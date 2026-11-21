
import {
  BrainCircuit,
  Code2,
  Bug,
  Lightbulb,
  MessageCircle,
  ClipboardCheck,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Code Explainer",
    description:
      "Paste your programming code and learn what it does through simple, easy-to-understand AI explanations.",
    color: "from-purple-500 to-violet-500",
    glow: "group-hover:shadow-purple-500/10",
    status: "In Development",
  },
  {
    icon: Code2,
    title: "Line-by-Line Analysis",
    description:
      "Understand every line of your code, including variables, functions, conditions, loops, and program logic.",
    color: "from-blue-500 to-cyan-400",
    glow: "group-hover:shadow-blue-500/10",
    status: "In Development",
  },
  {
    icon: Bug,
    title: "Error Detection",
    description:
      "Discover possible coding mistakes, understand why they happen, and learn how to correct them.",
    color: "from-fuchsia-500 to-purple-500",
    glow: "group-hover:shadow-fuchsia-500/10",
    status: "Planned",
  },
  {
    icon: Lightbulb,
    title: "Code Improvements",
    description:
      "Explore suggestions to make your code cleaner, easier to read, and more maintainable.",
    color: "from-cyan-500 to-blue-500",
    glow: "group-hover:shadow-cyan-500/10",
    status: "Planned",
  },
  {
    icon: MessageCircle,
    title: "AI Coding Tutor",
    description:
      "Ask follow-up questions about your code and explore programming concepts with an AI learning assistant.",
    color: "from-orange-500 to-pink-500",
    glow: "group-hover:shadow-orange-500/10",
    status: "Planned",
  },
  {
    icon: ClipboardCheck,
    title: "Code-Based Quizzes",
    description:
      "Test your understanding with quizzes based on the code you submit and the concepts you learn.",
    color: "from-emerald-500 to-teal-400",
    glow: "group-hover:shadow-emerald-500/10",
    status: "Planned",
  },
];

function FeaturesSection() {
  const navigate = useNavigate();

  const handleExplore = () => {
    const token = localStorage.getItem("token");

    navigate(token ? "/code-explainer" : "/register");
  };

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#080812] px-6 py-24 lg:px-8"
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
            <Sparkles size={14} />
            Why CODEVERSE?
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Understand Code.
            <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Learn Smarter with AI.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
            CODEVERSE is designed to help developers and
            programming students understand code instead of
            simply copying it. Explore the AI-powered learning
            tools we are building.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11111f] p-7 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-2 hover:border-purple-400/30 ${feature.glow}`}
              >
                {/* Background Glow */}
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-purple-500/[0.04] blur-3xl transition group-hover:bg-purple-500/[0.10]" />

                <div className="relative">
                  {/* Icon and Status */}
                  <div className="mb-6 flex items-start justify-between gap-3">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}
                    >
                      <Icon size={27} className="text-white" />
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-400">
                      {feature.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-xl font-bold text-white">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="min-h-[100px] text-sm leading-7 text-slate-400">
                    {feature.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5">
                    <span className="text-xs font-semibold tracking-wide text-slate-500">
                      FEATURE 0{index + 1}
                    </span>

                    <span className="text-xs text-purple-400">
                      {feature.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main CTA */}
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={handleExplore}
            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-4 font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-500 hover:to-blue-500"
          >
            <BrainCircuit size={20} />
            Explore Code Explainer
            <ArrowUpRight size={19} />
          </button>

          <p className="mt-4 text-xs text-slate-500">
            Code editor preview available. AI integration is
            currently under development.
          </p>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
