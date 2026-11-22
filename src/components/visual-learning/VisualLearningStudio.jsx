import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Code2 } from "lucide-react";
import AnimationEngine from "./AnimationEngine";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

export default function VisualLearningStudio() {
  const [language, setLanguage] = useState("Python");
  const [explanationLevel, setExplanationLevel] = useState("Beginner");
  const [code, setCode] = useState('name = "Alex"\nprint(name)');
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateLesson = async (event) => {
    event.preventDefault();
    if (!code.trim() || loading) return;
    setError("");
    setLesson(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to generate a visual lesson.");
      const response = await fetch(`${API_BASE_URL}/ai/visual-lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language, code, explanationLevel }),
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Your session is invalid or expired. Please log in again.");
        }
        if (response.status === 429) throw new Error("AI request limit reached. Please try again later.");
        throw new Error(`Unable to generate the lesson (HTTP ${response.status}). Please try again.`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.scenes) || data.scenes.length === 0) {
        throw new Error("The AI returned an invalid lesson. Please try again.");
      }
      setLesson(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080812] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-purple-400"><Sparkles size={17} /> CODEVERSE AI LEARNING</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Visual Learning Studio</h1>
          <p className="max-w-2xl text-gray-400">Turn your code into an animated, step-by-step lesson. Explore how variables, operations, and output work.</p>
        </header>

        <form onSubmit={generateLesson} className="space-y-5 rounded-2xl border border-purple-500/20 bg-[#11111f] p-5 sm:p-7">
          <div className="flex items-center gap-2 text-lg font-semibold"><Code2 className="text-purple-400" size={20} /> Your Code</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-300">Programming Language
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="block w-full rounded-xl border border-white/10 bg-[#080812] px-4 py-3 text-white outline-none focus:border-purple-500">
                <option value="Python">Python</option><option value="JavaScript">JavaScript</option><option value="Java">Java</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-gray-300">Explanation Level
              <select value={explanationLevel} onChange={(e) => setExplanationLevel(e.target.value)} className="block w-full rounded-xl border border-white/10 bg-[#080812] px-4 py-3 text-white outline-none focus:border-purple-500">
                <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
              </select>
            </label>
          </div>
          <label className="block space-y-2 text-sm text-gray-300">Code to visualize
            <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} rows={9} className="block w-full resize-y rounded-xl border border-white/10 bg-[#080812] p-4 font-mono text-sm leading-7 text-blue-200 outline-none focus:border-purple-500" placeholder="Paste your code here..." />
          </label>
          <button type="submit" disabled={loading || !code.trim()} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2 size={19} className="animate-spin" /> : <Sparkles size={19} />}
            {loading ? "Generating Visual Lesson..." : "Generate Visual Lesson"}
          </button>
          {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
        </form>

        {lesson && (
          <section className="space-y-5" aria-label="Generated visual lesson">
            <div className="space-y-2"><h2 className="text-2xl font-bold">{lesson.title}</h2><p className="text-gray-300">{lesson.introduction}</p></div>
            <AnimationEngine key={JSON.stringify(lesson.scenes)} scenes={lesson.scenes} language={language} />
            {lesson.conclusion && <div className="rounded-2xl border border-purple-500/20 bg-[#11111f] p-5"><p className="mb-2 font-semibold text-purple-300">What you've learned</p><p className="leading-7 text-gray-300">{lesson.conclusion}</p></div>}
          </section>
        )}
      </div>
    </main>
  );
}
