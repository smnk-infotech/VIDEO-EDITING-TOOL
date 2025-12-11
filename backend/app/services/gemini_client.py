import os
import json
import time
import asyncio
import concurrent.futures
from typing import List, Dict, Any
import google.generativeai as genai
from moviepy.editor import VideoFileClip

# Note: In production, ensure moviepy doesn't crash if ffmpeg is missing.
# We wrap duration checks in try/except.

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    print("[A.V.E.A] WARNING: GOOGLE_API_KEY is not set.")

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


def _upload_single_file(path: str):
    """Blocking upload function to be run in a thread."""
    try:
        if not path.lower().endswith(('.mp4', '.mov', '.avi', '.jpg', '.jpeg', '.png', '.webp')):
            return None
            
        print(f"Starting upload: {os.path.basename(path)}...")
        file_ref = genai.upload_file(path=path)
        
        # Wait for processing
        while file_ref.state.name == "PROCESSING":
            time.sleep(1) # Check more frequently
            file_ref = genai.get_file(file_ref.name)
            
        print(f"Ready: {os.path.basename(path)}")
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
    if not GOOGLE_API_KEY:
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
You are an expert video editor.
I have provided {len(uploaded_files)} media files above.

Task: Create a viral {style} style video.
{duration_instruction}
Format: {aspect_ratio} ({'Horizontal/YouTube' if aspect_ratio == '16:9' else 'Vertical/Reel'}).

CRITICAL INSTRUCTIONS:
1. **Visual Reasoning**: You can SEE the video. Identify the most interesting moments (action, emotion, movement).
2. **Dynamic Cuts**: Do NOT just use the start. Find the BEST segments.
3. **Pacing**: Use at least 4-6 different scenes.
4. **Story**: Start with a visual HOOK, add value in the BODY, end with a PUNCH.

IMPORTANT TIMING RULES:
{timing_rule}
- **Timestamps are in SECONDS**. Example: 'start': 5.0, 'end': 8.0 (This is a 3 second clip).
- **Start Time Reference**: 'start' refers to the timestamp in the SOURCE video.
- **End Time Reference**: 'end' refers to the timestamp in the SOURCE video.
- **Do NOT use decimals < 0.1**. Example 0.05 is 50 milliseconds (TOO SHORT). Use 1.5, 2.0, etc.
- **Minimum Clip Length**: 2.0 seconds. Ensure (end - start) >= 2.0.

Output JSON Format (Strict):
{{
  "scenes": [
    {{
      "input_type": "user_clip" | "user_image",
      "file_path": "original_filename_of_the_clip", 
      "start": 0.0,
      "end": 3.5, 
      "duration": 3.5,
      "role": "hook" | "body" | "punch",
      "caption": "Short overlay text",
      "effect": "slow_zoom_in" | "crossfade" | "none"
    }}
  ]
}}

IMPORTANT: For 'file_path', please look at the file names and match them to the inputs if possible, or just refer to them by order if names are lost.
The system will map them back. Attempts to match the original filename:
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
