
import {
  ArrowRight,
  Target,
  Lightbulb,
  Rocket,
  Code2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const highlights = [
  "Learn through practical coding experiences",
  "Understand code with visual explanations",
  "Get personalized help from an AI tutor",
  "Build confidence through coding challenges",
];

function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#080812] px-6 py-24 lg:px-8"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-purple-600/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-blue-600/[0.08] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left side - Content */}
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
              <Sparkles size={14} />
              About CODEVERSE
            </span>

            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              More Than Just a{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Coding Platform
              </span>
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-400">
              CODEVERSE is an interactive programming learning platform
              designed to make learning to code easier, smarter, and more
              engaging.
            </p>

            <p className="mt-4 text-base leading-8 text-slate-400">
              We combine structured lessons, hands-on coding, visual
              execution, and AI-powered assistance to help learners
              understand programming concepts and develop real-world skills.
            </p>

            {/* Highlights */}
            <div className="mt-8 space-y-4">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-purple-400"
                  />
                  <span className="text-sm leading-6 text-slate-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="#features"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-1 hover:shadow-purple-500/30"
            >
              Explore Features
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Right side - Vision cards */}
          <div className="relative">
            <div className="absolute inset-8 rounded-full bg-purple-500/10 blur-[80px]" />

            <div className="relative grid gap-5 sm:grid-cols-2">

              {/* Mission */}
              <div className="group rounded-2xl border border-white/[0.08] bg-[#11111f] p-7 transition hover:-translate-y-2 hover:border-purple-400/30 sm:translate-y-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20">
                  <Target size={27} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-white">
                  Our Mission
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  To make programming education accessible, interactive,
                  and enjoyable for everyone.
                </p>
              </div>

              {/* Vision */}
              <div className="group rounded-2xl border border-white/[0.08] bg-[#11111f] p-7 transition hover:-translate-y-2 hover:border-blue-400/30">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                  <Lightbulb size={27} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-white">
                  Our Vision
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  To create a learning environment where anyone can
                  become a confident and creative programmer.
                </p>
              </div>

              {/* Learning */}
              <div className="group rounded-2xl border border-white/[0.08] bg-[#11111f] p-7 transition hover:-translate-y-2 hover:border-cyan-400/30">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                  <Code2 size={27} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-white">
                  Learn by Doing
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Practice programming concepts with real code,
                  interactive exercises, and instant feedback.
                </p>
              </div>

              {/* Innovation */}
              <div className="group rounded-2xl border border-white/[0.08] bg-[#11111f] p-7 transition hover:-translate-y-2 hover:border-pink-400/30 sm:translate-y-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/20">
                  <Rocket size={27} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-white">
                  Keep Growing
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Develop your skills step by step and turn your
                  programming ideas into reality.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
