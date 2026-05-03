import os
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")
api_key = os.getenv("GEMINI_API_KEY")
print(api_key)

if not api_key:
    print("No API key found in web/.env.local")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
response = requests.get(url)
if response.status_code == 200:
    models = response.json().get("models", [])
    print("Available Gemini Models:")
    for m in models:
        if "gemini" in m["name"]:
            print(f"- {m['name']}")
else:
    print(f"Failed to fetch models: {response.status_code}")
    print(response.text)
