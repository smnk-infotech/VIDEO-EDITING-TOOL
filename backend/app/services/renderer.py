import os
import uuid
import asyncio
from typing import Dict, Any, List
# from moviepy.config import change_settings

# Configure ImageMagick manually for Windows
# change_settings({"IMAGEMAGICK_BINARY": r"C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"})

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

from . import storage
from ..models.job import JobResponse

try:
    from gTTS import gTTS
    HAS_GTTS = True
except ImportError:
    HAS_GTTS = False
    print("Warning: gTTS not found. AI Voiceovers will be disabled.")

OUTPUT_DIR = storage.OUTPUT_DIR

def _build_clip_from_scene(scene: Dict[str, Any]):
    """
    Helper to build a single MoviePy clip from a scene dict.
    Runs synchronously (CPU bound).
    """
    input_type = scene.get("input_type")
    file_path = scene.get("file_path")
    effect = scene.get("effect", "")
    caption = scene.get("caption", "")
    role = scene.get("role", "")
    start = float(scene.get("start", 0.0))
    end = float(scene.get("end", 0.0))
    duration = float(scene.get("duration", 3.0))
    use_voiceover = scene.get("use_voiceover", False)
    
    # Default to 9:16 vertical
    target_w, target_h = 1080, 1920 

    # 1) Base Clip Creation
    base_clip = None
    
    if input_type == "ai_broll":
        keyword = scene.get("b_roll_keyword", "B-Roll")
        base_clip = ColorClip(size=(target_w, target_h), color=(30, 30, 30), duration=duration)
        try:
            # Simple text overlay for B-Roll placeholder
            # Note: TextClip requires ImageMagick. If missing, this might fail.
            txt = TextClip(f"B-ROLL\n{keyword}", fontsize=70, color='yellow', font='Arial-Bold', method='caption', size=(target_w - 100, None))
            txt = txt.set_pos('center').set_duration(duration)
            base_clip = CompositeVideoClip([base_clip, txt])
        except Exception as e:
            print(f"B-Roll Text failed (likely missing ImageMagick): {e}")
            # Continue with just the color clip

    elif input_type == "user_clip":
         try:
            if not os.path.exists(file_path):
                print(f"Error: Clip not found {file_path}")
                return None
            
            base_clip = VideoFileClip(file_path)
            # Trim
            if end > start:
                base_clip = base_clip.subclip(start, end)
            else:
                base_clip = base_clip.subclip(0, min(base_clip.duration, duration))
         except Exception as e:
            print(f"Error loading clip {file_path}: {e}")
            return None
    
    elif input_type == "user_image":
        try:
            base_clip = ImageClip(file_path).set_duration(duration)
        except Exception as e:
            print(f"Error loading image {file_path}: {e}")
            return None
            
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
        # Ensure it doesn't exceed clip duration significantly
        return audio
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

def render_from_storyboard_sync(storyboard: Dict[str, Any], job_id: str = None):
    """
    Synchronous rendering function to be called in BackgroundTasks.
    """
    if not job_id:
        job_id = str(uuid.uuid4())
        
    print(f"[Renderer] Starting Job {job_id}")
    output_filename = f"{job_id}.mp4"
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    scenes = storyboard.get("scenes", [])
    clips = []
    
    use_voiceover = storyboard.get("use_voiceover", False)
    use_music = storyboard.get("use_music", False)
    
    # 1. Build Clips
    for scene in scenes:
        scene["use_voiceover"] = use_voiceover
        clip = _build_clip_from_scene(scene)
        if clip:
            clips.append(clip)
            
    if not clips:
        print("[Renderer] No clips generated.")
        return
        
    try:
        # 2. Concatenate
        final_clip = concatenate_videoclips(clips, method="compose")
        
        # 3. Add Music (Simplified)
        if use_music:
             music_path = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "music", "bg_music.mp3")
             if not os.path.exists(music_path):
                 # Try finding any mp3 in assets/music
                 music_dir = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "music")
                 if os.path.exists(music_dir):
                     files = [f for f in os.listdir(music_dir) if f.endswith(".mp3")]
                     if files:
                         music_path = os.path.join(music_dir, files[0])
            
             if os.path.exists(music_path):
                bg_music = AudioFileClip(music_path)
                # Loop
                if bg_music.duration < final_clip.duration:
                    bg_music = afx.audio_loop(bg_music, duration=final_clip.duration)
                else:
                    bg_music = bg_music.subclip(0, final_clip.duration)
                
                bg_music = bg_music.volumex(0.15) # Background level
                
                if final_clip.audio:
                    final_clip.audio = CompositeAudioClip([final_clip.audio, bg_music])
                else:
                    final_clip.audio = bg_music

        # 4. Write File (The slow part)
        print(f"[Renderer] Writing video to {output_path}...")
        final_clip.write_videofile(
            output_path,
            fps=24, # 24fps is faster than 30 and cinematic
            codec="libx264",
            audio_codec="aac",
            preset="ultrafast", # Fastest encoding
            threads=4,
            logger=None # Reduce console noise
        )
        
        final_clip.close()
        for c in clips:
            c.close()
            
        print(f"[Renderer] Job {job_id} Completed. saved to {output_path}")

    except Exception as e:
        print(f"[Renderer] Job {job_id} Failed: {e}")

# Async wrapper if needed, but router uses sync with BackgroundTasks
async def get_job_status(job_id: str) -> JobResponse:
    output_path = os.path.join(OUTPUT_DIR, f"{job_id}.mp4")
    if os.path.exists(output_path):
        return JobResponse(
            job_id=job_id,
            status="completed", # Frontend checks for this
            output_url=f"/media/output/{job_id}.mp4",
            message="Render complete"
        )
    return JobResponse(job_id=job_id, status="processing", message="Rendering...")
