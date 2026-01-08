
import os
import json
import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from pydantic import BaseModel

from ..services import project_manager, chat_service, renderer
from ..core.gemini_client import gemini_client

# --- Configuration ---
# Setup logging to file
logging.basicConfig(
    filename='backend_core.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

router = APIRouter()

# --- Models ---
class JobResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    storyboard: Dict[str, Any]
    message: str

# --- Endpoints ---

@router.get("/health")
async def health_check():
    return {"status": "ok", "env": os.getenv("ENVIRONMENT", "development")}

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_media(
    files: List[UploadFile] = File(...),
    style: str = Form("Motivational"),
    duration_seconds: int = Form(60),
    aspect_ratio: str = Form("9:16"),
    language: str = Form("Auto"),
    use_music: bool = Form(False),
    use_voiceover: bool = Form(False)
):
    """
    1. Save File
    2. Create Project
    3. Call Gemini (Analyze)
    4. Return Storyboard
    """
    job_id = str(uuid.uuid4())
    logging.info(f"REQ: /analyze {job_id} | Style: {style}")

    try:
        # 1. Save File Locally (Simplest for MVP)
        upload_dir = "temp_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_obj = files[0]
        file_path = os.path.join(upload_dir, f"{job_id}_{file_obj.filename}")
        
        with open(file_path, "wb") as buffer:
            content = await file_obj.read()
            buffer.write(content)
            
        logging.info(f"File saved: {file_path}")

        # 2. Init Project
        project = project_manager.create_project(
            name=f"Project_{job_id[:8]}",
            user_id="anonymous",
            file_path=file_path
        )
        
        # 3. Gemini Analysis
        prompt = f"""
        Act as a video editor. Analyze this footage for a {style} video.
        Target: {duration_seconds}s, {aspect_ratio}.
        Audio: Music={use_music}, VO={use_voiceover}.
        Return JSON with:
        - "summary": Strategy
        - "scenes": List of {{ "start": float, "end": float, "description": str }}
        """
        
        logging.info("Calling Gemini 2.5...")
        analysis_json = await gemini_client.analyze_video(file_path, prompt)
        
        # Parse JSON
        if isinstance(analysis_json, str):
            # Clean potential markdown
            cleaned = analysis_json.replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned)
        else:
            result = analysis_json

        # Attach Project ID
        result["projectId"] = project["id"]
        result["job_id"] = job_id
        result["source_file"] = file_path # Needed for renderer
        
        project_manager.update_project(project["id"], result)
        logging.info("Analysis success")
        
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        logging.error(f"Analysis Failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Backend Error: {str(e)}")

@router.post("/chat/edit")
async def chat_edit(req: ChatRequest):
    """
    Takes current storyboard + user message -> Returns NEW storyboard.
    """
    logging.info(f"REQ: /chat/edit | Msg: {req.message}")
    try:
        new_storyboard = await chat_service.process_edit_request(req.storyboard, req.message)
        logging.info("Chat edit success")
        return new_storyboard # { explanation: "...", storyboard: {...} }
    except Exception as e:
        logging.error(f"Chat Edit Failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/render")
async def render_video(
    request: Dict[str, Any], 
    background_tasks: BackgroundTasks
):
    """
    Takes a storyboard -> Outputs a Video File.
    Uses BackgroundTasks for immediate response, prevents timeout.
    """
    job_id = request.get("job_id") or str(uuid.uuid4())
    logging.info(f"REQ: /render {job_id}")

    # Validate inputs
    if not request.get("scenes"):
        raise HTTPException(status_code=400, detail="Invalid Storyboard: Missing scenes")
    if not request.get("source_file"):
        raise HTTPException(status_code=400, detail="Invalid Storyboard: Missing source_file")

    # Start Render in Background
    # We pass the WHOLE request object as the 'storyboard' context
    background_tasks.add_task(renderer.render_job, job_id, request)
    
    return {"job_id": job_id, "status": "rendering"}

@router.get("/status/{job_id}")
async def get_status(job_id: str):
    """
    Poll this to check if render is done.
    """
    status = project_manager.get_job_status(job_id)
    return status # { status: "completed", output_url: "..." }
