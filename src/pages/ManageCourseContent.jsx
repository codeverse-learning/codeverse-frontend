import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowLeft, BookOpen, ChevronDown, ChevronRight, FileText, Layers3, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import api from "../services/api";

const blankModule = { title: "", description: "", moduleOrder: 1, published: false };
const blankLesson = {
  title: "", description: "", lessonOrder: 1, lessonType: "THEORY",
  content: "", codeExamples: "", exercises: "", resourceLinks: "",
  videoUrl: "", estimatedDurationMinutes: 15, published: false, freePreview: false,
};
const lines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const inputStyle = "w-full rounded-xl bg-[#0c0c18] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500";
const labelStyle = "block text-sm text-gray-300 mb-2";
const buttonStyle = "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm border border-white/10 hover:bg-white/10 disabled:opacity-50";
const errorMessage = (e) => e.response?.data?.message || `Request failed${e.response?.status ? ` (${e.response.status})` : ""}. Please try again.`;

export default function ManageCourseContent({ course, onBack }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [publication, setPublication] = useState(null);
  const [coursePublished, setCoursePublished] = useState(Boolean(course.published));
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState(null); // { kind, id, moduleId, values }
  const [confirmDelete, setConfirmDelete] = useState(null); // { kind, item }

  const fetchModules = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/modules/admin/course/${course.id}`);
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0));
      setModules(sorted);
      const results = await Promise.allSettled(sorted.map(async m => {
        const { data } = await api.get(`/lessons/admin/module/${m.id}`);
        if (!Array.isArray(data)) throw new Error("Invalid lessons");
        return [m.id, data.sort((a,b) => (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0))];
      }));
      setLessons(Object.fromEntries(results.filter(r => r.status === "fulfilled").map(r => r.value)));
      if (results.some(r => r.status === "rejected")) setError("Some lesson lists could not be loaded. Refresh to retry.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModules(); }, [course.id]);

  const fetchLessons = async (moduleId) => {
    setError("");
    try {
      const { data } = await api.get(`/lessons/admin/module/${moduleId}`);
      setLessons((old) => ({ ...old, [moduleId]: (Array.isArray(data) ? data : []).sort((a, b) => (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0)) }));
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const toggleModule = async (moduleId) => {
    if (expanded[moduleId]) {
      setExpanded((old) => ({ ...old, [moduleId]: false }));
      return;
    }
    setExpanded((old) => ({ ...old, [moduleId]: true }));
    await fetchLessons(moduleId);
  };

  const openModule = (item = null) => {
    setError("");
    setEditor({ kind: "module", id: item?.id || null, values: item ? {
      title: item.title || "", description: item.description || "",
      moduleOrder: item.moduleOrder ?? 1, published: Boolean(item.published),
    } : { ...blankModule, moduleOrder: modules.length + 1 } });
  };

  const openLesson = async (moduleId, item = null) => {
    setError("");
    if (!item) {
      setEditor({ kind: "lesson", id: null, moduleId, values: { ...blankLesson, lessonOrder: (lessons[moduleId]?.length || 0) + 1 } });
      return;
    }
    // Fetch full lesson details, including its content, before editing.
    try {
      setBusy(true);
      const { data } = await api.get(`/lessons/admin/${item.id}`);
      setEditor({ kind: "lesson", id: item.id, moduleId, values: {
        title: data.title || "", description: data.description || "",
        lessonOrder: data.lessonOrder ?? 1, lessonType: data.lessonType || "THEORY",
        content: data.content || "", codeExamples: (data.codeExamples || []).join("\n\n"),
        exercises: (data.exercises || []).join("\n"),
        resourceLinks: (data.resourceLinks || []).join("\n"),
        videoUrl: data.videoUrl || "", estimatedDurationMinutes: data.estimatedDurationMinutes ?? 15,
        published: Boolean(data.published), freePreview: Boolean(data.freePreview),
      } });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const [generatingId, setGeneratingId] = useState(null);
  const hasContent = (lesson) => Boolean(lesson.content?.trim() || lesson.codeExamples?.length || lesson.exercises?.length);
  const generateLesson = async (moduleId, lesson) => {
    if (busy || lesson.published || hasContent(lesson)) return;
    setBusy(true); setGeneratingId(lesson.id); setError(""); setNotice("");
    try {
      const { data } = await api.post(`/courses/admin/generate-lesson/${lesson.id}`, null, { timeout: 300000 });
      setLessons(old => ({...old, [moduleId]: (old[moduleId] || []).map(item => item.id === lesson.id ? {...item,...data} : item)}));
      setNotice("Lesson content generated and saved as a draft. Review using View / Edit.");
    } catch (err) {
      await fetchLessons(moduleId);
      setError(err.response?.status === 409 ? "Lesson already contains content or is published. Open View / Edit to review." : err.response?.data?.message || "Generation failed or timed out. Check the lesson before retrying.");
    } finally { setGeneratingId(null); setBusy(false); }
  };

  const stopBulk = useRef(false);
  const bulkLock = useRef(false);
  const [bulk, setBulk] = useState(null);
  const [stopping, setStopping] = useState(false);

  const generateBulk = async (selectedModules) => {
    if (busy || loading || bulkLock.current) return;
    bulkLock.current = true;
    stopBulk.current = false;
    setStopping(false);
    setBusy(true); setError(""); setNotice("");
    let total = 0, completed = 0, skipped = 0, failed = 0;
    let current = "Loading lessons...";
    const report = () => setBulk({ total, completed, skipped, failed, current });
    report();
    try {
      const queue = [];
      for (const module of selectedModules) {
        if (stopBulk.current) break;
        const { data } = await api.get(`/lessons/admin/module/${module.id}`);
        if (!Array.isArray(data)) throw new Error("Invalid lesson list.");
        const sorted = [...data].sort((a,b) => (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0));
        setLessons(old => ({ ...old, [module.id]: sorted }));
        for (const lesson of sorted) queue.push({ moduleId: module.id, lesson });
      }
      total = queue.length; report();
      for (const { moduleId, lesson } of queue) {
        if (stopBulk.current) break;
        current = lesson.title; report();
        try {
          const { data: latest } = await api.get(`/lessons/admin/${lesson.id}`);
          if (latest.published || hasContent(latest)) {
            skipped++;
            setLessons(old => ({ ...old, [moduleId]: (old[moduleId] || []).map(item => item.id === lesson.id ? { ...item, ...latest } : item) }));
          } else {
            if (stopBulk.current) break;
            setGeneratingId(lesson.id);
            const { data } = await api.post(`/courses/admin/generate-lesson/${lesson.id}`, null, { timeout: 330000 });
            setLessons(old => ({ ...old, [moduleId]: (old[moduleId] || []).map(item => item.id === lesson.id ? { ...item, ...data } : item) }));
            completed++;
          }
        } catch (err) {
          failed++;
          const status = err.response?.status;
          setError(`Generation paused at ${lesson.title}: ${status === 429 ? "AI quota or rate limit reached." : errorMessage(err)} Run generation again after checking the lesson and resolving the error.`);
          await fetchLessons(moduleId);
          setError(`Generation paused at ${lesson.title}: ${status === 429 ? "AI quota or rate limit reached." : errorMessage(err)} Check the lesson before retrying.`);
          break;
        } finally { setGeneratingId(null); report(); }
        if (!stopBulk.current) await new Promise(resolve => setTimeout(resolve, 1500));
      }
      current = failed ? "Paused — retry after resolving the error" : stopBulk.current ? "Stopped" : "Finished";
      setNotice(`${current}. Generated: ${completed}. Skipped: ${skipped}. Failed: ${failed}. Review drafts before publishing.`);
    } catch (err) {
      current = "Paused";
      setError(errorMessage(err));
    } finally {
      report(); setBusy(false); setStopping(false); bulkLock.current = false;
    }
  };

  const publishContent = async (publish, module = null) => {
    if (busy || loading || bulkLock.current) return;
    const target = module?.title || course.title;
    setPublication(null);
    setBusy(true); setError(""); setNotice("");
    const base = `/courses/admin/${course.id}${module ? `/modules/${module.id}` : ""}`;
    let failure = "";
    try {
      const { data } = await api.patch(`${base}/${publish ? "publish-all" : "unpublish-all"}`, null, { timeout: 120000 });
      setCoursePublished(Boolean(data.published));
      setNotice(`${target} ${publish ? "published" : "unpublished"}. ${module && publish && !data.published ? "Parent course remains a draft." : ""}`);
    } catch (err) {
      failure = err.response?.data?.message || err.response?.data?.detail || "Publication failed or timed out. Check current status and lesson content before retrying.";
    } finally {
      await fetchModules();
      try { const { data } = await api.get(`/courses/admin/${course.id}`); setCoursePublished(Boolean(data.published)); } catch { setError("Unable to refresh course status. Reopen the course."); }
      if (failure) setError(failure);
      setBusy(false);
    }
  };

  const change = (key, value) => setEditor((old) => ({ ...old, values: { ...old.values, [key]: value } }));

  const save = async (e) => {
    e.preventDefault();
    if (!editor || busy) return;
    const { kind, id, moduleId, values } = editor;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      let payload;
      if (kind === "module") {
        payload = { courseId: course.id, title: values.title.trim(), description: values.description.trim(), moduleOrder: Number(values.moduleOrder), published: values.published };
      } else {
        payload = {
          courseId: course.id, moduleId, title: values.title.trim(), description: values.description.trim(),
          lessonOrder: Number(values.lessonOrder), lessonType: values.lessonType,
          content: values.content, codeExamples: values.codeExamples.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean), exercises: lines(values.exercises),
          resourceLinks: lines(values.resourceLinks), videoUrl: values.videoUrl.trim(),
          estimatedDurationMinutes: Number(values.estimatedDurationMinutes),
          published: values.published, freePreview: values.freePreview,
        };
      }
      if (!payload.title || !Number.isInteger(kind === "module" ? payload.moduleOrder : payload.lessonOrder) || (kind === "module" ? payload.moduleOrder : payload.lessonOrder) < 1) {
        setError("Enter a title and a valid positive order number.");
        return;
      }
      if (kind === "lesson" && (!Number.isInteger(payload.estimatedDurationMinutes) || payload.estimatedDurationMinutes < 1)) {
        setError("Lesson duration must be a positive whole number.");
        return;
      }
      const endpoint = kind === "module" ? "/modules" : "/lessons";
      if (id) await api.put(`${endpoint}/${id}`, payload);
      else await api.post(endpoint, payload);
      setEditor(null);
      setNotice(`${kind === "module" ? "Module" : "Lesson"} ${id ? "updated" : "created"} successfully.`);
      if (kind === "module") await fetchModules();
      else await fetchLessons(moduleId);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirmDelete || busy) return;
    const { kind, item, moduleId } = confirmDelete;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.delete(`/${kind === "module" ? "modules" : "lessons"}/${item.id}`);
      setConfirmDelete(null);
      setNotice(`${kind === "module" ? "Module" : "Lesson"} deleted.`);
      if (kind === "module") {
        setLessons((old) => { const next = { ...old }; delete next[item.id]; return next; });
        await fetchModules();
      } else await fetchLessons(moduleId);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const allLessons = modules.flatMap(m => lessons[m.id] || []);
  const completeLists = modules.every(m => Array.isArray(lessons[m.id]));
  const ready = allLessons.filter(l => l.content?.trim()).length;
  const publishedCount = allLessons.filter(l => l.published).length;
  const percent = allLessons.length ? Math.round(ready / allLessons.length * 100) : 0;
  const matchingLessons = m => (lessons[m.id] || []).filter(l =>
    (!search.trim() || `${m.title} ${l.title}`.toLowerCase().includes(search.trim().toLowerCase())) &&
    (filter === "all" || (filter === "published" ? l.published : !l.published)));
  const visibleModules = modules.filter(m => (!search.trim() && filter === "all") || matchingLessons(m).length || (filter === "all" && m.title.toLowerCase().includes(search.trim().toLowerCase())));
  const filtering = Boolean(search.trim() || filter !== "all");
  return (
    <div className="min-h-screen bg-[#080812] text-white p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button disabled={busy} onClick={onBack} className={`${buttonStyle} mb-6`}><ArrowLeft size={16}/> Back to Dashboard</button>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#1b1532] to-[#11111f] p-6 md:p-8">
          <div>
            <p className="text-purple-400 text-sm mb-2">Course Content Management</p>
            <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            <span className={`inline-flex mt-3 rounded-full px-3 py-1 text-xs font-semibold ${coursePublished ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{coursePublished ? "Published" : "Draft"}</span>
            <p className="text-gray-400 text-sm mt-2">View and manage modules, lessons, and lesson content.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || loading || !modules.length} onClick={() => generateBulk(modules)} className={`${buttonStyle} bg-purple-600 text-white`}><Sparkles size={16}/> Generate All Course Lessons</button>
            <button disabled={busy} onClick={fetchModules} className={buttonStyle}><RefreshCw size={16}/> Refresh</button>
            <button disabled={busy} onClick={() => openModule()} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm"><Plus size={16}/> Add Module</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          <button type="button" disabled={busy || loading || !modules.length} onClick={() => setPublication({publish:true})} className={`${buttonStyle} bg-green-600 text-white`}>Publish Full Course</button>
          <button type="button" disabled={busy || loading} onClick={() => setPublication({publish:false})} className={`${buttonStyle} text-red-300`}>Unpublish Full Course</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[["Modules", modules.length], ["Lessons", completeLists ? allLessons.length : "—"], ["Published lessons", completeLists ? publishedCount : "—"], ["Draft lessons", completeLists ? allLessons.length-publishedCount : "—"]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-[#11111f] p-5"><p className="text-xs uppercase tracking-wider text-gray-400">{label}</p><p className="mt-2 text-3xl font-bold text-purple-200">{loading ? "—" : value}</p></div>)}
        </div>
        <section className="rounded-2xl border border-white/10 bg-[#11111f] p-5 mb-6">
          <div className="flex justify-between gap-3 text-sm"><strong>Content readiness</strong><span className="text-emerald-300">{completeLists && !loading ? `${percent}%` : "Loading / incomplete"}</span></div>
          <progress className="w-full accent-emerald-500 mt-3" max={100} value={completeLists && !loading ? percent : 0}/>
          <p className="text-xs text-gray-400 mt-2">{completeLists && !loading ? `${ready} of ${allLessons.length} lessons contain text. Review accuracy before publishing.` : "Refresh if lesson data is incomplete."}</p>
        </section>
        {bulk && <section className="mb-5 rounded-2xl border border-purple-500/30 bg-[#11111f] p-5 space-y-3" aria-live="polite">
          <div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">AI Content Generation</h2>{busy && bulkLock.current && <button type="button" disabled={stopping} onClick={() => { stopBulk.current = true; setStopping(true); }} className={`${buttonStyle} text-red-300`}>{stopping ? "Stopping after current request..." : "Stop Generation"}</button>}</div>
          <p className="text-sm text-gray-300">{bulk.current}</p>
          <progress className="w-full accent-purple-500" max={bulk.total || 1} value={bulk.completed + bulk.skipped + bulk.failed}/>
          <p className="text-sm text-gray-400">Generated: {bulk.completed} · Skipped: {bulk.skipped} · Failed: {bulk.failed} · Total: {bulk.total}</p>
          <p className="text-xs text-gray-500">Keep this page open. To retry, run generation again; existing content is skipped.</p>
        </section>}
        {notice && <p className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-300 text-sm">{notice}</p>}
        {error && <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300 text-sm" role="alert">{error}</p>}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold mr-auto">Course curriculum</h2>
          <input aria-label="Search curriculum" placeholder="Search modules or lessons..." className={`${inputStyle} sm:w-64`} value={search} onChange={e => setSearch(e.target.value)} disabled={busy || loading}/>
          <select aria-label="Filter lesson status" className={`${inputStyle} sm:w-40`} value={filter} onChange={e => setFilter(e.target.value)} disabled={busy || loading}><option value="all">All lessons</option><option value="published">Published</option><option value="draft">Draft</option></select>
          <button disabled={busy || loading || filtering} className={buttonStyle} onClick={() => setExpanded(Object.fromEntries(modules.map(m => [m.id,true])))}>Expand all</button>
          <button disabled={busy || loading || filtering} className={buttonStyle} onClick={() => setExpanded({})}>Collapse all</button>
        </div>
        {loading ? <div role="status" className="space-y-3"><span className="text-gray-400">Loading curriculum...</span>{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#151524]"/>)}</div> : modules.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#11111f] p-10 text-center text-gray-400">No modules yet. Select Add Module to start.</div>
        ) : (
          <div className="space-y-4">
            {visibleModules.length === 0 && <p className="text-center text-gray-400 py-8">No matching modules or lessons.</p>}
            {visibleModules.map((module) => (
              <div key={module.id} className="rounded-2xl border border-white/10 bg-[#11111f] overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 p-4 md:p-5">
                  <button className="flex items-center gap-3 flex-1 min-w-48 text-left" disabled={busy || filtering} onClick={() => toggleModule(module.id)}>
                    {(expanded[module.id] || filtering) ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                    <Layers3 size={20} className="text-purple-400 shrink-0"/>
                    <span><strong className="block">{module.moduleOrder}. {module.title}</strong><span className="text-xs text-gray-400">{module.published ? "Published" : "Draft"} · {module.description || "No description"}</span></span>
                  </button>
                  <details className="relative"><summary className={`${buttonStyle} cursor-pointer list-none`}>Module actions <ChevronDown size={14}/></summary><div className="flex flex-wrap gap-2 mt-2 p-2 rounded-xl bg-[#19192b]"><button type="button" disabled={busy || loading} onClick={() => generateBulk([module])} className={`${buttonStyle} text-purple-300`}><Sparkles size={15}/> Generate All Module Lessons</button>
                  <button type="button" disabled={busy || loading} onClick={() => setPublication({publish:true,module})} className={`${buttonStyle} text-green-300`}>Publish Entire Module</button>
                   <button type="button" disabled={busy || loading} onClick={() => setPublication({publish:false,module})} className={`${buttonStyle} text-red-300`}>Unpublish Module</button>
                   <button className={buttonStyle} disabled={busy} onClick={() => openModule(module)}><Pencil size={15}/> Edit</button>
                  <button className={`${buttonStyle} text-red-300`} disabled={busy} onClick={() => setConfirmDelete({ kind: "module", item: module })}><Trash2 size={15}/> Delete</button>
                   </div></details>
                </div>
                {(expanded[module.id] || filtering) && (
                  <div className="border-t border-white/10 p-4 md:p-5 bg-[#0c0c18]">
                    <div className="flex justify-between items-center gap-3 mb-4">
                      <h3 className="font-semibold text-sm">Lessons</h3>
                      <button disabled={busy} onClick={() => openLesson(module.id)} className={buttonStyle}><Plus size={15}/> Add Lesson</button>
                    </div>
                    {!lessons[module.id] ? <p className="text-gray-400 text-sm">Loading lessons...</p> : lessons[module.id].length === 0 ? <p className="text-gray-500 text-sm">No lessons yet.</p> : (
                      <div className="space-y-2">
                        {matchingLessons(module).map((lesson) => (
                          <div key={lesson.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 p-3 bg-[#11111f]">
                            <FileText size={18} className="text-blue-400"/>
                            <div className="flex-1 min-w-40"><p className="text-sm font-medium">{lesson.lessonOrder}. {lesson.title}</p><p className="text-xs text-gray-500">{lesson.lessonType || "THEORY"} · {lesson.published ? "Published" : "Draft"}</p></div>
                            {!lesson.published && !hasContent(lesson) && <button type="button" disabled={busy} onClick={() => generateLesson(module.id, lesson)} className={`${buttonStyle} text-purple-300 border-purple-500/30`}><Sparkles size={15}/>{generatingId === lesson.id ? "Generating…" : "Generate with AI"}</button>}
                            <button onClick={() => openLesson(module.id, lesson)} className={buttonStyle} disabled={busy}><BookOpen size={15}/> View / Edit</button>
                            <button disabled={busy} onClick={() => setConfirmDelete({ kind: "lesson", item: lesson, moduleId: module.id })} className={`${buttonStyle} text-red-300`}><Trash2 size={15}/> Delete</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {publication && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Confirm publication"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11111f] p-6"><h2 className="text-xl font-bold">{publication.publish ? "Publish" : "Unpublish"} {publication.module ? "module" : "course"}?</h2><p className="text-gray-300 text-sm mt-3">{publication.module?.title || course.title} and all its lessons will be {publication.publish ? "published" : "unpublished"}. {publication.publish ? "Confirm that you reviewed the content." : "No content will be deleted."}</p>{publication.module && publication.publish && !coursePublished && <p className="text-amber-300 text-sm mt-2">The parent course will remain a draft.</p>}<div className="flex justify-end gap-3 mt-6"><button className={buttonStyle} onClick={() => setPublication(null)}>Cancel</button><button className={`${buttonStyle} ${publication.publish ? "bg-emerald-700" : "bg-red-700"}`} disabled={busy || loading} onClick={() => publishContent(publication.publish, publication.module)}>{publication.publish ? "Confirm publish" : "Confirm unpublish"}</button></div></div></div>}
      {editor && (
        <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto overscroll-contain p-2 sm:p-4" role="dialog" aria-modal="true" aria-label={`${editor.id ? "Edit" : "Add"} ${editor.kind}`}>
          <div className="w-full max-w-3xl mx-auto rounded-2xl bg-[#11111f] border border-white/10">
            <div className="sticky top-0 z-10 bg-[#11111f] flex items-center justify-between border-b border-white/10 p-5">
              <h2 className="font-bold text-xl">{editor.id ? "Edit" : "Add"} {editor.kind === "module" ? "Module" : "Lesson"}</h2>
              <button onClick={() => !busy && setEditor(null)} disabled={busy} aria-label="Close"><X size={21}/></button>
            </div>
            <form onSubmit={save} className="flex flex-col">
              <div className="p-5 space-y-4">
              <div><label className={labelStyle}>Title *</label><input className={inputStyle} required value={editor.values.title} onChange={(e) => change("title", e.target.value)}/></div>
              <div><label className={labelStyle}>Description</label><textarea className={inputStyle} rows={2} value={editor.values.description} onChange={(e) => change("description", e.target.value)}/></div>
              <div><label className={labelStyle}>{editor.kind === "module" ? "Module" : "Lesson"} Order *</label><input className={inputStyle} type="number" min="1" step="1" required value={editor.values[editor.kind === "module" ? "moduleOrder" : "lessonOrder"]} onChange={(e) => change(editor.kind === "module" ? "moduleOrder" : "lessonOrder", e.target.value)}/></div>
              {editor.kind === "lesson" && <>
                <div><label className={labelStyle}>Lesson Type</label><select className={inputStyle} value={editor.values.lessonType} onChange={(e) => change("lessonType", e.target.value)}><option value="THEORY">THEORY</option><option value="PRACTICAL">PRACTICAL</option><option value="QUIZ">QUIZ</option><option value="PROJECT">PROJECT</option></select><p className="text-xs text-gray-500 mt-1">Choose a type supported by your backend.</p></div>
                <div><label className={labelStyle}>Lesson Content</label><textarea className={`${inputStyle} font-mono`} rows={9} value={editor.values.content} onChange={(e) => change("content", e.target.value)} placeholder="Lesson text or Markdown content..."/></div>
                {[ ["codeExamples", "Code Examples"], ["exercises", "Exercises"], ["resourceLinks", "Resource Links"] ].map(([key, label]) => <div key={key}><label className={labelStyle}>{label}</label><textarea className={`${inputStyle} font-mono`} rows={4} value={editor.values[key]} onChange={(e) => change(key, e.target.value)}/><p className="text-xs text-gray-500 mt-1">{key === "codeExamples" ? "Separate code examples with a blank line." : "One item per line."}</p></div>)}
                <div><label className={labelStyle}>Video URL</label><input className={inputStyle} type="url" value={editor.values.videoUrl} onChange={(e) => change("videoUrl", e.target.value)} placeholder="https://..."/></div>
                <div><label className={labelStyle}>Duration (minutes)</label><input className={inputStyle} type="number" min="1" step="1" required value={editor.values.estimatedDurationMinutes} onChange={(e) => change("estimatedDurationMinutes", e.target.value)}/></div>
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={editor.values.freePreview} onChange={(e) => change("freePreview", e.target.checked)} className="accent-purple-500"/> Free Preview</label>
              </>}
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={editor.values.published} onChange={(e) => change("published", e.target.checked)} className="accent-purple-500"/> Published</label>
              {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
              </div>
              <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-white/10 bg-[#11111f] p-4 sm:p-5">
                <button type="button" disabled={busy} onClick={() => setEditor(null)} className={buttonStyle}>Cancel</button>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-sm hover:bg-purple-500 disabled:opacity-50"><Save size={16}/>{busy ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmDelete && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label="Confirm delete"><div className="w-full max-w-md bg-[#11111f] border border-white/10 rounded-2xl p-6"><h2 className="text-xl font-bold mb-3">Delete {confirmDelete.kind}?</h2><p className="text-gray-400 text-sm mb-5">Delete “{confirmDelete.item.title}”? This action cannot be undone. Deleting a module may also affect its lessons.</p>{error && <p className="text-red-300 text-sm mb-4">{error}</p>}<div className="flex justify-end gap-3"><button disabled={busy} onClick={() => setConfirmDelete(null)} className={buttonStyle}>Cancel</button><button disabled={busy} onClick={remove} className="rounded-xl bg-red-600 px-4 py-2 text-sm disabled:opacity-50">{busy ? "Deleting..." : "Delete"}</button></div></div></div>}
    </div>
  );
}
