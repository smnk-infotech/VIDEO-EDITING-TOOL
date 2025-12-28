import logging
from typing import List, Dict, Any
import asyncio
import json
from . import storage, renderer
from ..core.gemini_client import gemini_client
from .veo_client import generate_broll_with_veo

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run(
    media_files: list,
    style: str,
    duration_seconds: int,
    aspect_ratio: str,
    use_music: bool,
    use_voiceover: bool,
) -> Dict[str, Any]:
    """
    Main orchestration entrypoint.
    1. Saves uploaded files.
    2. Plans the storyboard.
    3. Renders the final video.
    """
    try:
        # 1. Save media files
        logger.info("Saving media files...")
        media_paths = await storage.save_files(media_files)
        logger.info(f"Media files saved at: {media_paths}")

        # 2. Plan storyboard
        logger.info("Planning storyboard...")
        storyboard = await plan_storyboard(
            media_paths=media_paths,
            style=style,
            duration_seconds=duration_seconds,
            aspect_ratio=aspect_ratio,
            use_music=use_music,
            use_voiceover=use_voiceover,
        )
        logger.info(f"Storyboard planned: {storyboard}")

        # 3. Render video
        logger.info("Rendering video...")
        output_path = await renderer.render_from_storyboard(storyboard)
        logger.info(f"Video rendered at: {output_path}")

        return {"output_path": output_path, "storyboard": storyboard}

    except Exception as e:
        logger.error(f"An error occurred in the orchestrator run: {e}", exc_info=True)
        # Re-raise the exception to be caught by the API endpoint
        raise

async def plan_storyboard(
    media_paths: List[str],
    style: str,
    duration_seconds: int,
    aspect_ratio: str = "9:16",
    use_music: bool = False,
    use_voiceover: bool = False,
) -> Dict[str, Any]:
    """
    Main orchestration entry for planning the reel.
    1. Call Gemini to get the storyboard.
    2. Check for 'ai_broll' scenes and trigger generation.
    3. Return final storyboard with file paths ready for renderer.
    """
    # 1. Get the plan from Gemini
    logger.info("Getting storyboard plan from Gemini...")
    storyboard_text = await gemini_client.analyze_video(
        video_path=media_paths[0], # Simple logic for now
        prompt=f"Act as a professional video editor. Analyze this footage for a {style} video..."
    )
    # Parse JSON
    cleaned = storyboard_text.replace("```json", "").replace("```", "")
    storyboard = json.loads(cleaned)
    logger.info("Received storyboard plan from Gemini.")

    scenes = storyboard.get("scenes", [])

    # 2. Process AI generation tasks
    logger.info("Processing AI generation tasks...")
    # We run them sequentially for now to be safe, but asyncio.gather is better for speed.
    for i, scene in enumerate(scenes):
        input_type = scene.get("input_type")
        provider = scene.get("provider", "").lower()
        prompt = scene.get("prompt", "")
        duration = float(scene.get("duration", 3.0))

        if input_type == "ai_broll":
            generated_path = None

            if "veo" in provider:
                logger.info(f"[Orchestrator] Generating Veo B-roll for scene {i+1}...")
                generated_path = await generate_broll_with_veo(
                    prompt=prompt,
                    duration_seconds=int(duration)
                )

                logger.info(f"Veo generation complete.")

            if generated_path:
                logger.info(f"[Orchestrator] Scene {i+1} generated at {generated_path}")
                scene["file_path"] = generated_path
            else:
                logger.warning(f"[Orchestrator] Scene {i+1} generation skipped/failed.")

    storyboard["use_music"] = use_music
    storyboard["use_voiceover"] = use_voiceover
    logger.info("Storyboard planning complete.")
    return storyboard
