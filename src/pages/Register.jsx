import { useState, useEffect, useRef } from "react";
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

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.68.08-.7 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.51 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.14a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.14 3.08-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.28-2.6 5.24-5.08 5.51.4.35.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
    </svg>
  );
}

// Convert bytes to Base64URL format
function base64UrlEncode(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Generate cryptographically secure PKCE code verifier
function generateCodeVerifier() {
  const randomBytes = new Uint8Array(32);

  crypto.getRandomValues(randomBytes);

  return base64UrlEncode(randomBytes);
}

// Generate SHA-256 PKCE code challenge
async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();

  const data = encoder.encode(codeVerifier);

  const digest = await crypto.subtle.digest("SHA-256", data);

  return base64UrlEncode(new Uint8Array(digest));
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
  const [githubLoading, setGithubLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Google authentication challenge
  const [googleNonce, setGoogleNonce] = useState("");
  const [googleNonceLoading, setGoogleNonceLoading] = useState(true);
  const [googleNonceError, setGoogleNonceError] = useState("");
  const [googleNonceVersion, setGoogleNonceVersion] = useState(0);

  const googleNonceExpiresAt = useRef(0);
  const googleRequestInProgress = useRef(false);

  // Registration redirect timer
  const registrationTimer = useRef(null);

  // Prevent simultaneous authentication requests
  const isBusy =
    loading ||
    googleLoading ||
    githubLoading ||
    registrationComplete;

  // Clean up registration redirect timer
  useEffect(() => {
    return () => {
      if (registrationTimer.current !== null) {
        clearTimeout(registrationTimer.current);
      }
    };
  }, []);

  // Request a secure Google authentication challenge
  useEffect(() => {
    let active = true;

    const controller = new AbortController();

    const loadGoogleNonce = async () => {
      setGoogleNonce("");
      setGoogleNonceError("");
      setGoogleNonceLoading(true);

      googleNonceExpiresAt.current = 0;

      const startedAt = Date.now();

      try {
        const response = await api.post(
          "/auth/google/nonce",
          {},
          {
            withCredentials: true,
            signal: controller.signal,
            timeout: 10000,
          }
        );

        const nonce = response.data?.nonce;

        if (
          typeof nonce !== "string" ||
          !/^[A-Za-z0-9_-]{43}$/.test(nonce)
        ) {
          throw new Error(
            "Invalid Google authentication challenge."
          );
        }

        if (!active) return;

        // Use a shorter client-side validity period
        googleNonceExpiresAt.current =
          startedAt + 4 * 60 * 1000;

        setGoogleNonce(nonce);

      } catch (err) {
        if (!active) return;

        if (err.response?.status === 429) {
          setGoogleNonceError(
            "Too many attempts. Please try again later."
          );
        } else {
          setGoogleNonceError(
            "Unable to initialize Google authentication."
          );
        }

      } finally {
        if (active) {
          setGoogleNonceLoading(false);
        }
      }
    };

    loadGoogleNonce();

    return () => {
      active = false;
      controller.abort();
    };

  }, [googleNonceVersion]);

  // Request a fresh Google challenge
  const refreshGoogleNonce = () => {
    googleNonceExpiresAt.current = 0;

    setGoogleNonce("");
    setGoogleNonceError("");
    setGoogleNonceLoading(true);

    setGoogleNonceVersion((previous) => previous + 1);
  };

  // Save authentication details
  const saveLogin = (data) => {
    if (
      typeof data?.token !== "string" ||
      !data.token.trim() ||
      !data.userId
    ) {
      throw new Error("Invalid authentication response.");
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

    if (isBusy || googleRequestInProgress.current) return;

    setError("");
    setMessage("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // Full name validation
    if (
      normalizedName.length < 2 ||
      normalizedName.length > 100
    ) {
      setError(
        "Full name must contain between 2 and 100 characters."
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      normalizedEmail.length > 254 ||
      !emailRegex.test(normalizedEmail)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    // Minimum password length
    if (password.length < 15) {
      setError(
        "Password must contain at least 15 characters."
      );
      return;
    }

    // BCrypt password byte-length validation
    const passwordBytes =
      new TextEncoder().encode(password).length;

    if (passwordBytes > 72) {
      setError("Password must not exceed 72 UTF-8 bytes.");
      return;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        fullName: normalizedName,
        email: normalizedEmail,
        password,
      });

      setRegistrationComplete(true);

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      registrationTimer.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);

    } catch (err) {
      const status = err.response?.status;

      if (status === 429) {
        setError(
          "Too many registration attempts. Please try again later."
        );
      } else if (status === 400 || status === 409) {
        setError(
          "Unable to create an account. Please check your details or use your existing login method."
        );
      } else {
        setError(
          "Registration failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // Google authentication with secure nonce
  const handleGoogleSuccess = async (credentialResponse) => {
    if (isBusy || googleRequestInProgress.current) return;

    setError("");
    setMessage("");

    const googleIdToken = credentialResponse?.credential;
    const nonce = googleNonce;

    // Validate Google ID token
    if (
      typeof googleIdToken !== "string" ||
      !googleIdToken ||
      googleIdToken.length > 16384
    ) {
      setError(
        "Unable to get a valid Google authentication token."
      );

      refreshGoogleNonce();
      return;
    }

    // Validate authentication challenge
    if (
      !nonce ||
      !/^[A-Za-z0-9_-]{43}$/.test(nonce) ||
      Date.now() >= googleNonceExpiresAt.current
    ) {
      setError(
        "Google authentication session expired. Please try again."
      );

      refreshGoogleNonce();
      return;
    }

    googleRequestInProgress.current = true;

    let loginSuccessful = false;

    try {
      setGoogleLoading(true);

      // Prevent reuse of the current frontend challenge
      setGoogleNonce("");
      googleNonceExpiresAt.current = 0;

      const response = await api.post(
        "/auth/google",
        {
          idToken: googleIdToken,
          nonce,
        },
        {
          withCredentials: true,
          timeout: 30000,
        }
      );

      saveLogin(response.data);

      loginSuccessful = true;

    } catch (err) {
      if (err.response?.status === 429) {
        setError(
          "Too many authentication attempts. Please try again later."
        );
      } else {
        setError(
          "Google authentication failed. Please try again or use your existing login method."
        );
      }

    } finally {
      googleRequestInProgress.current = false;

      setGoogleLoading(false);

      if (!loginSuccessful) {
        // Require an explicit retry with a fresh challenge
        setGoogleNonceError(
          "A new Google authentication session is required."
        );
      }
    }
  };

  // Handle Google authentication failure
  const handleGoogleError = () => {
    if (isBusy || googleRequestInProgress.current) return;

    setError(
      "Google authentication failed. Please try again."
    );

    googleNonceExpiresAt.current = 0;

    setGoogleNonce("");

    setGoogleNonceError(
      "A new Google authentication session is required."
    );
  };

  // GitHub authentication with PKCE
  const handleGithubRegister = async () => {
    if (isBusy || googleRequestInProgress.current) return;

    setError("");
    setMessage("");

    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

    if (!clientId) {
      setError("GitHub Client ID is not configured.");
      return;
    }

    try {
      setGithubLoading(true);

      // Web Crypto requires a secure browser context
      if (
        !window.isSecureContext ||
        !window.crypto?.subtle ||
        !window.crypto?.getRandomValues ||
        !window.crypto?.randomUUID
      ) {
        throw new Error(
          "Secure authentication is unavailable."
        );
      }

      // Environment-based callback URL
      const redirectUri =
        import.meta.env.VITE_GITHUB_REDIRECT_URI ||
        `${window.location.origin}/github/callback`;

      const callbackUrl = new URL(redirectUri);

      // Validate callback configuration
      if (
        callbackUrl.origin !== window.location.origin ||
        callbackUrl.pathname !== "/github/callback" ||
        callbackUrl.search ||
        callbackUrl.hash ||
        callbackUrl.username ||
        callbackUrl.password
      ) {
        throw new Error(
          "Invalid GitHub callback configuration."
        );
      }

      // Secure random OAuth state
      const state = crypto.randomUUID();

      // Generate PKCE verifier and challenge
      const codeVerifier = generateCodeVerifier();

      const codeChallenge =
        await generateCodeChallenge(codeVerifier);

      // Save OAuth state and creation time
      sessionStorage.setItem("github_oauth_state", state);

      sessionStorage.setItem(
        "github_oauth_started",
        String(Date.now())
      );

      // Temporarily save PKCE code verifier
      sessionStorage.setItem(
        "github_oauth_code_verifier",
        codeVerifier
      );

      // GitHub authorization URL
      const githubUrl = new URL(
        "https://github.com/login/oauth/authorize"
      );

      githubUrl.searchParams.set("client_id", clientId);
      githubUrl.searchParams.set("redirect_uri", redirectUri);
      githubUrl.searchParams.set("scope", "read:user user:email");
      githubUrl.searchParams.set("state", state);

      // PKCE authorization parameters
      githubUrl.searchParams.set(
        "code_challenge",
        codeChallenge
      );

      githubUrl.searchParams.set(
        "code_challenge_method",
        "S256"
      );

      // Redirect to GitHub
      window.location.href = githubUrl.toString();

    } catch {
      // Clear temporary OAuth data
      try {
        sessionStorage.removeItem("github_oauth_state");
        sessionStorage.removeItem("github_oauth_started");
        sessionStorage.removeItem(
          "github_oauth_code_verifier"
        );
      } catch {
        // Browser storage may be unavailable
      }

      setGithubLoading(false);

      setError(
        "Unable to start GitHub authentication."
      );
    }
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
              <label
                htmlFor="register-name"
                className="mb-2 block text-sm text-gray-300"
              >
                Full Name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="register-name"
                  name="fullName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                  disabled={isBusy}
                  className="w-full rounded-xl border border-white/10 bg-[#19192b] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="mb-2 block text-sm text-gray-300"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  disabled={isBusy}
                  className="w-full rounded-xl border border-white/10 bg-[#19192b] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-2 block text-sm text-gray-300"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  minLength={15}
                  aria-describedby="password-requirements"
                  required
                  disabled={isBusy}
                  className="w-full rounded-xl border border-white/10 bg-[#19192b] py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
                />

                <button
                  type="button"
                  disabled={isBusy}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {/* Password requirements */}
              <p
                id="password-requirements"
                className="mt-2 text-xs leading-5 text-gray-400"
              >
                Use at least 15 characters and no more than 72 UTF-8 bytes.
                A long, unique passphrase is recommended.
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="mb-2 block text-sm text-gray-300"
              >
                Confirm Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  disabled={isBusy}
                  className="w-full rounded-xl border border-white/10 bg-[#19192b] py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
                />

                <button
                  type="button"
                  disabled={isBusy}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmed password"
                      : "Show confirmed password"
                  }
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
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div
                role="status"
                className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400"
              >
                {message}
              </div>
            )}

            {/* Create account button */}
            <button
              type="submit"
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-purple-900/20 transition-all duration-300 hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {registrationComplete
                ? "Account Created"
                : loading
                  ? "Creating Account..."
                  : "Create Account"}

              {!loading && !registrationComplete && (
                <ArrowRight size={18} />
              )}
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

            {/* Google Authentication */}
            <div className="flex w-full flex-col gap-2">

              {isBusy || googleNonceLoading ? (

                <div
                  role="status"
                  className="flex h-10 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-gray-700"
                >
                  {googleLoading
                    ? "Connecting to Google..."
                    : googleNonceLoading
                      ? "Preparing secure signup..."
                      : "Please wait..."}
                </div>

              ) : googleNonceError || !googleNonce ? (

                <button
                  type="button"
                  onClick={refreshGoogleNonce}
                  disabled={isBusy}
                  className="flex h-10 w-full items-center justify-center rounded-md border border-white/10 bg-[#19192b] px-4 text-sm font-medium text-white transition hover:bg-[#222238] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Retry Google Authentication
                </button>

              ) : (

                <div className="flex h-10 w-full items-center justify-center overflow-hidden rounded-md [&>div]:!w-full [&_iframe]:!max-w-full">

                  <GoogleLogin
                    key={googleNonce}
                    nonce={googleNonce}
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

              {googleNonceError && !isBusy && (
                <p
                  role="alert"
                  className="text-center text-xs text-gray-400"
                >
                  {googleNonceError}
                </p>
              )}

            </div>

            {/* GitHub */}
            <button
              type="button"
              onClick={handleGithubRegister}
              disabled={isBusy}
              className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-[#19192b] px-4 text-sm font-medium text-white transition hover:bg-[#222238] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GithubIcon />

              {githubLoading
                ? "Connecting to GitHub..."
                : "Continue with GitHub"}
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