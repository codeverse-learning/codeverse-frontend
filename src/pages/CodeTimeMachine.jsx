import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Clock3, Code2, Play, Pause,
  RotateCcw, SkipBack, SkipForward, Terminal, Database,
  Info, Sparkles, LockKeyhole, ChevronDown, Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const LANGUAGES = [
  { id: "python", label: "Python", available: true },
  { id: "javascript", label: "JavaScript", available: false },
  { id: "java", label: "Java", available: false },
  { id: "c", label: "C", available: false },
  { id: "cpp", label: "C++", available: false },
];

const EXAMPLES = {
  loop: {
    label: "For Loop",
    code: "total = 0\nfor n in range(1, 4):\n    total += n\n    print(total)",
  },
  condition: {
    label: "If / Else",
    code: "score = 75\nif score >= 50:\n    result = 'Pass'\nelse:\n    result = 'Fail'\nprint(result)",
  },
};

export default function CodeTimeMachine() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("python");
  const [exampleKey, setExampleKey] = useState("loop");
  const [code, setCode] = useState(EXAMPLES.loop.code);
  const [result, setResult] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  const steps = result?.steps ?? [];
  const last = steps.length - 1;
  const current = steps[stepIndex] ?? null;
  const lines = code.split("\n");

  useEffect(() => {
    if (!playing || stepIndex >= last || last < 0) return undefined;
    const timer = setTimeout(() => setStepIndex((n) => Math.min(last, n + 1)), 1100);
    return () => clearTimeout(timer);
  }, [playing, stepIndex, last]);

  useEffect(() => {
    if (playing && stepIndex >= last) setPlaying(false);
  }, [playing, stepIndex, last]);

  function resetTrace() {
    setPlaying(false);
    setResult(null);
    setStepIndex(0);
    setRequestError("");
  }

  function chooseExample(key) {
    setExampleKey(key);
    setCode(EXAMPLES[key].code);
    resetTrace();
  }

  function move(index) {
    setPlaying(false);
    setStepIndex(Math.max(0, Math.min(last, index)));
  }

  function togglePlay() {
    if (!steps.length) return;
    if (playing) {
      setPlaying(false);
    } else {
      if (stepIndex >= last) setStepIndex(0);
      setPlaying(true);
    }
  }

  async function runCode() {
    if (!code.trim() || loading) return;
    resetTrace();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/code-trace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ language, code }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Please log in again to run your code.");
        }
        throw new Error(data?.error || data?.message || `Request failed (${response.status})`);
      }
      if (!data || !Array.isArray(data.steps)) {
        throw new Error("Invalid trace response from backend.");
      }
      setResult(data);
    } catch (error) {
      setRequestError(error.message || "Unable to connect to CODEVERSE backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080812] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c0c18]/95 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
            <ArrowLeft size={18} /> Dashboard
          </button>
          <span className="flex items-center gap-2 font-bold text-purple-300"><Clock3 size={19} /> CODEVERSE</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-9 md:px-10">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300">
            <Sparkles size={14} /> LIVE PYTHON TRACING · PHASE 1
          </span>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl">AI Code <span className="text-purple-400">Time Machine</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Write Python code and explore how it executes, one step at a time. More languages and AI explanations are planned.
          </p>
        </div>

        <div className="mb-5 rounded-2xl border border-white/10 bg-[#11111f] p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <label htmlFor="time-machine-language" className="text-sm font-semibold text-white">Programming language</label>
            <span className="text-xs text-gray-500">More languages coming later</span>
          </div>
          <div className="relative max-w-sm">
            <select
              id="time-machine-language"
              value={language}
              onChange={(event) => { setLanguage(event.target.value); resetTrace(); }}
              className="w-full appearance-none rounded-xl border border-purple-500/30 bg-[#090914] px-4 py-3 pr-10 text-sm text-white outline-none focus:border-purple-400"
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id} disabled={!item.available}>
                  {item.label}{item.available ? " — Available" : " — Coming soon"}
                </option>
              ))}
            </select>
            <ChevronDown size={17} className="pointer-events-none absolute right-3 top-3.5 text-purple-300" />
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-gray-400"><LockKeyhole size={13} /> JavaScript, Java, C and C++ are not executable yet.</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-400">Try an example:</span>
          {Object.entries(EXAMPLES).map(([key, item]) => (
            <button key={key} onClick={() => chooseExample(key)}
              className={`rounded-xl border px-4 py-2 text-sm transition ${exampleKey === key ? "border-purple-500/50 bg-purple-500/15 text-purple-200" : "border-white/10 text-gray-400 hover:bg-white/5"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#11111f]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-semibold"><Code2 size={17} className="text-purple-400" /> main.py</span>
              <span className="text-xs text-gray-500">Python · Editable code</span>
            </div>
            <div className="p-4 md:p-6">
              <div className="relative min-h-56 overflow-x-auto rounded-xl bg-[#090914] font-mono text-sm leading-8">
                {result && steps.length > 0 ? (
                  <div className="p-3">
                    {lines.map((line, index) => (
                      <div key={index} className={`flex min-w-max gap-4 rounded-lg border-l-2 px-3 ${index + 1 === current?.lineNumber ? "border-purple-400 bg-purple-500/20 text-purple-100" : "border-transparent text-gray-400"}`}>
                        <span className="w-6 shrink-0 select-none text-right text-gray-600">{index + 1}</span>
                        <span className="whitespace-pre">{line || " "}</span>
                        {index + 1 === current?.lineNumber && <span className="ml-auto text-xs text-purple-400">●</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-56">
                    <div aria-hidden="true" className="select-none border-r border-white/10 px-3 py-3 text-right text-gray-600">
                      {lines.map((_, index) => <div key={index}>{index + 1}</div>)}
                    </div>
                    <textarea
                      aria-label="Python code editor"
                      spellCheck={false}
                      value={code}
                      onChange={(event) => { setCode(event.target.value); setExampleKey(""); resetTrace(); }}
                      className="min-h-56 w-full min-w-0 flex-1 resize-y bg-transparent px-4 py-3 font-mono text-sm leading-8 text-gray-200 outline-none"
                    />
                  </div>
                )}
              </div>
              {result && <button onClick={resetTrace} className="mt-3 text-xs text-purple-300 hover:text-purple-200">Edit code / Clear trace</button>}
              <button
                onClick={runCode}
                disabled={loading || !code.trim()}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 size={17} className="animate-spin" /> : <Play size={17} />}
                {loading ? "Running Python..." : "Run Code"}
              </button>
              {requestError && <p role="alert" className="mt-3 whitespace-pre-wrap text-sm text-red-400">{requestError}</p>}
              {result?.error && <p role="alert" className="mt-3 whitespace-pre-wrap rounded-xl border border-red-500/20 bg-red-500/5 p-3 font-mono text-xs text-red-300">{result.error}</p>}
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-purple-300">{steps.length ? `Execution step ${stepIndex + 1} / ${steps.length}` : "Run code to generate execution steps"}</span>
                <span className="text-xs text-gray-500">{current ? `Line ${current.lineNumber}` : "No active step"}</span>
              </div>
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all" style={{ width: steps.length ? `${((stepIndex + 1) / steps.length) * 100}%` : "0%" }} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button title="Restart" aria-label="Restart" disabled={!steps.length} onClick={() => move(0)} className="rounded-xl border border-white/10 p-3 hover:bg-white/10 disabled:opacity-30"><RotateCcw size={17} /></button>
                <button title="Previous step" aria-label="Previous step" disabled={!steps.length || stepIndex === 0} onClick={() => move(stepIndex - 1)} className="rounded-xl border border-white/10 p-3 hover:bg-white/10 disabled:opacity-30"><SkipBack size={17} /></button>
                <button disabled={!steps.length} onClick={togglePlay} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold hover:from-purple-500 hover:to-blue-500 disabled:opacity-30">
                  {playing ? <Pause size={17} /> : <Play size={17} />} {playing ? "Pause" : stepIndex === last ? "Replay" : "Play"}
                </button>
                <button title="Next step" aria-label="Next step" disabled={!steps.length || stepIndex === last} onClick={() => move(stepIndex + 1)} className="rounded-xl border border-white/10 p-3 hover:bg-white/10 disabled:opacity-30"><SkipForward size={17} /></button>
                <button disabled={!steps.length} onClick={() => move(last)} className="ml-auto flex items-center gap-2 text-sm text-gray-400 hover:text-white disabled:opacity-30">End <ArrowRight size={16} /></button>
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-[#11111f] p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold"><Database size={18} className="text-purple-400" /> Variable Inspector</h2>
              <div className="space-y-2">
                {Object.entries(current?.variables ?? {}).length ? Object.entries(current.variables).map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between gap-3 rounded-xl bg-[#090914] px-4 py-3 text-sm">
                    <code className="text-purple-300">{name}</code>
                    <code className="break-all text-right text-green-300">{String(value)}</code>
                  </div>
                )) : <p className="text-sm text-gray-500">No variables at this step.</p>}
              </div>
            </section>
            <section className="rounded-2xl border border-white/10 bg-[#11111f] p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold"><Terminal size={18} className="text-blue-400" /> Console Output</h2>
              <pre className="min-h-24 whitespace-pre-wrap break-words rounded-xl bg-[#090914] p-4 font-mono text-sm text-green-300">{current?.output || (result && !steps.length ? result.output : "Waiting for output...")}</pre>
              {result && steps.length > 0 && <p className="mt-2 text-xs text-gray-500">Output shown up to the selected step. Full output: <span className="whitespace-pre-wrap text-gray-300">{result.output || "(empty)"}</span></p>}
            </section>
            <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold"><Info size={18} className="text-purple-400" /> What's happening?</h2>
              <p className="text-sm leading-7 text-gray-300">{current?.explanation || "Run your code to explore the execution trace."}</p>
              {current && <p className="mt-2 text-xs text-gray-500">Variable snapshots are captured before the highlighted line executes.</p>}
            </section>
          </div>
        </div>
        <p className="mt-6 text-xs leading-6 text-gray-500">
          Python execution uses the local Docker tracing gateway. Trace explanations are generated by the tracer, not an AI model. This development sandbox is not ready for public deployment.
        </p>
      </main>
    </div>
  );
}
