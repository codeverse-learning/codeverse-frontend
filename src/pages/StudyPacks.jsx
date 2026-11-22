import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, Layers3, LoaderCircle, RefreshCw, History } from "lucide-react";
import api from "../services/api";

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.userId || user?.id || user?.email || "guest";
  } catch {
    return "guest";
  }
}

function getLastLessonId(packId) {
  try {
    return localStorage.getItem(`codeverse:lastLesson:${getUserId()}:${packId}`);
  } catch {
    return null;
  }
}

function getLastPackId() {
  try {
    return localStorage.getItem(`codeverse:lastPack:${getUserId()}`);
  } catch {
    return null;
  }
}

function StudyPacks() {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastPackId, setLastPackId] = useState(() => getLastPackId());

  const loadPacks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/courses"); // Existing backend endpoint
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.content) ? response.data.content : [];
      setPacks(data.filter((pack) => pack.published));
      setLastPackId(getLastPackId());
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load study packs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPacks(); }, []);

  const availablePacks = packs.filter((pack) => pack.free);
  const savedPacks = availablePacks.filter((pack) => getLastLessonId(pack.id));
  const continuePack = savedPacks.find((pack) => pack.id === lastPackId) || savedPacks[0];

  return (
    <div className="min-h-screen bg-[#080812] text-white">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0c0c18] px-5 py-4 md:px-10">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
          <ArrowLeft size={18} /> Dashboard
        </button>
        <span className="font-bold tracking-wide text-purple-300">CODEVERSE</span>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-purple-400">EXPLORE & LEARN</p>
            <h1 className="text-3xl font-bold md:text-4xl">Study Packs</h1>
            <p className="mt-3 text-sm text-gray-400">Explore programming topics through structured modules and lessons.</p>
          </div>
          <button onClick={loadPacks} disabled={loading} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        {error && <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
        {!loading && continuePack && (
          <section className="mb-9 rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-300">
                  <History size={17} /> PICK UP WHERE YOU LEFT OFF
                </p>
                <h2 className="text-xl font-bold md:text-2xl">{continuePack.title}</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Return to your last opened lesson. No completion tracking required.
                </p>
              </div>
              <button
                onClick={() => navigate(`/learn/${continuePack.id}`)}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold hover:from-purple-500 hover:to-blue-500"
              >
                Continue Learning <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-400"><LoaderCircle className="animate-spin text-purple-400" /> Loading study packs...</div>
        ) : packs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#11111f] p-12 text-center">
            <BookOpen className="mx-auto mb-4 text-purple-400" size={38} />
            <h2 className="text-xl font-semibold">Study Packs Coming Soon</h2>
            <p className="mt-2 text-sm text-gray-400">No published study packs are available yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {packs.map((pack) => (
              <div key={pack.id} className="flex flex-col rounded-2xl border border-white/10 bg-[#11111f] p-6 transition hover:border-purple-500/40">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400"><BookOpen size={24} /></div>
                  <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">{pack.difficultyLevel || "All Levels"}</span>
                </div>
                <h2 className="text-xl font-semibold">{pack.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-gray-400">{pack.description || "Learn with guided programming lessons."}</p>
                <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Layers3 size={15} /> {pack.totalModules ?? 0} modules</span>
                  <span className="flex items-center gap-1"><Clock3 size={15} /> {pack.estimatedDurationHours ?? 0}h</span>
                </div>
                <button
                  disabled={!pack.free}
                  onClick={() => navigate(`/learn/${pack.id}`)}
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pack.free ? (getLastLessonId(pack.id) ? "Continue Learning" : "Start Learning") : "Unavailable"} <ArrowRight size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default StudyPacks;
