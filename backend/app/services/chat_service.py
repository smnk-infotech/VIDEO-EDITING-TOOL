
import os
import json
import logging
import google.generativeai as genai
from typing import Dict, Any

logger = logging.getLogger(__name__)

async def process_edit_request(current_storyboard: Dict[str, Any], user_message: str) -> Dict[str, Any]:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise Exception("Missing GOOGLE_API_KEY")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash", generation_config={"response_mime_type": "application/json"})

    # Clean storyboard for token efficiency (remove large base64s if any)
    sb_context = {k:v for k,v in current_storyboard.items() if k != "result"}

    prompt = f"""
    SYSTEM: You are a Video Editing Agent. 
    TASK: Update the JSON storyboard to fulfill the USER REQUEST.
    INPUT JSON: {json.dumps(sb_context)}
    USER REQUEST: "{user_message}"
    
    RESPONSE FORMAT (JSON ONLY):
    {{
      "explanation": "Briefly explain what you changed.",
      "storyboard": {{ ... the complete updated storyboard json ... }}
    }}
    
    RULES:
    - Keep "source_file" key unchanged.
    - If user says "Trim first 5s", adjust "scenes".
    - "scenes" items have "start" (float), "end" (float).
    """

    try:
        response = await model.generate_content_async(prompt)
        text = response.text
        
        # Unfence
        if text.startswith("```"):
            text = text.split("```", 2)[1]
            text = text.lstrip("json").strip()
            
        return json.loads(text)
        
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        # Fallback
        return {
            "explanation": "I failed to process that request. Please try again.",
            "storyboard": current_storyboard
        }
