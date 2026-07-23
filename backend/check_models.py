import google.generativeai as genai
import os
import sys

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("Error: GEMINI_API_KEY belum dikonfigurasi.")
    sys.exit(1)

genai.configure(api_key=API_KEY)

try:
    models = genai.list_models()
    for m in models:
        print(f"Model: {m.name}, generateContent: {'generateContent' in m.supported_generation_methods}")
except Exception as e:
    print(f"Error: {e}")
