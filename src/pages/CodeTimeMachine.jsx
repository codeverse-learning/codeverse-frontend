import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Clock3, Code2, Play, Pause,
  RotateCcw, SkipBack, SkipForward, Terminal, Database,
  Info, Sparkles, LockKeyhole, ChevronDown, Loader2, Copy, CheckCircle2, Gauge,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const LANGUAGES = [
  { id: "python", label: "Python", available: true },
  { id: "javascript", label: "JavaScript", available: true },
  { id: "java", label: "Java", available: true},
  { id: "c", label: "C", available: true },
  { id: "cpp", label: "C++", available: false },
  { id: "csharp", label: "C#", available: false },
  { id: "php", label: "PHP", available: false },
  { id: "go", label: "Go", available: false },
  { id: "kotlin", label: "Kotlin", available: false },
  { id: "dart", label: "Dart", available: false },
  { id: "r", label: "R", available: false },
  { id: "bash", label: "Bash", available: false },
];

const EXAMPLES = {
  variables: {
    label: "Variables",
    code: "x = 5\ny = 10\ntotal = x + y\nprint(total)",
  },
  loop: {
    label: "For Loop",
    code: "total = 0\nfor n in range(1, 4):\n    total += n\n    print(total)",
  },
  condition: {
    label: "If / Else",
    code: "score = 75\nif score >= 50:\n    result = 'Pass'\nelse:\n    result = 'Fail'\nprint(result)",
  },
};

const LANGUAGE_EXAMPLES = {
  c: {
    variables: "#include <stdio.h>\nint main(void) {\n  int x = 5;\n  int y = 10;\n  int total = x + y;\n  printf(\"%d\\n\", total);\n  return 0;\n}",
    loop: "#include <stdio.h>\nint main(void) {\n  int total = 0;\n  for (int n = 1; n <= 3; n++) {\n    total += n;\n    printf(\"%d\\n\", total);\n  }\n  return 0;\n}",
    condition: "#include <stdio.h>\nint main(void) {\n  int score = 75;\n  if (score >= 50) {\n    printf(\"Pass\\n\");\n  } else {\n    printf(\"Fail\\n\");\n  }\n  return 0;\n}",
  },
  javascript: {
    variables: "let x = 5;\nlet y = 10;\nlet total = x + y;\nconsole.log(total);",
    loop: "let total = 0;\nfor (let n = 1; n <= 3; n++) {\n  total += n;\n  console.log(total);\n}",
    condition: "let score = 75;\nlet result;\nif (score >= 50) {\n  result = 'Pass';\n} else {\n  result = 'Fail';\n}\nconsole.log(result);",
  },
  java: {
    variables: "public class Main {\n  public static void main(String[] args) {\n    int x = 5;\n    int y = 10;\n    int total = x + y;\n    System.out.println(total);\n  }\n}",
    loop: "public class Main {\n  public static void main(String[] args) {\n    int total = 0;\n    for (int n = 1; n <= 3; n++) {\n      total += n;\n      System.out.println(total);\n    }\n  }\n}",
    condition: "public class Main {\n  public static void main(String[] args) {\n    int score = 75;\n    String result = score >= 50 ? \"Pass\" : \"Fail\";\n    System.out.println(result);\n  }\n}",
  },
};

function getExampleCode(language, key) {
  return LANGUAGE_EXAMPLES[language]?.[key] ?? EXAMPLES[key].code;
}

export default function CodeTimeMachine() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("python");
  const [exampleKey, setExampleKey] = useState("loop");
  const [code, setCode] = useState(EXAMPLES.loop.code);
  const [result, setResult] = useState(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [speed, setSpeed] = useState(1);
  const [copied, setCopied] = useState(false);

  const steps = result?.steps ?? [];
  const last = steps.length - 1;
  const current = steps[stepIndex] ?? null;
  const isCompleted = current?.event === "completed";
  const hasStarted = stepIndex >= 0;
  const lines = code.split("\n");
  const previous = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const previousVariables = previous?.variables ?? {};
  const currentVariables = current?.variables ?? {};
  const variableEntries = Object.entries(currentVariables).map(([name, value]) => {
    const existed = Object.prototype.hasOwnProperty.call(previousVariables, name);
    const oldValue = previousVariables[name];
    return {
      name,
      value,
      oldValue,
      change: !previous ? null : !existed ? "new" : oldValue !== value ? "changed" : null,
    };
  });
  const removedVariables = previous
    ? Object.keys(previousVariables).filter((name) => !Object.prototype.hasOwnProperty.call(currentVariables, name))
    : [];
  const changedCount = variableEntries.filter((item) => item.change).length;
  const outputAdded = previous && current
    ? current.output?.startsWith(previous.output ?? "")
      ? (current.output ?? "").slice((previous.output ?? "").length)
      : ""
    : "";

  useEffect(() => {
    if (!playing || stepIndex >= last || last < 0) return undefined;
    const timer = setTimeout(() => setStepIndex((n) => Math.min(last, n + 1)), Math.round(1100 / speed));
    return () => clearTimeout(timer);
  }, [playing, stepIndex, last, speed]);

  useEffect(() => {
    if (playing && stepIndex >= last) setPlaying(false);
  }, [playing, stepIndex, last]);

  function resetTrace() {
    setPlaying(false);
    setResult(null);
    setStepIndex(-1);
    setRequestError("");
    setCopied(false);
  }

  function chooseExample(key) {
    setExampleKey(key);
    setCode(getExampleCode(language, key));
    resetTrace();
  }

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setExampleKey("variables");
    setCode(getExampleCode(nextLanguage, "variables"));
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
      if (stepIndex < 0 || stepIndex >= last) setStepIndex(0);
      setPlaying(true);
    }
  }

  async function copyOutput() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(current?.output ?? "");
      setCopied(true);
    } catch {
      setCopied(false);
      setRequestError("Could not copy output. Please copy it manually.");
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
            <Sparkles size={14} /> LIVE CODE TRACING · PYTHON / JAVASCRIPT / JAVA / C
          </span>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl">AI Code <span className="text-purple-400">Time Machine</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Write code and explore its execution step by step. C tracing is experimental and available for local development.
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
              onChange={(event) => changeLanguage(event.target.value)}
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
          <p className="mt-3 flex items-center gap-2 text-xs text-gray-400"><LockKeyhole size={13} /> Python, JavaScript, Java and C execution available. More languages coming soon.</p>
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
              <span className="flex items-center gap-2 text-sm font-semibold"><Code2 size={17} className="text-purple-400" /> {language === "python" ? "main.py" : language === "javascript" ? "main.js" : language === "java" ? "Main.java" : "main.c"}</span>
              <span className="text-xs text-gray-500">{LANGUAGES.find((item) => item.id === language)?.label} · Editable code</span>
            </div>
            <div className="p-4 md:p-6">
              <div className="relative min-h-56 overflow-x-auto rounded-xl bg-[#090914] font-mono text-sm leading-8">
                {result && steps.length > 0 ? (
                  <div className="p-3">
                    {lines.map((line, index) => (
                      <div key={index} className={`flex min-w-max gap-4 rounded-lg border-l-2 px-3 ${!isCompleted && index + 1 === current?.lineNumber ? "border-purple-400 bg-purple-500/20 text-purple-100" : "border-transparent text-gray-400"}`}>
                        <span className="w-6 shrink-0 select-none text-right text-gray-600">{index + 1}</span>
                        <span className="whitespace-pre">{line || " "}</span>
                        {!isCompleted && index + 1 === current?.lineNumber && <span className="ml-auto text-xs text-purple-400">●</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-56">
                    <div aria-hidden="true" className="select-none border-r border-white/10 px-3 py-3 text-right text-gray-600">
                      {lines.map((_, index) => <div key={index}>{index + 1}</div>)}
                    </div>
                    <textarea
                      aria-label={`${language} code editor`}
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
                {loading ? `Running ${language}...` : "Run Code"}
              </button>
              {requestError && <p role="alert" className="mt-3 whitespace-pre-wrap text-sm text-red-400">{requestError}</p>}
              {result?.error && <p role="alert" className="mt-3 whitespace-pre-wrap rounded-xl border border-red-500/20 bg-red-500/5 p-3 font-mono text-xs text-red-300">{result.error}</p>}
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-purple-300">{steps.length ? hasStarted ? `Execution step ${stepIndex + 1} / ${steps.length}` : "Trace ready — press Play" : "Run code to generate execution steps"}</span>
                <span className="text-xs text-gray-500">{isCompleted ? "Completed" : current ? `Line ${current.lineNumber}` : "No active step"}</span>
              </div>
              {isCompleted && (
                <div role="status" className="mb-4 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
                  <span className="text-green-400" aria-hidden="true">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-green-300">Execution Completed</p>
                    <p className="text-xs text-gray-400">Your program finished successfully. Final trace snapshot is displayed.</p>
                  </div>
                </div>
              )}
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all" style={{ width: steps.length ? `${((stepIndex + 1) / steps.length) * 100}%` : "0%" }} />
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="playback-speed" className="flex items-center gap-2 text-xs text-gray-400">
                  <Gauge size={15} className="text-purple-400" /> Playback speed
                </label>
                <select
                  id="playback-speed"
                  value={speed}
                  onChange={(event) => setSpeed(Number(event.target.value))}
                  className="rounded-lg border border-white/10 bg-[#090914] px-3 py-2 text-xs text-gray-200"
                >
                  <option value={0.5}>0.5× Slow</option>
                  <option value={1}>1× Normal</option>
                  <option value={1.5}>1.5×</option>
                  <option value={2}>2× Fast</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button title="Restart" aria-label="Restart" disabled={!steps.length} onClick={() => move(0)} className="rounded-xl border border-white/10 p-3 hover:bg-white/10 disabled:opacity-30"><RotateCcw size={17} /></button>
                <button title="Previous step" aria-label="Previous step" disabled={!steps.length || stepIndex <= 0} onClick={() => move(stepIndex - 1)} className="rounded-xl border border-white/10 p-3 hover:bg-white/10 disabled:opacity-30"><SkipBack size={17} /></button>
                <button disabled={!steps.length} onClick={togglePlay} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold hover:from-purple-500 hover:to-blue-500 disabled:opacity-30">
                  {playing ? <Pause size={17} /> : <Play size={17} />} {playing ? "Pause" : stepIndex === last ? "Replay" : "Play"}
                </button>
                <button title="Next step" aria-label="Next step" disabled={!steps.length || stepIndex === last} onClick={() => move(stepIndex + 1)} className="rounded-xl border border-white/10 p-3 hover:bg-white/10 disabled:opacity-30"><SkipForward size={17} /></button>
                <button disabled={!steps.length} onClick={() => move(last)} className="ml-auto flex items-center gap-2 text-sm text-gray-400 hover:text-white disabled:opacity-30">End <ArrowRight size={16} /></button>
              </div>

              {/* Interactive execution timeline: select any trace snapshot. */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Clock3 size={17} className="text-purple-400" /> Execution Timeline
                  </h2>
                  <span className="text-xs text-gray-500">
                    {steps.length ? `${steps.length} snapshots · click to jump` : "Run code to view the timeline"}
                  </span>
                </div>
                {steps.length ? (
                  <div className="flex gap-2 overflow-x-auto pb-3" aria-label="Execution timeline">
                    {steps.map((step, index) => {
                      const selected = index === stepIndex;
                      const completed = step.event === "completed";
                      const sourceLine = lines[step.lineNumber - 1]?.trim() || "";
                      const priorVars = index > 0 ? (steps[index - 1].variables ?? {}) : null;
                      const stepVars = step.variables ?? {};
                      const updates = priorVars ? Object.keys(stepVars).filter(
                        (key) => !Object.prototype.hasOwnProperty.call(priorVars, key) || priorVars[key] !== stepVars[key]
                      ).length : 0;
                      return (
                        <button
                          key={`${step.stepNumber}-${index}`}
                          type="button"
                          onClick={() => move(index)}
                          aria-pressed={selected}
                          aria-label={`Go to step ${index + 1}: ${completed ? "execution completed" : `line ${step.lineNumber}`}`}
                          className={`min-w-28 max-w-44 shrink-0 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 ${
                            selected
                              ? "border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-950/30"
                              : completed
                                ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                                : "border-white/10 bg-[#090914] hover:border-purple-500/40 hover:bg-purple-500/10"
                          }`}
                        >
                          <span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            selected ? "bg-purple-500 text-white" : completed ? "bg-green-500/20 text-green-300" : "bg-white/10 text-gray-300"
                          }`}>
                            {completed ? "✓" : index + 1}
                          </span>
                          <span className={`block text-xs font-semibold ${completed ? "text-green-300" : selected ? "text-purple-200" : "text-gray-300"}`}>
                            {completed ? "Completed" : `Line ${step.lineNumber}`}
                          </span>
                          {updates > 0 && (
                            <span className="mt-1 inline-block rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] text-blue-300">
                              {updates} variable {updates === 1 ? "update" : "updates"}
                            </span>
                          )}
                          <span className="mt-1 block truncate font-mono text-[11px] text-gray-500" title={completed ? "Final state" : sourceLine}>
                            {completed ? "Final state" : sourceLine || "(blank line)"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-white/10 bg-[#090914] p-4 text-sm text-gray-500">
                    Your execution steps will appear here after running code.
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-[#11111f] p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold"><Database size={18} className="text-purple-400" /> Variable Inspector</h2>
              <p className="mb-3 text-xs text-gray-500">
                {current ? `${variableEntries.length} variables · ${changedCount} updates since previous step` : "Press Play to inspect variables"}
              </p>
              <div className="space-y-2">
                {variableEntries.length ? variableEntries.map(({ name, value, oldValue, change }) => (
                  <div
                    key={name}
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      change === "new" ? "border-blue-500/30 bg-blue-500/10" :
                      change === "changed" ? "border-amber-500/30 bg-amber-500/10" :
                      "border-transparent bg-[#090914]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <code className="text-purple-300">{name}</code>
                      <div className="flex items-center gap-2">
                        {change && (
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            change === "new" ? "bg-blue-500/20 text-blue-300" : "bg-amber-500/20 text-amber-300"
                          }`}>{change === "new" ? "NEW" : "CHANGED"}</span>
                        )}
                        <code className="break-all text-right text-green-300">{String(value)}</code>
                      </div>
                    </div>
                    {change === "changed" && (
                      <p className="mt-2 break-all font-mono text-xs text-gray-400">
                        <span className="text-red-300">{String(oldValue)}</span>
                        <span className="mx-2">→</span>
                        <span className="text-green-300">{String(value)}</span>
                      </p>
                    )}
                  </div>
                )) : <p className="text-sm text-gray-500">No variables at this step.</p>}
                {removedVariables.map((name) => (
                  <div key={`removed-${name}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm">
                    <code className="text-gray-400 line-through">{name}</code>
                    <span className="text-[10px] font-bold text-red-300">REMOVED</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-white/10 bg-[#11111f] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-semibold"><Terminal size={18} className="text-blue-400" /> Console Output</h2>
                <button type="button" disabled={!current?.output} onClick={copyOutput} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-30">
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy visible"}
                </button>
              </div>
              <pre className="min-h-24 whitespace-pre-wrap break-words rounded-xl bg-[#090914] p-4 font-mono text-sm text-green-300">{current?.output || (hasStarted ? "No output at this step." : "Waiting for playback...")}</pre>
              {outputAdded && <p className="mt-2 break-words text-xs text-blue-300">New output at this step: <code className="whitespace-pre-wrap">{outputAdded}</code></p>}
              {result && steps.length > 0 && <p className="mt-2 text-xs text-gray-500">Only output reached by the selected playback step is shown.</p>}
            </section>
            <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold"><Info size={18} className="text-purple-400" /> What's happening?</h2>
              <p className="text-sm leading-7 text-gray-300">{current?.explanation || "Press Play to explore the execution trace."}</p>
              {current && changedCount > 0 && (
                <p className="mt-2 text-xs text-blue-300">{changedCount} variable {changedCount === 1 ? "update" : "updates"} detected since the previous snapshot.</p>
              )}
              {current && <p className="mt-2 text-xs text-gray-500">{isCompleted ? "This snapshot shows the final variable values after execution." : "Variable snapshots are captured before the highlighted line executes."}</p>}
            </section>
          </div>
        </div>
        <p className="mt-6 text-xs leading-6 text-gray-500">
          Execution uses the local Docker tracing gateway. Trace explanations are generated by the tracer, not an AI model. This development sandbox is not ready for public deployment.
        </p>
      </main>
    </div>
  );
}
