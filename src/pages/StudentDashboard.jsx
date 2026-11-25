import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Clock3, Code2, BrainCircuit, LogOut, Sparkles, FileText, ArrowRight, Globe, Menu, X, History, RefreshCw } from "lucide-react";
import api from "../services/api";

const tools = [
  { title: "Learning Hub", icon: BookOpen, path: "/learning-hub", category: "STRUCTURED LEARNING", description: "Explore programming courses, guided lessons and practical exercises.", action: "Explore courses", color: "text-purple-300", background: "bg-purple-500/10" },
  { title: "AI Study Packs", icon: Sparkles, path: "/study-packs", category: "STUDY ASSISTANT", description: "Turn documents, notes or topics into summaries, flashcards and quizzes.", action: "Create study packs", color: "text-fuchsia-300", background: "bg-fuchsia-500/10" },
  { title: "AI Code Time Machine", icon: Clock3, path: "/code-time-machine", category: "CODE EXECUTION", description: "Step through code, inspect variables and rewind execution across eight programming languages.", action: "Trace your code", color: "text-blue-300", background: "bg-blue-500/10" },
  { title: "Live Code Playground", icon: Globe, path: "/live-playground", category: "HANDS-ON PRACTICE", description: "Experiment with web and framework code in interactive editors and previews.", action: "Open playground", color: "text-cyan-300", background: "bg-cyan-500/10" },
  { title: "AI Code Explainer", icon: BrainCircuit, path: "/code-explainer", category: "AI GUIDED LEARNING", description: "Understand code with explanations, interactive tutoring and visual learning.", action: "Explain code", color: "text-indigo-300", background: "bg-indigo-500/10" },
];

function readStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || "Student";
  const userId = user?.userId || user?.id || user?.email || "guest";
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(false);
    api.get("/courses").then(({data}) => {
      if (cancelled) return;
      const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setCourses(list.filter(c => c.published && c.free));
    }).catch(() => { if (!cancelled) { setError(true); setCourses([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refresh, userId]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const close = e => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [sidebarOpen]);
  const opened = courses.filter(c => readStorage(`codeverse:lastLesson:${userId}:${c.id}`));
  const recentId = readStorage(`codeverse:lastPack:${userId}`);
  const recent = opened.find(c => c.id === recentId) || opened[0];
  const go = path => { setSidebarOpen(false); navigate(path); };
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login", { replace: true }); };
  const stats = [
    { label: "Free courses", value: courses.length, icon: BookOpen },
    { label: "Catalog lessons", value: courses.reduce((sum,c) => sum + (Number(c.totalLessons) || 0),0), icon: FileText },
    { label: "Courses opened on this browser", value: opened.length, icon: History },
  ];
  return (
    <div className="min-h-screen bg-[#080812] text-white lg:flex">
      {sidebarOpen && <button aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/70 lg:hidden" />}
      <aside className={`${sidebarOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-50 w-[min(85vw,270px)] flex-col overflow-y-auto border-r border-white/10 bg-[#0c0c18] p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[270px] lg:shrink-0`}>
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600"><Code2 size={24}/></div>
          <div className="min-w-0"><p className="font-bold tracking-wide">CODEVERSE</p><p className="text-xs text-gray-400">Student workspace</p></div>
          <button aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden"><X size={20}/></button>
        </div>
        <p className="mb-3 px-3 text-xs font-semibold tracking-widest text-gray-500">WORKSPACE</p>
        <nav className="space-y-2" aria-label="Student navigation">
          <button aria-current="page" onClick={() => { setSidebarOpen(false); window.scrollTo({top:0,behavior:"smooth"}); }} className="flex w-full items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-3 text-left text-sm text-purple-300"><LayoutDashboard size={19}/>Dashboard</button>
          {tools.map(({title,icon:Icon,path}) => <button key={path} onClick={() => go(path)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-400 hover:bg-white/5 hover:text-white"><Icon size={19} className="shrink-0"/>{title}</button>)}
        </nav>
        <div className="mt-auto pt-8"><div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4"><Sparkles size={20} className="mb-3 text-purple-400"/><p className="text-sm font-semibold">Learn at your own pace</p><p className="mt-2 text-xs leading-5 text-gray-400">Explore a lesson, practice code or revise a topic today.</p></div></div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-18 items-center justify-between gap-3 border-b border-white/10 bg-[#0c0c18] px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3"><button aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-300 lg:hidden"><Menu size={22}/></button><div><p className="font-semibold">Dashboard</p><p className="text-xs text-gray-500">Student workspace</p></div></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="max-w-48 truncate text-sm">{user?.fullName || "Student"}</p><p className="text-xs text-purple-400">STUDENT</p></div><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 font-bold">{firstName[0].toUpperCase()}</div><button onClick={logout} title="Logout" aria-label="Logout" className="rounded-xl border border-red-500/20 p-3 text-red-400 hover:bg-red-500/10"><LogOut size={18}/></button></div>
        </header>
        <div className="mx-auto max-w-7xl space-y-8 p-5 md:p-8">
          <section className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-950/70 via-[#151426] to-blue-950/50 p-6 md:p-9">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl"/>
            <div className="relative"><p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-purple-300"><Sparkles size={16}/> YOUR LEARNING SPACE</p><h1 className="text-3xl font-bold md:text-4xl">Welcome back, {firstName}!</h1><p className="mt-3 max-w-xl text-sm leading-7 text-gray-300">Build your skills one lesson at a time. Learn, experiment and discover new ideas with CODEVERSE.</p><button onClick={() => go("/learning-hub")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold hover:from-purple-500 hover:to-blue-500">Explore Learning Hub <ArrowRight size={18}/></button></div>
          </section>
          <section aria-label="Learning overview"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Learning overview</h2><button aria-label="Refresh statistics" onClick={() => setRefresh(v => v+1)} disabled={loading} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white disabled:opacity-50"><RefreshCw size={14} className={loading ? "animate-spin" : ""}/>Refresh</button></div>
            {error && <p role="alert" className="mb-3 text-sm text-red-300">Course statistics could not be loaded. You can still open your learning tools.</p>}
            <div className="grid gap-3 sm:grid-cols-3">{stats.map(({label,value,icon:Icon}) => <div key={label} className="rounded-2xl border border-white/10 bg-[#11111f] p-5"><Icon size={21} className="mb-3 text-purple-400"/><p className="text-3xl font-bold">{loading || error ? "—" : value}</p><p className="mt-2 text-xs leading-5 text-gray-400">{label}</p></div>)}</div>
          </section>
          {!loading && !error && recent && <section className="flex flex-col gap-4 rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-500/10 to-blue-500/5 p-6 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="mb-2 flex items-center gap-2 text-xs font-semibold text-purple-300"><History size={16}/> PICK UP WHERE YOU LEFT OFF</p><h2 className="break-words text-xl font-bold">{recent.title}</h2><p className="mt-2 text-sm text-gray-400">Return to your last opened lesson on this browser.</p></div><button onClick={() => go(`/learn/${recent.id}`)} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-500">Continue Learning <ArrowRight size={17}/></button></section>}
          <section><h2 className="text-xl font-bold">Your learning tools</h2><p className="mb-5 mt-2 text-sm text-gray-400">Choose how you want to learn today.</p><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{tools.map(({title,icon:Icon,path,category,description,action,color,background}) => <button key={path} onClick={() => go(path)} className="group flex min-w-0 flex-col items-start rounded-2xl border border-white/10 bg-[#11111f] p-6 text-left transition hover:-translate-y-0.5 hover:border-purple-500/40 focus-visible:outline-2 focus-visible:outline-purple-400"><div className={`mb-5 grid h-12 w-12 place-items-center rounded-xl ${color} ${background}`}><Icon size={24}/></div><p className={`mb-2 text-[10px] font-semibold tracking-wider ${color}`}>{category}</p><h3 className="text-lg font-bold">{title}</h3><p className="mb-6 mt-2 flex-1 text-sm leading-6 text-gray-400">{description}</p><span className={`flex items-center gap-2 text-sm font-semibold ${color}`}>{action}<ArrowRight size={16} className="transition group-hover:translate-x-1"/></span></button>)}</div></section>
          <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} CODEVERSE · Learn. Code. Create.</footer>
        </div>
      </main>
    </div>
  );
}
export default StudentDashboard;
