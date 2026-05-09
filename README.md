# Sunbird AI Pipeline App

A full-stack GenAI web application powered by **Sunbird AI's Sunflower LLM** and speech APIs. Accepts typed text or an uploaded audio file and runs it through a complete processing pipeline, producing a translated audio summary in a chosen Ugandan local language.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     User Input                       │
│          Text  ──or──  Audio File (≤5 min)          │
└────────────────────────┬────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │  (Audio path only)  │
              │  STT Transcription  │  POST /tasks/stt
              │  Sunbird STT API    │
              └──────────┬──────────┘
                         │ text
              ┌──────────▼──────────┐
              │    Summarisation    │  POST /tasks/summarise
              │  Sunbird Summarise  │
              └──────────┬──────────┘
                         │ summary
              ┌──────────▼──────────┐
              │    Translation      │  POST /tasks/sunflower_simple
              │  Sunflower LLM      │  (Luganda / Runyankole /
              └──────────┬──────────┘   Ateso / Lugbara / Acholi)
                         │ translated text
              ┌──────────▼──────────┐
              │  Text-to-Speech     │  POST /tasks/tts
              │  Sunbird TTS API    │
              └──────────┬──────────┘
                         │ audio URL
              ┌──────────▼──────────┐
              │      Output         │
              │ transcript, summary,│
              │ translation, audio  │
              └─────────────────────┘
```

**Stack:**
- **Frontend**: Next.js 14 (TypeScript + Tailwind CSS)
- **Backend**: FastAPI (Python 3.11+)
- **AI**: 100% Sunbird AI APIs — STT, Summarisation, Sunflower LLM, TTS

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Sunbird AI API token → [sign up here](https://sunbird.ai)

### 1. Clone

```bash
git clone https://github.com/<your-username>/sunbird-pipeline-app.git
cd sunbird-pipeline-app
```

### 2. Python backend

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate.bat    # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your SUNBIRD_API_TOKEN
```

### 3. Next.js frontend

```bash
cd frontend
npm install
cd ..
```

### 4. Run both servers

**Terminal 1 — backend:**
```bash
uvicorn main:app --reload --port 8000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUNBIRD_API_TOKEN`  | Your Sunbird AI API bearer token. Obtain from the Sunbird AI portal. |

Store these in a `.env` file in the project root (never commit it — it's in `.gitignore`).

---

## Part 1 — Programming Exercises

The `exercises/basics.py` file implements:

- **`collatz(n)`** — returns the full Collatz sequence from `n` down to 1.
- **`distinct_numbers(numbers)`** — returns a sorted list of unique integers.

Run the tests:
```bash
pytest
```

---

## Usage

1. **Choose input mode** — toggle between *Text Input* and *Audio Upload*.
2. **Provide input** — paste/type text, or drag-and-drop / browse for an audio file (MP3, WAV, OGG, M4A, AAC; max 5 minutes).
3. **Pick a target language** — Luganda, Runyankole, Ateso, Lugbara, or Acholi.
4. **Click "Run Pipeline"** — watch the steps complete in real time.
5. **View results** — transcript (audio mode), summary, translated summary, and a playable audio clip.

---

## Deployed Link

🔗 **https://\<your-space\>.hf.space** *(update after deployment)*

---

## Deployment (Hugging Face Spaces)

This project is deployed on Hugging Face Spaces. To deploy your own copy:

```bash
# Create a Space at https://huggingface.co/new-space (choose Gradio/Streamlit SDK
# or Docker for a custom Next.js + FastAPI setup)

git remote add space https://huggingface.co/spaces/<your-username>/<your-space>
git push space main
```

Add your `SUNBIRD_API_TOKEN` under **Space settings → Variables and secrets**.

> **Alternative — Vercel**: deploy the Next.js frontend to Vercel and host the FastAPI backend on Railway, Render, or Fly.io. Set `SUNBIRD_API_TOKEN` as a Vercel environment variable and point `next.config.js` rewrites to your backend URL.

---

## Known Limitations

- **5-minute audio cap**: files longer than 5 minutes are rejected with a clear error message (the Sunbird STT API processes up to 10 minutes, but we enforce 5 as a UX constraint).
- **TTS languages**: TTS is available for Luganda, Runyankole, Ateso, Lugbara, and Acholi. Swahili TTS is available via the API but is not in the translation target list for this app.
- **Summarisation language**: the `/tasks/summarise` endpoint works best with English and Luganda text. Non-English audio transcripts may produce lower-quality summaries.
- **Audio URL expiry**: the TTS-generated audio URL is a temporary signed Google Cloud Storage URL — download or play it promptly.
- **Rate limits**: Sunbird AI free-tier accounts have rate limits; heavy usage may return 429 errors (the UI surfaces these clearly).
