
import {
  BookOpen,
  BrainCircuit,
  Terminal,
  Workflow,
  Trophy,
  ChartNoAxesCombined,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description:
      "Learn programming through structured lessons, practical examples, and hands-on activities.",
    color: "from-purple-500 to-violet-500",
    glow: "group-hover:shadow-purple-500/10",
  },
  {
    icon: BrainCircuit,
    title: "AI Coding Tutor",
    description:
      "Get personalized coding guidance, clear explanations, and helpful answers whenever you need.",
    color: "from-blue-500 to-cyan-400",
    glow: "group-hover:shadow-blue-500/10",
  },
  {
    icon: Terminal,
    title: "Live Code Execution",
    description:
      "Write and run your code in an interactive coding environment and see the results instantly.",
    color: "from-fuchsia-500 to-purple-500",
    glow: "group-hover:shadow-fuchsia-500/10",
  },
  {
    icon: Workflow,
    title: "Visual Learning",
    description:
      "Understand how your code works through visual execution steps and algorithm illustrations.",
    color: "from-cyan-500 to-blue-500",
    glow: "group-hover:shadow-cyan-500/10",
  },
  {
    icon: Trophy,
    title: "Coding Challenges",
    description:
      "Improve your programming skills by solving practical challenges and testing your knowledge.",
    color: "from-orange-500 to-pink-500",
    glow: "group-hover:shadow-orange-500/10",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress Tracking",
    description:
      "Track completed lessons, coding activity, achievements, and your overall learning journey.",
    color: "from-emerald-500 to-teal-400",
    glow: "group-hover:shadow-emerald-500/10",
  },
];

function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#080812] px-6 py-24 lg:px-8"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            Why CODEVERSE?
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Master Coding
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
            A smarter way to learn programming with interactive tools,
            AI-powered guidance, and practical coding experiences.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11111f] p-7 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-2 hover:border-purple-400/30 ${feature.glow}`}
              >
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-purple-500/[0.04] blur-3xl transition group-hover:bg-purple-500/[0.10]" />

                <div className="relative">
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}
                  >
                    <Icon size={27} className="text-white" />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="min-h-[72px] text-sm leading-7 text-slate-400">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5">
                    <span className="text-xs font-semibold tracking-wide text-slate-500">
                      FEATURE 0{index + 1}
                    </span>

                    <ArrowUpRight
                      size={19}
                      className="text-slate-500 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-purple-400"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
