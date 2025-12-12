
import os
import json
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, Header, HTTPException
from typing import List, Dict, Any
import uuid
from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2, duration_pb2

from ..services import flow_orchestrator, renderer, storage, jobs
from ..models.job import JobResponse

api_router = APIRouter()

# --- Security --- 
# This is a simple shared secret. In a real app, use something more robust like OIDC.
WORKER_SECRET_TOKEN = os.getenv("WORKER_SECRET_TOKEN", "a-very-secret-token")

# --- Cloud Tasks --- 
TASKS_CLIENT = tasks_v2.CloudTasksClient()
PROJECT_ID = os.getenv("FIREBASE_PROJECT")
LOCATION = "us-central1"
QUEUE = "render-queue"
WORKER_URL = os.getenv("WORKER_URL") # e.g., https://your-cloud-run-service.a.run.app/api/render-worker

PARENT_QUEUE = TASKS_CLIENT.queue_path(PROJECT_ID, LOCATION, QUEUE)

@api_router.get("/health")
async def health_check():
    return {"status": "ok"}

@api_router.post("/signed-upload-url")
async def get_signed_upload_url(file_name: str, content_type: str):
    """Get a signed URL for uploading a file to GCS."""
    return {"url": storage.get_signed_upload_url(file_name, content_type)}

@api_router.post("/render", response_model=JobResponse)
async def render_reel(
    storyboard: Dict[str, Any],
    owner_user: str = "anonymous_user"
):
    """Triggers an async render job by creating a Firestore job and a Cloud Task."""
    job_id = str(uuid.uuid4())
    jobs.create_job(job_id, owner_user)

    # Extract GCS paths from the storyboard
    media_paths = [scene["file_path"] for scene in storyboard.get("scenes", []) if "file_path" in scene]

    # Create a Cloud Task to call the worker
    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": WORKER_URL,
            "headers": {"Content-Type": "application/json", "X-Worker-Token": WORKER_SECRET_TOKEN},
            "body": json.dumps({
                "job_id": job_id,
                "storyboard": storyboard,
                "media_paths": media_paths
            }).encode()
        },
        "schedule_time": timestamp_pb2.Timestamp(seconds=int(duration_pb2.Duration(seconds=1).seconds) + int(os.times()[4]))

    }
    
    TASKS_CLIENT.create_task(parent=PARENT_QUEUE, task=task)

    return JobResponse(job_id=job_id, status="queued")

@api_router.post("/render-worker")
async def render_worker(
    task_payload: Dict[str, Any],
    x_worker_token: str = Header(None)
):
    """Protected endpoint called by Cloud Tasks to execute the render job."""
    if x_worker_token != WORKER_SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden")

    job_id = task_payload.get("job_id")
    storyboard = task_payload.get("storyboard")
    media_paths = task_payload.get("media_paths")

    if not all([job_id, storyboard, media_paths]):
        raise HTTPException(status_code=400, detail="Invalid payload")

    # This is a synchronous, long-running process
    renderer.render_from_storyboard(job_id, storyboard, media_paths)

    return {"status": "completed"}


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

