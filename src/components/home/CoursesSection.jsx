
import {
  ArrowRight,
  Code2,
  Braces,
  Coffee,
  Clock3,
  BookOpen,
  Sparkles,
} from "lucide-react";

const courses = [
  {
    name: "Python",
    level: "Beginner Friendly",
    description:
      "Start your programming journey with Python. Learn fundamentals, problem solving, and build real projects.",
    lessons: "24 Lessons",
    duration: "8 Hours",
    icon: Code2,
    gradient: "from-blue-500 to-cyan-400",
    glow: "bg-blue-500/10",
    tag: "MOST POPULAR",
  },
  {
    name: "JavaScript",
    level: "Beginner to Intermediate",
    description:
      "Learn modern JavaScript and discover how to build interactive websites and powerful web applications.",
    lessons: "30 Lessons",
    duration: "10 Hours",
    icon: Braces,
    gradient: "from-yellow-400 to-orange-400",
    glow: "bg-yellow-500/10",
    tag: "WEB DEVELOPMENT",
  },
  {
    name: "Java",
    level: "Beginner Friendly",
    description:
      "Understand object-oriented programming and develop strong foundations for building Java applications.",
    lessons: "28 Lessons",
    duration: "12 Hours",
    icon: Coffee,
    gradient: "from-red-500 to-orange-400",
    glow: "bg-red-500/10",
    tag: "OOP FUNDAMENTALS",
  },
];

function CoursesSection() {
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

        {/* Course cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const Icon = course.icon;

            return (
              <article
                key={course.name}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11111f] transition duration-300 hover:-translate-y-2 hover:border-purple-400/30 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                {/* Course banner */}
                <div
                  className={`relative flex h-44 items-center justify-center overflow-hidden ${course.glow}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

                  <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/[0.07]" />
                  <div className="absolute -right-2 -top-6 h-36 w-36 rounded-full border border-white/[0.07]" />

                  <div
                    className={`relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${course.gradient} shadow-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon size={48} className="text-white" />
                  </div>

                  <span className="absolute left-5 top-5 rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-200 backdrop-blur">
                    {course.tag}
                  </span>
                </div>

                {/* Course details */}
                <div className="p-6">
                  <span className="text-xs font-semibold text-purple-400">
                    {course.level}
                  </span>

                  <h3 className="mt-2 text-2xl font-bold text-white">
                    {course.name}
                  </h3>

                  <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-400">
                    {course.description}
                  </p>

                  <div className="my-6 flex items-center gap-5 border-y border-white/[0.07] py-4">
                    <span className="flex items-center gap-2 text-xs text-slate-400">
                      <BookOpen size={15} className="text-purple-400" />
                      {course.lessons}
                    </span>

                    <span className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock3 size={15} className="text-blue-400" />
                      {course.duration}
                    </span>
                  </div>

                  <a
                    href="/register"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-300 transition hover:border-purple-400 hover:bg-purple-500 hover:text-white"
                  >
                    Start Learning
                    <ArrowRight size={17} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-sm text-slate-500">
          More programming languages and learning paths are coming soon.
        </p>
      </div>
    </section>
  );
}

export default CoursesSection;
