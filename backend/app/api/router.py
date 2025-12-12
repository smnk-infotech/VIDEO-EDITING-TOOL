from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from typing import List
import uuid
from ..services import flow_orchestrator, renderer, storage
from ..models.job import JobResponse

api_router = APIRouter()


@api_router.post("/analyze", response_model=dict)
async def analyze_media(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    style: str = Form("Hollywood"),
    duration_seconds: int = Form(30),
    aspect_ratio: str = Form("9:16"),
    language: str = Form("Auto"), 
):
    print(f"[API] Analyze request received. Files: {len(files)}, Style: {style}")
    
    stored_paths = await storage.save_uploads(files)

    # 1. Plan Storyboard (Fast, uses Gemini)
    storyboard = await flow_orchestrator.plan_storyboard(
        media_paths=stored_paths,
        style=style,
        duration_seconds=duration_seconds,
        aspect_ratio=aspect_ratio,
    )
    
    # 2. Assign Job ID immediately
    job_id = str(uuid.uuid4())
    storyboard["job_id"] = job_id
    
    # 3. Offload Rendering to Background (Non-blocking)
    # Note: We call a synchronous wrapper or change renderer to sync to use threadpool
    background_tasks.add_task(renderer.render_from_storyboard_sync, storyboard, job_id)
    
    return {
        **storyboard,
        "job_id": job_id,
        "output_url": None, # Not ready yet
        "status": "processing"
    }


@api_router.post("/render", response_model=JobResponse)
async def render_reel(storyboard: dict):
    """
    Accepts storyboard JSON and triggers async render job.
    For now we can run it sync and just return job_id + file url.
    """
    job = await renderer.render_from_storyboard(storyboard)
    return job


@api_router.get("/status/{job_id}", response_model=JobResponse)
async def get_status(job_id: str):
    return await renderer.get_job_status(job_id)


from ..services import chat_service
from pydantic import BaseModel

class ChatRequest(BaseModel):
    storyboard: dict
    message: str

@api_router.post("/chat/edit")
async def chat_edit(request: ChatRequest):
    """
    Accepts current storyboard + user message.
    Returns new storyboard + AI explanation.
    """
    result = await chat_service.process_edit_request(request.storyboard, request.message)
    return result
