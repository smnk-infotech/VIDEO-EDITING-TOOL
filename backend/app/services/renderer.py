import os
import uuid
from typing import Dict, Any, List
from moviepy.config import change_settings

# Configure ImageMagick manually for Windows
change_settings({"IMAGEMAGICK_BINARY": r"C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"})

from moviepy.editor import (
    VideoFileClip,
    ImageClip,
    concatenate_videoclips,
    CompositeVideoClip,
    TextClip,
)

from . import storage
from ..models.job import JobResponse
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.audio.AudioClip import CompositeAudioClip

try:
    from gTTS import gTTS
    HAS_GTTS = True
except ImportError:
    HAS_GTTS = False
    print("Warning: gTTS not found. AI Voiceovers will be disabled.")

OUTPUT_DIR = storage.OUTPUT_DIR


def _build_clip_from_scene(scene: Dict[str, Any]):
    input_type = scene.get("input_type")
    file_path = scene.get("file_path")
    effect = scene.get("effect", "")
    caption = scene.get("caption", "")
    role = scene.get("role", "")
    start = float(scene.get("start", 0.0))
    end = float(scene.get("end", 0.0))
    duration = float(scene.get("duration", 3.0))
    use_voiceover = scene.get("use_voiceover", False)
    aspect_ratio = scene.get("aspect_ratio", "9:16")

    if aspect_ratio == "16:9":
        target_w, target_h = 1920, 1080
    else:
        target_w, target_h = 1080, 1920

    # 1) Base clip/image
    if input_type in ("user_clip", "ai_broll"):
        try:
            base_clip = VideoFileClip(file_path)
            if end > 0:
                base_clip = base_clip.subclip(start, end)
        except Exception as e:
            print(f"Error loading clip {file_path}: {e}")
            return None
    elif input_type == "user_image":
        try:
            base_clip = ImageClip(file_path).set_duration(duration)
        except Exception as e:
            print(f"Error loading image {file_path}: {e}")
            return None
    else:
        return None

    # 2) Resize & crop to 9:16
    base_clip = base_clip.resize(height=target_h)
    if base_clip.w > target_w:
        x_center = base_clip.w / 2
        x1 = x_center - target_w / 2
        x2 = x_center + target_w / 2
        base_clip = base_clip.crop(x1=x1, x2=x2)

    # 3) Simple “cinematic” effect (slow zoom on hook/punch)
    if effect == "slow_zoom_in" or role in ("hook", "punch"):
        print(f"[DEBUG] Applying slow_zoom_in to segment: {file_path} ({start}-{end})")
        try:
            base_clip = base_clip.fx(
                lambda clip: clip.resize(lambda t: 1 + 0.03 * t)
            )
        except Exception as e:
            print(f"Zoom effect failed: {e}")

    # 4) Caption overlay (simple)
    clip_with_caption = base_clip
    if caption:
        try:
            # Note: TextClip requires ImageMagick. If not installed, this will fail.
            # On failures we ideally just fallback to no caption.
            txt = TextClip(
                caption,
                fontsize=60,
                color="white",
                font="Arial",  # Ensure this font exists or use a default one
                method="caption",
                size=(int(target_w * 0.8), None),
            )
            txt = txt.set_duration(base_clip.duration)
            txt = txt.set_position(("center", target_h - 280))
            # Background box for text
            txt_bg = txt.on_color(
                size=(txt.w + 40, txt.h + 20),
                color=(0, 0, 0),
                col_opacity=0.6,
            )
            clip_with_caption = CompositeVideoClip([base_clip, txt_bg])
        except Exception as e:
            print(f"[A.V.E.A] Caption overlay failed (ImageMagick missing?): {e}")
            clip_with_caption = base_clip

    # 5) Add Voiceover (TTS)
    if use_voiceover and caption:
        tts_audio = _generate_tts_audio(caption, clip_with_caption.duration)
        if tts_audio:
            # Composite original audio + TTS
            # If original has audio, keep it but lower volume maybe?
            # For simplicity: Mix them.
            original_audio = clip_with_caption.audio
            if original_audio:
                new_audio = CompositeAudioClip([original_audio.volumex(0.3), tts_audio])
            else:
                new_audio = tts_audio
            clip_with_caption = clip_with_caption.set_audio(new_audio)

    return clip_with_caption


def _generate_tts_audio(text: str, duration: float) -> AudioFileClip:
    """Generates a TTS audio clip for the given text."""
    if not HAS_GTTS:
        return None

    try:
        temp_audio = os.path.join(OUTPUT_DIR, f"tts_{uuid.uuid4()}.mp3")
        tts = gTTS(text=text, lang='en')
        tts.save(temp_audio)
        
        audio = AudioFileClip(temp_audio)
        if audio.duration > duration:
            audio = audio.subclip(0, duration)
        return audio
    except Exception as e:
        print(f"TTS generation failed: {e}")
        return None


async def render_from_storyboard(storyboard: Dict[str, Any]) -> JobResponse:
    job_id = str(uuid.uuid4())
    output_file = os.path.join(OUTPUT_DIR, f"{job_id}.mp4")

    scenes: List[Dict[str, Any]] = storyboard.get("scenes", [])
    clips = []

    use_voiceover = storyboard.get("use_voiceover", False)
    use_music = storyboard.get("use_music", False)
    music_style = storyboard.get("music_style", "Upbeat")
    aspect_ratio = storyboard.get("aspect_ratio", "9:16")

    for scene in scenes:
        scene["use_voiceover"] = use_voiceover
        scene["aspect_ratio"] = aspect_ratio
        clip = _build_clip_from_scene(scene)
        if clip:
            clips.append(clip)

    if not clips:
        with open(output_file, "wb") as f:
            f.write(b"")
        return JobResponse(
            job_id=job_id,
            status="error",
            output_url=f"/media/output/{job_id}.mp4",
            message="Storyboard had no valid scenes.",
        )

    try:
        # Concatenate with a subtle crossfade (compose method implies we handle logic, 
        # but pure list concat is simpler unless we specifically add transitions)
        final = concatenate_videoclips(clips, method="compose")

        # Slight color “cinema” tweak – slightly increase contrast/darken
        final = final.fx(lambda clip: clip.fl_image(
            lambda frame: (frame * 1.02).clip(0, 255)
        ))

        # 6) Add Background Music
        if use_music:
            # Placeholder: In prod, map style to file
            # For now, we assume a file exists or we skip
            music_path = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "music", "bg_music.mp3")
            if os.path.exists(music_path):
                bg_music = AudioFileClip(music_path)
                # Loop music to match video duration
                if bg_music.duration < final.duration:
                    # Simple loop logic requires loop function or making a new clip
                    # For MVP, just subclip or let it play once. 
                    # MoviePy loop: afx.audio_loop(bg_music, duration=final.duration)
                    pass 
                
                bg_music = bg_music.subclip(0, min(bg_music.duration, final.duration))
                bg_music = bg_music.volumex(0.15) # Low volume background

                if final.audio:
                    final_audio = CompositeAudioClip([final.audio, bg_music])
                else:
                    final_audio = bg_music
                
                final = final.set_audio(final_audio)

        final.write_videofile(
            output_file,
            fps=30,
            codec="libx264",
            audio_codec="aac",
            preset="ultrafast",
            threads=4,
            verbose=False,
            logger=None,
        )

        for c in clips:
            c.close()
        final.close()

        return JobResponse(
            job_id=job_id,
            status="completed",
            output_url=f"/media/output/{job_id}.mp4",
            message="Render complete.",
        )
    except Exception as e:
        print(f"Render failed: {e}")
        return JobResponse(
            job_id=job_id,
            status="failed",
            message=f"Render failed: {str(e)}",
        )


async def get_job_status(job_id: str) -> JobResponse:
    output_path = os.path.join(OUTPUT_DIR, f"{job_id}.mp4")
    if os.path.exists(output_path):
        return JobResponse(
            job_id=job_id,
            status="completed",
            output_url=f"/media/output/{job_id}.mp4",
        )
    return JobResponse(job_id=job_id, status="unknown", message="Job not found")
