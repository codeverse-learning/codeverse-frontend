import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, FileText, Layers3, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
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
      setModules((Array.isArray(data) ? data : []).sort((a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0)));
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
        content: data.content || "", codeExamples: (data.codeExamples || []).join("\n"),
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
          content: values.content, codeExamples: lines(values.codeExamples), exercises: lines(values.exercises),
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

  return (
    <div className="min-h-screen bg-[#080812] text-white p-5 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className={`${buttonStyle} mb-6`}><ArrowLeft size={16}/> Back to Dashboard</button>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
          <div>
            <p className="text-purple-400 text-sm mb-2">Course Content Management</p>
            <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            <p className="text-gray-400 text-sm mt-2">View and manage modules, lessons, and lesson content.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchModules} className={buttonStyle}><RefreshCw size={16}/> Refresh</button>
            <button onClick={() => openModule()} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm"><Plus size={16}/> Add Module</button>
          </div>
        </div>
        {notice && <p className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-300 text-sm">{notice}</p>}
        {error && <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300 text-sm" role="alert">{error}</p>}
        {loading ? <p className="text-gray-400 py-12 text-center">Loading modules...</p> : modules.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#11111f] p-10 text-center text-gray-400">No modules yet. Select Add Module to start.</div>
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="rounded-2xl border border-white/10 bg-[#11111f] overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 p-4 md:p-5">
                  <button className="flex items-center gap-3 flex-1 min-w-48 text-left" onClick={() => toggleModule(module.id)}>
                    {expanded[module.id] ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                    <Layers3 size={20} className="text-purple-400 shrink-0"/>
                    <span><strong className="block">{module.moduleOrder}. {module.title}</strong><span className="text-xs text-gray-400">{module.published ? "Published" : "Draft"} · {module.description || "No description"}</span></span>
                  </button>
                  <button className={buttonStyle} onClick={() => openModule(module)}><Pencil size={15}/> Edit</button>
                  <button className={`${buttonStyle} text-red-300`} onClick={() => setConfirmDelete({ kind: "module", item: module })}><Trash2 size={15}/> Delete</button>
                </div>
                {expanded[module.id] && (
                  <div className="border-t border-white/10 p-4 md:p-5 bg-[#0c0c18]">
                    <div className="flex justify-between items-center gap-3 mb-4">
                      <h3 className="font-semibold text-sm">Lessons</h3>
                      <button onClick={() => openLesson(module.id)} className={buttonStyle}><Plus size={15}/> Add Lesson</button>
                    </div>
                    {!lessons[module.id] ? <p className="text-gray-400 text-sm">Loading lessons...</p> : lessons[module.id].length === 0 ? <p className="text-gray-500 text-sm">No lessons yet.</p> : (
                      <div className="space-y-2">
                        {lessons[module.id].map((lesson) => (
                          <div key={lesson.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 p-3 bg-[#11111f]">
                            <FileText size={18} className="text-blue-400"/>
                            <div className="flex-1 min-w-40"><p className="text-sm font-medium">{lesson.lessonOrder}. {lesson.title}</p><p className="text-xs text-gray-500">{lesson.lessonType || "THEORY"} · {lesson.published ? "Published" : "Draft"}</p></div>
                            <button onClick={() => openLesson(module.id, lesson)} className={buttonStyle} disabled={busy}><BookOpen size={15}/> View / Edit</button>
                            <button onClick={() => setConfirmDelete({ kind: "lesson", item: lesson, moduleId: module.id })} className={`${buttonStyle} text-red-300`}><Trash2 size={15}/> Delete</button>
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
                {[ ["codeExamples", "Code Examples"], ["exercises", "Exercises"], ["resourceLinks", "Resource Links"] ].map(([key, label]) => <div key={key}><label className={labelStyle}>{label}</label><textarea className={`${inputStyle} font-mono`} rows={4} value={editor.values[key]} onChange={(e) => change(key, e.target.value)}/><p className="text-xs text-gray-500 mt-1">One item per line.</p></div>)}
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
