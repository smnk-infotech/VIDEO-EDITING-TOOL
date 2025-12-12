from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api.router import api_router
from .services import storage

app = FastAPI(
    title="A.V.E.A – Automated Video Editing Agent",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

# Serve media directory (input + output) as static files
app.mount(
    "/media",
    StaticFiles(directory=storage.BASE_MEDIA_DIR),
    name="media",
)
