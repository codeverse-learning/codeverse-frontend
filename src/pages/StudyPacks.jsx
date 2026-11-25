import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, Layers3, RefreshCw, History, Search, FileText, GraduationCap } from "lucide-react";
import api from "../services/api";

function getUserId() {
  try { const user = JSON.parse(localStorage.getItem("user") || "null"); return user?.userId || user?.id || user?.email || "guest"; } catch { return "guest"; }
}
function getLastLessonId(id) { try { return localStorage.getItem(`codeverse:lastLesson:${getUserId()}:${id}`); } catch { return null; } }
function getLastPackId() { try { return localStorage.getItem(`codeverse:lastPack:${getUserId()}`); } catch { return null; } }
const languages = {
  html: ["HTML", "text-orange-300 bg-orange-500/10"], css: ["CSS", "text-blue-300 bg-blue-500/10"], javascript: ["JS", "text-yellow-300 bg-yellow-500/10"], python: ["PY", "text-sky-300 bg-sky-500/10"], java: ["Java", "text-red-300 bg-red-500/10"], "c++": ["C++", "text-blue-300 bg-blue-500/10"], "c#": ["C#", "text-violet-300 bg-violet-500/10"], react: ["React", "text-cyan-300 bg-cyan-500/10"], typescript: ["TS", "text-blue-300 bg-blue-500/10"], sql: ["SQL", "text-emerald-300 bg-emerald-500/10"], php: ["PHP", "text-indigo-300 bg-indigo-500/10"], dart: ["Dart", "text-cyan-300 bg-cyan-500/10"], flutter: ["Flutter", "text-sky-300 bg-sky-500/10"]
};
const field = "rounded-xl border border-white/10 bg-[#11111f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500";
const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed";
function StudyPacks() {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastPackId, setLastPackId] = useState(getLastPackId);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const loadPacks = async () => {
    setLoading(true); setError("");
    try {
      const {data} = await api.get("/courses");
      const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setPacks(list.filter(p => p.published)); setLastPackId(getLastPackId());
    } catch (err) { setError(err.response?.data?.message || "Unable to load courses. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadPacks(); }, []);
  const saved = packs.filter(p => p.free && getLastLessonId(p.id));
  const resume = saved.find(p => p.id === lastPackId) || saved[0];
  const categories = [...new Set(packs.map(p => p.category).filter(Boolean))].sort();
  const filtered = packs.filter(p => (!category || p.category === category) && (!level || p.difficultyLevel === level) && [p.title,p.description,p.programmingLanguage,p.category].some(v => String(v || "").toLowerCase().includes(search.trim().toLowerCase())));
  const reset = () => { setSearch(""); setCategory(""); setLevel(""); };
  return (
    <div className="min-h-screen bg-[#080812] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c0c18]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 md:px-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><ArrowLeft size={18}/> Dashboard</button>
          <span className="font-bold tracking-wider text-purple-300">CODEVERSE</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#21163d] via-[#141326] to-[#101c35] p-6 md:p-10">
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div><p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-purple-300"><GraduationCap size={18}/> YOUR LEARNING SPACE</p><h1 className="text-3xl font-bold md:text-5xl">Learning Hub</h1><p className="mt-4 max-w-xl text-sm leading-7 text-gray-300">Build your programming skills with structured courses, guided lessons and practical examples. Learn at your own pace.</p></div>
            <button onClick={loadPacks} disabled={loading} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Refresh</button>
          </div>
        </section>
        {error && <div role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[[BookOpen,'Available courses',packs.filter(p=>p.free).length],[FileText,'Catalog lessons',packs.reduce((s,p)=>s+(Number(p.totalLessons)||0),0)],[History,'Courses opened',saved.length]].map(([Icon,label,value])=><div key={label} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#11111f] p-5"><div className="rounded-xl bg-purple-500/10 p-3 text-purple-300"><Icon size={23}/></div><div><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-2xl font-bold">{loading?'—':value}</p></div></div>)}
        </section>
        {!loading && resume && <section className="mb-9 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6"><div><p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-purple-300"><History size={16}/> PICK UP WHERE YOU LEFT OFF</p><h2 className="text-xl font-bold">{resume.title}</h2><p className="mt-2 text-sm text-gray-400">Return to your last opened lesson.</p></div><button className={primary} onClick={()=>navigate(`/learn/${resume.id}`)}>Continue Learning <ArrowRight size={17}/></button></section>}
        <section>
          <h2 className="text-2xl font-bold">Explore courses</h2><p className="mt-1 text-sm text-gray-400">Find your next learning path.</p>
          <div className="my-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-gray-400"/><input aria-label="Search courses" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses or languages..." className={`${field} w-full pl-11`}/></div>
            <select aria-label="Category" className={field} value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select>
            <select aria-label="Difficulty" className={field} value={level} onChange={e=>setLevel(e.target.value)}><option value="">All levels</option>{['BEGINNER','INTERMEDIATE','ADVANCED'].map(l=><option key={l} value={l}>{l.charAt(0)+l.slice(1).toLowerCase()}</option>)}</select>
          </div>
          {!loading && <div className="mb-4 flex items-center justify-between text-sm text-gray-400"><span>{filtered.length} of {packs.length} courses</span>{(search||category||level)&&<button onClick={reset} className="text-purple-300 hover:underline">Clear filters</button>}</div>}
          {loading ? <div role="status" aria-label="Loading courses" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({length:6},(_,i)=><div key={i} className="h-72 animate-pulse rounded-2xl border border-white/10 bg-[#11111f] p-6"><div className="h-12 w-16 rounded-xl bg-white/10"/><div className="mt-6 h-5 w-3/4 rounded bg-white/10"/><div className="mt-4 h-3 rounded bg-white/5"/><div className="mt-3 h-3 w-2/3 rounded bg-white/5"/></div>)}</div> : filtered.length===0 ? <div className="rounded-2xl border border-white/10 bg-[#11111f] p-12 text-center"><BookOpen size={38} className="mx-auto mb-4 text-purple-400"/><h3 className="text-xl font-semibold">{error&&!packs.length?'Courses unavailable':packs.length?'No matching courses':'Courses coming soon'}</h3><p className="mt-2 text-sm text-gray-400">{error&&!packs.length?'Try refreshing the page.':packs.length?'Try a different search or filter.':'No published courses are available yet.'}</p>{packs.length>0&&<button className={`${primary} mt-5`} onClick={reset}>Clear filters</button>}</div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(p=>{const [symbol,color]=languages[String(p.programmingLanguage||'').trim().toLowerCase()]||[p.programmingLanguage||'CODE','text-purple-300 bg-purple-500/10'];const started=Boolean(getLastLessonId(p.id));return <article key={p.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11111f] transition hover:-translate-y-0.5 hover:border-purple-500/40"><div className="h-1 bg-gradient-to-r from-purple-500/70 to-blue-500/70"/><div className="flex flex-1 flex-col p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-2"><span className={`max-w-full break-words rounded-xl px-4 py-3 font-bold ${color}`}>{symbol}</span><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">{p.free?'Free':'Unavailable'}</span></div><p className="mb-2 text-xs text-purple-300">{p.category||'Programming'} · {p.difficultyLevel||'All levels'}</p><h3 className="break-words text-xl font-semibold">{p.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-gray-400 line-clamp-3">{p.description||'Learn with guided programming lessons.'}</p><div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4 text-xs text-gray-400">{[[Layers3,p.totalModules??0,'Modules'],[FileText,p.totalLessons??0,'Lessons'],[Clock3,`${p.estimatedDurationHours??0}h`,'Duration']].map(([Icon,value,label])=><div key={label} className="text-center"><Icon size={16} className="mx-auto mb-1 text-purple-300"/><p className="text-sm font-semibold text-white">{value}</p>{label}</div>)}</div><button disabled={!p.free} onClick={()=>navigate(`/learn/${p.id}`)} className={`${primary} mt-5 w-full`}>{p.free?(started?'Continue Learning':'Start Learning'):'Unavailable'}<ArrowRight size={16}/></button></div></article>})}
          </div>}
        </section>
        <footer className="py-10 text-center text-xs text-gray-500">CODEVERSE · Learn at your own pace</footer>
      </main>
    </div>
  );
}
export default StudyPacks;
