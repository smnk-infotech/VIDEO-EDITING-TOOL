import os
import json
import shutil
import uuid
from datetime import datetime
from typing import List, Dict, Optional
from .config import settings

PROJECTS_FILE = os.path.join(os.getcwd(), "projects.json")

class ProjectManager:
    def __init__(self):
        self._ensure_file()

    def _ensure_file(self):
        if not os.path.exists(PROJECTS_FILE):
            with open(PROJECTS_FILE, 'w') as f:
                json.dump([], f)

    def _load(self) -> List[Dict]:
        with open(PROJECTS_FILE, 'r') as f:
            return json.load(f)

    def _save(self, projects: List[Dict]):
        with open(PROJECTS_FILE, 'w') as f:
            json.dump(projects, f, indent=2)

    def create_project(self, name: str, user_id: str, file_path: str = None) -> Dict:
        projects = self._load()
        new_project = {
            "id": str(uuid.uuid4()),
            "name": name,
            "userId": user_id,
            "status": "uploading" if not file_path else "ready",
            "createdAt": datetime.now().isoformat(),
            "videoPath": file_path,
            "thumbnailUrl": "/placeholder.jpg" # Placeholder
        }
        projects.append(new_project)
        self._save(projects)
        return new_project

    def get_user_projects(self, user_id: str) -> List[Dict]:
        projects = self._load()
        # Filter by user_id logic here if needed, or return all for dev
        return [p for p in projects if p.get("userId") == user_id or user_id == "dev_user_123"]

    def update_project_status(self, project_id: str, status: str, result: Dict = None):
        projects = self._load()
        for p in projects:
            if p["id"] == project_id:
                p["status"] = status
                if result:
                    p["analysisResult"] = result
                p["updatedAt"] = datetime.now().isoformat()
        self._save(projects)

    def delete_project(self, project_id: str, user_id: str) -> bool:
        projects = self._load()
        project = next((p for p in projects if p["id"] == project_id), None)
        
        if not project:
            return False
            
        # Permission check (bypass for dev)
        if project["userId"] != user_id and user_id != "dev_user_123":
            return False

        # File Cleanup
        if project.get("videoPath") and os.path.exists(project["videoPath"]):
            try:
                os.remove(project["videoPath"])
            except:
                pass

        projects = [p for p in projects if p["id"] != project_id]
        self._save(projects)
        return True

project_manager = ProjectManager()
