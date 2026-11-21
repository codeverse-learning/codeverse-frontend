
import {
  ArrowRight,
  Sparkles,
  Code2,
  BrainCircuit,
  Lightbulb,
  WandSparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function CTASection() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/code-explainer");
    } else {
      navigate("/register");
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0b0b18] px-6 py-24 lg:px-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/[0.08] via-transparent to-blue-600/[0.08]" />

      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-blue-600/10 blur-[120px]" />

      {/* CTA Card */}
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-purple-400/20 bg-[#11111f] px-6 py-16 text-center shadow-2xl shadow-purple-900/10 sm:px-12">
        {/* Decorative Circles */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-purple-400/10" />

        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-purple-400/10" />

        <div className="relative">
          {/* Main Icon */}
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-xl shadow-purple-500/20">
            <BrainCircuit size={30} className="text-white" />
          </div>

          {/* Small Heading */}
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-purple-300">
            <Sparkles size={15} />
            Your Code Learning Journey Starts Here
          </span>

          {/* Main Heading */}
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Stop Copying Code.
            <span className="mt-2 block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Start Understanding It.
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400">
            Every great developer starts by understanding how code
            works. CODEVERSE is building an AI-powered learning
            experience to help you explore programming logic,
            understand individual lines of code, and improve
            your coding knowledge.
          </p>

          {/* Main CTA Button */}
          <button
            type="button"
            onClick={handleGetStarted}
            className="mt-9 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-purple-500/20 transition hover:-translate-y-1 hover:shadow-purple-500/40"
          >
            <WandSparkles size={19} />
            Try Code Explainer
            <ArrowRight size={19} />
          </button>

          {/* Development Note */}
          <p className="mt-4 text-xs text-slate-500">
            Code editor available. AI-powered explanations are
            currently under development.
          </p>

          {/* Feature Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-7 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-2">
              <Code2
                size={16}
                className="text-purple-400"
              />
              Understand Code
            </span>

            <span className="flex items-center gap-2">
              <BrainCircuit
                size={16}
                className="text-blue-400"
              />
              AI Code Analysis
            </span>

            <span className="flex items-center gap-2">
              <Lightbulb
                size={16}
                className="text-cyan-400"
              />
              Learn & Improve
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
