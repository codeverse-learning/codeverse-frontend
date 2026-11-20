
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/me");

        if (!active) return;

        setUser(response.data);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );
      } catch (err) {
        if (!active) return;

        if ([401, 403].includes(err.response?.status)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        setError("Unable to load your profile.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080812] flex items-center justify-center text-purple-300">
        Loading CODEVERSE Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080812] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-purple-600 px-5 py-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  const role = String(user.role || "")
    .replace(/^ROLE_/i, "")
    .toUpperCase();

  if (role === "ADMIN") {
    return <AdminDashboard user={user} />;
  }

  return <StudentDashboard user={user} />;
}

export default Dashboard;
