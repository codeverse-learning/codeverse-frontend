
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Trophy,
  BrainCircuit,
  Settings,
  LogOut,
  Sparkles,
  Clock3,
  Layers3,
  FileText,
  Play,
  ChevronRight,
  RefreshCw,
  GraduationCap,
} from "lucide-react";

import api from "../services/api";

function StudentDashboard({ user }) {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "My Courses", icon: BookOpen },
    { name: "Code Playground", icon: Code2 },
    { name: "Challenges", icon: Trophy },
    { name: "AI Tutor", icon: BrainCircuit },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080812] text-white flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen border-r border-white/10 bg-[#0c0c18] flex-col p-5">
        <div className="flex items-center gap-3 mb-10 mt-2">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xl">
            C
          </div>

          <div>
            <h1 className="text-xl font-bold">CODEVERSE</h1>
            <p className="text-xs text-gray-500">
              Learning Platform
            </p>
          </div>
        </div>

        <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 px-3">
          Menu
        </p>

        <nav className="space-y-2">
          {menu.map(({ name, icon: Icon, active }) => (
            <div
              key={name}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                active
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300"
                  : "text-gray-400"
              }`}
            >
              <Icon size={19} />
              {name}
            </div>
          ))}
        </nav>

        <div className="mt-auto p-4 rounded-2xl border border-purple-500/20 bg-purple-500/10">
          <Sparkles className="text-purple-400 mb-2" />
          <p className="font-semibold text-sm">
            Keep learning!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Small steps every day lead to big achievements.
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="min-h-20 border-b border-white/10 flex items-center justify-between px-5 md:px-8 gap-3">
          <div>
            <h2 className="font-semibold">
              Learning Dashboard
            </h2>
            <p className="text-xs text-gray-500">
              Student Portal
            </p>
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
              Ready to continue your coding journey today?
            </p>

            {user?.email && (
              <p className="text-xs text-gray-500 mt-2">
                {user.email}
              </p>
            )}
          </section>

          {/* Welcome Card */}
          <section className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-[#11111f] to-blue-500/10 p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="text-purple-400" size={26} />
              <h2 className="text-xl font-bold">
                Start Your Learning Journey
              </h2>
            </div>

            <p className="text-gray-400 text-sm">
              Explore programming courses, learn new skills,
              and build real-world projects with CODEVERSE.
            </p>
          </section>

          {/* Available Courses */}
          <section className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Explore Courses
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Discover available learning paths
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
                <BookOpen className="mx-auto mb-3 text-gray-500" size={32} />
                <p className="text-gray-400">
                  No published courses available yet.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map((course) => (
                  
                <div
                key={course.id}
                onClick={() => {
                    if (course.free) {
                    navigate(`/learn/${course.id}`);
                    }
                }}
                className={`rounded-2xl border border-white/10 bg-[#11111f] p-5 transition group ${
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
                        Available
                        <ChevronRight size={15} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Features */}
          <section className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-purple-500/20 bg-[#11111f] p-6">
              <Code2 className="text-purple-400 mb-3" size={24} />
              <h3 className="font-bold text-lg">
                Code Playground
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Practice coding with interactive exercises.
              </p>
              <span className="text-xs text-purple-400 mt-4 inline-flex items-center gap-2">
                Coming Soon <Play size={13} />
              </span>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-[#11111f] p-6">
              <BrainCircuit className="text-blue-400 mb-3" size={24} />
              <h3 className="font-bold text-lg">
                AI Learning Assistant
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Get help understanding coding concepts.
              </p>
              <span className="text-xs text-blue-400 mt-4 inline-flex items-center gap-2">
                Coming Soon <Sparkles size={13} />
              </span>
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
