
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  Copy,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  Layers3,
  Link2,
  LoaderCircle,
  Menu,
  PlayCircle,
  X,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import api from "../services/api";

// Remembers the last opened lesson on this browser, separately for each user and course.
function getResumeKey(courseId) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.userId || user?.id || user?.email || "guest";
    return `codeverse:lastLesson:${userId}:${courseId}`;
  } catch {
    return `codeverse:lastLesson:guest:${courseId}`;
  }
}

// Stores the most recently visited course for the Courses landing page.
function rememberRecentPack(courseId) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.userId || user?.id || user?.email || "guest";
    localStorage.setItem(`codeverse:lastPack:${userId}`, courseId);
  } catch {
    // Learning remains available when storage is disabled.
  }
}

function getPracticeTarget(language) {
  const key = String(language || "").trim().toLowerCase().replace(/\s+/g, " ");
  const web = { html: "web", css: "web", javascript: "web", js: "web", typescript: "typescript", ts: "typescript", react: "react", "react.js": "react", reactjs: "react", flutter: "flutter", vue: "vue", svelte: "svelte", angular: "angular", "react native": "react-native", "next.js": "nextjs" };
  const trace = { python: "python", java: "java", c: "c", "c++": "cpp", cpp: "cpp", "c#": "csharp", csharp: "csharp", php: "php", dart: "dart" };
  if (Object.hasOwn(web, key)) return { path: `/live-playground?environment=${web[key]}`, label: "Open Playground", trace: false };
  if (Object.hasOwn(trace, key)) return { path: `/code-time-machine?language=${trace[key]}`, label: "Practice with Code Time Machine", trace: true };
  return null;
}

function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const copyExample = async (example) => {
    try { await navigator.clipboard.writeText(example); setCopyNotice("Code copied."); }
    catch { setCopyNotice("Unable to copy. Select the code manually."); }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const courseResponse = await api.get("/courses");
        const courses = Array.isArray(courseResponse.data)
          ? courseResponse.data
          : courseResponse.data?.content || [];

        const currentCourse = courses.find(
          (item) => item.id === courseId
        );

        if (!currentCourse || !currentCourse.published) {
          throw new Error("Study pack not found or not published.");
        }

        if (!currentCourse.free) {
          throw new Error("This course is not available for free.");
        }

        const modulesResponse = await api.get(
          `/modules/course/${courseId}`
        );

        const courseModules = (
          Array.isArray(modulesResponse.data)
            ? modulesResponse.data
            : []
        ).sort(
          (a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0)
        );

        const lessonResults = await Promise.all(
          courseModules.map(async (module) => {
            const response = await api.get(
              `/lessons/module/${module.id}`
            );

            return (Array.isArray(response.data)
              ? response.data
              : []
            )
              .sort(
                (a, b) =>
                  (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0)
              )
              .map((lesson) => ({
                ...lesson,
                moduleId: module.id,
              }));
          })
        );

        if (cancelled) return;

        const allLessons = lessonResults.flat();

        setCourse(currentCourse);
        setModules(courseModules);
        setLessons(allLessons);
        let savedLessonId = null;
        try {
          savedLessonId = localStorage.getItem(getResumeKey(courseId));
        } catch {
          // Browsers with restricted storage still allow lessons to open.
        }

        const resumedLesson = allLessons.find(
          (lesson) => lesson.id === savedLessonId
        );
        const initialLesson = resumedLesson || allLessons[0];
        setSelectedLessonId(initialLesson?.id ?? null);
        if (initialLesson) {
          rememberRecentPack(courseId);
          try { localStorage.setItem(getResumeKey(courseId), initialLesson.id); } catch { /* Storage optional */ }
        }

        const initialModuleId = initialLesson?.moduleId || courseModules[0]?.id;
        setExpandedModules(initialModuleId ? { [initialModuleId]: true } : {});
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load this course."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const selectedIndex = lessons.findIndex(
    (lesson) => lesson.id === selectedLessonId
  );

  const selectedLesson =
    selectedIndex >= 0 ? lessons[selectedIndex] : null;

  const rememberLesson = (lesson) => {
    try {
      localStorage.setItem(getResumeKey(courseId), lesson.id);
      rememberRecentPack(courseId);
    } catch {
      // Lesson navigation continues even when browser storage is disabled.
    }
  };

  const selectLesson = (lesson) => {
    setCopyNotice("");
    setSelectedLessonId(lesson.id);
    rememberLesson(lesson);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToLesson = (index) => {
    if (index < 0 || index >= lessons.length) return;

    const lesson = lessons[index];
    setCopyNotice("");
    setSelectedLessonId(lesson.id);
    rememberLesson(lesson);
    setExpandedModules((previous) => ({
      ...previous,
      [lesson.moduleId]: true,
    }));

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((previous) => ({
      ...previous,
      [moduleId]: !previous[moduleId],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080812] flex flex-col items-center justify-center text-white gap-4">
        <LoaderCircle
          size={38}
          className="animate-spin text-purple-400"
        />
        <p className="text-gray-400">Loading your course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080812] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-[#11111f] p-8 text-center">
          <BookOpen
            size={40}
            className="mx-auto mb-4 text-red-400"
          />
          <h2 className="text-xl font-bold mb-3">
            Unable to Open Course
          </h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/learning-hub")}
            className="rounded-xl bg-purple-600 px-6 py-3 hover:bg-purple-500"
          >
            Back to Learning Hub
          </button>
        </div>
      </div>
    );
  }

  const practice = getPracticeTarget(course?.programmingLanguage);

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-lg">Course Curriculum</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          {modules.length} Modules · {lessons.length} Lessons
        </p>
      </div>

      <div className="p-3 border-b border-white/10 space-y-3">
        <div className="relative"><Search size={16} className="absolute left-3 top-3 text-gray-400"/><input aria-label="Search lessons" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search lessons..." className="w-full rounded-xl bg-[#11111f] border border-white/10 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-purple-500"/></div>
        <div className="flex gap-2 text-xs"><button onClick={() => {setQuery(""); setExpandedModules(Object.fromEntries(modules.map(m => [m.id,true])));}} className="flex-1 rounded-lg border border-white/10 p-2 hover:bg-white/5">Expand all</button><button onClick={() => {setQuery(""); setExpandedModules({});}} className="flex-1 rounded-lg border border-white/10 p-2 hover:bg-white/5">Collapse all</button></div>
        <p className="text-xs text-gray-400">{query.trim() ? `${lessons.filter(l => l.title?.toLowerCase().includes(query.trim().toLowerCase())).length} matching lessons` : selectedIndex >= 0 ? `Current lesson ${selectedIndex+1} of ${lessons.length}` : "No lesson selected"}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {modules.length === 0 && (
          <p className="p-4 text-sm text-gray-500">
            No published modules available.
          </p>
        )}

        {modules.map((module, moduleIndex) => {
          const moduleLessons = lessons.filter(
            (lesson) => lesson.moduleId === module.id && (!query.trim() || lesson.title?.toLowerCase().includes(query.trim().toLowerCase()))
          );

          if (query.trim() && !moduleLessons.length) return null;
          const expanded = Boolean(query.trim() || expandedModules[module.id]);

          return (
            <div key={module.id} className="mb-2">
              <button
                aria-expanded={expanded}
                onClick={() => { if (query.trim()) {setQuery(""); setExpandedModules(old => ({...old,[module.id]:false}));} else toggleModule(module.id); }}
                className="w-full flex items-center justify-between gap-3 rounded-xl p-3 text-left hover:bg-white/5"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 shrink-0 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-bold">
                    {moduleIndex + 1}
                  </span>

                  <div>
                    <p className="text-sm font-semibold">
                      {module.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {moduleLessons.length} Lessons
                    </p>
                  </div>
                </div>

                {expanded ? (
                  <ChevronDown
                    size={17}
                    className="shrink-0 text-gray-400"
                  />
                ) : (
                  <ChevronRight
                    size={17}
                    className="shrink-0 text-gray-400"
                  />
                )}
              </button>

              {expanded && (
                <div className="mt-1 space-y-1 pl-3">
                  {moduleLessons.length === 0 && (
                    <p className="text-xs text-gray-500 p-3">
                      No published lessons yet.
                    </p>
                  )}

                  {moduleLessons.map((lesson) => {
                    const active =
                      lesson.id === selectedLessonId;

                    return (
                      <button
                        key={lesson.id}
                        aria-current={active ? "step" : undefined}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition ${
                          active
                            ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <PlayCircle
                          size={17}
                          className="shrink-0 mt-0.5"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {lesson.title}
                          </p>

                          {lesson.estimatedDurationMinutes != null && (
                            <p className="text-xs text-gray-500 mt-1">
                              {lesson.estimatedDurationMinutes} min
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080812] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 h-[72px] border-b border-white/10 bg-[#0c0c18] px-4 md:px-7 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/learning-hub")}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
            title="Back to Learning Hub"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold">
            C
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base truncate">
              {course?.title}
            </h1>
            <p className="text-xs text-purple-400">
              CODEVERSE Learning
            </p>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg border border-white/10"
          aria-label="Open course content"
        >
          <Menu size={21} />
        </button>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0 border-r border-white/10 bg-[#0c0c18] sticky top-[72px] h-[calc(100dvh-72px)]">
          {sidebar}
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-black/70 w-full"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close course content"
            />

            <aside className="absolute left-0 top-0 bottom-0 w-[min(85vw,340px)] bg-[#0c0c18] border-r border-white/10">
              {sidebar}
            </aside>
          </div>
        )}

        {/* Main Lesson Content */}
        <main className="flex-1 min-w-0 p-5 md:p-10">
          <div className="max-w-4xl mx-auto">
            {!selectedLesson ? (
              <div className="rounded-2xl border border-white/10 bg-[#11111f] p-10 text-center">
                <BookOpen
                  size={40}
                  className="text-purple-400 mx-auto mb-4"
                />
                <h2 className="text-xl font-bold">
                  Lessons Coming Soon
                </h2>
                <p className="text-gray-400 text-sm mt-3">
                  No published lessons are available for this course yet.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#21163d] via-[#11111f] to-[#101c32] p-5 md:p-8">
                  <p className="mb-4 text-xs font-medium text-purple-300">{modules.find(m => m.id === selectedLesson.moduleId)?.title || "Course lesson"}</p>
                  <div className="flex flex-wrap gap-3 mb-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300">
                      <Layers3 size={14} />
                      Lesson {selectedIndex + 1} of {lessons.length}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
                      <FileText size={14} />
                      {selectedLesson.lessonType || "THEORY"}
                    </span>

                    {selectedLesson.estimatedDurationMinutes != null && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-400">
                        <Clock3 size={14} />
                        {selectedLesson.estimatedDurationMinutes} min
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    {selectedLesson.title}
                  </h1>

                  {selectedLesson.description && (
                    <p className="text-gray-400 mt-4 leading-7">
                      {selectedLesson.description}
                    </p>
                  )}
                </div>

                {/* Theory */}
                {selectedLesson.content && (
                  <section className="rounded-2xl border border-white/10 bg-[#11111f] p-6 md:p-8 mb-6">
                    <h2 className="flex items-center gap-3 text-xl font-bold mb-5">
                      <BookOpen
                        size={22}
                        className="text-purple-400"
                      />
                      Lesson Content
                    </h2>

                    <div className="break-words text-gray-300 leading-8 text-sm md:text-base [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_h1]:mt-6 [&_h2]:mt-6 [&_h3]:mt-4 [&_p]:my-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#080812] [&_pre]:p-4 [&_code]:text-purple-200 [&_a]:text-blue-300 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-purple-500 [&_blockquote]:pl-4">
                      <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
                    </div>
                  </section>
                )}

                {copyNotice && <p role="status" className="mb-3 text-sm text-purple-300">{copyNotice}</p>}
                {/* Code Examples */}
                {selectedLesson.codeExamples?.length > 0 && (
                  <section className="mb-6">
                    <h2 className="flex items-center gap-3 text-xl font-bold mb-5">
                      <Code2
                        size={22}
                        className="text-purple-400"
                      />
                      Code Examples
                    </h2>

                    <div className="space-y-4">
                      {selectedLesson.codeExamples.map(
                        (example, index) => (
                          <div
                            key={index}
                            className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d17]"
                          >
                            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 bg-white/5">
                              <span className="text-xs font-medium text-gray-400">
                                Example {index + 1}
                              </span>
                              <div className="flex items-center gap-3"><span className="text-xs text-purple-400">{course?.programmingLanguage || "Code"}</span><button onClick={() => copyExample(example)} className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"><Copy size={14}/> Copy</button></div>
                            </div>

                            <pre className="overflow-x-auto p-5 text-sm text-green-300 leading-7">
                              <code>{example}</code>
                            </pre>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* Exercises */}
                {selectedLesson.exercises?.length > 0 && (
                  <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 md:p-8 mb-6">
                    <h2 className="flex items-center gap-3 text-xl font-bold mb-5">
                      <Code2
                        size={22}
                        className="text-purple-400"
                      />
                      Practice Exercises
                    </h2>

                    <div className="space-y-3">
                      {selectedLesson.exercises.map(
                        (exercise, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-white/10 bg-[#11111f] p-5 border-l-2 border-l-purple-500"
                          >
                            <p className="text-xs text-purple-400 mb-2">
                              Exercise {index + 1}
                            </p>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">
                              {exercise}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                    <div className="mt-6 rounded-2xl border border-purple-500/25 bg-[#21163d] p-5">
                      <h3 className="font-semibold">Ready to practice?</h3>
                      {practice ? <>
                        <p className="mt-2 text-sm leading-6 text-gray-300">Write your own solution and inspect the output. {practice.trace ? "Run Code, then select End to view the final trace output." : "Use the selected environment to preview your code."} Your lesson stays open in this tab.</p>
                        <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}${practice.path}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-500"><Code2 size={17}/>{practice.label}<ArrowRight size={17}/></a>
                        <p className="mt-3 text-xs text-gray-400">Output is not automatically graded. Some exercises may require tools or input not supported by this environment.</p>
                      </> : <p className="mt-2 text-sm text-gray-400">A matching practice environment is not available for this course yet.</p>}
                    </div>
                  </section>
                )}

                {/* Video */}
                {selectedLesson.videoUrl && (
                  <section className="rounded-2xl border border-white/10 bg-[#11111f] p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">
                      Video Lesson
                    </h2>
                    <a
                      href={selectedLesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline break-all"
                    >
                      Watch Video Lesson
                    </a>
                  </section>
                )}

                {/* Resources */}
                {selectedLesson.resourceLinks?.length > 0 && (
                  <section className="rounded-2xl border border-white/10 bg-[#11111f] p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">
                      Additional Resources
                    </h2>

                    <div className="space-y-3">
                      {selectedLesson.resourceLinks.map(
                        (link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-purple-400 hover:text-purple-300 text-sm break-all"
                          >
                            <Link2 size={17} className="shrink-0" />
                            {link}
                          </a>
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* Lesson Navigation */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={() => goToLesson(selectedIndex - 1)}
                    disabled={selectedIndex <= 0}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-4 md:px-6 py-3 text-sm font-medium hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={17} />
                    Previous
                  </button>

                  <button
                    onClick={() => selectedIndex >= lessons.length - 1 ? navigate("/learning-hub") : goToLesson(selectedIndex + 1)}
                    className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 md:px-6 py-3 text-sm font-medium hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {selectedIndex >= lessons.length - 1 ? "Learning Hub" : "Next Lesson"}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CourseLearning;
