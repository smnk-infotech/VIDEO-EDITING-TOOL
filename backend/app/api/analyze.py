import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import uuid

from ..services import flow_orchestrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

analyze_router = APIRouter()

@analyze_router.post("/analyze")
async def analyze_video(
    files: List[UploadFile] = File(...),
    style: str = Form(...),
    duration_seconds: int = Form(...),
    aspect_ratio: str = Form(...),
    use_music: bool = Form(False),  # Default to False if not provided
    use_voiceover: bool = Form(False), # Default to False if not provided
):
    """
    This is the main endpoint that kicks off the video processing pipeline.
    It's called from the frontend's setup page.
    """
    job_id = str(uuid.uuid4())
    logger.info(f"Received analysis request with job_id: {job_id}")

    try:
        # The flow_orchestrator.run is a long-running task.
        # For a production system, you'd use a proper background task queue like Celery.
        # For this example, we'll run it directly, but be aware of potential timeouts.
        result = await flow_orchestrator.run(
            media_files=files,
            style=style,
            duration_seconds=duration_seconds,
            aspect_ratio=aspect_ratio,
            use_music=use_music,
            use_voiceover=use_voiceover,
        )

        logger.info(f"Analysis complete for job_id: {job_id}")
        return {"job_id": job_id, "result": result}

    except Exception as e:
        logger.error(f"Error during analysis for job_id: {job_id}: {e}", exc_info=True)
        # The HTTPException will be caught by FastAPI and returned as a proper HTTP error response.
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
