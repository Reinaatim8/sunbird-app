"use client";

import { useState, useRef } from "react";
import {
  Mic,
  FileText,
  Upload,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Volume2,
  Languages,
  AlignLeft,
  Bird,
} from "lucide-react";

const LANGUAGES = [
  { code: "lug", name: "Luganda" },
  { code: "nyn", name: "Runyankole" },
  { code: "teo", name: "Ateso" },
  { code: "lgg", name: "Lugbara" },
  { code: "ach", name: "Acholi" },
];

type InputMode = "text" | "audio";
type StepStatus = "idle" | "loading" | "done" | "error";

interface PipelineResult {
  transcript?: string;
  summary?: string;
  translation?: string;
  audio_url?: string;
}

interface StepState {
  transcribe: StepStatus;
  summarise: StepStatus;
  translate: StepStatus;
  tts: StepStatus;
}

const STEP_LABELS = {
  transcribe: "Transcribing audio",
  summarise:  "Summarising text",
  translate:  "Translating",
  tts:        "Generating speech",
};

export default function Home() {
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("lug");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepState>({
    transcribe: "idle",
    summarise:  "idle",
    translate:  "idle",
    tts:        "idle",
  });
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setResult(null);
    setError(null);
    setSteps({ transcribe: "idle", summarise: "idle", translate: "idle", tts: "idle" });
  };

  const setStep = (key: keyof StepState, status: StepStatus) =>
    setSteps((prev) => ({ ...prev, [key]: status }));

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const allowed = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac", "audio/x-m4a"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported file type. Please upload MP3, WAV, OGG, M4A, or AAC.");
      return;
    }
    setAudioFile(file);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const runPipeline = async () => {
    resetState();
    setRunning(true);

    try {
      const formData = new FormData();
      formData.append("target_language", language);

      let endpoint: string;

      if (mode === "text") {
        if (!text.trim()) {
          setError("Please enter some text.");
          setRunning(false);
          return;
        }
        formData.append("text", text);
        endpoint = "https://sunbird-backend-gwu5.onrender.com/api/pipeline/text";
        setStep("summarise", "loading");
      } else {
        if (!audioFile) {
          setError("Please upload an audio file.");
          setRunning(false);
          return;
        }
        formData.append("audio", audioFile);
        endpoint = "https://sunbird-backend-gwu5.onrender.com/api/pipeline/audio";
        setStep("transcribe", "loading");
      }

      const res = await fetch(endpoint, { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data: PipelineResult = await res.json();

      // Animate steps completing
      if (mode === "audio" && data.transcript) {
        setStep("transcribe", "done");
      }
      setStep("summarise", "done");
      setStep("translate", "done");
      setStep("tts", "done");

      setResult(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setSteps({ transcribe: "idle", summarise: "idle", translate: "idle", tts: "idle" });
    } finally {
      setRunning(false);
    }
  };

  const stepIcon = (status: StepStatus) => {
    if (status === "loading") return <Loader2 className="w-4 h-4 animate-spin text-sun-500" />;
    if (status === "done")    return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "error")   return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 rounded-full border-2 border-earth-300" />;
  };

  const langName = LANGUAGES.find((l) => l.code === language)?.name ?? language;

  return (
    <main className="relative z-10 min-h-screen px-4 py-12 max-w-2xl mx-auto">

      {/* Header */}
      
      <header className="mb-12 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full
                        bg-sun-100 border border-sun-200 text-sun-700 text-xs font-mono font-medium">
          <Bird className="w-3.5 h-3.5" />
          Sunbird AI · Ugandan Languages
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink leading-tight">
          Voice{" "}
          <span className="text-sun-500 italic">Pipeline</span>
        </h1>
        <p className="mt-3 text-earth-600 font-body text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Transcribe audio, summarise the content, translate it into a Ugandan language,
          and hear it spoken aloud all in one flow.
        </p>
      </header>

      {/* Input mode tabs */}
      <div className="flex gap-2 p-1 bg-earth-100 rounded-xl mb-6" style={{ animationDelay: "0.1s" }}>
        <button
          className={`tab-btn flex-1 flex items-center justify-center gap-2 ${mode === "text" ? "active" : "inactive"}`}
          onClick={() => { setMode("text"); resetState(); }}
        >
          <FileText className="w-4 h-4" /> Text Input
        </button>
        <button
          className={`tab-btn flex-1 flex items-center justify-center gap-2 ${mode === "audio" ? "active" : "inactive"}`}
          onClick={() => { setMode("audio"); resetState(); }}
        >
          <Mic className="w-4 h-4" /> Audio Upload
        </button>
      </div>

      {/* Input area */}
      <div className="mb-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        {mode === "text" ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here…"
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-earth-200 bg-white
                       font-body text-sm text-ink placeholder-earth-400 resize-none
                       focus:outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-100
                       transition-all duration-200"
          />
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200
              ${dragOver ? "border-sun-400 bg-sun-50" : "border-earth-300 bg-white hover:border-sun-300 hover:bg-sun-50"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <Upload className="w-8 h-8 text-earth-400 mx-auto mb-3" />
            {audioFile ? (
              <div>
                <p className="font-body font-medium text-ink text-sm">{audioFile.name}</p>
                <p className="text-xs text-earth-500 mt-1">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB · click to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="font-body font-medium text-earth-700 text-sm">
                  Drop audio file here or click to browse
                </p>
                <p className="text-xs text-earth-400 mt-1">MP3, WAV, OGG, M4A, AAC · max 5 minutes</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Language picker */}
      <div className="mb-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <label className="label block mb-2">
          <Languages className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
          Target language
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-all duration-150
                ${language === l.code
                  ? "bg-sun-500 text-white shadow-sm"
                  : "bg-white border border-earth-200 text-earth-700 hover:border-sun-300"}`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Run button */}
      <div className="mb-8 animate-fade-up" style={{ animationDelay: "0.25s" }}>
        <button
          onClick={runPipeline}
          disabled={running}
          className="btn-primary w-full justify-center text-base"
        >
          {running ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
          ) : (
            <>Run Pipeline <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Pipeline progress */}
      {running && (
      <div className="mb-6 rounded-xl border border-earth-200 bg-white p-4 space-y-3 animate-fade-up">
        <div className="flex items-center gap-2 mb-2 p-3 rounded-lg bg-sun-50 border border-sun-200">
          <Loader2 className="w-4 h-4 animate-spin text-sun-500 shrink-0" />
          <p className="font-body text-sm text-sun-700">
             Please be patient — this pipeline makes several API calls and may take
            1–3 minutes to complete. Sit tight!
          </p>
        </div>
    <p className="label">Pipeline progress</p>
          {(mode === "audio" ? ["transcribe", "summarise", "translate", "tts"] : ["summarise", "translate", "tts"]).map((key) => (
            <div key={key} className="flex items-center gap-3">
              {stepIcon(steps[key as keyof StepState])}
              <span className="font-body text-sm text-earth-700">
                {STEP_LABELS[key as keyof typeof STEP_LABELS]}
              </span>
            </div>
          ))}
        </div>
      )}

       {/* Error */}
        {error && (
          <div className="mb-6 animate-fade-up">
            <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-sm text-red-800">Something went wrong</p>
                  <p className="font-body text-sm text-red-700 mt-1">
                    {error.includes("Failed to fetch") 
                      ? "The server is taking a moment to wake up or you have no internet. Please wait 30 seconds and try again." 
                      : error}
                  </p>
                </div>
              </div>
              
              {/* Try Again Button */}
              <button
                onClick={runPipeline}
                disabled={running}
                className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-lg
                          bg-white border border-red-200 text-red-700 text-sm font-medium
                          hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {running ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Try again"
                )}
              </button>
            </div>
          </div>
        )}


      {/* Results */}
      {result && !running && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center gap-2 text-green-600 font-body font-medium text-sm mb-2">
            <CheckCircle className="w-4 h-4" />
            Pipeline complete!
          </div>

          {result.transcript && (
            <div className="result-block">
              <p className="label flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Transcript
              </p>
              <p className="font-body text-sm text-ink leading-relaxed pt-1">{result.transcript}</p>
            </div>
          )}

          {result.summary && (
            <div className="result-block">
              <p className="label flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5" /> Summary
              </p>
              <p className="font-body text-sm text-ink leading-relaxed pt-1">{result.summary}</p>
            </div>
          )}

          {result.translation && (
            <div className="result-block">
              <p className="label flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" /> Translation · {langName}
              </p>
              <p className="font-body text-sm text-ink leading-relaxed pt-1 italic">{result.translation}</p>
            </div>
          )}

          {result.audio_url && (
            <div className="result-block border-sun-200 bg-sun-50">
              <p className="label flex items-center gap-1.5 text-sun-700">
                <Volume2 className="w-3.5 h-3.5" /> Synthesised Speech · {langName}
              </p>
              <audio
                controls
                src={result.audio_url}
                className="w-full mt-2 rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-xs font-mono text-earth-400 space-y-1">
        <p>Powered by <span className="text-sun-500">Sunbird AI</span> · Sunflower LLM</p>
        <p>STT · Summarisation · Translation · TTS</p>
      </footer>
    </main>
  );
}
