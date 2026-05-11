"""
sunbird_client.py
Thin wrapper around all Sunbird AI API endpoints.
"""

import os
import requests
from typing import Optional

SUNBIRD_BASE_URL = "https://api.sunbird.ai"

TTS_SPEAKER_IDS = {
    "lug": 248,
    "nyn": 243,
    "teo": 242,
    "lgg": 245,
    "ach": 241,
}

LANGUAGE_NAMES = {
    "lug": "Luganda",
    "nyn": "Runyankole",
    "teo": "Ateso",
    "lgg": "Lugbara",
    "ach": "Acholi",
}


def _get_headers(content_type: Optional[str] = "application/json") -> dict:
    token = os.environ.get("SUNBIRD_API_TOKEN")
    if not token:
        raise EnvironmentError("SUNBIRD_API_TOKEN is not set in your .env file.")
    headers = {"Authorization": f"Bearer {token}"}
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def transcribe_audio(audio_bytes: bytes, filename: str = "audio.mp3") -> str:
    url = f"{SUNBIRD_BASE_URL}/tasks/stt"
    files = {"audio": (filename, audio_bytes)}
    headers = _get_headers(content_type=None)
    response = requests.post(url, files=files, headers=headers, timeout=180)
    response.raise_for_status()
    data = response.json()
    return data["output"]["text"]


def summarise_text(text: str) -> str:
    url = f"{SUNBIRD_BASE_URL}/tasks/summarise"
    payload = {"text": text}
    headers = _get_headers()
    response = requests.post(url, json=payload, headers=headers, timeout=180)
    response.raise_for_status()
    data = response.json()
    return data["summarized_text"]


def translate_text(text: str, target_language: str) -> str:
    lang_name = LANGUAGE_NAMES.get(target_language, target_language)
    url = f"{SUNBIRD_BASE_URL}/tasks/sunflower_inference"
    payload = {
        "messages": [
            {
                "role": "system",
                "content": f"You are a translator. Translate the user's text into {lang_name}. Return only the translated text, nothing else."
            },
            {
                "role": "user",
                "content": text
            }
        ]
    }
    headers = _get_headers()
    response = requests.post(url, json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    data = response.json()
    return data["content"]


def synthesise_speech(text: str, language: str) -> str:
    speaker_id = TTS_SPEAKER_IDS.get(language)
    if not speaker_id:
        raise ValueError(f"No TTS speaker for language '{language}'.")
    url = f"{SUNBIRD_BASE_URL}/tasks/tts"
    payload = {"text": text, "speaker_id": speaker_id}
    headers = _get_headers()
    response = requests.post(url, json=payload, headers=headers, timeout=180)
    response.raise_for_status()
    data = response.json()
    return data["output"]["audio_url"]