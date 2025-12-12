
import datetime
from typing import Dict, Any, Optional

from google.cloud import firestore

db = firestore.Client()

def create_job(job_id: str, owner_user: str) -> None:
    """Creates a new job in Firestore."""
    doc_ref = db.collection("jobs").document(job_id)
    doc_ref.set(
        {
            "job_id": job_id,
            "owner_user": owner_user,
            "status": "queued",
            "progress": 0,
            "created_at": datetime.datetime.now(datetime.timezone.utc),
            "updated_at": datetime.datetime.now(datetime.timezone.utc),
            "output_url": None,
            "message": None,
        }
    )

def update_job_progress(job_id: str, progress: int, message: Optional[str] = None) -> None:
    """Updates the progress of a job in Firestore."""
    doc_ref = db.collection("jobs").document(job_id)
    doc_ref.update(
        {
            "progress": progress,
            "message": message,
            "updated_at": datetime.datetime.now(datetime.timezone.utc),
        }
    )

def set_job_status(job_id: str, status: str) -> None:
    """Sets the status of a job in Firestore."""
    doc_ref = db.collection("jobs").document(job_id)
    doc_ref.update(
        {
            "status": status,
            "updated_at": datetime.datetime.now(datetime.timezone.utc),
        }
    )

def set_job_complete(job_id: str, output_url: str) -> None:
    """Marks a job as complete in Firestore."""
    doc_ref = db.collection("jobs").document(job_id)
    doc_ref.update(
        {
            "status": "complete",
            "progress": 100,
            "output_url": output_url,
            "updated_at": datetime.datetime.now(datetime.timezone.utc),
        }
    )

def set_job_failed(job_id: str, message: str) -> None:
    """Marks a job as failed in Firestore."""
    doc_ref = db.collection("jobs").document(job_id)
    doc_ref.update(
        {
            "status": "failed",
            "message": message,
            "updated_at": datetime.datetime.now(datetime.timezone.utc),
        }
    )

