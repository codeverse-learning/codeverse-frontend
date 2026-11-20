
import { useEffect, useState } from "react";
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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          : Array.isArray(data.content)
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

  return (
    <section
      id="courses"
      className="relative overflow-hidden bg-[#0b0b18] px-6 py-24 lg:px-8"
    >
      <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-blue-600/[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              <Sparkles size={14} />
              Explore Courses
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Learning Path
              </span>
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
              Start with the language you love and build the skills to turn
              your ideas into reality.
            </p>
          </div>

          <a
            href="/courses"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-purple-400 transition hover:text-purple-300"
          >
            View all courses
            <ArrowRight size={18} />
          </a>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-400">
            <Loader2 className="animate-spin text-purple-400" size={24} />
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

        {/* Course cards */}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course, index) => {
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
                  key={course.id || course._id || course.slug}
                  className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11111f] transition duration-300 hover:-translate-y-2 hover:border-purple-400/30 hover:shadow-2xl hover:shadow-purple-500/10"
                >
                  {/* Course banner */}
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

                  {/* Course details */}
                  <div className="p-6">
                    <span className="text-xs font-semibold text-purple-400">
                      {course.level || "All Levels"}
                    </span>

                    <h3 className="mt-2 text-2xl font-bold text-white">
                      {courseTitle}
                    </h3>

                    <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-400">
                      {course.description ||
                        "Start learning with practical lessons and exercises."}
                    </p>

                    <div className="my-6 flex items-center gap-5 border-y border-white/[0.07] py-4">
                      <span className="flex items-center gap-2 text-xs text-slate-400">
                        <BookOpen size={15} className="text-purple-400" />
                        {lessonCount != null
                          ? `${lessonCount} Lessons`
                          : "Lessons"}
                      </span>

                      <span className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock3 size={15} className="text-blue-400" />
                        {duration != null
                          ? `${duration} Hours`
                          : "Self-paced"}
                      </span>
                    </div>

                    <a
                      href={`/courses/${course.slug}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-300 transition hover:border-purple-400 hover:bg-purple-500 hover:text-white"
                    >
                      Explore Course
                      <ArrowRight size={17} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <p className="py-12 text-center text-slate-400">
            No published courses available yet.
          </p>
        )}

        {/* Bottom note */}
        <p className="mt-10 text-center text-sm text-slate-500">
          More programming languages and learning paths are coming soon.
        </p>
      </div>
    </section>
  );
}

export default CoursesSection;
