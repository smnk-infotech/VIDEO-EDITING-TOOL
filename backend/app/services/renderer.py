
import os
import uuid
import asyncio
from typing import Dict, Any, List
from google.cloud import storage
from moviepy.editor import (
    VideoFileClip,
    ImageClip,
    ColorClip,
    concatenate_videoclips,
    CompositeVideoClip,
    TextClip,
    AudioFileClip,
    CompositeAudioClip,
)
import moviepy.audio.fx.all as afx

from . import storage as storage_service
from . import jobs as job_service

try:
    from gTTS import gTTS
    HAS_GTTS = True
except ImportError:
    HAS_GTTS = False
    print("Warning: gTTS not found. AI Voiceovers will be disabled.")

OUTPUT_DIR = storage_service.get_output_dir()

def _build_clip_from_scene(scene: Dict[str, Any], local_media_paths: Dict[str, str]):
    """Build a single MoviePy clip from a scene, using local media paths."""
    input_type = scene.get("input_type")
    file_path = scene.get("file_path")  # This will be a GCS path
    effect = scene.get("effect", "")
    caption = scene.get("caption", "")
    role = scene.get("role", "")
    start = float(scene.get("start", 0.0))
    end = float(scene.get("end", 0.0))
    duration = float(scene.get("duration", 3.0))
    use_voiceover = scene.get("use_voiceover", False)

    target_w, target_h = 1080, 1920

    base_clip = None
    local_path = local_media_paths.get(file_path)

    if not local_path or not os.path.exists(local_path):
        print(f"Error: Media not found locally for GCS path {file_path}")
        return None

    if input_type == "user_clip":
        try:
            base_clip = VideoFileClip(local_path)
            if end > start:
                base_clip = base_clip.subclip(start, end)
            else:
                base_clip = base_clip.subclip(0, min(base_clip.duration, duration))
        except Exception as e:
            print(f"Error loading clip {local_path}: {e}")
            return None
    elif input_type == "user_image":
        try:
            base_clip = ImageClip(local_path).set_duration(duration)
        except Exception as e:
            print(f"Error loading image {local_path}: {e}")
            return None
    
    # The rest of the function remains the same as it was, since it works on the created base_clip
    if not base_clip:
        return None

    # 2) Resize & Crop (Vertical 9:16)
    # Logic: Resize so height matches target_h, then center crop width.
    ratio = target_h / base_clip.h
    base_clip = base_clip.resize(height=target_h)
    
    if base_clip.w < target_w:
        # If still too narrow, resize by width
        base_clip = base_clip.resize(width=target_w)
    
    # Center Crop
    if base_clip.w > target_w:
        x_center = base_clip.w / 2
        base_clip = base_clip.crop(x1=x_center - target_w/2, width=target_w)
    elif base_clip.h > target_h:
        y_center = base_clip.h / 2
        base_clip = base_clip.crop(y1=y_center - target_h/2, height=target_h)


    # 3) Effects
    if effect == "slow_zoom_in" or role in ("hook", "punch"):
        # Very simple zoom (resize) would require applying to every frame, slow in MoviePy.
        # Skipping for MVP performance unless specifically requested.
        pass

    # 4) Caption Overlay
    clip_with_caption = base_clip
    if caption:
        try:
            # Check if we can create a simple TextClip to verify ImageMagick
            # If this fails, we skip the caption
            txt = TextClip(
                caption,
                fontsize=60,
                color="white",
                font="Arial", 
                method="caption",
                size=(int(target_w * 0.8), None),
            )
            txt = txt.set_duration(base_clip.duration)
            txt = txt.set_position(("center", target_h - 280))
            
            # Simple Box
            txt_bg = txt.on_color(
                size=(txt.w + 40, txt.h + 20),
                color=(0, 0, 0),
                col_opacity=0.6,
            )
            clip_with_caption = CompositeVideoClip([base_clip, txt_bg])
        except Exception as e:
            print(f"Caption failed (likely missing ImageMagick): {e}")
            clip_with_caption = base_clip

    # 5) Voiceover
    if use_voiceover and caption and HAS_GTTS:
        tts_audio = _generate_tts_audio(caption, clip_with_caption.duration)
        if tts_audio:
            original_audio = clip_with_caption.audio
            if original_audio:
                 # Mix: User audio quieter
                new_audio = CompositeAudioClip([original_audio.volumex(0.3), tts_audio])
            else:
                new_audio = tts_audio
            clip_with_caption = clip_with_caption.set_audio(new_audio)

    return clip_with_caption


def _generate_tts_audio(text: str, duration: float) -> AudioFileClip:
    try:
        temp_audio = os.path.join(OUTPUT_DIR, f"tts_{uuid.uuid4()}.mp3")
        tts = gTTS(text=text, lang='en')
        tts.save(temp_audio)
        audio = AudioFileClip(temp_audio)
        return audio
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

def render_from_storyboard(job_id: str, storyboard: Dict[str, Any], media_paths: List[str]):
    """Renders a video from a storyboard, using media from GCS."""
    try:
        job_service.set_job_status(job_id, "analyzing")
        job_service.update_job_progress(job_id, 10, "Downloading media...")

        # Download media from GCS to local temp
        local_media_paths = {}
        for gcs_path in media_paths:
            file_name = os.path.basename(gcs_path)
            local_path = os.path.join(storage_service.INPUT_DIR, file_name)
            storage_service.get_gcs_bucket().blob(gcs_path).download_to_filename(local_path)
            local_media_paths[gcs_path] = local_path

        job_service.update_job_progress(job_id, 25, "Building scenes...")

        scenes = storyboard.get("scenes", [])
        clips = []
        for scene in scenes:
            scene["use_voiceover"] = storyboard.get("use_voiceover", False)
            clip = _build_clip_from_scene(scene, local_media_paths)
            if clip:
                clips.append(clip)

        if not clips:
            raise ValueError("No clips generated from storyboard.")

        job_service.update_job_progress(job_id, 50, "Compositing video...")
        final_clip = concatenate_videoclips(clips, method="compose")

        # Music and other final touches would go here...

        output_filename = f"{job_id}.mp4"
        local_output_path = os.path.join(OUTPUT_DIR, output_filename)

        job_service.update_job_progress(job_id, 75, "Rendering video...")
        final_clip.write_videofile(
            local_output_path,
            fps=24,
            codec="libx264",
            audio_codec="aac",
            preset="ultrafast",
            threads=4,
            logger=None,
        )

        job_service.update_job_progress(job_id, 95, "Uploading to storage...")
        remote_path = f"output/{output_filename}"
        output_url = storage_service.upload_to_gcs(local_output_path, remote_path)

        job_service.set_job_complete(job_id, output_url)

    except Exception as e:
        print(f"[Renderer] Job {job_id} Failed: {e}")
        job_service.set_job_failed(job_id, str(e))
    finally:
        # Clean up local files
        for local_path in local_media_paths.values():
            if os.path.exists(local_path):
                os.remove(local_path)
        if 'local_output_path' in locals() and os.path.exists(local_output_path):
            os.remove(local_output_path)
