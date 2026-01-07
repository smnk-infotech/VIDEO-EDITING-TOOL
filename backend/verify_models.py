
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load env directly to be sure
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ ERROR: GOOGLE_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

# Models to test based on user list
candidates = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]

print(f"🔑 Testing API Key: {api_key[:5]}...{api_key[-5:]}")
print("--------------------------------------------------")

best_model = None

for model_name in candidates:
    print(f"Testing {model_name}...", end=" ")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello, can you hear me?")
        if response.text:
            print(f"✅ WORKS! (Latency: Fast)")
            if not best_model:
                best_model = model_name
        else:
            print(f"⚠️  Empty Response")
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")

print("--------------------------------------------------")
if best_model:
    print(f"🏆 BEST AVAILABLE MODEL: {best_model}")
else:
    print("💀 NO MODELS WORKED. Please check your API Key.")
