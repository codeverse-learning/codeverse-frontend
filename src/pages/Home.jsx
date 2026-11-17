
import {
  ArrowRight,
  Play,
  Sparkles,
  Terminal,
  Code2,
  BrainCircuit,
} from "lucide-react";

import { motion } from "framer-motion";

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
  return (
    <main
      id="home"
      className="relative min-h-screen overflow-hidden pt-16"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="pointer-events-none absolute left-1/2 top-[500px] h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/[0.06] blur-[120px]" />

      {/* Hero Section */}
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
            AI-Powered Programming Learning
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="max-w-2xl text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Learn to Code.

            <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Build the Future.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg"
          >
            Master programming with interactive lessons, real-time code
            execution, visual learning and your personal AI coding tutor.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap gap-4"
          >
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-4 font-semibold text-white shadow-xl shadow-purple-500/20 transition"
            >
              Start Learning
              <ArrowRight size={19} />
            </motion.a>

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
              <h3 className="text-2xl font-bold text-white">AI</h3>
              <p className="mt-1 text-sm text-slate-500">
                Personal Tutor
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">Live</h3>
              <p className="mt-1 text-sm text-slate-500">
                Code Execution
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">Visual</h3>
              <p className="mt-1 text-sm text-slate-500">
                Learning Experience
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Code Editor Preview */}
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

          {/* Editor */}
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
                main.py
              </div>

              <Terminal size={18} className="text-slate-500" />
            </div>

            {/* Code */}
            <div className="overflow-x-auto p-6 font-mono text-xs leading-8 sm:p-8 sm:text-sm">
              <div>
                <span className="text-purple-400">def</span>{" "}
                <span className="text-blue-300">learn_programming</span>():
              </div>

              <div className="pl-6">
                <span className="text-purple-400">name</span> ={" "}
                <span className="text-green-300">
                  "Future Developer"
                </span>
              </div>

              <div className="pl-6">
                <span className="text-purple-400">skills</span> = [
                <span className="text-green-300">"Python"</span>,{" "}
                <span className="text-green-300">"JavaScript"</span>]
              </div>

              <div className="pl-6 text-slate-400">
                # Your journey starts here
              </div>

              <div className="pl-6">
                <span className="text-blue-300">print</span>(
                <span className="text-green-300">"Hello, "</span> + name)
              </div>

              {/* Output */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  OUTPUT
                </div>

                <p className="text-green-300">
                  Hello, Future Developer
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Process finished successfully
                </p>
              </div>
            </div>
          </motion.div>

          {/* AI Assistant Floating Card */}
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
                AI Assistant
              </p>

              <p className="text-xs text-slate-400">
                Ready to help you
              </p>
            </div>

            <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-green-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Other Sections */}
      <FeaturesSection />
      <CoursesSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </main>
  );
}

export default Home;
