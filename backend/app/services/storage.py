import os
from fastapi import UploadFile
from typing import List

# Cloud Run injects 'K_SERVICE' or 'GOOGLE_CLOUD_PROJECT'
IS_CLOUD_RUN = os.getenv("K_SERVICE") is not None
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
BUCKET_NAME = f"{GOOGLE_CLOUD_PROJECT}.appspot.com" if GOOGLE_CLOUD_PROJECT else None

# Local Fallback or Cloud Run Temp
if IS_CLOUD_RUN:
    BASE_MEDIA_DIR = "/tmp/media"
else:
    BASE_MEDIA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "media"))

INPUT_DIR = os.path.join(BASE_MEDIA_DIR, "input")
OUTPUT_DIR = os.path.join(BASE_MEDIA_DIR, "output")

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Helper function not strictly needed if we assume local filesystem usage in /tmp
# But good for future GCS expansion. For now, we rely on the mount in main.py


async def save_uploads(files: List[UploadFile]) -> List[str]:
    """
    Saves uploaded files.
    - Local: ./media/input/filename
    - Cloud: gs://bucket_name/input/filename (Returns signed URL or public URL? Or just temp local path?)
    
    Correction: For processing in Cloud Run, we usually need the file locally in the container /tmp
    unless we rewrite Gemini/Renderer to read from GCS directly.
    For this MVP deployment, we will save to /tmp in container (ephemeral)
    because our Renderer uses local file paths.
    """
    saved_paths = []
    
    if IS_CLOUD_RUN:
        # Save to /tmp for processing (It's an in-memory tempfs on Cloud Run usually)
        temp_dir = "/tmp/input"
        os.makedirs(temp_dir, exist_ok=True)
        
        for f in files:
            dest_path = os.path.join(temp_dir, f.filename)
            with open(dest_path, "wb") as out:
                out.write(await f.read())
            saved_paths.append(dest_path)
            
        return saved_paths
    else:
        # Local Development
        for f in files:
            dest_path = os.path.join(INPUT_DIR, f.filename)
            with open(dest_path, "wb") as out:
                out.write(await f.read())
            saved_paths.append(dest_path)
        return saved_paths

# NOTE: OUTPUT_DIR needs to be determined at runtime by renderer
def get_output_dir():
    if IS_CLOUD_RUN:
        dir_path = "/tmp/output"
        os.makedirs(dir_path, exist_ok=True)
        return dir_path
    return OUTPUT_DIR

