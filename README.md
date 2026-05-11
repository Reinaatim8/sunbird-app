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

### 1. Clone

```bash
git clone https://github.com/Reinaatim8/sunbird-app.git
cd sunbird-app
```

### 2. Python backend

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edited .env and set the SUNBIRD_API_TOKEN
```

### 3. Next.js frontend

```bash
cd frontend
npm install
cd ..
```

### 4. Running both servers locally first

**Terminal 1 — Backend (FastAPI):**
```bash
# Ensure your virtual environment is active
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend (Next.js):**
```bash
cd frontend
npm run dev
```

Once both are running, open **[http://localhost:3000](http://localhost:3000)** in your browser to use the app.

---

---

## Environment Variables

The application requires the following environment variables to function correctly. 

### Backend (.env)
Create a `.env` file in the root directory:


| Variable | Required | Description |
|---|---|---|
| `SUNBIRD_API_TOKEN` | **Yes** | Your Sunbird AI API bearer token. Obtain this from the [Sunbird AI Portal](https://sunbird.ai). |

### Frontend (.env.local)
If you are using environment variables to manage your API location in the frontend:


| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | **Yes** | The base URL of your backend (e.g., `https://onrender.com` for production or `http://localhost:8000` for local dev). |

> **Note:** Never commit your `.env` files to GitHub. They are included in the `.gitignore` to protect your API keys.

---

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
4. **Click "Run Pipeline"** — watch the steps complete in real time and an output is produced. This pipeline may tae some time to load due to several calls being amde at once hence abit slow.
5. **View results** — transcript (audio mode), summary, translated summary, and a playable audio clip.

---

## Deployed Link on Vercel and the Backend on Vercel

 **https://sunbird-frontend.vercel.app/**
 **https://sunbird-backend-gwu5.onrender.com/api/health -to test functionality of the deployed backend**

---

## Known Limitations

- **5-minute audio cap**: files longer than 5 minutes are rejected with a clear error message (the Sunbird STT API processes up to 10 minutes, but we enforce 5 as a UX constraint).
- **TTS languages**: TTS is available for Luganda, Runyankole, Ateso, Lugbara, and Acholi. Swahili TTS is available via the API but is not in the translation target list for this app.
- **Summarisation language**: the `/tasks/summarise` endpoint works best with English and Luganda text. Non-English audio transcripts may produce lower-quality summaries.
- **Audio URL expiry**: the TTS-generated audio URL is a temporary signed Google Cloud Storage URL — download or play it promptly.
- **Rate limits**: Sunbird AI free-tier accounts have rate limits; heavy usage may return 429 errors (the UI surfaces these clearly).
- **Render Cold Start**: The backend is hosted on a Render Free Instance. If the app hasn't been used in 15 minutes, the first request may take ~50 seconds to complete while the server spins up.
