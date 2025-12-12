
import os
import datetime
from typing import List
from fastapi import UploadFile
from google.cloud import storage

# Cloud Run injects 'K_SERVICE' or 'GOOGLE_CLOUD_PROJECT'
IS_CLOUD_RUN = os.getenv("K_SERVICE") is not None
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
STORAGE_BUCKET = os.getenv("STORAGE_BUCKET")

if not STORAGE_BUCKET:
    if GOOGLE_CLOUD_PROJECT:
        STORAGE_BUCKET = f"{GOOGLE_CLOUD_PROJECT}.appspot.com"
    else:
        # A default bucket name for local development, if you have one.
        # Or raise an error if it's essential for local dev too.
        print("Warning: STORAGE_BUCKET environment variable not set.")
        STORAGE_BUCKET = "avea-media-video-editing-git-918280-158e1"

# Local Fallback for temporary files, not for primary storage
BASE_MEDIA_DIR = "/tmp/media" if IS_CLOUD_RUN else os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "media"))
INPUT_DIR = os.path.join(BASE_MEDIA_DIR, "input")
OUTPUT_DIR = os.path.join(BASE_MEDIA_DIR, "output")

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

storage_client = storage.Client()

def get_gcs_bucket():
    """Gets the GCS bucket."""
    return storage_client.bucket(STORAGE_BUCKET)

def get_signed_upload_url(file_name: str, content_type: str) -> str:
    """Generates a signed URL for uploading a file to GCS."""
    bucket = get_gcs_bucket()
    blob = bucket.blob(f"input/{file_name}")

    # The URL is valid for 15 minutes.
    expiration = datetime.timedelta(minutes=15)

    url = blob.generate_signed_url(
        version="v4",
        expiration=expiration,
        method="PUT",
        content_type=content_type,
    )
    return url

async def save_uploads(files: List[UploadFile]) -> List[str]:
    """Saves uploaded files to a temporary local directory."""
    saved_paths = []
    for f in files:
        dest_path = os.path.join(INPUT_DIR, f.filename)
        with open(dest_path, "wb") as out:
            out.write(await f.read())
        saved_paths.append(dest_path)
    return saved_paths

def get_output_dir() -> str:
    """Returns the local output directory."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    return OUTPUT_DIR

def upload_to_gcs(local_path: str, remote_path: str) -> str:
    """Uploads a file from a local path to GCS and returns its public URL."""
    bucket = get_gcs_bucket()
    blob = bucket.blob(remote_path)
    blob.upload_from_filename(local_path)
    return blob.public_url

