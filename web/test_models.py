import os
import requests
from dotenv import load_dotenv

load_dotenv("web/.env.local")
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("No API key found")
    exit(1)

def test_model(model_name):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": "Hello"}]}]
    }
    response = requests.post(url, json=payload)
    print(f"Model {model_name} -> Status: {response.status_code}")
    if response.status_code != 200:
        print(response.json())

test_model("gemini-2.5-flash")
test_model("gemini-2.0-flash-lite")
test_model("gemini-2.0-flash")
test_model("gemini-1.5-flash")
