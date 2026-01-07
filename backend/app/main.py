
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load Environment
load_dotenv()

from .api.router import router

app = FastAPI(title="AVEA Backend (Reboot)")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for MVP/Local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static for Output Videos
os.makedirs("public/outputs", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="public/outputs"), name="outputs")

# Include Router
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "AVEA AI Engine Online"}
