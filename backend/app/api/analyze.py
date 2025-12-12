
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from typing import List
import uuid

from ..services import flow_orchestrator

analyze_router = APIRouter()

@analyze_router.post("/analyze")
async def analyze_video(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    style: str = Form(...),
    duration_seconds: int = Form(...),
    aspect_ratio: str = Form(...),
    language: str = Form(...),
    use_music: bool = Form(...),
    use_voiceover: bool = Form(...),
):
    """
    This is the main endpoint that kicks off the video processing pipeline.
    It's called from the frontend's setup page.
    """
    job_id = str(uuid.uuid4())
    video_file = files[0]
    
    # This is a long-running task, so we run it in the background
    background_tasks.add_task(
        flow_orchestrator.run,
        job_id=job_id,
        video_file=video_file,
        style=style,
        duration_seconds=duration_seconds,
        aspect_ratio=aspect_ratio,
        language=language,
        use_music=use_music,
        use_voiceover=use_voiceover,
    )

    return {"job_id": job_id}
