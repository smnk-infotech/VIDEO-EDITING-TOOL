
import os
import logging
from moviepy.editor import VideoFileClip, concatenate_videoclips
from ..services import project_manager

# Setup logging
logger = logging.getLogger(__name__)

def render_job(job_id: str, storyboard: dict):
    """
    Executes the FFmpeg render via MoviePy.
    """
    logger.info(f"JOB {job_id}: Starting Render")
    project_manager.set_job_status(job_id, "processing")
    
    try:
        source_path = storyboard.get("source_file")
        scenes = storyboard.get("scenes", [])
        
        if not source_path or not os.path.exists(source_path):
             raise Exception(f"Source file not found: {source_path}")

        # Load Video
        # Note: MoviePy accesses the file directly.
        original_clip = VideoFileClip(source_path)
        
        final_clips = []
        
        for scene in scenes:
            start = float(scene.get("start", 0))
            end = float(scene.get("end", 1))
            
            # Sanity Check
            if start < 0: start = 0
            if end > original_clip.duration: end = original_clip.duration
            if end <= start: continue # Skip invalid
            
            # Create Subclip
            clip = original_clip.subclip(start, end)
            final_clips.append(clip)
            
        if not final_clips:
            # Fallback: Render first 5s if logic fail
            final_clips.append(original_clip.subclip(0, min(5, original_clip.duration)))
            
        # Concatenate
        final_video = concatenate_videoclips(final_clips)
        
        # Write Output
        output_dir = "public/outputs"
        os.makedirs(output_dir, exist_ok=True)
        filename = f"render_{job_id}.mp4"
        output_path = os.path.join(output_dir, filename)
        
        # preset='ultrafast' for speed in MVP
        final_video.write_videofile(
            output_path, 
            codec="libx264", 
            audio_codec="aac", 
            preset="ultrafast",
            logger=None # Suppress moviepy stdout spam
        )
        
        # Close handles to release file lock
        original_clip.close()
        final_video.close()
        
        # Update Status
        # In this setup, we serve files statically from backend or frontend public. 
        # For localhost:3000 to see it, it needs to be in frontend public OR backend static.
        # Router assumes separate backend. Let's return a backend static URL.
        # But wait, frontend runs on 3000, backend 8080.
        # We should mount /outputs in `main.py`
        
        public_url = f"http://localhost:8080/outputs/{filename}"
        
        project_manager.set_job_status(job_id, "completed", {"url": public_url})
        logger.info(f"JOB {job_id}: Completed -> {public_url}")

    except Exception as e:
        logger.error(f"JOB {job_id}: FAILED - {e}")
        project_manager.set_job_status(job_id, "failed", {"error": str(e)})
