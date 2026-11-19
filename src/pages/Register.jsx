
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import logo from "../assets/codeverse-logo.png";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 0 1 24 36a12 12 0 1 1 8.3-20.7l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 32.3 15.3l5.7-5.7A20 20 0 0 0 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.3l-6.2-5.2A12 12 0 0 1 12.9 29l-6.5 5A20 20 0 0 0 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-3.9 5.5l6.2 5.2A20 20 0 0 0 44 24c0-1.2-.1-2.3-.4-3.5Z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.1c-3.19.69-3.86-1.35-3.86-1.35-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.52-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.18a10.9 10.9 0 0 1 5.71 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.08 0 4.42-2.68 5.39-5.24 5.68.41.35.77 1.04.77 2.1v3.12c0 .3.21.66.79.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setMessage(
      "Registration UI is ready! Backend account creation will be connected later."
    );
  };

  const handleSocialRegister = (provider) => {
    setError("");
    setMessage(
      `${provider} authentication will be connected with the CODEVERSE backend soon.`
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080812] px-4 py-10">
      {/* Background */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[130px]" />

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#11111f]/90 p-7 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:p-9"
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Link to="/">
            <img
              src={logo}
              alt="CODEVERSE Logo"
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300">
            <Sparkles size={14} />
            Start Your Coding Journey
          </div>

          <h1 className="text-3xl font-bold text-white">
            Create Your Account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Join CODEVERSE and start learning programming interactively.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="mt-7 space-y-4">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Full Name
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-white/10 bg-[#080812] py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#080812] py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 8 characters)"
                className="w-full rounded-xl border border-white/10 bg-[#080812] py-3 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Confirm Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full rounded-xl border border-white/10 bg-[#080812] py-3 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Message */}
          {message && (
            <p className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm leading-6 text-purple-300">
              {message}
            </p>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:shadow-purple-500/30"
          >
            Create Account
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium text-slate-500">
            OR SIGN UP WITH
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Social Registration */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialRegister("Google")}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 font-medium text-gray-800 transition hover:bg-gray-100"
          >
            <GoogleIcon />
            Sign up with Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialRegister("GitHub")}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#19192b] px-4 py-3 font-medium text-white transition hover:bg-[#222238]"
          >
            <GithubIcon />
            Sign up with GitHub
          </button>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-purple-400 transition hover:text-purple-300"
          >
            Login
          </Link>
        </p>

        <Link
          to="/"
          className="mt-5 block text-center text-xs text-slate-500 transition hover:text-slate-300"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}

export default Register;
