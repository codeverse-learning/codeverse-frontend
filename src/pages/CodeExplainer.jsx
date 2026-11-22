import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import AnimationEngine from "../components/visual-learning/AnimationEngine";
import {
  ArrowLeft, BrainCircuit, Check, ChevronDown, Clipboard, Code2,
  FileCode2, Lightbulb, LoaderCircle, RotateCcw, Sparkles,
  WandSparkles, BookOpen, ChevronLeft, ChevronRight, Trophy,
  CircleCheck, CircleX, Play, GraduationCap, Pause, Square, Volume2, VolumeX, Film, ArrowRight,
} from "lucide-react";

const LANGUAGES = [
  "JavaScript",
  "Python",
  "Java",
  "HTML",
  "CSS",
  "C",
  "C++",
  "C#",
  "TypeScript",
  "PHP",
  "SQL",
  "Dart",
];

const EXAMPLES = {
  JavaScript: `function greet(name) {
  return "Hello, " + name;
}

console.log(greet("CODEVERSE"));`,

  Python: `def greet(name):
    return "Hello, " + name

print(greet("CODEVERSE"))`,

  Java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello CODEVERSE");
    }
}`,

  HTML: `<!DOCTYPE html>
<html>
<head>
    <title>CODEVERSE</title>
</head>
<body>
    <h1>Hello CODEVERSE</h1>
    <p>Learn programming with AI.</p>
</body>
</html>`,

  CSS: `body {
  background-color: #080812;
  color: white;
  font-family: Arial, sans-serif;
}

h1 {
  color: #a855f7;
}`,

  C: `#include <stdio.h>

int main() {
    printf("Hello CODEVERSE");
    return 0;
}`,

  "C++": `#include <iostream>
using namespace std;

int main() {
    cout << "Hello CODEVERSE";
    return 0;
}`,

  "C#": `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello CODEVERSE");
    }
}`,

  TypeScript: `function greet(name: string): string {
  return "Hello, " + name;
}

console.log(greet("CODEVERSE"));`,

  PHP: `<?php
function greet($name) {
    return "Hello, " . $name;
}

echo greet("CODEVERSE");
?>`,

  SQL: `SELECT name, email
FROM students
WHERE active = true
ORDER BY name;`,

  Dart: `void main() {
  String name = "CODEVERSE";
  print("Hello $name");
}`,
};

const DEMO_LESSON = {
  title: "JavaScript Functions: Learn by Doing",
  introduction: "Explore a simple greeting function and test your understanding at each step.",
  steps: [
    {
      title: "Define a Function",
      explanation: "A function groups reusable instructions. The name greet identifies this function, while name is its parameter.",
      codeSnippet: 'function greet(name) {\n  return "Hello, " + name;\n}',
      tip: "Parameters are placeholders for values provided when a function is called.",
      question: { text: "What is name in the function definition?", options: ["A loop", "A parameter", "A class", "A keyword"], correctAnswerIndex: 1, explanation: "name is a parameter that receives the argument passed to greet." },
    },
    {
      title: "Return a Value",
      explanation: "The return statement sends a result back to the caller. Here it combines Hello, with the supplied name.",
      codeSnippet: 'return "Hello, " + name;',
      tip: "Returning a string does not automatically display it in the console.",
      question: { text: "What does greet(\"Ada\") return?", options: ["Ada", "Hello, Ada", "undefined", "Hello, name"], correctAnswerIndex: 1, explanation: "The + operator concatenates the greeting and the argument Ada." },
    },
    {
      title: "Call the Function",
      explanation: "Calling greet with CODEVERSE passes that value to name. console.log displays the returned string.",
      codeSnippet: 'console.log(greet("CODEVERSE"));',
      tip: "Try calling the function with different names to see how arguments affect the output.",
      question: { text: "What appears in the console?", options: ["greet", "CODEVERSE", "Hello, CODEVERSE", "name"], correctAnswerIndex: 2, explanation: "console.log prints the string returned by greet." },
    },
  ],
  conclusion: "You learned about function parameters, return values, and function calls. Great work!",
};


// Browser-based text-to-speech: no API key or backend endpoint required.
function VoicePlayer({ text, title = "Listen to explanation" }) {
  const supported = typeof window !== "undefined" &&
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [notice, setNotice] = useState("");
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!supported) return;
    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      setVoiceURI((current) => current ||
        available.find((v) => v.lang.toLowerCase().startsWith("en"))?.voiceURI ||
        available[0]?.voiceURI || "");
    };
    updateVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", updateVoices);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", updateVoices);
  }, [supported]);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
      utteranceRef.current = null;
    };
  }, [supported, text]);

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
    setPaused(false);
  };

  const play = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (speaking && paused) {
      synth.resume();
      setPaused(false);
      return;
    }
    if (speaking) {
      synth.pause();
      setPaused(true);
      return;
    }
    if (!text?.trim()) return;
    synth.cancel();
    setNotice("");
    // Strip Markdown formatting and code fences for more natural narration.
    const spokenText = text
      .replace(/```[\s\S]*?```/g, " Code example shown on screen. ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/^[#>*\s-]+/gm, "")
      .replace(/\*\*|__/g, "")
      .trim();
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = "en-US";
    utterance.rate = rate;
    const selectedVoice = voices.find((v) => v.voiceURI === voiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    utterance.onend = () => {
      if (utteranceRef.current !== utterance) return;
      setSpeaking(false);
      setPaused(false);
      utteranceRef.current = null;
    };
    utterance.onerror = (event) => {
      if (utteranceRef.current !== utterance) return;
      setSpeaking(false);
      setPaused(false);
      utteranceRef.current = null;
      if (event.error !== "interrupted" && event.error !== "canceled") {
        setNotice("Voice playback could not start. Try another browser or voice.");
      }
    };
    utteranceRef.current = utterance;
    setSpeaking(true);
    setPaused(false);
    synth.speak(utterance);
  };

  if (!supported) return (
    <p className="text-xs text-amber-300 flex items-center gap-2">
      <VolumeX size={16} /> Audio is not supported in this browser.
    </p>
  );

  return (
    <div className="rounded-xl border border-purple-500/20 bg-[#151426] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-purple-200">
          <Volume2 size={18} /> {title}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={play} disabled={!text?.trim()}
            className="flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-semibold disabled:opacity-40">
            {speaking && !paused ? <Pause size={16} /> : <Play size={16} />}
            {speaking && !paused ? "Pause" : paused ? "Resume" : "Listen"}
          </button>
          <button type="button" onClick={stop} disabled={!speaking}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-40">
            <Square size={14} /> Stop
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs text-gray-400">Voice
          <select value={voiceURI} onChange={(e) => { stop(); setVoiceURI(e.target.value); }}
            className="mt-1 w-full rounded-lg bg-[#0b0b16] border border-white/10 p-2 text-sm text-white">
            {voices.length === 0 && <option value="">System default</option>}
            {voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-400">Playback speed
          <select value={rate} onChange={(e) => { stop(); setRate(Number(e.target.value)); }}
            className="mt-1 w-full rounded-lg bg-[#0b0b16] border border-white/10 p-2 text-sm text-white">
            {[0.75, 1, 1.25, 1.5].map((speed) => <option key={speed} value={speed}>{speed}×</option>)}
          </select>
        </label>
      </div>
      {notice && <p role="alert" className="text-xs text-amber-300">{notice}</p>}
      <p className="text-xs text-gray-500">Uses your browser's available voices. Audio quality and support vary by device.</p>
    </div>
  );
}

// Turn Gemini's Markdown into a guided, navigable learning journey.
// Keep compatibility with the existing { explanation: string } API response.
function parseExplanationSections(markdown) {
  if (!markdown || typeof markdown !== "string") return [];
  const sections = [];
  let title = "Welcome to your code adventure";
  let lines = [];
  let insideFence = false;
  const push = () => {
    const content = lines.join("\n").trim();
    if (content) sections.push({ title, content });
    lines = [];
  };
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) insideFence = !insideFence;
    const heading = !insideFence && line.match(/^\s*#{1,3}\s+(.+?)\s*$/);
    if (heading) {
      push();
      title = heading[1].replace(/\*\*/g, "");
    } else {
      lines.push(line);
    }
  }
  push();
  return sections.length ? sections : [{ title: "Explore your code", content: markdown }];
}

const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => <h3 className="text-2xl font-bold text-white mb-4">{children}</h3>,
  h2: ({ children }) => <h3 className="text-xl font-bold text-white mb-4">{children}</h3>,
  h3: ({ children }) => <h4 className="text-lg font-semibold text-purple-200 mt-5 mb-3">{children}</h4>,
  p: ({ children }) => <p className="mb-5 text-[17px] leading-8 text-gray-200">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 mb-5 space-y-3 text-[17px] leading-8">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 mb-5 space-y-3 text-[17px] leading-8">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
  pre: ({ children }) => <pre className="overflow-x-auto rounded-2xl bg-[#080812] border border-purple-500/20 p-5 my-5 text-[15px] leading-7 text-blue-200">{children}</pre>,
  code: ({ children, className }) => <code className={className || "rounded-md bg-purple-500/15 px-1.5 py-0.5 text-purple-200 text-[15px]"}>{children}</code>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-purple-400 bg-purple-500/10 rounded-r-xl p-4 my-5">{children}</blockquote>,
};

function GuidedExplanation({ result, onCopy, copied }) {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const sections = parseExplanationSections(result.explanation);
  const current = sections[Math.min(active, sections.length - 1)];
  const progress = Math.round((completed.length / sections.length) * 100);
  const icons = [Sparkles, BrainCircuit, Code2, Play, Lightbulb, BookOpen, Trophy];
  const goTo = (index) => {
    setActive(Math.max(0, Math.min(index, sections.length - 1)));
  };
  const completeAndNext = () => {
    setCompleted((prev) => prev.includes(active) ? prev : [...prev, active]);
    if (active < sections.length - 1) setActive(active + 1);
  };
  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-purple-500/25 bg-[#11111f]" aria-label="Guided code explanation">
      <div className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-5 py-7 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-300"><GraduationCap size={19} /> YOUR GUIDED CODE JOURNEY</div>
            <h3 className="text-2xl md:text-3xl font-bold">Learn your code, one step at a time</h3>
            <p className="mt-2 text-base text-gray-300">{result.language} · {result.explanationLevel} · {sections.length} learning steps</p>
          </div>
          <button type="button" onClick={() => onCopy(result.explanation)} className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-base hover:bg-white/10">{copied ? <Check size={18}/> : <Clipboard size={18}/>} {copied ? "Copied" : "Copy lesson"}</button>
        </div>
        <div className="mt-6 flex items-center justify-between gap-3 text-sm text-purple-200"><span>{completed.length} of {sections.length} steps completed</span><span>{progress}%</span></div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-400 transition-all duration-300" style={{width: `${progress}%`}}/></div>
      </div>
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="border-b lg:border-b-0 lg:border-r border-white/10 p-4 md:p-5" aria-label="Learning steps">
          <p className="px-2 mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Your learning path</p>
          <div className="space-y-2">
            {sections.map((section, i) => {
              const Icon = icons[i % icons.length];
              const selected = active === i;
              const done = completed.includes(i);
              return <button type="button" key={i} onClick={() => { goTo(i); setShowAll(false); }} aria-current={selected ? "step" : undefined} className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition ${selected ? "border-purple-400/60 bg-purple-500/20 text-white" : "border-transparent text-gray-300 hover:bg-white/5"}`}>
                <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${done ? "bg-green-500/20 text-green-300" : selected ? "bg-purple-500/25 text-purple-200" : "bg-white/5 text-gray-400"}`}>{done ? <CircleCheck size={21}/> : <Icon size={20}/>}</div>
                <div className="min-w-0"><span className="block text-xs text-gray-400">Step {i+1}</span><span className="block text-sm font-semibold leading-5">{section.title}</span></div>
              </button>;
            })}
          </div>
          <button type="button" onClick={() => setShowAll(v => !v)} className="mt-5 w-full rounded-xl border border-white/15 px-4 py-3 text-sm text-purple-200 hover:bg-white/5">{showAll ? "Show one step" : "View complete explanation"}</button>
        </nav>
        <div className="min-w-0 p-5 md:p-8">
          {showAll ? (
            <div className="space-y-8">{sections.map((section,i) => <article key={i} className="rounded-2xl border border-white/10 bg-[#151426] p-5 md:p-7"><p className="text-sm font-bold text-purple-300 mb-3">STEP {i+1}</p><h4 className="text-xl md:text-2xl font-bold mb-5">{section.title}</h4><VoicePlayer key={`all-${i}`} text={`${section.title}. ${section.content}`} title="Listen to this step"/><div className="mt-6 break-words"><ReactMarkdown components={MARKDOWN_COMPONENTS}>{section.content}</ReactMarkdown></div></article>)}</div>
          ) : (
            <article key={active}>
              <div className="mb-5 flex items-center gap-3"><span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200">STEP {active + 1} / {sections.length}</span>{completed.includes(active) && <span className="flex items-center gap-1 text-sm text-green-300"><CircleCheck size={16}/> Completed</span>}</div>
              <h4 className="mb-3 text-2xl md:text-3xl font-bold leading-tight">{current.title}</h4>
              <p className="mb-6 text-base text-gray-400">Explore this concept, listen if you like, then continue when you're ready.</p>
              <VoicePlayer key={active} text={`${current.title}. ${current.content}`} title="Listen to this learning step" />
              <div className="mt-7 rounded-2xl border border-white/10 bg-[#171727] p-5 md:p-7 break-words"><ReactMarkdown components={MARKDOWN_COMPONENTS}>{current.content}</ReactMarkdown></div>
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4"><Lightbulb size={22} className="shrink-0 text-blue-300 mt-0.5"/><p className="text-base leading-7 text-blue-100">Learning tip: Try predicting what the code does before reading the next step. You'll remember more by thinking it through!</p></div>
              <div className="mt-7 flex flex-wrap justify-between gap-3">
                <button type="button" onClick={() => goTo(active-1)} disabled={active===0} className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-base font-semibold hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={19}/> Previous</button>
                <button type="button" onClick={completeAndNext} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-base font-bold hover:from-purple-500 hover:to-blue-500">{active === sections.length-1 ? "Complete this journey" : "Got it! Next step"} {active === sections.length-1 ? <Trophy size={20}/> : <ChevronRight size={20}/>}</button>
              </div>
              {progress===100 && <div role="status" className="mt-6 rounded-2xl border border-green-500/25 bg-green-500/10 p-5 text-base text-green-200">🎉 Journey completed! You explored every part of this code. Try changing one line and generate a new lesson to see what happens.</div>}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

function CodeExplainer() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [explanationLevel, setExplanationLevel] = useState("Beginner");
  const [mode, setMode] = useState("explain");
  const editorRef = useRef(null);
  const [visualLesson, setVisualLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [demo, setDemo] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resultCopied, setResultCopied] = useState(false);

  const clearOutputs = () => {
    setResult(null);
    setLesson(null);
    setVisualLesson(null);
    setDemo(false);
    setStepIndex(0);
    setAnswers({});
    setFinished(false);
    setMessage("");
  };

  const selectMode = (nextMode) => {
    setMode(nextMode);
    clearOutputs();
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const selectVisualStudio = () => selectMode("visual");

  const handleExample = () => {
    setCode(EXAMPLES[language] || "");
    clearOutputs();
  };

  const handleClear = () => {
    setCode("");
    clearOutputs();
  };

  const copyText = async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      window.setTimeout(() => setter(false), 2000);
    } catch {
      setMessage("Unable to copy text.");
    }
  };

  const validateCode = () => {
    if (!code.trim()) {
      setMessage("Please enter some code first.");
      return false;
    }
    if (code.length > 20000) {
      setMessage("Code must not exceed 20,000 characters.");
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateCode()) return;
    clearOutputs();
    setLoading(true);

    const endpoint = mode === "explain" ? "/ai/explain" : mode === "tutor" ? "/ai/interactive-lesson" : "/ai/visual-lesson";

    try {
      const response = await api.post(endpoint, {
        language,
        code,
        explanationLevel,
      });

      const data = response.data;
      if (typeof data === "string" && /<!doctype html|<html/i.test(data)) {
        throw new Error("HTML_INSTEAD_OF_API_JSON");
      }

      if (mode === "explain") {
        if (!data || typeof data.explanation !== "string" || !data.explanation.trim()) {
          throw new Error("INVALID_EXPLANATION");
        }
        setResult(data);
        window.setTimeout(() => document.getElementById("learning-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } else if (mode === "tutor") {
        if (!data || !Array.isArray(data.steps) || data.steps.length < 3) {
          throw new Error("INVALID_LESSON");
        }
        setLesson(data);
        window.setTimeout(() => document.getElementById("learning-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } else {
        if (!data || !Array.isArray(data.scenes) || data.scenes.length === 0) {
          throw new Error("INVALID_VISUAL_LESSON");
        }
        setVisualLesson(data);
        window.setTimeout(() => document.getElementById("learning-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } catch (error) {
      const status = error.response?.status;
      const body = error.response?.data;
      const backendMessage =
        typeof body === "object" && body !== null
          ? body.detail || body.message || body.error || body.title
          : "";

      console.error("CODEVERSE AI request failed", {
        endpoint,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status,
        response: body,
        message: error.message,
      });

      if (error.message === "HTML_INSTEAD_OF_API_JSON") {
        setMessage("The server returned an HTML page instead of AI results. Check the API base URL and backend routing.");
      } else if (["INVALID_EXPLANATION", "INVALID_LESSON", "INVALID_VISUAL_LESSON"].includes(error.message)) {
        setMessage("The AI server returned an unexpected response format. Please try again.");
      } else if (status === 401 || status === 403) {
        setMessage("Your session expired or access was denied. Please log in again.");
      } else if (status === 429) {
        setMessage("AI rate limit or quota reached. Please try later or use the Demo Lesson.");
      } else if (status === 404) {
        setMessage("AI endpoint or selected model was not found. Check the backend route and Gemini model configuration.");
      } else if (status === 502 || status === 503 || status === 504) {
        setMessage(
          typeof backendMessage === "string" && backendMessage.length < 240
            ? `AI service unavailable: ${backendMessage} You can try the Demo Lesson.`
            : "AI service is temporarily unavailable. Please try later or open the Demo Lesson."
        );
      } else if (!error.response) {
        setMessage("Cannot reach the CODEVERSE backend. Check that Spring Boot is running on port 8080.");
      } else {
        setMessage("Unable to generate content right now. Please try again or use the demo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setMode("tutor");
    setLanguage("JavaScript");
    setExplanationLevel("Beginner");
    setCode(EXAMPLES.JavaScript);
    clearOutputs();
    setLesson(DEMO_LESSON);
    setDemo(true);
    window.setTimeout(() => document.getElementById("learning-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const steps = lesson?.steps || [];
  const currentStep = steps[stepIndex];
  const answered = Object.prototype.hasOwnProperty.call(answers, stepIndex);
  const selected = answers[stepIndex];
  const correct = currentStep?.question?.correctAnswerIndex;
  const score = steps.reduce((total, step, i) =>
    total + (answers[i] === step.question.correctAnswerIndex ? 1 : 0), 0);
  const progress = steps.length ? Math.round((Object.keys(answers).length / steps.length) * 100) : 0;

  const chooseAnswer = (optionIndex) => {
    if (answered) return;
    setAnswers((previous) => ({ ...previous, [stepIndex]: optionIndex }));
  };

  const restartLesson = () => {
    setStepIndex(0);
    setAnswers({});
    setFinished(false);
  };

  return (
    <div className="min-h-screen bg-[#080812] text-white">
      <header className="border-b border-white/10 bg-[#0c0c18]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => navigate("/dashboard")} className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5" title="Back to Dashboard"><ArrowLeft size={19} /></button>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"><BrainCircuit size={23} /></div>
            <div><h1 className="text-lg md:text-xl font-bold">AI Code Explainer & Tutor</h1><p className="text-xs text-gray-500">CODEVERSE Learning Platform</p></div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2"><Sparkles size={14} /> AI Powered</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <section className="mb-8">
          <div className="inline-flex items-center gap-2 text-purple-400 text-sm mb-4"><Sparkles size={16} /> Learn Programming Smarter</div>
          <h2 className="text-3xl md:text-4xl font-bold">Understand Any Code with <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AI</span></h2>
          <p className="text-base text-gray-300 mt-4 max-w-2xl leading-8">Explore code with friendly explanations, listen to your AI tutor, and learn by doing with mini challenges and quizzes.</p>
        </section>

        {/* Choose a learning tool */}
        <section aria-label="AI learning tools" className="mb-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Your learning workspace</p>
              <h3 className="text-xl font-bold md:text-2xl">Choose how you want to learn</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400">3 learning experiences</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <button type="button" disabled={loading} onClick={() => selectMode("explain")}
              aria-pressed={mode === "explain"}
              className={`group rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 disabled:opacity-60 ${mode === "explain" ? "border-purple-400/60 bg-gradient-to-br from-purple-500/20 to-[#141326] shadow-lg shadow-purple-950/20" : "border-white/10 bg-[#11111f] hover:border-purple-500/40"}`}>
              <div className="mb-5 flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300"><Code2 size={23}/></span>{mode === "explain" ? <span className="flex items-center gap-1 text-xs font-semibold text-purple-300"><Check size={14}/> Selected</span> : <ArrowRight size={18} className="text-gray-500 group-hover:text-purple-300"/>}</div>
              <h4 className="text-lg font-semibold">Code Explanation</h4>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-400">Understand your code with guided, line-by-line explanations and improvements.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-300">{mode === "explain" ? "Ready to explain" : "Choose tool"} <ChevronRight size={16}/></span>
            </button>
            <button type="button" disabled={loading} onClick={() => selectMode("tutor")}
              aria-pressed={mode === "tutor"}
              className={`group rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 disabled:opacity-60 ${mode === "tutor" ? "border-blue-400/60 bg-gradient-to-br from-blue-500/20 to-[#141326] shadow-lg shadow-blue-950/20" : "border-white/10 bg-[#11111f] hover:border-blue-500/40"}`}>
              <div className="mb-5 flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><GraduationCap size={23}/></span>{mode === "tutor" ? <span className="flex items-center gap-1 text-xs font-semibold text-blue-300"><Check size={14}/> Selected</span> : <ArrowRight size={18} className="text-gray-500 group-hover:text-blue-300"/>}</div>
              <h4 className="text-lg font-semibold">Interactive AI Tutor</h4>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-400">Generate an interactive lesson, answer quizzes, and track your score.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-300">{mode === "tutor" ? "Ready to generate" : "Choose tool"} <ChevronRight size={16}/></span>
            </button>
            <button type="button" disabled={loading} onClick={selectVisualStudio} aria-pressed={mode === "visual"}
              className={`group rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 disabled:opacity-60 ${mode === "visual" ? "border-fuchsia-400/60 bg-gradient-to-br from-fuchsia-500/20 to-[#141326]" : "border-white/10 bg-[#11111f] hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5"}`}>
              <div className="mb-5 flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300"><Film size={23}/></span><ArrowRight size={18} className="text-gray-500 group-hover:text-fuchsia-300"/></div>
              <h4 className="text-lg font-semibold">Visual Learning Studio</h4>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-400">Watch your code come to life with animated scenes and voice narration.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fuchsia-300">{mode === "visual" ? "Ready to animate" : "Choose tool"} <ChevronRight size={16}/></span>
            </button>
          </div>
        </section>

        <div ref={editorRef} className="mb-5 scroll-mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-[#17142b] to-[#10172b] px-5 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {mode === "tutor" ? <GraduationCap size={23} className="text-blue-300"/> : mode === "visual" ? <Film size={23} className="text-fuchsia-300"/> : <BrainCircuit size={23} className="text-purple-300"/>}
              <div><h3 className="font-semibold">{mode === "tutor" ? "Interactive Tutor Workspace" : mode === "visual" ? "Visual Learning Workspace" : "Code Explanation Workspace"}</h3><p className="mt-1 text-sm text-gray-400">{mode === "tutor" ? "Paste code, then generate a lesson with quizzes." : mode === "visual" ? "Paste code, then generate animated scenes with optional voice narration." : "Paste code, then create a guided explanation."}</p></div>
            </div>
            <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300">{mode === "tutor" ? "Lesson + quizzes" : mode === "visual" ? "Animation + narration" : "Step-by-step analysis"}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <section className="rounded-2xl border border-white/10 bg-[#11111f] overflow-hidden">
            <div className="p-5 md:p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><FileCode2 size={21} className="text-purple-400" /></div><div><h3 className="font-semibold text-lg">Your Code</h3><p className="text-xs text-gray-500">Paste or write code to get started</p></div></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-400 mb-2">Programming Language</label><div className="relative"><select value={language} onChange={(e) => { setLanguage(e.target.value); clearOutputs(); }} className="w-full appearance-none bg-[#0b0b16] border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-purple-500">{LANGUAGES.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" /></div></div>
                <div><label className="block text-xs text-gray-400 mb-2">Explanation Level</label><div className="relative"><select value={explanationLevel} onChange={(e) => { setExplanationLevel(e.target.value); clearOutputs(); }} className="w-full appearance-none bg-[#0b0b16] border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-purple-500"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select><ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" /></div></div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#0b0b16] border-b border-white/10">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="w-3 h-3 rounded-full bg-yellow-500" /><span className="w-3 h-3 rounded-full bg-green-500" /><span className="ml-3 text-xs text-gray-500">code.{language.toLowerCase()}</span></div>
              <div className="flex items-center gap-3"><button onClick={() => copyText(code, setCopied)} disabled={!code} className="text-gray-400 hover:text-white disabled:opacity-40" title="Copy Code">{copied ? <Check size={17} /> : <Clipboard size={17} />}</button><button onClick={handleClear} disabled={!code} className="text-gray-400 hover:text-white disabled:opacity-40" title="Clear Code"><RotateCcw size={17} /></button></div>
            </div>
            <textarea value={code} onChange={(e) => { setCode(e.target.value); clearOutputs(); }} placeholder="// Paste your code here..." spellCheck={false} className="w-full min-h-[360px] md:min-h-[430px] resize-y bg-[#0b0b16] text-gray-200 font-mono text-sm leading-7 p-6 outline-none placeholder:text-gray-600" />
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-t border-white/10"><div className="flex gap-4 text-xs text-gray-500"><span>{code ? code.split("\n").length : 0} Lines</span><span>{code.length} Characters</span></div><button onClick={handleExample} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"><Code2 size={16} /> Load Example</button></div>
            <div className="p-5 md:p-6 border-t border-white/10 space-y-3">
              <button onClick={handleGenerate} disabled={loading || !code.trim()} className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-4 font-semibold hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-40 disabled:cursor-not-allowed">{loading ? <LoaderCircle size={20} className="animate-spin" /> : <WandSparkles size={20} />}{loading ? "Generating..." : mode === "explain" ? "Explain My Code" : mode === "tutor" ? "Generate Interactive Lesson" : "Generate Visual Lesson"}</button>
              {mode === "tutor" && <button onClick={loadDemo} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 py-3 text-sm font-medium text-purple-200 hover:bg-purple-500/20 disabled:opacity-40"><Play size={16} /> Try Demo Lesson (No API Required)</button>}
              {message && <p role="alert" className="text-sm text-purple-200 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">{message}</p>}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6"><Sparkles size={26} className="text-purple-400 mb-4" /><h3 className="text-lg font-bold">Your AI Coding Assistant</h3><p className="text-sm text-gray-400 mt-3 leading-7">Understand complex code through explanations, interactive learning, and quick knowledge checks.</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#11111f] p-6"><h3 className="font-semibold mb-5">What You'll Learn</h3><div className="space-y-5">{[{ icon: BookOpen, title: "Code Explanation", description: "Understand what your code does." }, { icon: Code2, title: "Line-by-Line Analysis", description: "Learn the purpose of each line." }, { icon: Lightbulb, title: "Code Improvements", description: "Discover better coding practices." }, { icon: BrainCircuit, title: "Interactive Tutor", description: "Practice concepts with quizzes." }].map(({ icon: Icon, title, description }) => <div key={title} className="flex gap-3"><div className="w-9 h-9 shrink-0 rounded-lg bg-purple-500/10 flex items-center justify-center"><Icon size={18} className="text-purple-400" /></div><div><h4 className="text-sm font-medium">{title}</h4><p className="text-xs text-gray-500 mt-1 leading-5">{description}</p></div></div>)}</div></div>
            <button type="button" onClick={selectVisualStudio} className="w-full rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5 text-left transition hover:border-fuchsia-400/50 hover:bg-fuchsia-500/10"><div className="flex items-center gap-3"><Film size={22} className="text-fuchsia-300"/><span className="font-semibold">Create a Visual Lesson</span><ArrowRight size={17} className="ml-auto text-fuchsia-300"/></div><p className="mt-2 text-sm leading-6 text-gray-400">See animated code walkthroughs with optional narration.</p></button>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5"><Lightbulb size={21} className="text-blue-400 mb-3" /><p className="text-sm font-semibold">Learning Tip</p><p className="text-xs text-gray-400 mt-2 leading-6">Start with a small code snippet. Understanding simple examples first makes complex programs easier to learn.</p></div>
          </aside>
        </div>

        {(result?.explanation || lesson || visualLesson) && <div id="learning-results" className="mt-8 flex items-center gap-2 text-sm text-purple-300"><CircleCheck size={18}/> Your learning content is ready below</div>}

        {visualLesson && (
          <section className="mt-8 space-y-5" aria-label="Visual learning lesson">
            <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5 md:p-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300"><Film size={19} /> VISUAL LEARNING STUDIO</div>
              <h3 className="mt-3 text-2xl font-bold">{visualLesson.title || "Your animated code lesson"}</h3>
              {visualLesson.introduction && <p className="mt-3 text-gray-300 leading-7">{visualLesson.introduction}</p>}
            </div>
            <AnimationEngine scenes={visualLesson.scenes} language={language} />
            {visualLesson.conclusion && <div className="rounded-2xl border border-white/10 bg-[#11111f] p-6"><h4 className="mb-2 font-semibold text-fuchsia-300">Lesson summary</h4><p className="text-gray-300 leading-7">{visualLesson.conclusion}</p></div>}
          </section>
        )}

        {result?.explanation && <GuidedExplanation key={result.explanation} result={result} onCopy={(text) => copyText(text, setResultCopied)} copied={resultCopied} />}

        {lesson && <section className="mt-8 rounded-2xl border border-blue-500/20 bg-[#11111f] overflow-hidden" aria-label="Interactive lesson">
          <div className="p-5 md:p-7 border-b border-white/10"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-xs text-purple-300 mb-2"><GraduationCap size={15} /> Interactive Learning {demo && <span className="rounded-full border border-purple-500/30 px-2 py-0.5">DEMO</span>}</div><h3 className="text-xl font-bold">{lesson.title}</h3><p className="text-base leading-7 text-gray-300 mt-2">{lesson.introduction}</p></div><span className="text-sm font-medium text-purple-300">{finished ? "Complete" : `Step ${stepIndex + 1} of ${steps.length}`}</span></div><div className="mt-5 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div><p className="text-xs text-gray-500 mt-2">{progress}% of questions answered</p></div>
          {finished ? <div className="p-6 md:p-10 text-center"><div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center mb-5"><Trophy size={34} /></div><h4 className="text-2xl font-bold mb-2">Lesson Complete!</h4><p className="text-gray-400 mb-5">{lesson.conclusion}</p><div className="max-w-xl mx-auto mb-5"><VoicePlayer text={lesson.conclusion} title="Listen to your lesson summary" /></div><div className="text-4xl font-bold text-purple-300 mb-2">{score} / {steps.length}</div><p className="text-sm text-gray-400 mb-6">Correct answers · {Math.round(score / steps.length * 100)}% score</p><button onClick={restartLesson} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold"><RotateCcw size={17} /> Try Again</button></div> : currentStep && <div className="p-5 md:p-7 space-y-6">
            <div><p className="text-xs uppercase tracking-wider text-purple-400 mb-2">Learning step {stepIndex + 1}</p><h4 className="text-xl font-bold mb-3">{currentStep.title}</h4><p className="text-[17px] text-gray-200 leading-8">{currentStep.explanation}</p></div><VoicePlayer text={`${currentStep.title}. ${currentStep.explanation}. ${currentStep.tip}`} title="Listen to this learning step" />
            <div className="rounded-xl border border-white/10 bg-[#080812] overflow-hidden"><div className="border-b border-white/10 px-4 py-2 text-xs text-gray-500 flex items-center gap-2"><Code2 size={14} /> Code example</div><pre className="overflow-x-auto p-5 text-base text-blue-200 font-mono leading-8"><code>{currentStep.codeSnippet}</code></pre></div>
            <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"><Lightbulb size={20} className="shrink-0 text-blue-400" /><div><p className="text-sm font-semibold text-blue-200">Learning tip</p><p className="text-base text-gray-200 mt-2 leading-7">{currentStep.tip}</p></div></div>
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5"><p className="text-xs text-purple-300 mb-2">QUICK QUIZ</p><h5 className="font-semibold text-lg mb-4">{currentStep.question.text}</h5><div className="grid gap-3">{currentStep.question.options.map((option, index) => { const isCorrect = index === correct; const isChosen = index === selected; const className = answered && isCorrect ? "border-green-500/60 bg-green-500/10 text-green-200" : answered && isChosen ? "border-red-500/60 bg-red-500/10 text-red-200" : "border-white/10 bg-[#0b0b16] text-gray-300 hover:border-purple-500/40"; return <button key={index} disabled={answered} onClick={() => chooseAnswer(index)} className={`flex items-center justify-between gap-3 text-left rounded-xl border px-4 py-3 text-base leading-7 transition disabled:cursor-default ${className}`}><span><span className="mr-3 text-gray-500">{String.fromCharCode(65 + index)}.</span>{option}</span>{answered && isCorrect && <CircleCheck size={18} className="shrink-0 text-green-400" />}{answered && isChosen && !isCorrect && <CircleX size={18} className="shrink-0 text-red-400" />}</button>; })}</div>{answered && <div role="status" className={`mt-4 rounded-xl border p-4 text-base leading-7 ${selected === correct ? "border-green-500/20 bg-green-500/10 text-green-200" : "border-red-500/20 bg-red-500/10 text-red-200"}`}><p className="font-semibold mb-1">{selected === correct ? "Correct answer!" : "Not quite — keep learning!"}</p><p>{currentStep.question.explanation}</p></div>}</div>
            <div className="flex items-center justify-between gap-3 pt-2"><button onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={stepIndex === 0} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={17} /> Previous</button>{stepIndex < steps.length - 1 ? <button onClick={() => setStepIndex((i) => i + 1)} disabled={!answered} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold disabled:opacity-40">Next Step <ChevronRight size={17} /></button> : <button onClick={() => setFinished(true)} disabled={!answered} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold disabled:opacity-40">Finish Lesson <Trophy size={17} /></button>}</div>
          </div>}
        </section>}

        <footer className="text-center text-xs text-gray-600 mt-12">© 2026 CODEVERSE · Learn. Code. Create.</footer>
      </main>
    </div>
  );
}

export default CodeExplainer;
