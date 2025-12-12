
from typing import List, Dict, Any
import asyncio

from .gemini_client import analyze_media_with_gemini
from .veo_client import generate_broll_with_veo
from .nano_banana_client import apply_vfx_with_nanobanana


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
    storyboard = await analyze_media_with_gemini(
        media_paths=media_paths,
        style=style,
        target_duration_seconds=duration_seconds,
        aspect_ratio=aspect_ratio,
    )

    scenes = storyboard.get("scenes", [])
    
    # 2. Process AI generation tasks
    # We run them sequentially for now to be safe, but asyncio.gather is better for speed.
    for i, scene in enumerate(scenes):
        input_type = scene.get("input_type")
        provider = scene.get("provider", "").lower()
        prompt = scene.get("prompt", "")
        duration = float(scene.get("duration", 3.0))
        
        if input_type == "ai_broll":
            generated_path = None
            
            if "veo" in provider:
                print(f"[Orchestrator] Generating Veo B-roll for scene {i+1}...")
                generated_path = await generate_broll_with_veo(
                    prompt=prompt,
                    duration_seconds=int(duration)
                )
            
            elif "nano" in provider:
                 print(f"[Orchestrator] Generating Nano Banana VFX for scene {i+1}...")
                 # Nano usually processes an existing clip, but if used for generation:
                 # logical placeholder for now. If input was user_clip + vfx, logic would differ.
                 generated_path = await apply_vfx_with_nanobanana(
                     input_path="", # Placeholder if strict generation, or pass a source
                     style=style 
                 )
            
            if generated_path:
                print(f"[Orchestrator] Scene {i+1} generated at {generated_path}")
                scene["file_path"] = generated_path
            else:
                print(f"[Orchestrator] Scene {i+1} generation skipped/failed.")

    storyboard["use_music"] = use_music
    storyboard["use_voiceover"] = use_voiceover
    return storyboard
