
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Layers3,
  FileText,
  Users,
  Settings,
  LogOut,
  RefreshCw,
  Plus,
  GraduationCap,
  Clock3,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Pencil,
  Trash2,
} from "lucide-react";

import api from "../services/api";
import ManageCourseContent from "./ManageCourseContent";

const initialForm = {
  title: "",
  slug: "",
  description: "",
  category: "Web Development",
  programmingLanguage: "",
  difficultyLevel: "BEGINNER",
  thumbnailUrl: "",
  instructorName: "CODEVERSE Team",
  estimatedDurationHours: 1,
  published: false,
  free: true,
  learningOutcomes: "",
  prerequisites: "",
};

function AdminDashboard({ user }) {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [contentCourse, setContentCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const [aiForm, setAiForm] = useState({ programmingLanguage: "", category: "Programming", difficultyLevel: "BEGINNER", moduleCount: 3, lessonsPerModule: 3 });
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const generateOutline = async (event) => {
    event.preventDefault();
    if (generating || !aiForm.programmingLanguage.trim()) return;
    setGenerating(true); setAiError(""); setSuccess("");
    try {
      const { data } = await api.post("/courses/admin/generate-outline", {
        ...aiForm, programmingLanguage: aiForm.programmingLanguage.trim(),
        moduleCount: Number(aiForm.moduleCount), lessonsPerModule: Number(aiForm.lessonsPerModule),
      }, { timeout: 300000 });
      setSuccess(`${data.title} generated as a draft.`);
      await fetchCourses();
    } catch (err) {
      setAiError(err.response?.status === 409 ? "A course with this language and level already exists. Check existing drafts." : err.response?.data?.message || "Generation failed or timed out. Refresh courses before retrying; a draft may already exist.");
    } finally { setGenerating(false); }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      // ADMIN: Include published and draft courses
      const response = await api.get("/courses/admin/all");

      const data = response.data;

      setCourses(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : []
      );
    } catch (err) {
      console.error("Course loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load courses from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (value) => {
    setForm((previous) => ({
      ...previous,
      title: value,
      slug: generateSlug(value),
    }));
  };

  const parseLines = (text) => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const openAddForm = () => {
    setEditingCourse(null);
    setForm({ ...initialForm });
    setFormError("");
    setShowAddForm(true);
  };

  const openEditForm = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title || "",
      slug: course.slug || "",
      description: course.description || "",
      category: course.category || "Web Development",
      programmingLanguage: course.programmingLanguage || "",
      difficultyLevel: course.difficultyLevel || "BEGINNER",
      thumbnailUrl: course.thumbnailUrl || "",
      instructorName: course.instructorName || "CODEVERSE Team",
      estimatedDurationHours: course.estimatedDurationHours ?? 1,
      published: Boolean(course.published),
      free: course.free !== false,
      learningOutcomes: (course.learningOutcomes || []).join("\n"),
      prerequisites: (course.prerequisites || []).join("\n"),
    });
    setFormError("");
    setShowAddForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowAddForm(false);
    setEditingCourse(null);
    setFormError("");
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse || deleting) return;
    setDeleting(true);
    setDeleteError("");
    setSuccess("");
    try {
      await api.delete(`/courses/${deletingCourse.id}`);
      setDeletingCourse(null);
      setSuccess("Course deleted successfully.");
      await fetchCourses();
    } catch (err) {
      console.error("Delete course error:", err);
      setDeleteError(err.response?.data?.message || "Unable to delete course. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    setSaving(true);
    setFormError("");
    setSuccess("");

    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        programmingLanguage: form.programmingLanguage.trim(),
        difficultyLevel: form.difficultyLevel,
        thumbnailUrl: form.thumbnailUrl.trim(),
        instructorName: form.instructorName.trim(),
        estimatedDurationHours: Number(
          form.estimatedDurationHours
        ),
        published: form.published,
        free: form.free,
        learningOutcomes: parseLines(form.learningOutcomes),
        prerequisites: parseLines(form.prerequisites),
      };

      if (
        !payload.title ||
        !payload.slug ||
        !payload.description ||
        !payload.programmingLanguage
      ) {
        setFormError("Please complete all required fields.");
        return;
      }

      if (
        !Number.isInteger(payload.estimatedDurationHours) ||
        payload.estimatedDurationHours < 1
      ) {
        setFormError("Duration must be a positive whole number.");
        return;
      }

      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, payload);
      } else {
        await api.post("/courses", payload);
      }

      setSuccess(editingCourse ? "Course updated successfully!" : "Course created successfully!");
      setForm(initialForm);
      setShowAddForm(false);
      setEditingCourse(null);

      await fetchCourses();
    } catch (err) {
      console.error("Create course error:", err);

      setFormError(
        err.response?.data?.message ||
          `Failed to ${editingCourse ? "update" : "create"} course. Check your details and try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  const totalModules = courses.reduce(
    (sum, course) => sum + (course.totalModules || 0),
    0
  );

  const totalLessons = courses.reduce(
    (sum, course) => sum + (course.totalLessons || 0),
    0
  );

  const publishedCourses = courses.filter(
    (course) => course.published
  ).length;

  const stats = [
    {
      title: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Total Modules",
      value: totalModules,
      icon: Layers3,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Lessons",
      value: totalLessons,
      icon: FileText,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Published Courses",
      value: publishedCourses,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "Manage Courses", icon: BookOpen },
    { name: "Manage Modules", icon: Layers3 },
    { name: "Manage Lessons", icon: FileText },
    { name: "Students", icon: Users },
    { name: "Settings", icon: Settings },
  ];

  const inputClass =
    "w-full bg-[#0c0c18] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition";

  const labelClass =
    "block text-sm font-medium text-gray-300 mb-2";

  if (contentCourse) {
    return <ManageCourseContent course={contentCourse} onBack={() => { setContentCourse(null); fetchCourses(); }} />;
  }

  return (
    <div className="min-h-screen bg-[#080812] text-white flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-[#0c0c18] border-r border-white/10 flex-col p-5">
        <div className="flex items-center gap-3 mb-10 mt-2">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xl">
            C
          </div>

          <div>
            <h1 className="font-bold text-xl">CODEVERSE</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 px-3">
          Administration
        </p>

        <nav className="space-y-2">
          {menu.map(({ name, icon: Icon, active }) => (
            <div
              key={name}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                active
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300"
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              <Icon size={19} />
              {name}
            </div>
          ))}
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <GraduationCap className="text-purple-400 mb-2" />
          <p className="font-semibold text-sm">
            CODEVERSE Administration
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Manage your learning platform.
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 min-h-20 border-b border-white/10 bg-[#0c0c18] flex items-center justify-between px-5 md:px-8 gap-3 shadow-lg shadow-black/20">
          <div>
            <h2 className="font-semibold">Admin Dashboard</h2>
            <p className="text-xs text-gray-500">
              Platform Management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">
                {user?.fullName || "Administrator"}
              </p>
              <p className="text-xs text-purple-400">ADMIN</p>
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold">
              {(user?.fullName || "A")[0].toUpperCase()}
            </div>

            <button
              onClick={logout}
              className="p-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="p-5 md:p-8 max-w-7xl mx-auto">
          {/* Welcome */}
          <section className="mb-8">
            <p className="text-purple-400 text-sm mb-2">
              Administration Overview
            </p>

            <h1 className="text-3xl font-bold">
              Welcome, {user?.fullName?.split(" ")[0] || "Admin"} 👋
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Manage courses and learning content.
            </p>
          </section>

          {success && (
            <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Statistics */}
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
            {stats.map(({ title, value, icon: Icon, color, bg }) => (
              <div
                key={title}
                className="rounded-2xl bg-[#11111f] border border-white/10 p-5"
              >
                <div className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center mb-4`}>
                  <Icon size={21} />
                </div>

                <p className="text-sm text-gray-400">{title}</p>
                <h2 className="text-3xl font-bold mt-2">
                  {loading ? "..." : value}
                </h2>
              </div>
            ))}
          </section>

          <section className="mb-8 rounded-2xl border border-purple-500/20 bg-[#11111f] p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles className="text-purple-400"/> AI Learning Generator</h2>
            <p className="text-sm text-gray-400 mt-2">Generate course, module and lesson outlines as drafts. Review before publishing.</p>
            <form onSubmit={generateOutline} className="mt-5 space-y-4">
              <fieldset disabled={generating} className="grid sm:grid-cols-2 gap-4 disabled:opacity-60">
                <label className={labelClass}>Programming Language<input required maxLength={80} className={inputClass} placeholder="e.g. CSS, Java" value={aiForm.programmingLanguage} onChange={e => setAiForm(old => ({...old, programmingLanguage:e.target.value}))}/></label>
                <label className={labelClass}>Category<select className={inputClass} value={aiForm.category} onChange={e => setAiForm(old => ({...old, category:e.target.value}))}>{["Programming","Web Development","Mobile Development","Database","Data Science","Artificial Intelligence","Other"].map(v => <option key={v}>{v}</option>)}</select></label>
                <label className={labelClass}>Difficulty<select className={inputClass} value={aiForm.difficultyLevel} onChange={e => setAiForm(old => ({...old, difficultyLevel:e.target.value}))}>{["BEGINNER","INTERMEDIATE","ADVANCED"].map(v => <option key={v}>{v}</option>)}</select></label>
                {[["moduleCount","Modules",10],["lessonsPerModule","Lessons per module",6]].map(([key,label,max]) => <label key={key} className={labelClass}>{label}<select className={inputClass} value={aiForm[key]} onChange={e => setAiForm(old => ({...old,[key]:Number(e.target.value)}))}>{Array.from({length:max},(_,i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></label>)}
              </fieldset>
              <p className="text-sm text-purple-300">{aiForm.moduleCount * aiForm.lessonsPerModule} lessons · Estimated {Math.ceil(aiForm.moduleCount * aiForm.lessonsPerModule / 3)} hours</p>
              {aiError && <p role="alert" className="text-sm text-red-300">{aiError}</p>}
              <button type="submit" disabled={generating || !aiForm.programmingLanguage.trim()} className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-3 text-sm font-medium disabled:opacity-50"><Sparkles size={17}/>{generating ? "Generating outline… Please wait" : "Generate Learning Outline"}</button>
            </form>
          </section>
          {/* Course Management */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Course Management
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Create and manage CODEVERSE courses
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchCourses}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>

                <button
                  onClick={openAddForm}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-sm font-medium transition"
                >
                  <Plus size={17} />
                  Add Course
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-400">
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border border-white/10 bg-[#11111f]">
                <BookOpen
                  className="mx-auto mb-3 text-gray-500"
                  size={32}
                />
                <p className="text-gray-400">
                  No courses found.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-white/10 bg-[#11111f] p-5 hover:border-purple-500/30 transition"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-2xl">
                        {course.programmingLanguage === "HTML"
                          ? "🌐"
                          : "📚"}
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          course.published
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg">
                      {course.title}
                    </h3>

                    <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="text-xs bg-purple-500/10 text-purple-300 px-3 py-1 rounded-lg">
                        {course.difficultyLevel}
                      </span>

                      <span className="text-xs bg-blue-500/10 text-blue-300 px-3 py-1 rounded-lg">
                        {course.category}
                      </span>

                      <span className="text-xs bg-green-500/10 text-green-300 px-3 py-1 rounded-lg">
                        {course.free ? "Free" : "Paid"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-5 py-4 border-y border-white/10">
                      <div className="text-center">
                        <p className="font-bold">
                          {course.totalModules ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          Modules
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="font-bold">
                          {course.totalLessons ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          Lessons
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="font-bold">
                          {course.estimatedDurationHours ?? 0}h
                        </p>
                        <p className="text-xs text-gray-500">
                          Duration
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                      <Clock3 size={15} />
                      {course.instructorName}
                    </div>

                    <button
                      type="button"
                      disabled={generating} onClick={() => setContentCourse(course)}
                      className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-3 py-3 text-sm font-medium transition"
                    >
                      <Layers3 size={17} /> Manage Content
                    </button>

                    <div className="flex gap-3 mt-5 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => openEditForm(course)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2.5 text-sm text-purple-300 hover:bg-purple-500/20 transition"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError("");
                          setDeletingCourse(course);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="text-center text-xs text-gray-600 py-8">
            © 2026 CODEVERSE · Admin Panel
          </footer>
        </div>
      </main>

      {/* Add / Edit Course Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#11111f] shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-[#11111f] border-b border-white/10 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {editingCourse ? "Update existing course details" : "Create a new learning course"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
              >
                <X size={21} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCourse} className="p-6">
              {formError && (
                <div className="mb-5 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
                  {formError}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Course Title *
                  </label>
                  <input
                    required
                    className={inputClass}
                    placeholder="e.g. CSS Fundamentals"
                    value={form.title}
                    onChange={(e) =>
                      handleTitleChange(e.target.value)
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Course Slug *
                  </label>
                  <input
                    required
                    className={inputClass}
                    placeholder="css-fundamentals"
                    value={form.slug}
                    onChange={(e) =>
                      updateForm("slug", e.target.value)
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className={inputClass}
                    placeholder="Describe this course..."
                    value={form.description}
                    onChange={(e) =>
                      updateForm("description", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Category
                  </label>
                  <select
                    className={inputClass}
                    value={form.category}
                    onChange={(e) =>
                      updateForm("category", e.target.value)
                    }
                  >
                    <option>Web Development</option>
                    <option>Programming</option>
                    <option>Mobile Development</option>
                    <option>Database</option>
                    <option>Data Science</option>
                    <option>Artificial Intelligence</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Programming Language *
                  </label>
                  <input
                    required
                    className={inputClass}
                    placeholder="e.g. CSS, Python, Java"
                    value={form.programmingLanguage}
                    onChange={(e) =>
                      updateForm(
                        "programmingLanguage",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Difficulty Level
                  </label>
                  <select
                    className={inputClass}
                    value={form.difficultyLevel}
                    onChange={(e) =>
                      updateForm(
                        "difficultyLevel",
                        e.target.value
                      )
                    }
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">
                      Intermediate
                    </option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Estimated Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    className={inputClass}
                    value={form.estimatedDurationHours}
                    onChange={(e) =>
                      updateForm(
                        "estimatedDurationHours",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Instructor Name
                  </label>
                  <input
                    className={inputClass}
                    value={form.instructorName}
                    onChange={(e) =>
                      updateForm(
                        "instructorName",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    className={inputClass}
                    placeholder="https://example.com/image.png"
                    value={form.thumbnailUrl}
                    onChange={(e) =>
                      updateForm(
                        "thumbnailUrl",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Learning Outcomes
                  </label>
                  <textarea
                    rows={4}
                    className={inputClass}
                    placeholder={
                      "Understand the basics\nBuild real projects\nApply best practices"
                    }
                    value={form.learningOutcomes}
                    onChange={(e) =>
                      updateForm(
                        "learningOutcomes",
                        e.target.value
                      )
                    }
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter one learning outcome per line.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Prerequisites
                  </label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    placeholder={
                      "Basic computer knowledge\nA code editor"
                    }
                    value={form.prerequisites}
                    onChange={(e) =>
                      updateForm(
                        "prerequisites",
                        e.target.value
                      )
                    }
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter one prerequisite per line.
                  </p>
                </div>
              </div>

              {/* Switches */}
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      updateForm("published", e.target.checked)
                    }
                    className="accent-purple-500 w-4 h-4"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Publish Course
                    </p>
                    <p className="text-xs text-gray-500">
                      Make visible to students
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.free}
                    onChange={(e) =>
                      updateForm("free", e.target.checked)
                    }
                    className="accent-purple-500 w-4 h-4"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Free Course
                    </p>
                    <p className="text-xs text-gray-500">
                      Available without payment
                    </p>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-sm font-medium transition"
                >
                  <Save size={17} />
                  {saving
                    ? editingCourse ? "Saving..." : "Creating..."
                    : editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-course-title" className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#11111f] p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h2 id="delete-course-title" className="text-xl font-bold">Delete Course?</h2>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold">{deletingCourse.title}</span>?
              This action cannot be undone. Related module and lesson data may also be affected depending on backend deletion logic.
            </p>
            {deleteError && (
              <p className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingCourse(null)}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteCourse}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
              >
                <Trash2 size={16} /> {deleting ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
