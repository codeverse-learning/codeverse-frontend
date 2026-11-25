
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Clock3,
  Code2,
  Trophy,
  BrainCircuit,
  LogOut,
  Sparkles,
  FileText,
  ChevronRight,
  ArrowRight,
  Bug,
  Lightbulb,
  ClipboardCheck,
  Globe,
  Menu,
  X,
} from "lucide-react";


function StudentDashboard({ user }) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const firstName = user?.fullName?.split(" ")[0] || "Student";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const openCodeExplainer = () => {
    setSidebarOpen(false);
    navigate("/code-explainer");
  };

  const openTimeMachine = () => {
    setSidebarOpen(false);
    navigate("/code-time-machine");
  };

  const openLivePlayground = () => {
    setSidebarOpen(false);
    navigate("/live-playground");
  };

  const openStudyPacks = () => {
    setSidebarOpen(false);
    navigate("/study-packs");
  };

  const openLearningHub = () => {
    setSidebarOpen(false);
    navigate("/learning-hub");
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
      name: "AI Code Time Machine",
      icon: Clock3,
      action: openTimeMachine,
    },
    {
      name: "Live Code Playground",
      icon: Globe,
      action: openLivePlayground,
    },
    {
      name: "AI Code Explainer",
      icon: BrainCircuit,
      action: openCodeExplainer,
    },
    {
      name: "AI Study Packs",
      icon: Sparkles,
      action: openStudyPacks,
    },
    {
      name: "Learning Hub",
      icon: BookOpen,
      action: openLearningHub,
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
                Student Dashboard
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
              Ready to learn, experiment, and build your coding skills?
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
                    Travel Through Your Code
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      with Code Time Machine
                    </span>
                  </h2>

                  <p className="text-gray-400 mt-5 leading-7">
                    Explore code execution step by step across eight programming languages. Follow the active line, watch variables change, and rewind execution to understand the logic.
                  </p>

                  <button
                    onClick={openTimeMachine}
                    className="mt-7 inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-4 font-semibold hover:from-purple-500 hover:to-blue-500 transition"
                  >
                    <Clock3 size={20} />
                    Launch Code Time Machine
                    <ArrowRight size={19} />
                  </button>

                  <p className="text-xs text-gray-500 mt-4">
                    Python · JavaScript · Java · C · C++ · C# · PHP · Dart
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

          {/* Live Code Playground */}
          <section className="mb-10 rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-[#11111f] to-purple-500/10 p-7 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-blue-300">
                  <Globe size={18} /> INTERACTIVE WEB DEVELOPMENT
                </div>
                <h2 className="text-2xl font-bold">Live Code Playground</h2>
                <p className="mt-3 text-sm leading-7 text-gray-400">
                  Write HTML, CSS and JavaScript in a professional code editor and see your results instantly with a live browser preview.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["HTML", "CSS", "JavaScript"].map((language) => (
                    <span key={language} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">{language}</span>
                  ))}
                </div>
              </div>
              <button onClick={openLivePlayground} className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 font-semibold hover:from-purple-500 hover:to-blue-500 transition">
                <Code2 size={20} /> Launch Playground <ArrowRight size={18} />
              </button>
            </div>
          </section>

          {/* AI Features */}
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Other AI Learning Tools
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Explore explanations, debugging, and deeper code analysis.
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
