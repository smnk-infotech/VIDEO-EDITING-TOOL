import os
from typing import Optional

VEO_API_KEY = os.getenv("VEO_API_KEY")


async def generate_broll_with_veo(
    prompt: str,
    duration_seconds: int = 3,
    output_dir: str = "./media/output",
) -> Optional[str]:
    """
    Placeholder for Veo 3 integration.

    Args:
        prompt: Text prompt describing the cinematic b-roll.
        duration_seconds: Desired clip length in seconds.
        output_dir: Where to save the generated video.

    Returns:
        Local file path to the generated clip, or None if not implemented.
    """
    if not VEO_API_KEY:
        # Not configured yet – just return None for now.
        return None

    # TODO: Implement real HTTP/API call to Veo 3 when you have SDK/docs.
    return None
