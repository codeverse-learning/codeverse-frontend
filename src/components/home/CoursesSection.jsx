
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Code2,
  Braces,
  Coffee,
  Clock3,
  BookOpen,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Layers3,
  GraduationCap,
  LockKeyhole,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const courseStyles = [
  {
    icon: Code2,
    gradient: "from-blue-500 to-cyan-400",
    glow: "bg-blue-500/10",
  },
  {
    icon: Braces,
    gradient: "from-yellow-400 to-orange-400",
    glow: "bg-yellow-500/10",
  },
  {
    icon: Coffee,
    gradient: "from-red-500 to-orange-400",
    glow: "bg-red-500/10",
  },
];

function CoursesSection() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/courses`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load courses.");
        }

        const data = await response.json();

        const courseList = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : [];

        setCourses(
          courseList.filter((course) => course.published === true)
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load courses. Please try again later.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedCourse(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedCourse]);

  const handleStartLearning = (course) => {
    const courseId = course.id || course._id;

    if (!courseId) {
      return;
    }

    if (!course.free) {
      return;
    }

    const token = localStorage.getItem("token");

    if (token) {
      navigate(`/learn/${courseId}`);
    } else {
      navigate("/login");
    }
  };

  const visibleCourses = showAll ? courses : courses.slice(0, 3);

  return (
    <section
      id="courses"
      className="relative overflow-hidden bg-[#0b0b18] px-6 py-24 lg:px-8"
    >
      {/* Background */}
      <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-blue-600/[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              <GraduationCap size={14} />
              Additional Learning Resources
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Explore{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Programming Courses
              </span>
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
              Alongside our AI Code Explainer, explore optional
              programming lessons to strengthen your coding
              knowledge and build your skills.
            </p>
          </div>

          {courses.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAll((previous) => !previous)}
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-purple-400 transition hover:text-purple-300"
            >
              {showAll ? "Show fewer courses" : "View all courses"}
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-400">
            <Loader2
              className="animate-spin text-purple-400"
              size={24}
            />
            Loading courses...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <AlertCircle size={30} className="text-red-400" />
            <p className="text-slate-400">{error}</p>
          </div>
        )}

        {/* Course Cards */}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map((course, index) => {
              const style = courseStyles[index % courseStyles.length];
              const Icon = style.icon;

              const courseTitle =
                course.title || course.name || "Untitled Course";

              const lessonCount =
                course.totalLessons ?? course.lessonCount;

              const duration =
                course.estimatedDurationHours ??
                course.durationHours;

              return (
                <article
                  key={course.id || course._id || index}
                  className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11111f] transition duration-300 hover:-translate-y-2 hover:border-purple-400/30 hover:shadow-2xl hover:shadow-purple-500/10"
                >
                  {/* Course Banner */}
                  <div
                    className={`relative flex h-44 items-center justify-center overflow-hidden ${style.glow}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

                    <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/[0.07]" />

                    <div className="absolute -right-2 -top-6 h-36 w-36 rounded-full border border-white/[0.07]" />

                    <div
                      className={`relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${style.gradient} shadow-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon size={48} className="text-white" />
                    </div>

                    <span className="absolute left-5 top-5 rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-200 backdrop-blur">
                      {course.free ? "FREE COURSE" : "COURSE"}
                    </span>
                  </div>

                  {/* Course Details */}
                  <div className="p-6">
                    <span className="text-xs font-semibold text-purple-400">
                      {course.difficultyLevel ||
                        course.level ||
                        "All Levels"}
                    </span>

                    <h3 className="mt-2 text-2xl font-bold text-white">
                      {courseTitle}
                    </h3>

                    <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-400 line-clamp-3">
                      {course.description ||
                        "Start learning with practical lessons and examples."}
                    </p>

                    <div className="my-6 flex flex-wrap items-center gap-5 border-y border-white/[0.07] py-4">
                      <span className="flex items-center gap-2 text-xs text-slate-400">
                        <BookOpen
                          size={15}
                          className="text-purple-400"
                        />
                        {lessonCount != null
                          ? `${lessonCount} Lessons`
                          : "Lessons"}
                      </span>

                      <span className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock3
                          size={15}
                          className="text-blue-400"
                        />
                        {duration != null
                          ? `${duration} Hours`
                          : "Self-paced"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCourse(course)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-300 transition hover:border-purple-400 hover:bg-purple-500 hover:text-white"
                    >
                      Explore Course
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <p className="py-12 text-center text-slate-400">
            No published courses available yet.
          </p>
        )}

        {/* Bottom Note */}
        <p className="mt-10 text-center text-sm text-slate-500">
          Courses are optional learning resources. AI Code Explainer
          is the main feature of CODEVERSE.
        </p>
      </div>

      {/* Course Preview Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-preview-title"
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-500/20 bg-[#141422] p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedCourse(null)}
              className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close course preview"
            >
              <X size={20} />
            </button>

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500">
              <BookOpen size={27} className="text-white" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Course Preview
            </span>

            <h2
              id="course-preview-title"
              className="mt-3 pr-8 text-2xl font-bold text-white"
            >
              {selectedCourse.title ||
                selectedCourse.name ||
                "Untitled Course"}
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              {selectedCourse.description ||
                "Explore programming concepts through practical lessons."}
            </p>

            {/* Course Metadata */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <Layers3
                  size={18}
                  className="mb-2 text-purple-400"
                />
                <p className="text-sm font-semibold text-white">
                  {selectedCourse.totalModules ?? 0}
                </p>
                <p className="text-xs text-slate-500">
                  Modules
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <BookOpen
                  size={18}
                  className="mb-2 text-blue-400"
                />
                <p className="text-sm font-semibold text-white">
                  {selectedCourse.totalLessons ?? 0}
                </p>
                <p className="text-xs text-slate-500">
                  Lessons
                </p>
              </div>
            </div>

            {/* Access Note */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
              <LockKeyhole
                size={19}
                className="mt-0.5 shrink-0 text-purple-400"
              />

              <p className="text-sm leading-6 text-slate-400">
                You can preview this course without an account.
                Sign in to access its learning materials.
              </p>
            </div>

            {/* Action */}
            <button
              type="button"
              disabled={!selectedCourse.free ||
                !(selectedCourse.id || selectedCourse._id)}
              onClick={() => handleStartLearning(selectedCourse)}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 font-semibold text-white transition hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedCourse.free
                ? "Start Learning"
                : "Currently Unavailable"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default CoursesSection;
