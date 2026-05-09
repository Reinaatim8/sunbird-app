"""
pipeline.py
Orchestrates the full STT -> Summarise -> Translate -> TTS pipeline.
"""

from . import sunbird_client

MAX_AUDIO_DURATION_SECONDS = 5 * 60  # 5 minutes


def run_pipeline(
    text_input: str | None,
    audio_bytes: bytes | None,
    audio_filename: str | None,
    audio_duration_seconds: float | None,
    target_language: str,
) -> dict:
    """
    Runs the full pipeline and returns a result dict with keys:
      - transcript (str | None)
      - summary (str)
      - translation (str)
      - audio_url (str)
      - error (str | None)
    """
    result = {
        "transcript": None,
        "summary": None,
        "translation": None,
        "audio_url": None,
        "error": None,
    }

    try:
        # Step 1: Get text (from direct input or via STT)
        if audio_bytes is not None:
            if audio_duration_seconds and audio_duration_seconds > MAX_AUDIO_DURATION_SECONDS:
                raise ValueError(
                    f"Audio file is too long ({audio_duration_seconds / 60:.1f} min). "
                    "Please upload a file shorter than 5 minutes."
                )
            transcript = sunbird_client.transcribe_audio(audio_bytes, audio_filename or "audio.mp3")
            result["transcript"] = transcript
            working_text = transcript
        elif text_input and text_input.strip():
            working_text = text_input.strip()
        else:
            raise ValueError("Please provide either text input or an audio file.")

        # Step 2: Summarise
        summary = sunbird_client.summarise_text(working_text)
        result["summary"] = summary

        # Step 3: Translate
        translation = sunbird_client.translate_text(summary, target_language)
        result["translation"] = translation

        # Step 4: TTS
        audio_url = sunbird_client.synthesise_speech(translation, target_language)
        result["audio_url"] = audio_url

    except ValueError as e:
        result["error"] = str(e)
    except Exception as e:
        result["error"] = f"An API error occurred: {str(e)}"

    return result
