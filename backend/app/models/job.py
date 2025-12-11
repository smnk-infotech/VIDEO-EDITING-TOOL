from pydantic import BaseModel
from typing import Optional


class JobResponse(BaseModel):
    job_id: str
    status: str
    output_url: Optional[str] = None
    message: Optional[str] = None
