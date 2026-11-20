
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function GithubCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    hasProcessed.current = true;

    const handleGithubCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const code = params.get("code");
        const returnedState = params.get("state");
        const savedState = sessionStorage.getItem("github_oauth_state");

        if (!code) {
          throw new Error("GitHub authorization code not found.");
        }

        if (!returnedState || !savedState || returnedState !== savedState) {
          throw new Error("Invalid GitHub authentication state.");
        }

        sessionStorage.removeItem("github_oauth_state");

        const response = await api.post("/auth/github", { code });
        const data = response.data;

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

      } catch (err) {
        console.error("GitHub authentication error:", err);

        sessionStorage.removeItem("github_oauth_state");

        setError(
          err.response?.data?.message ||
          err.message ||
          "GitHub authentication failed."
        );
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

            <p className="mb-6 text-sm text-gray-300">
              {error}
            </p>

            <button
              onClick={() => navigate("/login", { replace: true })}
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

            <p className="mt-2 text-sm text-gray-400">
              Please wait while we authenticate your account...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default GithubCallback;
