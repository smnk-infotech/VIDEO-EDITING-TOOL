
import json
import os
import logging
from typing import Dict, Any

JOBS_FILE = "jobs_db.json"
jobs_cache = {}

if os.path.exists(JOBS_FILE):
    try:
        with open(JOBS_FILE, "r") as f:
            jobs_cache = json.load(f)
    except:
        jobs_cache = {}

def _save():
    with open(JOBS_FILE, "w") as f:
        json.dump(jobs_cache, f, indent=2)

def create_project(name: str, user_id: str, file_path: str):
    import uuid
    project_id = str(uuid.uuid4())
    project = {
        "id": project_id,
        "name": name,
        "user_id": user_id,
        "file_path": file_path,
        "status": "created",
        "created_at": str(os.path.getctime(file_path))
    }
    jobs_cache[project_id] = project
    _save()
    return project

def update_project(project_id: str, data: Dict[str, Any]):
    if project_id in jobs_cache:
        jobs_cache[project_id].update(data)
        _save()

def set_job_status(job_id: str, status: str, result: Dict[str, Any] = None):
    # Depending on how we map jobs to projects. 
    # For MVP, let's treat job_id as the primary key or assume job_id maps to something.
    # In router.py, we generated job_id and saved it in result.
    # But wait, create_project returns 'id' (project_id). Router uses job_id for the file.
    # Let's unify.
    
    # Simple lookup
    if job_id not in jobs_cache:
        jobs_cache[job_id] = {}
        
    jobs_cache[job_id]["status"] = status
    if result:
        jobs_cache[job_id]["result"] = result
    _save()

def get_job_status(job_id: str):
    return jobs_cache.get(job_id, {"status": "unknown"})
