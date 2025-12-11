import os
import random

# In a real scenario, this would call Pexels/Pixabay API
# For Phase 2 Foundation, we return a "Virtual Path" that the renderer understands

def get_broll_path(keyword: str) -> str:
    """
    Returns a file path for the requested B-Roll keyword.
    If API is configured, downloads and returns local path.
    Otherwise, returns a special placeholder string.
    """
    # Mock Logic
    print(f"[B-Roll Service] Searching for: {keyword}")
    
    # Check for Pexels Key (Future Proofing)
    pexels_key = os.getenv("PEXELS_API_KEY")
    if pexels_key:
        # TODO: Implement Pexels Download
        pass
        
    return f"BROLL_PLACEHOLDER:{keyword}"
