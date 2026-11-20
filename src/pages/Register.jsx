
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
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
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.65 5.94c4.46-4.13 7.13-10.2 7.13-17.59Z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" transform="translate(1 0)" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.65-5.94c-2.13 1.43-4.85 2.28-8.25 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -1)" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.51 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.14a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.14 3.08-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.28-2.6 5.22-5.08 5.5.4.35.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
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
  const [googleLoading, setGoogleLoading] = useState(false);

  // Save authentication details
  const saveLogin = (data) => {
    if (!data.token) {
      throw new Error("Authentication token not received.");
    }

    localStorage.setItem("token", data.token);

    localStorage.setItem(
      "user",
      JSON.stringify({
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      })
    );

    navigate("/dashboard", { replace: true });
  };

  // Normal registration
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

      setMessage("Account created successfully! Redirecting to login...");

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
        setError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google authentication
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setMessage("");

    const googleIdToken = credentialResponse?.credential;

    if (!googleIdToken) {
      setError("Unable to get Google authentication token.");
      return;
    }

    try {
      setGoogleLoading(true);

      const response = await api.post("/auth/google", {
        idToken: googleIdToken,
      });

      saveLogin(response.data);

    } catch (err) {
      console.error("Google registration error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response) {
        setError("Google authentication failed. Please try again.");
      } else {
        setError(err.message || "Unable to connect to the server.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google authentication failed. Please try again.");
  };

  // GitHub authentication
  const handleGithubRegister = () => {
    setError("");
    setMessage("");

    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

    if (!clientId) {
      setError("GitHub Client ID is not configured.");
      return;
    }

    const state = crypto.randomUUID();

    sessionStorage.setItem("github_oauth_state", state);

    const redirectUri = "http://localhost:5173/github/callback";

    const githubUrl = new URL(
      "https://github.com/login/oauth/authorize"
    );

    githubUrl.searchParams.set("client_id", clientId);
    githubUrl.searchParams.set("redirect_uri", redirectUri);
    githubUrl.searchParams.set("scope", "read:user user:email");
    githubUrl.searchParams.set("state", state);

    window.location.href = githubUrl.toString();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080812] px-4 py-12">

      {/* Background effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/10 bg-[#11111f]/90 p-7 shadow-2xl shadow-purple-900/10 backdrop-blur-xl sm:p-9">

          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Link to="/">
              <img
                src={logo}
                alt="CODEVERSE"
                className="h-24 w-24 object-contain"
              />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-purple-400">
              <Sparkles size={16} />
              Start your coding journey
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white">
              Create Account
            </h1>

            <p className="text-sm text-gray-400">
              Join CODEVERSE and start learning today.
            </p>
          </div>

          {/* Registration form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Full name */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
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
                  className="w-full rounded-xl border border-white/10 bg-[#19192b] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
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
                  className="w-full rounded-xl border border-white/10 bg-[#19192b] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
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
                  className="w-full rounded-xl border border-white/10 bg-[#19192b] py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
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
              <label className="mb-2 block text-sm text-gray-300">
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
                  className="w-full rounded-xl border border-white/10 bg-[#19192b] py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
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

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                {message}
              </div>
            )}

            {/* Create account button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-purple-900/20 transition-all duration-300 hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-medium text-gray-500">
              OR SIGN UP WITH
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Social authentication */}
          <div className="mx-auto flex w-full max-w-[350px] flex-col gap-3">

            {/* Google */}
            <div className="flex h-10 w-full items-center justify-center overflow-hidden rounded-md">
              {googleLoading ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-gray-700">
                  Connecting to Google...
                </div>
              ) : (
                <div className="flex h-10 w-full items-center justify-center [&>div]:!w-full [&_iframe]:!max-w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_white"
                    size="large"
                    shape="rectangular"
                    text="signup_with"
                    width="350"
                  />
                </div>
              )}
            </div>

            {/* GitHub */}
            <button
              type="button"
              onClick={handleGithubRegister}
              disabled={loading || googleLoading}
              className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-[#19192b] px-4 text-sm font-medium text-white transition hover:bg-[#222238] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GithubIcon />
              Continue with GitHub
            </button>

          </div>

          {/* Login link */}
          <p className="mt-7 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-purple-400 hover:text-purple-300"
            >
              Login
            </Link>
          </p>

          {/* Home link */}
          <div className="mt-5 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 transition hover:text-white"
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
