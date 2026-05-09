"""
sunbird_client.py
Thin wrapper around all Sunbird AI API endpoints.
"""

import os
import requests
from typing import Optional

SUNBIRD_BASE_URL = "https://api.sunbird.ai"

# TTS speaker IDs mapped to language codes
TTS_SPEAKER_IDS = {
    "lug": 248,  # Luganda - Female
    "nyn": 243,  # Runyankole - Female
    "teo": 242,  # Ateso - Female
    "lgg": 245,  # Lugbara - Female
    "ach": 241,  # Acholi - Female
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
        raise EnvironmentError(
            "SUNBIRD_API_TOKEN environment variable is not set. "
            "Please add it to your .env file."
        )
    headers = {"Authorization": f"Bearer {token}"}
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def transcribe_audio(audio_bytes: bytes, filename: str = "audio.mp3") -> str:
    """
    Transcribes audio bytes to text using Sunbird STT API.
    Returns the transcribed text string.
    """
    url = f"{SUNBIRD_BASE_URL}/tasks/stt"
    files = {"audio": (filename, audio_bytes)}
    headers = _get_headers(content_type=None)  # multipart — no Content-Type override

    response = requests.post(url, files=files, headers=headers, timeout=120)
    response.raise_for_status()

    data = response.json()
    return data["output"]["text"]


def summarise_text(text: str) -> str:
    """
    Summarises text using the Sunbird summarisation endpoint.
    Returns the summary string.
    """
    url = f"{SUNBIRD_BASE_URL}/tasks/summarise"
    payload = {"text": text}
    headers = _get_headers()

    response = requests.post(url, json=payload, headers=headers, timeout=60)
    response.raise_for_status()

    data = response.json()
    return data["output"]["summary"]


def translate_text(text: str, target_language: str) -> str:
    """
    Translates text into a Ugandan local language using the Sunflower LLM.
    target_language: language code e.g. 'lug', 'nyn', 'teo', 'lgg', 'ach'
    Returns the translated text string.
    """
    lang_name = LANGUAGE_NAMES.get(target_language, target_language)
    url = f"{SUNBIRD_BASE_URL}/tasks/sunflower_simple"
    payload = {
        "instruction": (
            f"Translate the following text into {lang_name}. "
            f"Return only the translated text, nothing else.\n\n{text}"
        ),
        "model_type": "qwen",
        "temperature": 0.3,
    }
    headers = _get_headers()

    response = requests.post(url, json=payload, headers=headers, timeout=60)
    response.raise_for_status()

    data = response.json()
    return data["output"]["content"]


def synthesise_speech(text: str, language: str) -> str:
    """
    Converts text to speech using Sunbird TTS API.
    language: language code e.g. 'lug'
    Returns a temporary audio URL string.
    """
    speaker_id = TTS_SPEAKER_IDS.get(language)
    if not speaker_id:
        raise ValueError(
            f"No TTS speaker available for language '{language}'. "
            f"Supported: {list(TTS_SPEAKER_IDS.keys())}"
        )

    url = f"{SUNBIRD_BASE_URL}/tasks/tts"
    payload = {"text": text, "speaker_id": speaker_id}
    headers = _get_headers()

    response = requests.post(url, json=payload, headers=headers, timeout=60)
    response.raise_for_status()

    data = response.json()
    return data["output"]["audio_url"]
