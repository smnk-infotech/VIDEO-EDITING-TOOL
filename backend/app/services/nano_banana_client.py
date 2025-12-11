import os
from typing import Optional

NANO_BANANA_API_KEY = os.getenv("NANO_BANANA_API_KEY")


async def apply_vfx_with_nanobanana(
    input_path: str,
    style: str = "cinematic",
    output_dir: str = "./media/output",
) -> Optional[str]:
    """
    Placeholder wrapper for Nano Banana Pro VFX API.

    Args:
        input_path: Path to an existing video clip.
        style: VFX style, e.g. "cinematic", "anime", "glitch".
        output_dir: Where to save the processed clip.

    Returns:
        Local file path to the styled clip, or None if not implemented.
    """
    if not NANO_BANANA_API_KEY:
        return None

    # TODO: Implement real HTTP/API call using Nano Banana Pro API docs.
    return None
