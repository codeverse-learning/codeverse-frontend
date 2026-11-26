import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import {
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
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.1c-3.19.69-3.86-1.35-3.86-1.35-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.52-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.18a10.9 10.9 0 0 1 5.71 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.08 0 4.42-2.68 5.39-5.24 5.68.41.35.77 1.04.77 2.1v3.12c0 .3.21.66.79.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
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

// Validate Google authentication nonce
function isValidGoogleNonce(nonce) {
  return (
    typeof nonce === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(nonce)
  );
}

// Share an active nonce request to avoid duplicate requests
// during React StrictMode development rendering
let pendingGoogleNonceRequest = null;

function requestGoogleNonce() {
  if (!pendingGoogleNonceRequest) {
    const startedAt = Date.now();

    pendingGoogleNonceRequest = api
      .post(
        "/auth/google/nonce",
        {},
        {
          withCredentials: true,
          timeout: 10000,
        }
      )
      .then((response) => {
        const nonce = response.data?.nonce;

        if (!isValidGoogleNonce(nonce)) {
          throw new Error(
            "Invalid Google authentication challenge."
          );
        }

        return {
          nonce,
          expiresAt: startedAt + 4 * 60 * 1000,
        };
      })
      .finally(() => {
        pendingGoogleNonceRequest = null;
      });
  }

  return pendingGoogleNonceRequest;
}

function Login() {
  const navigate = useNavigate();

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Authentication states
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  // Google authentication challenge
  const [googleNonce, setGoogleNonce] = useState("");
  const [googleNonceLoading, setGoogleNonceLoading] =
    useState(true);
  const [googleNonceError, setGoogleNonceError] =
    useState("");
  const [googleNonceVersion, setGoogleNonceVersion] =
    useState(0);

  // Authentication references
  const googleNonceExpiresAt = useRef(0);
  const googleRequestInProgress = useRef(false);
  const authenticationInProgress = useRef(false);

  // Prevent simultaneous authentication requests
  const isBusy =
    loading || googleLoading || githubLoading;

  // Request a secure Google authentication challenge
  useEffect(() => {
    let active = true;

    const loadGoogleNonce = async () => {
      setGoogleNonce("");
      setGoogleNonceError("");
      setGoogleNonceLoading(true);

      googleNonceExpiresAt.current = 0;

      try {
        const challenge = await requestGoogleNonce();

        if (!active) return;

        googleNonceExpiresAt.current =
          challenge.expiresAt;

        setGoogleNonce(challenge.nonce);

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
    };

  }, [googleNonceVersion]);

  // Request a fresh Google challenge
  const refreshGoogleNonce = () => {
    if (
      authenticationInProgress.current ||
      googleRequestInProgress.current
    ) {
      return;
    }

    googleNonceExpiresAt.current = 0;

    setError("");
    setGoogleNonce("");
    setGoogleNonceError("");
    setGoogleNonceLoading(true);

    setGoogleNonceVersion(
      (previous) => previous + 1
    );
  };

  // Save authentication details
  const saveLogin = (data) => {
    if (
      typeof data?.token !== "string" ||
      !data.token.trim() ||
      !data.userId
    ) {
      throw new Error(
        "Invalid authentication response."
      );
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

  // Email and password login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (
      isBusy ||
      authenticationInProgress.current
    ) {
      return;
    }

    setError("");
    setMessage("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    // BCrypt password byte-length validation
    const passwordBytes =
      new TextEncoder().encode(password).length;

    if (passwordBytes > 72) {
      setError("Invalid email or password.");
      return;
    }

    authenticationInProgress.current = true;

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/login",
        {
          email: normalizedEmail,
          password,
        }
      );

      saveLogin(response.data);

    } catch (err) {
      const status = err.response?.status;

      if (
        status === 400 ||
        status === 401 ||
        status === 403
      ) {
        setError("Invalid email or password.");
      } else if (status === 429) {
        setError(
          "Too many login attempts. Please try again later."
        );
      } else {
        setError(
          "Unable to log in. Please try again."
        );
      }

    } finally {
      authenticationInProgress.current = false;
      setLoading(false);
    }
  };

  // Google authentication with nonce verification
  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    if (
      isBusy ||
      authenticationInProgress.current ||
      googleRequestInProgress.current
    ) {
      return;
    }

    setError("");
    setMessage("");

    const googleIdToken =
      credentialResponse?.credential;

    // Capture the current nonce before clearing it
    const currentNonce = googleNonce;

    // Validate Google ID token
    if (
      typeof googleIdToken !== "string" ||
      !googleIdToken.trim() ||
      googleIdToken.length > 16384
    ) {
      googleNonceExpiresAt.current = 0;
      setGoogleNonce("");

      setError(
        "Unable to get a valid Google authentication token."
      );

      setGoogleNonceError(
        "Please retry Google authentication."
      );

      return;
    }

    // Validate nonce and expiration time
    if (
      !isValidGoogleNonce(currentNonce) ||
      Date.now() >= googleNonceExpiresAt.current
    ) {
      googleNonceExpiresAt.current = 0;
      setGoogleNonce("");

      setGoogleNonceError(
        "Your Google authentication session has expired. Please retry."
      );

      return;
    }

    authenticationInProgress.current = true;
    googleRequestInProgress.current = true;

    setGoogleLoading(true);

    // Prevent reuse of the current challenge
    setGoogleNonce("");
    googleNonceExpiresAt.current = 0;

    let loginSuccessful = false;

    try {
      // Send Google ID token, nonce and session cookie
      const response = await api.post(
        "/auth/google",
        {
          idToken: googleIdToken,
          nonce: currentNonce,
        },
        {
          withCredentials: true,
          timeout: 30000,
        }
      );

      saveLogin(response.data);

      loginSuccessful = true;

    } catch (err) {
      const status = err.response?.status;

      if (status === 429) {
        setError(
          "Too many authentication attempts. Please try again later."
        );
      } else {
        setError(
          "Google login failed. Please try again or use your existing login method."
        );
      }

    } finally {
      googleRequestInProgress.current = false;
      authenticationInProgress.current = false;

      setGoogleLoading(false);

      if (!loginSuccessful) {
        setGoogleNonceError(
          "Please retry to start a new secure Google login session."
        );
      }
    }
  };

  // Handle Google authentication errors
  const handleGoogleError = () => {
    if (
      authenticationInProgress.current ||
      googleRequestInProgress.current
    ) {
      return;
    }

    googleNonceExpiresAt.current = 0;

    setGoogleNonce("");

    setError(
      "Google authentication failed. Please try again."
    );

    setGoogleNonceError(
      "Please retry Google authentication."
    );
  };

  // GitHub authentication with PKCE
  const handleSocialLogin = async (provider) => {
    if (
      isBusy ||
      authenticationInProgress.current
    ) {
      return;
    }

    setError("");
    setMessage("");

    if (provider === "GitHub") {
      const clientId =
        import.meta.env.VITE_GITHUB_CLIENT_ID;

      if (!clientId) {
        setError(
          "GitHub Client ID is not configured."
        );
        return;
      }

      authenticationInProgress.current = true;

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
        sessionStorage.setItem(
          "github_oauth_state",
          state
        );

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

        githubUrl.searchParams.set(
          "client_id",
          clientId
        );

        githubUrl.searchParams.set(
          "redirect_uri",
          redirectUri
        );

        githubUrl.searchParams.set(
          "scope",
          "read:user user:email"
        );

        githubUrl.searchParams.set(
          "state",
          state
        );

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
          sessionStorage.removeItem(
            "github_oauth_state"
          );

          sessionStorage.removeItem(
            "github_oauth_started"
          );

          sessionStorage.removeItem(
            "github_oauth_code_verifier"
          );

        } catch {
          // Browser storage may be unavailable
        }

        authenticationInProgress.current = false;

        setGithubLoading(false);

        setError(
          "Unable to start GitHub authentication."
        );
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080812] px-4 py-12">

      {/* Background */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[130px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[130px]" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#11111f]/90 p-7 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:p-9"
      >

        {/* Logo */}
        <div className="mb-7 flex justify-center">
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
            Welcome Back
          </div>

          <h1 className="text-3xl font-bold text-white">
            Login to CODEVERSE
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Continue your programming journey and unlock your potential.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="username"
                maxLength={254}
                required
                disabled={isBusy}
                className="w-full rounded-xl border border-white/10 bg-[#080812] py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  setMessage(
                    "Forgot password feature will be added later."
                  )
                }
                className="text-xs text-purple-400 transition hover:text-purple-300"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                id="login-password"
                name="password"
                type={
                  showPassword ? "text" : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isBusy}
                className="w-full rounded-xl border border-white/10 bg-[#080812] py-3 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10"
              />

              <button
                type="button"
                disabled={isBusy}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {/* Message */}
          {message && (
            <p
              role="status"
              className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm leading-6 text-purple-300"
            >
              {message}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isBusy}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}

            {!loading && (
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />

          <span className="text-xs font-medium text-slate-500">
            OR CONTINUE WITH
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Social Login Buttons */}
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
                    ? "Preparing secure login..."
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
                  type="standard"
                  shape="rectangular"
                  text="continue_with"
                  width="350"
                />

              </div>

            )}

            {googleNonceError && !isBusy && (
              <p
                role="alert"
                className="text-center text-xs text-slate-400"
              >
                {googleNonceError}
              </p>
            )}

          </div>

          {/* GitHub Authentication */}
          <button
            type="button"
            onClick={() =>
              handleSocialLogin("GitHub")
            }
            disabled={isBusy}
            className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-[#19192b] px-4 text-sm font-medium text-white transition hover:bg-[#222238] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GithubIcon />

            {githubLoading
              ? "Connecting to GitHub..."
              : "Continue with GitHub"}
          </button>

        </div>

        {/* Register Link */}
        <p className="mt-7 text-center text-sm text-slate-400">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="font-semibold text-purple-400 transition hover:text-purple-300"
          >
            Create Account
          </Link>
        </p>

        {/* Back to Home */}
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

export default Login;
