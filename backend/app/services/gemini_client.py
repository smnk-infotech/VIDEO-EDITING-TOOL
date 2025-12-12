import os
import json
import time
import asyncio
import concurrent.futures
import subprocess
from typing import List, Dict, Any
import google.generativeai as genai
from moviepy.editor import VideoFileClip

# Note: In production, ensure moviepy doesn't crash if ffmpeg is missing.
# We wrap duration checks in try/except.

GOOG_API_KEY = os.getenv("GOOGLE_API_KEY")

if GOOG_API_KEY:
    genai.configure(api_key=GOOG_API_KEY)
else:
    print("[A.V.E.A] WARNING: GOOGLE_API_KEY is not set.")

# AVAILABLE MODELS (User provided list):
# - Speed/Analysis: gemini-2.0-flash-lite, gemini-2.0-flash, gemini-2.5-flash
# - Reasoning/Chat: gemini-2.5-pro, gemini-3-pro
# - Media: veo-3.0-generate, imagen-4.0-generate

# Selected for Video Analysis (Speed + VQA capabilities):
MODEL_NAME = "gemini-2.5-flash"


def _get_media_info(path: str) -> str:
    """Helper to get duration string or image label."""
    filename = os.path.basename(path)
    if path.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        return f"{filename} [Type: Image]"
    
    # Try to scan video duration
    try:
        clip = VideoFileClip(path)
        duration = clip.duration
        clip.close()
        return f"{filename} [Type: Video, Duration: {duration:.1f}s]"
    except Exception as e:
        print(f"Error reading duration for {path}: {e}")
        return f"{filename} [Type: Video, Duration: Unknown]"

def _create_fallback_storyboard(media_paths: List[str], style: str, target_duration: int) -> Dict[str, Any]:
    """Generates a dynamic multi-cut storyboard without AI."""
    scenes = []
    
    if not media_paths:
        return {"scenes": []}
        
    main_video = media_paths[0]
    duration = 5.0
    
    try:
        clip = VideoFileClip(main_video)
        duration = clip.duration
        clip.close()
    except:
        pass

    # If video is long enough, cut it into 3 parts
    if duration > 15:
        segment_len = target_duration / 3
        # 1. Start (Hook)
        scenes.append({
            "input_type": "user_clip",
            "file_path": main_video,
            "start": 0.0,
            "end": segment_len,
            "role": "hook",
            "caption": "POV: You find this...",
            "effect": "slow_zoom_in"
        })
        # 2. Middle (Body)
        mid = duration / 2
        scenes.append({
            "input_type": "user_clip",
            "file_path": main_video,
            "start": mid,
            "end": mid + segment_len,
            "role": "body",
            "caption": "And then it gets better",
            "effect": "none"
        })
        # 3. End (Punch)
        scenes.append({
            "input_type": "user_clip",
            "file_path": main_video,
            "start": duration - segment_len,
            "end": duration,
            "role": "punch",
            "caption": "Wait for IT!",
            "effect": "slow_zoom_in"
        })
    else:
        # Short video, just use the whole thing
        scenes.append({
            "input_type": "user_clip",
            "file_path": main_video,
            "start": 0.0,
            "end": min(duration, target_duration),
            "role": "hook",
            "caption": "Watch this!",
            "effect": "slow_zoom_in"
        })

    return {
        "style": style,
        "target_duration": target_duration,
        "scenes": scenes,
        "note": "Generated via Smart Fallback (API Error)"
    }

def _compress_video_for_analysis(input_path: str) -> str:
    """
    Compresses video to 360p low bitrate for faster global upload & analysis.
    Returns path to compressed temp file.
    """
    if not input_path.lower().endswith((".mp4", ".mov", ".avi", ".mkv")):
        return input_path # Skip images
        
    try:
        temp_dir = os.path.dirname(input_path)
        filename = os.path.basename(input_path)
        output_path = os.path.join(temp_dir, f"temp_lowres_{filename}")
        
        # Check if already exists from previous run
        if os.path.exists(output_path):
            return output_path

        # FFmpeg command: Scale to 360p height, max 1000k bitrate, ultra fast preset
        # This reduces a 100MB file to ~5MB in seconds.
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        
        cmd = [
            ffmpeg_exe, "-y",
            "-i", input_path,
            "-vf", "scale=-2:360", # Maintain aspect ratio, height 360
            "-b:v", "700k", # Low bitrate
            "-preset", "ultrafast",
            "-c:a", "copy", # Copy audio (fast)
            output_path
        ]
        
        # Suppress output unless error
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        print(f"[Compress] Reduced {filename} for analysis -> {output_path}")
        return output_path
    
    except Exception as e:
        print(f"[Compress] Failed to compress {input_path}, using original. Error: {e}")
        return input_path

def _upload_single_file(path: str):
    """Blocking upload function to be run in a thread."""
    try:
        if not path.lower().endswith(('.mp4', '.mov', '.avi', '.jpg', '.jpeg', '.png', '.webp')):
            return None
        
        # OPTIMIZATION: Compress before upload
        upload_path = _compress_video_for_analysis(path)
            
        print(f"Starting upload: {os.path.basename(upload_path)}...")
        file_ref = genai.upload_file(path=upload_path)
        
        # Wait for processing
        while file_ref.state.name == "PROCESSING":
            time.sleep(1) # Check more frequently
            file_ref = genai.get_file(file_ref.name)
            
        print(f"Ready: {os.path.basename(upload_path)}")
        return file_ref
    except Exception as e:
        print(f"Upload failed for {path}: {e}")
        return None


async def analyze_media_with_gemini(
    media_paths: List[str],
    style: str,
    target_duration_seconds: int,
    aspect_ratio: str = "9:16",
) -> Dict[str, Any]:
    """
    Calls Gemini using parallel file uploads.
    """
    if not GOOG_API_KEY:
        return _create_fallback_storyboard(media_paths, style, target_duration_seconds)

    # 1. Parallel Uploads via ThreadPool
    print(f"analyze_media: Uploading {len(media_paths)} files in parallel (max 5 concurrent)...")
    uploaded_files = []
    
    try:
        # Run synchronous uploads in threads with limited concurrency
        loop = asyncio.get_running_loop()
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            tasks = [
                loop.run_in_executor(executor, _upload_single_file, path)
                for path in media_paths
            ]
            results = await asyncio.gather(*tasks)
            
        uploaded_files = [f for f in results if f is not None]
        
        print(f"Uploads complete. {len(uploaded_files)} files ready for analysis.")
        
    except Exception as e:
        print(f"Error during parallel upload: {e}")
        return _create_fallback_storyboard(media_paths, style, target_duration_seconds)

    # 2. Construct Prompt
    # We pass the file handles directly in the list
    
    duration_instruction = f"Target Length: {target_duration_seconds} sec."
    timing_rule = f"- **STRICTLY OBEY TIME LIMIT**: The video MUST end at or before {target_duration_seconds} seconds. Do NOT create scenes beyond this point."
    
    if target_duration_seconds == 0:
        duration_instruction = "Target Length: Flexible (Auto-detect based on best content). Aim for 30-60s generally, but go longer if content is good."
        timing_rule = "- **FLEXIBLE TIMING**: End the video when the story is complete. No strict second limit."

    prompt_text = f"""
You are an expert video editor and creative director.
I have provided {len(uploaded_files)} media files above.

Task: Create a viral {style} style video (Target: {target_duration_seconds}s).
Format: {aspect_ratio}.

CRITICAL INSTRUCTIONS:
1. **Visual Reasoning**: Identify the most interesting moments (Action, Emotion, Movement).
2. **Story Arc**: Structure the video: **Hook (0-3s)** -> **Body (Value/Story)** -> **Punch/CTA**.
3. **B-Roll Logic**: If the user mentions a specific noun (e.g., "Bitcoin", "Ocean", "Future"), you can request B-Roll using 'ai_broll' input_type.
4. **Pacing**: {style} style usually requires {'fast cuts (1-2s)' if style == 'Fast-Paced' else 'balanced cuts (3-5s)'}.

Output JSON Format (Strict):
{{
  "sentiment": "Motivational" | "Sad" | "Happy" | "Intense",
  "pacing": "Fast" | "Slow" | "Medium",
  "scenes": [
    {{
      "input_type": "user_clip" | "user_image" | "ai_broll",
      "file_path": "original_filename" (OR "keyword_for_broll" if input_type is ai_broll),
      "start": 0.0,
      "end": 3.0,
      "duration": 3.0,
      "role": "hook" | "body" | "punch",
      "caption": "Overlay text",
      "effect": "slow_zoom_in" | "crossfade" | "none",
      "b_roll_keyword": "tech city" (Only if input_type is ai_broll)
    }}
  ]
}}

Example of B-Roll Usage:
If user says "Imagine a world of AI", you can insert a scene:
{{ "input_type": "ai_broll", "b_roll_keyword": "futuristic ai robot", "duration": 2.5, "caption": "Imagine AI", ... }}

Mapping attempts:
{json.dumps([os.path.basename(p) for p in media_paths])}
"""

    content_payload = uploaded_files + [prompt_text]

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(content_payload)
        text = response.text.strip()

        # [DEBUG] Log raw response
        log_path = os.path.join(os.path.dirname(__file__), "..", "..", "gemini_debug.log")
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(f"\n\n--- RAW GEMINI RESPONSE ({style}) ---\n")
                f.write(text)
                f.write("\n---------------------------------\n")
        except:
            pass
        
        if text.startswith("```"):
            text = text.split("```", 2)[1]
            text = text.lstrip("json").strip()
            
        storyboard = json.loads(text)
        
        # Mapping basename back to full path
        filename_map = {os.path.basename(p): p for p in media_paths}
        
        for scene in storyboard.get("scenes", []):
            fp = scene.get("file_path", "")
            if fp in filename_map:
                scene["file_path"] = filename_map[fp]
            else:
                # Fallback: if filename not found, default to first file?
                # Or try fuzzy match. For now, strict or fallback.
                if media_paths:
                    scene["file_path"] = media_paths[0]
        
    except Exception as e:
        print(f"Error calling Gemini or parsing JSON: {e}")
        log_path = os.path.join(os.path.dirname(__file__), "..", "..", "gemini_debug.log")
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(f"\n\n--- ESTIMATED FAILURE: {e} ---\n")
        except:
            pass
            
        # Use smart fallback
        return _create_fallback_storyboard(media_paths, style, target_duration_seconds)

    storyboard.setdefault("style", style)
    storyboard.setdefault("target_duration", target_duration_seconds)

    return storyboard
