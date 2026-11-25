
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
  BookOpen,
  WandSparkles,
  GraduationCap,
  Film,
  Clock3,
  History,
} from "lucide-react";

import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  const reduceMotion = useReducedMotion();

  const openTool = (path) => {
    navigate(localStorage.getItem("token") ? path : "/register");
  };

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
      <section className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-8">
        {/* Hero Content */}
        <motion.div
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300"
          >
            <Sparkles size={16} className="motion-safe:animate-pulse" />
            AI-Powered Learning Platform
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={fadeUp}
            className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl xl:text-5xl"
          >
            Learn. Code. Create.
            <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              with AI.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg"
          >
            Explore programming courses, understand code with AI,
            practice in live coding environments, and turn your study
            materials into interactive learning resources.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-wrap gap-4"
          >
            <motion.button
              type="button"
              onClick={handleStartExplainer}
              whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-4 font-semibold text-white shadow-xl shadow-purple-500/20 transition"
            >
              <WandSparkles size={19} />
              Try Code Explainer
              <ArrowRight size={19} />
            </motion.button>

            <motion.a
              href="#features"
              whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              <Play size={17} />
              Explore Features
            </motion.a>
          </motion.div>

          
        </motion.div>

        {/* AI CODE EXPLAINER PREVIEW */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            duration: 1,
            delay: 0.3,
            ease: "easeOut",
          }}
          className="relative min-w-0"
        >
          {/* Glow */}
          <div className="absolute -inset-5 rounded-3xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-2xl" />

          {/* Code Editor */}
          <motion.div
            animate={{ y: 0 }}
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
                className="text-slate-400"
              />
            </div>

            {/* Code Preview */}
            <div className="overflow-x-auto p-4 font-mono text-xs leading-6 sm:p-5 sm:text-sm">
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
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

              {/* Sample AI Explanation */}
              <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-purple-400">
                  <BrainCircuit size={19} />
                  <span className="text-sm font-semibold">
                    Sample AI Explanation
                  </span>
                </div>

                <div className="space-y-2">
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

                <div className="mt-3 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 text-xs text-blue-300">
                    <Lightbulb size={16} />
                    Output: Hello, CODEVERSE
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          
        </motion.div>
      </section>

      {/* MAIN FEATURES — implemented learning tools only */}
      <section id="features" aria-labelledby="features-heading" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold text-purple-300">YOUR LEARNING WORKSPACE</p>
          <h2 id="features-heading" className="text-3xl font-bold text-white md:text-4xl">Explore CODEVERSE Features</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">Learn programming, practice code and review your study materials in one place.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "AI Code Explainer", description: "Understand code through guided explanations and voice narration.", icon: BrainCircuit, path: "/code-explainer" },
            { title: "Interactive AI Tutor", description: "Learn through interactive lessons, quizzes and answer feedback.", icon: GraduationCap, path: "/code-explainer" },
            { title: "Visual Learning Studio", description: "Explore animated code walkthroughs and visual chapters.", icon: Film, path: "/code-explainer" },
            { title: "Code Time Machine", description: "Trace execution, variables and output across 8 programming languages.", icon: Clock3, path: "/code-time-machine" },
            { title: "Live Code Playground", description: "Write code and preview results across 9 coding environments.", icon: Code2, path: "/live-playground" },
            { title: "Learning Hub", description: "Explore published programming courses, lessons and practice exercises.", icon: BookOpen, path: "/learning-hub" },
            { title: "AI Study Packs", description: "Generate summaries, notes, flashcards and quizzes from documents, text or topics.", icon: FileCode2, path: "/study-packs" },
            { title: "AI Learning History", description: "Review previously generated AI learning sessions.", icon: History, path: "/ai/history" },
          ].map(({ title, description, icon: Icon, path }) => (
            <button key={title} type="button" onClick={() => openTool(path)} className="group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-[#11111f] p-6 text-left transition hover:border-purple-400/50 focus-visible:outline-2 focus-visible:outline-purple-400">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300"><Icon size={24} /></span>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">{description}</p>
              <span className="mt-6 flex items-center gap-2 text-sm font-medium text-purple-300">{title === "Interactive AI Tutor" || title === "Visual Learning Studio" ? "Open AI workspace" : "Explore"} <ArrowRight size={16} /></span>
            </button>
          ))}
        </div>
      </section>

      {/* HOW CODEVERSE WORKS */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-sm text-purple-400">
            <Sparkles size={16} />
            SIMPLE LEARNING PROCESS
          </div>

          <h2 className="text-3xl font-bold text-white md:text-4xl">
            How AI Code Explanation Works
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Three simple steps to understand your code
            with the AI Code Explainer.
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
