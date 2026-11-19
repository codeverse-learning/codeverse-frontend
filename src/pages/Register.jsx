
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

import api from "../services/api";
import logo from "../assets/codeverse-logo.png";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.65 5.94c4.46-4.13 7.13-10.2 7.13-17.59Z"/>
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" transform="translate(1 0)"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.65-5.94c-2.13 1.43-4.85 2.28-8.25 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -1)"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.51 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.14a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.14 3.08-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.28-2.6 5.22-5.08 5.5.4.35.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/>
    </svg>
  );
}

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
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

    try {
      setLoading(true);

      await api.post("/auth/register", {
        fullName: name.trim(),
        email: email.trim(),
        password,
      });

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setError("Please check your registration details.");
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    setError("");
    setMessage(
      `${provider} authentication will be connected soon.`
    );
  };

  return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-[#11111f]/90 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-purple-900/10 backdrop-blur-xl">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/">
              <img
                src={logo}
                alt="CODEVERSE"
                className="w-24 h-24 object-contain"
              />
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-purple-400 text-sm font-medium mb-3">
              <Sparkles size={16} />
              Start your coding journey
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h1>

            <p className="text-gray-400 text-sm">
              Join CODEVERSE and start learning today.
            </p>
          </div>

          {/* Registration form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Full name */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Full Name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#19192b] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[#19192b] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full bg-[#19192b] border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-[#19192b] border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            {/* Success message */}
            {message && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl p-3">
                {message}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20"
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Social authentication */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">
              OR SIGN UP WITH
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialRegister("Google")}
              className="flex items-center justify-center gap-2 bg-[#19192b] border border-white/10 hover:border-purple-500/50 text-gray-200 py-3 rounded-xl transition"
            >
              <GoogleIcon />
              <span className="text-sm">Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialRegister("GitHub")}
              className="flex items-center justify-center gap-2 bg-[#19192b] border border-white/10 hover:border-purple-500/50 text-gray-200 py-3 rounded-xl transition"
            >
              <GithubIcon />
              <span className="text-sm">GitHub</span>
            </button>
          </div>

          {/* Login link */}
          <p className="text-center text-gray-400 text-sm mt-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              Login
            </Link>
          </p>

          {/* Home link */}
          <div className="text-center mt-5">
            <Link
              to="/"
              className="text-gray-500 hover:text-white text-sm transition"
            >
              ← Back to Home
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default Register;
