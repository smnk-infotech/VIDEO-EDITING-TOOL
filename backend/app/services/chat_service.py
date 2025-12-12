
import os
import json
import google.generativeai as genai
from typing import Dict, Any

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

MODEL_NAME = "gemini-2.5-flash"  # Using 2.5 Flash for speed/reasoning

async def process_edit_request(current_storyboard: Dict[str, Any], user_message: str) -> Dict[str, Any]:
    """
    Takes the current storyboard JSON and a user's natural language request.
    Returns a tuple: (new_storyboard_json, explanation_text)
    """
    
    prompt = f"""
You are an AI Video Editor Assistant.
Your goal is to modify the keys in the JSON storyboard based on the User's Request.

CURRENT STORYBOARD JSON:
{json.dumps(current_storyboard, indent=2)}

USER REQUEST: "{user_message}"

INSTRUCTIONS:
1. Understand the user's intent (e.g., "remove last scene", "make the hook longer", "change caption").
2. Modify the JSON to reflect this change.
3. Keep the overall structure valid.
4. Return the NEW JSON and a short explanation of what you did.

OUTPUT FORMAT (Strict JSON):
{{
  "explanation": "I removed the last scene as requested.",
  "storyboard": {{ ... new storyboard json ... }}
}}
"""

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith("```"):
            text = text.split("```", 2)[1]
            text = text.lstrip("json").strip()
            
        result = json.loads(text)
        return result
        
    except Exception as e:
        print(f"Chat Service Error: {e}")
        return {
            "explanation": "I encountered an error trying to process that edit.",
            "storyboard": current_storyboard
        }
