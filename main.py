"""
main.py  —  FastAPI backend for Sunbird AI Pipeline App
"""

import sys
import os

# to make sure backend package is importable when running from project root
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import mutagen
import io

load_dotenv()

from backend.pipeline import run_pipeline
from backend.sunbird_client import LANGUAGE_NAMES

app = FastAPI(title="Sunbird AI Pipeline API", version="1.0.0")

# Allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_audio_duration(audio_bytes: bytes, filename: str) -> float | None:
    """Attempt to read audio duration in seconds using mutagen."""
    try:
        audio = mutagen.File(io.BytesIO(audio_bytes))
        if audio and audio.info:
            return audio.info.length
    except Exception:
        pass
    return None


@app.get("/api/languages")
def get_languages():
    """Return supported target languages."""
    return {"languages": [{"code": k, "name": v} for k, v in LANGUAGE_NAMES.items()]}


@app.post("/api/pipeline/text")
async def pipeline_text(
    text: str = Form(...),
    target_language: str = Form(...),
):
    """Run pipeline from text input."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")
    if target_language not in LANGUAGE_NAMES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {target_language}")

    result = run_pipeline(
        text_input=text,
        audio_bytes=None,
        audio_filename=None,
        audio_duration_seconds=None,
        target_language=target_language,
    )
    if result["error"]:
        raise HTTPException(status_code=422, detail=result["error"])
    return result


@app.post("/api/pipeline/audio")
async def pipeline_audio(
    audio: UploadFile = File(...),
    target_language: str = Form(...),
):
    """Run pipeline from uploaded audio file."""
    if target_language not in LANGUAGE_NAMES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {target_language}")

    allowed_types = {"audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac",
                     "audio/x-m4a", "audio/mp3"}
    if audio.content_type and audio.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {audio.content_type}. "
                   "Please upload MP3, WAV, OGG, M4A, or AAC."
        )

    audio_bytes = await audio.read()
    duration = get_audio_duration(audio_bytes, audio.filename or "audio")

    result = run_pipeline(
        text_input=None,
        audio_bytes=audio_bytes,
        audio_filename=audio.filename or "audio.mp3",
        audio_duration_seconds=duration,
        target_language=target_language,
    )
    if result["error"]:
        raise HTTPException(status_code=422, detail=result["error"])
    return result


@app.get("/api/health")
def health():
    return {"status": "ok"}
