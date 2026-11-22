
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Trophy,
  BrainCircuit,
  Clapperboard,
  Settings,
  LogOut,
  Sparkles,
  Clock3,
  Layers3,
  FileText,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  Bug,
  Lightbulb,
  ClipboardCheck,
  WandSparkles,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";

import api from "../services/api";

function StudentDashboard({ user }) {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const firstName = user?.fullName?.split(" ")[0] || "Student";

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];

      setCourses(data.filter((course) => course.published));
    } catch (err) {
      console.error("Failed to load courses:", err);
      setError("Unable to load available courses.");
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

  const openCodeExplainer = () => {
    setSidebarOpen(false);
    navigate("/code-explainer");
  };

  const openVisualLearning = () => {
    setSidebarOpen(false);
    navigate("/visual-learning");
  };

  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      action: () => {
        setSidebarOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      active: true,
    },
    {
      name: "AI Code Explainer",
      icon: BrainCircuit,
      action: openCodeExplainer,
    },
    {
      name: "Visual Learning Studio",
      icon: Clapperboard,
      action: openVisualLearning,
    },
    {
      name: "Explore Courses",
      icon: BookOpen,
      action: () => {
        setSidebarOpen(false);
        document
          .getElementById("courses")
          ?.scrollIntoView({ behavior: "smooth" });
      },
    },
  ];

  const features = [
    {
      icon: Code2,
      title: "Code Explanation",
      description:
        "Understand what your code does with clear AI explanations.",
    },
    {
      icon: FileText,
      title: "Line-by-Line Analysis",
      description:
        "Learn the purpose of each line and how the logic works.",
    },
    {
      icon: Bug,
      title: "Error Detection",
      description:
        "Identify potential bugs and understand how to fix them.",
    },
    {
      icon: Lightbulb,
      title: "Code Improvements",
      description:
        "Discover cleaner, more readable coding practices.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080812] text-white flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen shrink-0 border-r border-white/10 bg-[#0c0c18] flex flex-col p-5 transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-10 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xl">
              C
            </div>

            <div>
              <h1 className="text-xl font-bold">CODEVERSE</h1>
              <p className="text-xs text-gray-500">
                AI Learning Platform
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 px-3">
          Menu
        </p>

        <nav className="space-y-2">
          {menu.map(({ name, icon: Icon, action, active }) => (
            <button
              key={name}
              onClick={action}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition ${
                active
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={19} />
              {name}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 rounded-2xl border border-purple-500/20 bg-purple-500/10">
          <Sparkles className="text-purple-400 mb-2" />

          <p className="font-semibold text-sm">
            Learn Smarter with AI
          </p>

          <p className="text-xs text-gray-400 mt-2 leading-5">
            Paste your code, explore its logic, and improve your
            programming knowledge.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 min-h-20 border-b border-white/10 bg-[#0c0c18] flex items-center justify-between px-5 md:px-8 gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="font-semibold">
                AI Learning Dashboard
              </h2>
              <p className="text-xs text-gray-500">
                Student Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">
                {user?.fullName || "Student"}
              </p>

              <p className="text-xs text-purple-400">
                STUDENT
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold">
              {firstName[0].toUpperCase()}
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
            <p className="text-purple-400 text-sm mb-2 flex items-center gap-2">
              <Sparkles size={16} />
              Welcome back!
            </p>

            <h1 className="text-3xl font-bold">
              Hello, {firstName} 👋
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Ready to understand your code and learn something
              new today?
            </p>
          </section>

          {/* Main Feature Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-[#11111f] to-blue-500/10 p-7 md:p-10 mb-10">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

            <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-6">
                <Sparkles size={15} />
                MAIN FEATURE
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="max-w-2xl">
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                    Understand Your Code
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      with AI
                    </span>
                  </h2>

                  <p className="text-gray-400 mt-5 leading-7">
                    Paste your programming code and discover how
                    it works. CODEVERSE is designed to help you
                    understand code structure, logic, syntax,
                    and programming concepts.
                  </p>

                  <button
                    onClick={openCodeExplainer}
                    className="mt-7 inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-4 font-semibold hover:from-purple-500 hover:to-blue-500 transition"
                  >
                    <WandSparkles size={20} />
                    Start Code Explainer
                    <ArrowRight size={19} />
                  </button>

                  <p className="text-xs text-gray-500 mt-4">
                    Explore AI-powered explanations and interactive learning tools.
                  </p>
                </div>

                {/* Decorative Code Preview */}
                <div className="hidden xl:block w-[300px] shrink-0 rounded-2xl border border-white/10 bg-[#090914] shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />

                    <span className="ml-3 text-xs text-gray-500">
                      example.py
                    </span>
                  </div>

                  <pre className="text-xs leading-7 text-gray-300 p-5 overflow-x-auto">
                    <code>{`def greet(name):
    return "Hello " + name

print(greet("CODEVERSE"))`}</code>
                  </pre>

                  <div className="border-t border-white/10 px-5 py-4">
                    <div className="flex items-center gap-2 text-purple-400 text-xs">
                      <BrainCircuit size={15} />
                      AI Code Analysis
                    </div>

                    <p className="text-xs text-gray-400 mt-2 leading-5">
                      Learn how functions, variables, and
                      execution flow work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Learning Tools */}
          <section className="mb-10" id="ai-tools">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2 text-xs text-purple-400">
                <Sparkles size={16} />
                LEARN WITH AI
              </div>
              <h2 className="text-xl font-bold">AI Learning Tools</h2>
              <p className="mt-2 text-sm text-gray-400">
                Choose how you want to understand your code.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <button
                type="button"
                onClick={openCodeExplainer}
                className="group rounded-2xl border border-purple-500/20 bg-[#11111f] p-6 text-left transition hover:-translate-y-1 hover:border-purple-400/60"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <BrainCircuit className="text-purple-400" size={25} />
                </div>
                <h3 className="text-lg font-semibold">AI Code Explainer</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Get clear, step-by-step explanations of your code, logic, and syntax.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-purple-400">
                  Explain Code <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </span>
              </button>
              <button
                type="button"
                onClick={openVisualLearning}
                className="group rounded-2xl border border-blue-500/20 bg-[#11111f] p-6 text-left transition hover:-translate-y-1 hover:border-blue-400/60"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Clapperboard className="text-blue-400" size={25} />
                </div>
                <h3 className="text-lg font-semibold">Visual Learning Studio</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Watch animated code lessons with optional English voice narration.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-400">
                  Start Visual Learning <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </section>

          {/* AI Features */}
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Explore AI Code Learning
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Everything you need to understand programming
                code more clearly.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {features.map(({ icon: Icon, title, description }) => (
                <button
                  key={title}
                  onClick={openCodeExplainer}
                  className="text-left rounded-2xl border border-white/10 bg-[#11111f] p-6 hover:border-purple-500/40 hover:-translate-y-1 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5">
                    <Icon
                      size={23}
                      className="text-purple-400"
                    />
                  </div>

                  <h3 className="font-semibold">{title}</h3>

                  <p className="text-sm text-gray-400 mt-3 leading-6">
                    {description}
                  </p>

                  <span className="inline-flex items-center gap-2 text-xs text-purple-400 mt-5">
                    Explore
                    <ChevronRight size={15} />
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Secondary Feature - Courses */}
          <section id="courses" className="mb-10 scroll-mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-purple-400 text-xs mb-2">
                  <GraduationCap size={15} />
                  ADDITIONAL LEARNING RESOURCES
                </div>

                <h2 className="text-xl font-bold">
                  Explore Courses
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                  Optional programming lessons to support your
                  learning journey.
                </p>
              </div>

              <button
                onClick={fetchCourses}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 mb-5 text-red-300 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#11111f] p-10 text-center">
                <BookOpen
                  className="mx-auto mb-3 text-gray-500"
                  size={32}
                />

                <p className="text-gray-400">
                  No published courses available yet.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    disabled={!course.free}
                    onClick={() =>
                      navigate(`/learn/${course.id}`)
                    }
                    className={`text-left rounded-2xl border border-white/10 bg-[#11111f] p-5 transition group ${
                      course.free
                        ? "cursor-pointer hover:border-purple-500/50"
                        : "cursor-not-allowed opacity-75"
                    }`}
                  >
                    <h3 className="font-semibold text-lg">
                      {course.title}
                    </h3>

                    <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="flex gap-2 flex-wrap mt-4">
                      <span className="text-xs px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300">
                        {course.difficultyLevel}
                      </span>

                      <span className="text-xs px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300">
                        {course.category}
                      </span>

                      <span className="text-xs px-3 py-1 rounded-lg bg-green-500/10 text-green-300">
                        {course.free ? "Free" : "Paid"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-5 py-4 border-y border-white/10 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Layers3 size={15} />
                        {course.totalModules ?? 0} Modules
                      </span>

                      <span className="flex items-center gap-1">
                        <FileText size={15} />
                        {course.totalLessons ?? 0} Lessons
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock3 size={15} />
                        {course.estimatedDurationHours ?? 0}h
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {course.instructorName}
                      </p>

                      <span className="text-xs text-purple-400 flex items-center gap-1">
                        {course.free ? "Start Learning" : "Unavailable"}
                        <ChevronRight size={15} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Features */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-5">
              Coming Next
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-white/10 bg-[#11111f] p-6">
                <ClipboardCheck
                  className="text-purple-400 mb-4"
                  size={25}
                />

                <h3 className="font-semibold text-lg">
                  AI Code Quizzes
                </h3>

                <p className="text-sm text-gray-400 mt-2 leading-6">
                  Test your understanding with questions
                  generated from your own code.
                </p>

                <span className="text-xs text-purple-400 mt-4 inline-block">
                  Coming Soon
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#11111f] p-6">
                <Trophy
                  className="text-blue-400 mb-4"
                  size={25}
                />

                <h3 className="font-semibold text-lg">
                  Coding Challenges
                </h3>

                <p className="text-sm text-gray-400 mt-2 leading-6">
                  Improve your problem-solving skills through
                  practical coding challenges.
                </p>

                <span className="text-xs text-blue-400 mt-4 inline-block">
                  Coming Soon
                </span>
              </div>
            </div>
          </section>

          <footer className="text-center text-xs text-gray-600 py-8">
            © 2026 CODEVERSE · Learn. Code. Create.
          </footer>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
