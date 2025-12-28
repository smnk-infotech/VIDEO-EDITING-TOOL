import google.generativeai as genai
import os
import time
from .config import settings

gemini_client = None

class GeminiClient:
    def __init__(self):
        self.model = None
        if not settings.GOOGLE_API_KEY:
            print("Warning: GOOGLE_API_KEY is missing. AI features will be disabled.")
            return
        
        try:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.model = genai.GenerativeModel("gemini-1.5-pro-latest")
        except Exception as e:
            print(f"Failed to initialize Gemini: {e}")

    async def analyze_video(self, video_path: str, prompt: str = "Analyze this video for viral potential."):
        if not self.model:
            print("MOCK ANALYSIS: Gemini API Key missing.")
            # Return a valid mock JSON structure so the frontend doesn't break
            return """
            ```json
            {
                "summary": "Mock Analysis (API Key Missing)",
                "scores": {"viralPotential": 75, "retention": "Med"},
                "scenes": []
            }
            ```
            """

        print(f"Uploading file to Gemini: {video_path}")
        
        try:
            video_file = genai.upload_file(video_path)
            
            # Wait for processing
            while video_file.state.name == "PROCESSING":
                print("Processing video...")
                time.sleep(2)
                video_file = genai.get_file(video_file.name)

            if video_file.state.name == "FAILED":
                raise ValueError("Video processing failed.")

            print("Generating content...")
            response = self.model.generate_content([prompt, video_file], request_options={"timeout": 600})
            
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
            raise e

gemini_client = GeminiClient()
