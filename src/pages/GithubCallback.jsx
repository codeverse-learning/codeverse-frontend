import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Clear temporary GitHub OAuth data
function clearGithubOAuthData() {
  sessionStorage.removeItem("github_oauth_state");
  sessionStorage.removeItem("github_oauth_started");
  sessionStorage.removeItem("github_oauth_code_verifier");
}

function GithubCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    hasProcessed.current = true;

    const handleGithubCallback = async () => {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");
        const returnedState = params.get("state");

        // Remove sensitive OAuth parameters from URL
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname
        );

        const savedState = sessionStorage.getItem(
          "github_oauth_state"
        );

        const started = Number(
          sessionStorage.getItem("github_oauth_started")
        );

        // Retrieve original PKCE code verifier
        const codeVerifier = sessionStorage.getItem(
          "github_oauth_code_verifier"
        );

        // Remove temporary OAuth data after reading
        clearGithubOAuthData();

        // Validate OAuth state
        if (
          !returnedState ||
          !savedState ||
          returnedState !== savedState ||
          params.getAll("state").length !== 1
        ) {
          setError("Invalid GitHub authentication state.");
          return;
        }

        // Validate OAuth state expiration (10 minutes)
        const age = Date.now() - started;

        if (
          !started ||
          !Number.isFinite(age) ||
          age < 0 ||
          age > 600000
        ) {
          setError("GitHub login expired. Please try again.");
          return;
        }

        // Validate authorization code
        if (
          !code ||
          !code.trim() ||
          code.length > 2048 ||
          params.getAll("code").length !== 1 ||
          params.has("error")
        ) {
          setError(
            "GitHub authorization failed or was cancelled."
          );
          return;
        }

        // Validate PKCE code verifier
        if (
          !codeVerifier ||
          codeVerifier.length < 43 ||
          codeVerifier.length > 128 ||
          !/^[A-Za-z0-9._~-]+$/.test(codeVerifier)
        ) {
          setError(
            "Invalid GitHub security verification. Please try again."
          );
          return;
        }

        // Exchange authorization code with PKCE verifier
        const response = await api.post(
          "/auth/github",
          {
            code,
            codeVerifier,
          }
        );

        const data = response.data;

        // Validate authentication response
        if (
          typeof data?.token !== "string" ||
          !data.token.trim() ||
          !data.userId
        ) {
          setError("Invalid authentication response.");
          return;
        }

        // Save authentication details
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

      } catch (err) {

        // Clear temporary OAuth data
        try {
          clearGithubOAuthData();
        } catch {
          // Browser storage may be unavailable
        }

        // Use safe authentication error messages
        if (err.response?.status === 429) {
          setError(
            "Too many authentication attempts. Please try again later."
          );
        } else {
          setError(
            "GitHub authentication failed. Please try again or use your existing login method."
          );
        }
      }
    };

    handleGithubCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f1b] px-4">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#19192b] p-8 text-center">

        {error ? (
          <>
            <h2 className="mb-3 text-xl font-bold text-red-400">
              GitHub Login Failed
            </h2>

            <p
              role="alert"
              className="mb-6 text-sm text-gray-300"
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/login", { replace: true })
              }
              className="rounded-xl bg-[#F2C94C] px-6 py-3 font-semibold text-black transition hover:bg-yellow-400"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#F2C94C]" />

            <h2 className="text-xl font-bold text-white">
              Signing in with GitHub
            </h2>

            <p
              role="status"
              className="mt-2 text-sm text-gray-400"
            >
              Please wait while we authenticate your account...
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default GithubCallback;