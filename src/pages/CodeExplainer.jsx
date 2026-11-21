import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, BrainCircuit, Check, ChevronDown, Clipboard, Code2,
  FileCode2, Lightbulb, LoaderCircle, RotateCcw, Sparkles,
  WandSparkles, BookOpen, ChevronLeft, ChevronRight, Trophy,
  CircleCheck, CircleX, Play, GraduationCap,
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

function CodeExplainer() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [explanationLevel, setExplanationLevel] = useState("Beginner");
  const [mode, setMode] = useState("explain");
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
    setDemo(false);
    setStepIndex(0);
    setAnswers({});
    setFinished(false);
    setMessage("");
  };

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
    try {
      const endpoint = mode === "explain" ? "/ai/explain" : "/ai/interactive-lesson";
      const response = await api.post(endpoint, { language, code, explanationLevel });
      if (mode === "explain") {
        setResult(response.data);
      } else {
        const data = response.data;
        if (!data || !Array.isArray(data.steps) || data.steps.length < 3) {
          throw new Error("INVALID_LESSON");
        }
        setLesson(data);
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        setMessage("Your session expired or access was denied. Please log in again.");
      } else if (status === 429) {
        setMessage("Gemini daily quota reached. You can try the Demo Lesson while waiting for the quota to reset.");
      } else if (status === 503 || status === 502) {
        setMessage("AI is temporarily unavailable. Please try again later or open the Demo Lesson.");
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
          <p className="text-gray-400 mt-4 max-w-2xl leading-7">Get clear code explanations or learn through interactive lessons with quizzes and instant feedback.</p>
        </section>

        <div className="grid sm:grid-cols-2 gap-3 mb-7">
          <button disabled={loading} onClick={() => { setMode("explain"); clearOutputs(); }} className={`text-left rounded-2xl border p-5 transition ${mode === "explain" ? "border-purple-500/60 bg-purple-500/10" : "border-white/10 bg-[#11111f] hover:border-white/20"}`}>
            <div className="flex items-center gap-3 mb-2"><Code2 className="text-purple-400" size={22} /><span className="font-semibold">Code Explanation</span></div>
            <p className="text-sm text-gray-400">Overview, line-by-line analysis, and improvements.</p>
          </button>
          <button disabled={loading} onClick={() => { setMode("tutor"); clearOutputs(); }} className={`text-left rounded-2xl border p-5 transition ${mode === "tutor" ? "border-blue-500/60 bg-blue-500/10" : "border-white/10 bg-[#11111f] hover:border-white/20"}`}>
            <div className="flex items-center gap-3 mb-2"><GraduationCap className="text-blue-400" size={22} /><span className="font-semibold">Interactive AI Tutor</span></div>
            <p className="text-sm text-gray-400">Learn in steps, answer quizzes, and track your score.</p>
          </button>
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
              <button onClick={handleGenerate} disabled={loading || !code.trim()} className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-4 font-semibold hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-40 disabled:cursor-not-allowed">{loading ? <LoaderCircle size={20} className="animate-spin" /> : <WandSparkles size={20} />}{loading ? "Generating..." : mode === "explain" ? "Explain My Code" : "Generate Interactive Lesson"}</button>
              {mode === "tutor" && <button onClick={loadDemo} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 py-3 text-sm font-medium text-purple-200 hover:bg-purple-500/20 disabled:opacity-40"><Play size={16} /> Try Demo Lesson (No API Required)</button>}
              {message && <p role="alert" className="text-sm text-purple-200 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">{message}</p>}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6"><Sparkles size={26} className="text-purple-400 mb-4" /><h3 className="text-lg font-bold">Your AI Coding Assistant</h3><p className="text-sm text-gray-400 mt-3 leading-7">Understand complex code through explanations, interactive learning, and quick knowledge checks.</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#11111f] p-6"><h3 className="font-semibold mb-5">What You'll Learn</h3><div className="space-y-5">{[{ icon: BookOpen, title: "Code Explanation", description: "Understand what your code does." }, { icon: Code2, title: "Line-by-Line Analysis", description: "Learn the purpose of each line." }, { icon: Lightbulb, title: "Code Improvements", description: "Discover better coding practices." }, { icon: BrainCircuit, title: "Interactive Tutor", description: "Practice concepts with quizzes." }].map(({ icon: Icon, title, description }) => <div key={title} className="flex gap-3"><div className="w-9 h-9 shrink-0 rounded-lg bg-purple-500/10 flex items-center justify-center"><Icon size={18} className="text-purple-400" /></div><div><h4 className="text-sm font-medium">{title}</h4><p className="text-xs text-gray-500 mt-1 leading-5">{description}</p></div></div>)}</div></div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5"><Lightbulb size={21} className="text-blue-400 mb-3" /><p className="text-sm font-semibold">Learning Tip</p><p className="text-xs text-gray-400 mt-2 leading-6">Start with a small code snippet. Understanding simple examples first makes complex programs easier to learn.</p></div>
          </aside>
        </div>

        {result?.explanation && <section className="mt-8 rounded-2xl border border-purple-500/20 bg-[#11111f] overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 md:p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400"><BrainCircuit size={22} /></div><div><h3 className="text-lg font-bold">AI Code Explanation</h3><p className="text-xs text-gray-400 mt-1">{result.language} · {result.explanationLevel} · {result.model}</p></div></div><button onClick={() => copyText(result.explanation, setResultCopied)} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">{resultCopied ? <Check size={16} /> : <Clipboard size={16} />}{resultCopied ? "Copied!" : "Copy Explanation"}</button></div><div className="p-5 md:p-7 text-sm leading-7 text-gray-300 break-words"><ReactMarkdown components={{ h1: ({ children }) => <h3 className="text-xl font-bold text-white mt-7 mb-3">{children}</h3>, h2: ({ children }) => <h3 className="text-lg font-bold text-white mt-7 mb-3">{children}</h3>, h3: ({ children }) => <h4 className="text-base font-semibold text-purple-300 mt-6 mb-2">{children}</h4>, p: ({ children }) => <p className="mb-4">{children}</p>, ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>, ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>, li: ({ children }) => <li>{children}</li>, strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>, pre: ({ children }) => <pre className="overflow-x-auto rounded-xl bg-[#080812] border border-white/10 p-4 my-4 text-xs leading-6">{children}</pre>, code: ({ children, className }) => <code className={className || "rounded bg-white/10 px-1 py-0.5 text-purple-200"}>{children}</code>, hr: () => <hr className="border-white/10 my-6" /> }}>{result.explanation}</ReactMarkdown></div></section>}

        {lesson && <section className="mt-8 rounded-2xl border border-blue-500/20 bg-[#11111f] overflow-hidden" aria-label="Interactive lesson">
          <div className="p-5 md:p-7 border-b border-white/10"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-xs text-purple-300 mb-2"><GraduationCap size={15} /> Interactive Learning {demo && <span className="rounded-full border border-purple-500/30 px-2 py-0.5">DEMO</span>}</div><h3 className="text-xl font-bold">{lesson.title}</h3><p className="text-sm text-gray-400 mt-2">{lesson.introduction}</p></div><span className="text-sm font-medium text-purple-300">{finished ? "Complete" : `Step ${stepIndex + 1} of ${steps.length}`}</span></div><div className="mt-5 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div><p className="text-xs text-gray-500 mt-2">{progress}% of questions answered</p></div>
          {finished ? <div className="p-6 md:p-10 text-center"><div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center mb-5"><Trophy size={34} /></div><h4 className="text-2xl font-bold mb-2">Lesson Complete!</h4><p className="text-gray-400 mb-5">{lesson.conclusion}</p><div className="text-4xl font-bold text-purple-300 mb-2">{score} / {steps.length}</div><p className="text-sm text-gray-400 mb-6">Correct answers · {Math.round(score / steps.length * 100)}% score</p><button onClick={restartLesson} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold"><RotateCcw size={17} /> Try Again</button></div> : currentStep && <div className="p-5 md:p-7 space-y-6">
            <div><p className="text-xs uppercase tracking-wider text-purple-400 mb-2">Learning step {stepIndex + 1}</p><h4 className="text-xl font-bold mb-3">{currentStep.title}</h4><p className="text-gray-300 leading-7">{currentStep.explanation}</p></div>
            <div className="rounded-xl border border-white/10 bg-[#080812] overflow-hidden"><div className="border-b border-white/10 px-4 py-2 text-xs text-gray-500 flex items-center gap-2"><Code2 size={14} /> Code example</div><pre className="overflow-x-auto p-5 text-sm text-blue-200 font-mono leading-7"><code>{currentStep.codeSnippet}</code></pre></div>
            <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"><Lightbulb size={20} className="shrink-0 text-blue-400" /><div><p className="text-sm font-semibold text-blue-200">Learning tip</p><p className="text-sm text-gray-300 mt-1">{currentStep.tip}</p></div></div>
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5"><p className="text-xs text-purple-300 mb-2">QUICK QUIZ</p><h5 className="font-semibold text-lg mb-4">{currentStep.question.text}</h5><div className="grid gap-3">{currentStep.question.options.map((option, index) => { const isCorrect = index === correct; const isChosen = index === selected; const className = answered && isCorrect ? "border-green-500/60 bg-green-500/10 text-green-200" : answered && isChosen ? "border-red-500/60 bg-red-500/10 text-red-200" : "border-white/10 bg-[#0b0b16] text-gray-300 hover:border-purple-500/40"; return <button key={index} disabled={answered} onClick={() => chooseAnswer(index)} className={`flex items-center justify-between gap-3 text-left rounded-xl border px-4 py-3 text-sm transition disabled:cursor-default ${className}`}><span><span className="mr-3 text-gray-500">{String.fromCharCode(65 + index)}.</span>{option}</span>{answered && isCorrect && <CircleCheck size={18} className="shrink-0 text-green-400" />}{answered && isChosen && !isCorrect && <CircleX size={18} className="shrink-0 text-red-400" />}</button>; })}</div>{answered && <div role="status" className={`mt-4 rounded-xl border p-4 text-sm ${selected === correct ? "border-green-500/20 bg-green-500/10 text-green-200" : "border-red-500/20 bg-red-500/10 text-red-200"}`}><p className="font-semibold mb-1">{selected === correct ? "Correct answer!" : "Not quite — keep learning!"}</p><p>{currentStep.question.explanation}</p></div>}</div>
            <div className="flex items-center justify-between gap-3 pt-2"><button onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={stepIndex === 0} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={17} /> Previous</button>{stepIndex < steps.length - 1 ? <button onClick={() => setStepIndex((i) => i + 1)} disabled={!answered} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold disabled:opacity-40">Next Step <ChevronRight size={17} /></button> : <button onClick={() => setFinished(true)} disabled={!answered} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold disabled:opacity-40">Finish Lesson <Trophy size={17} /></button>}</div>
          </div>}
        </section>}

        <footer className="text-center text-xs text-gray-600 mt-12">© 2026 CODEVERSE · Learn. Code. Create.</footer>
      </main>
    </div>
  );
}

export default CodeExplainer;
