
import {
  ArrowRight,
  Play,
  Sparkles,
  Terminal,
  Code2,
  BrainCircuit,
  CheckCircle2,
  Lightbulb,
  FileCode2,
  Bug,
  BookOpen,
  WandSparkles,
} from "lucide-react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import FeaturesSection from "../components/home/FeaturesSection";
import CoursesSection from "../components/home/CoursesSection";
import AboutSection from "../components/home/AboutSection";
import CTASection from "../components/home/CTASection";
import Footer from "../components/layout/Footer";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

function Home() {
  const navigate = useNavigate();

  const handleStartExplainer = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/code-explainer");
    } else {
      navigate("/register");
    }
  };

  return (
    <main
      id="home"
      className="relative min-h-screen overflow-hidden pt-16"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="pointer-events-none absolute left-1/2 top-[500px] h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/[0.06] blur-[120px]" />

      {/* HERO SECTION */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pb-28 pt-16 lg:grid-cols-2 lg:px-8 lg:pt-20">
        {/* Hero Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300"
          >
            <Sparkles size={16} className="animate-pulse" />
            AI-Powered Code Understanding Platform
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={fadeUp}
            className="max-w-2xl text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Understand
            <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Any Code
            </span>
            with AI.
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg"
          >
            Stop copying code without understanding it.
            Paste your code into CODEVERSE and learn how
            it works through clear explanations,
            line-by-line analysis, and AI-powered guidance.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap gap-4"
          >
            <motion.button
              type="button"
              onClick={handleStartExplainer}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-4 font-semibold text-white shadow-xl shadow-purple-500/20 transition"
            >
              <WandSparkles size={19} />
              Try Code Explainer
              <ArrowRight size={19} />
            </motion.button>

            <motion.a
              href="#features"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              <Play size={17} />
              Explore Features
            </motion.a>
          </motion.div>

          {/* Highlights */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap gap-9"
          >
            <div>
              <h3 className="text-xl font-bold text-white">
                Explain
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Code Logic
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Analyze
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Line by Line
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Improve
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Coding Skills
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* AI CODE EXPLAINER PREVIEW */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            duration: 1,
            delay: 0.3,
            ease: "easeOut",
          }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute -inset-5 rounded-3xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-2xl" />

          {/* Code Editor */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#11111f] shadow-2xl shadow-purple-950/40"
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Code2 size={15} />
                example.py
              </div>

              <Terminal
                size={18}
                className="text-slate-500"
              />
            </div>

            {/* Code Preview */}
            <div className="overflow-x-auto p-6 font-mono text-xs leading-8 sm:p-8 sm:text-sm">
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                <FileCode2 size={14} />
                YOUR CODE
              </div>

              <div>
                <span className="text-purple-400">def</span>{" "}
                <span className="text-blue-300">
                  greet
                </span>
                (name):
              </div>

              <div className="pl-6">
                <span className="text-purple-400">
                  return
                </span>{" "}
                <span className="text-green-300">
                  "Hello, "
                </span>{" "}
                + name
              </div>

              <div className="mt-3">
                <span className="text-blue-300">
                  print
                </span>
                (greet(
                <span className="text-green-300">
                  "CODEVERSE"
                </span>
                ))
              </div>

              {/* AI Explanation Preview */}
              <div className="mt-7 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                <div className="mb-4 flex items-center gap-2 text-purple-400">
                  <BrainCircuit size={19} />
                  <span className="text-sm font-semibold">
                    AI Explanation Preview
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-green-400"
                    />
                    <p className="text-xs leading-6 text-slate-300">
                      <span className="font-semibold text-white">
                        Line 1:
                      </span>{" "}
                      Defines a function called greet
                      that accepts a name.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-green-400"
                    />
                    <p className="text-xs leading-6 text-slate-300">
                      <span className="font-semibold text-white">
                        Line 2:
                      </span>{" "}
                      Returns a greeting message
                      combined with the name.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-green-400"
                    />
                    <p className="text-xs leading-6 text-slate-300">
                      <span className="font-semibold text-white">
                        Line 4:
                      </span>{" "}
                      Calls the function and
                      prints its returned value.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 text-xs text-blue-300">
                    <Lightbulb size={16} />
                    Output: Hello, CODEVERSE
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating AI Card */}
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-7 -left-7 hidden items-center gap-3 rounded-xl border border-white/10 bg-[#19192b] p-4 shadow-xl sm:flex"
          >
            <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
              <BrainCircuit size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                AI Code Explainer
              </p>

              <p className="text-xs text-slate-400">
                Learn how your code works
              </p>
            </div>

            <span className="ml-2 h-2 w-2 rounded-full bg-purple-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* MAIN FEATURES */}
      <FeaturesSection />

      {/* HOW CODEVERSE WORKS */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-sm text-purple-400">
            <Sparkles size={16} />
            SIMPLE LEARNING PROCESS
          </div>

          <h2 className="text-3xl font-bold text-white md:text-4xl">
            How CODEVERSE Works
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Three simple steps to understand your code
            and improve your programming knowledge.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              number: "01",
              icon: Code2,
              title: "Paste Your Code",
              description:
                "Choose your programming language and paste the code you want to understand.",
            },
            {
              number: "02",
              icon: BrainCircuit,
              title: "AI Analyzes Your Code",
              description:
                "Receive explanations about syntax, structure, logic, and how your code works.",
            },
            {
              number: "03",
              icon: Lightbulb,
              title: "Learn and Improve",
              description:
                "Explore line-by-line explanations, understand concepts, and discover improvements.",
            },
          ].map(({ number, icon: Icon, title, description }) => (
            <div
              key={number}
              className="relative rounded-2xl border border-white/10 bg-[#11111f] p-7 transition hover:border-purple-500/40"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <Icon
                    size={24}
                    className="text-purple-400"
                  />
                </div>

                <span className="text-3xl font-bold text-white/10">
                  {number}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECONDARY FEATURE */}
      <CoursesSection />

      {/* ABOUT */}
      <AboutSection />

      {/* CTA */}
      <CTASection />

      {/* FOOTER */}
      <Footer />
    </main>
  );
}

export default Home;
