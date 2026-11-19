
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Trophy,
  BrainCircuit,
  Settings,
  Search,
  Bell,
  Flame,
  Clock3,
  ChevronRight,
  Play,
  Sparkles,
  Target,
  Zap,
  Menu,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../services/api";

const courses = [
  {
    title: "Python Fundamentals",
    subtitle: "Start your programming journey",
    progress: 35,
    lessons: "12 / 34 lessons",
    color: "from-purple-500 to-violet-600",
    icon: "🐍",
  },
  {
    title: "JavaScript Essentials",
    subtitle: "Build interactive web experiences",
    progress: 12,
    lessons: "4 / 32 lessons",
    color: "from-blue-500 to-cyan-500",
    icon: "⚡",
  },
  {
    title: "Java Programming",
    subtitle: "Master object-oriented programming",
    progress: 0,
    lessons: "0 / 40 lessons",
    color: "from-orange-500 to-pink-500",
    icon: "☕",
  },
];

const activities = [
  { day: "Mon", value: 35 },
  { day: "Tue", value: 65 },
  { day: "Wed", value: 45 },
  { day: "Thu", value: 85 },
  { day: "Fri", value: 55 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 25 },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getStoredUser);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Fetch actual logged-in user profile
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError("");

      const response = await api.get("/auth/me");

      const userData = response.data;

      setUser(userData);

      // Update locally stored user information
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      setProfileError(
        "Unable to load your profile. Please check your connection and try again."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const firstName = user.fullName?.split(" ")[0] || "Student";

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080812] text-white flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen border-r border-white/10 bg-[#0c0c18] flex-col px-5 py-7">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-lg">
            C
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide">CODEVERSE</h1>
            <p className="text-xs text-gray-500">Learning Platform</p>
          </div>
        </div>

        <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 px-2">
          Menu
        </p>

        <nav className="space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
            <LayoutDashboard size={19} />
            <span className="text-sm font-medium">Dashboard</span>
          </div>

          {[
            { icon: BookOpen, label: "My Courses" },
            { icon: Code2, label: "Code Playground" },
            { icon: Trophy, label: "Challenges" },
            { icon: BrainCircuit, label: "AI Tutor" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <Icon size={19} />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 px-2">
            Preferences
          </p>

          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition">
            <Settings size={19} />
            <span className="text-sm">Settings</span>
          </div>
        </div>

        <div className="mt-auto rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4">
          <Sparkles className="text-purple-400 mb-2" size={20} />
          <h3 className="text-sm font-semibold">Keep learning!</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Small steps every day lead to big achievements.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Menu className="lg:hidden text-gray-400" size={22} />

            <div className="hidden sm:block">
              <p className="text-sm text-gray-400">Learning Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/5">
              <Search size={18} />
            </button>

            <button className="relative w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/5">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-semibold text-sm">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-medium">
                  {profileLoading ? "Loading..." : user.fullName || "Student"}
                </p>

                <p className="text-xs text-gray-500">
                  {user.role || "Student"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition text-sm"
              >
                <LogOut size={17} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-5 md:p-8 max-w-7xl mx-auto">

          {/* Profile Error */}
          {profileError && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-red-300">{profileError}</p>

              <button
                onClick={fetchProfile}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Welcome Section */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-purple-400 text-sm font-medium mb-2">
                  <Sparkles size={14} className="inline mr-1" />
                  Welcome back!
                </p>

                <h1 className="text-2xl md:text-3xl font-bold">
                  {profileLoading
                    ? "Loading your profile..."
                    : `Hello, ${firstName}`}
                  {!profileLoading && <span> 👋</span>}
                </h1>

                <p className="text-gray-400 mt-2 text-sm">
                  Ready to continue your coding journey today?
                </p>

                {!profileLoading && user.email && (
                  <p className="text-xs text-gray-500 mt-2">
                    {user.email}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-orange-500/20 bg-orange-500/5 w-fit">
                <Flame className="text-orange-400" size={21} />

                <div>
                  <p className="text-sm font-semibold">0 Day Streak</p>
                  <p className="text-xs text-gray-500">Keep it going!</p>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Courses Enrolled",
                value: "3",
                icon: BookOpen,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
              {
                label: "Lessons Completed",
                value: "16",
                icon: Target,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                label: "Coding Hours",
                value: "8.5h",
                icon: Clock3,
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
              },
              {
                label: "Total XP Earned",
                value: "240",
                icon: Zap,
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="border border-white/10 bg-[#11111f] rounded-2xl p-4 md:p-5 hover:border-white/20 transition"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-4`}>
                  <Icon size={20} />
                </div>

                <p className="text-gray-400 text-xs md:text-sm">{label}</p>
                <h2 className="text-2xl font-bold mt-1">{value}</h2>
              </div>
            ))}
          </section>

          {/* Continue Learning */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg md:text-xl font-bold">Continue Learning</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pick up where you left off
                </p>
              </div>

              <span className="text-sm text-purple-400 flex items-center gap-1 cursor-pointer">
                View all <ChevronRight size={16} />
              </span>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.title}
                  className="rounded-2xl border border-white/10 bg-[#11111f] p-5 hover:border-purple-500/30 transition group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl`}>
                      {course.icon}
                    </div>

                    <span className="text-xs text-gray-500">
                      {course.progress}%
                    </span>
                  </div>

                  <h3 className="font-semibold text-base">{course.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{course.subtitle}</p>

                  <div className="mt-5">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {course.lessons}
                      </span>

                      <button className="text-xs text-purple-400 flex items-center gap-1 group-hover:text-purple-300">
                        <Play size={12} />
                        {course.progress === 0 ? "Start" : "Continue"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Activity & Daily Goal */}
          <section className="grid lg:grid-cols-3 gap-4 mb-8">
            {/* Activity Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#11111f] p-5 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold">Learning Activity</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Your activity this week
                  </p>
                </div>

                <span className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400">
                  This week
                </span>
              </div>

              <div className="flex items-end justify-between gap-3 h-40">
                {activities.map((activity) => (
                  <div
                    key={activity.day}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <div className="w-full max-w-10 flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-blue-500 opacity-80 hover:opacity-100 transition"
                        style={{ height: `${activity.value}%` }}
                      />
                    </div>

                    <span className="text-xs text-gray-500">
                      {activity.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Goal */}
            <div className="rounded-2xl border border-white/10 bg-[#11111f] p-5 md:p-6">
              <h2 className="font-bold">Daily Goal</h2>
              <p className="text-xs text-gray-500 mt-1">You're doing great!</p>

              <div className="flex justify-center my-6">
                <div className="w-36 h-36 rounded-full border-[10px] border-white/5 relative flex items-center justify-center">
                  <div className="absolute inset-[-10px] rounded-full border-[10px] border-purple-500 border-r-transparent border-b-transparent rotate-45" />

                  <div className="text-center">
                    <p className="text-3xl font-bold">0%</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Today's progress</span>
                <span>0 / 30 min</span>
              </div>

              <div className="h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                <div className="h-full w-0 bg-purple-500 rounded-full" />
              </div>
            </div>
          </section>

          {/* Bottom Section */}
          <section className="grid md:grid-cols-2 gap-4">
            {/* Recommended Challenge */}
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-[#11111f] to-blue-500/5 p-5 md:p-6">
              <div className="flex items-center gap-2 text-purple-400 mb-3">
                <Code2 size={19} />
                <span className="text-xs font-medium">DAILY CHALLENGE</span>
              </div>

              <h2 className="text-lg font-bold">Two Sum</h2>

              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                Find two numbers in an array that add up to a target value.
                Test your problem-solving skills!
              </p>

              <div className="flex items-center gap-3 mt-4">
                <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400">
                  Easy
                </span>

                <span className="text-xs text-gray-500">+50 XP</span>
              </div>

              <button className="mt-5 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition text-sm font-medium flex items-center justify-center gap-2">
                Start Challenge <ChevronRight size={16} />
              </button>
            </div>

            {/* AI Tutor */}
            <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-[#11111f] to-purple-500/5 p-5 md:p-6">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <BrainCircuit size={19} />
                <span className="text-xs font-medium">AI LEARNING ASSISTANT</span>
              </div>

              <h2 className="text-lg font-bold">Need help with coding?</h2>

              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                Ask questions, understand errors, get hints and learn programming
                concepts with your AI coding tutor.
              </p>

              <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500">Try asking</p>
                <p className="text-sm text-gray-300 mt-1">
                  "Explain Python loops with a simple example"
                </p>
              </div>

              <button className="mt-4 w-full py-3 rounded-xl border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 transition text-sm font-medium flex items-center justify-center gap-2">
                <Sparkles size={16} />
                Explore AI Tutor
              </button>
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

export default Dashboard;
