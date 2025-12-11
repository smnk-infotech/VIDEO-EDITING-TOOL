import os
from fastapi import UploadFile
from typing import List

BASE_MEDIA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "media"))
INPUT_DIR = os.path.join(BASE_MEDIA_DIR, "input")
OUTPUT_DIR = os.path.join(BASE_MEDIA_DIR, "output")

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


async def save_uploads(files: List[UploadFile]) -> List[str]:
    saved_paths = []
    for f in files:
        dest_path = os.path.join(INPUT_DIR, f.filename)
        with open(dest_path, "wb") as out:
            out.write(await f.read())
        saved_paths.append(dest_path)
    return saved_paths
