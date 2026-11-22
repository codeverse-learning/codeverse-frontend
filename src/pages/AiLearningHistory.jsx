
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../services/api";

import {
  ArrowLeft,
  History,
  Search,
  Code2,
  BookOpen,
  Film,
  GraduationCap,
  Trash2,
  Eye,
  X,
  CalendarDays,
  LoaderCircle,
  RefreshCw,
  AlertCircle,
  Clipboard,
  Check,
} from "lucide-react";

const FILTERS = [
  { value: "ALL", label: "All History" },
  { value: "EXPLANATION", label: "Code Explanation" },
  { value: "INTERACTIVE_LESSON", label: "Interactive Tutor" },
  { value: "VISUAL_LESSON", label: "Visual Learning" },
];

const MODE_LABELS = {
  EXPLANATION: "Code Explanation",
  INTERACTIVE_LESSON: "Interactive Tutor",
  VISUAL_LESSON: "Visual Learning",
};

function formatDate(date) {
  if (!date) return "Unknown date";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "Unknown date"
    : parsed.toLocaleString();
}

function parseResult(value) {
  try {
    return typeof value === "string"
      ? JSON.parse(value)
      : value;
  } catch {
    return value;
  }
}

function AiLearningHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [selectedHistory, setSelectedHistory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchHistory = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/ai/history");

      setHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("History loading failed:", err);

      if ([401, 403].includes(err.response?.status)) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else {
        setError(
          "Unable to load learning history. Check your backend connection."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesFilter =
      filter === "ALL" || item.learningMode === filter;

    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      (item.title || "").toLowerCase().includes(query) ||
      (item.language || "").toLowerCase().includes(query) ||
      (item.code || "").toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this learning history?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      await api.delete(`/ai/history/${id}`);

      setHistory((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }
    } catch (err) {
      console.error("History deletion failed:", err);

      setError("Unable to delete this history record.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (deletingAll || deletingId || history.length === 0) return;

    const confirmed = window.confirm(
      `Permanently delete all ${history.length} saved learning sessions? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingAll(true);
    setError("");

    const failedIds = [];
    const deletedIds = [];

    // Reuse the existing authenticated, user-scoped DELETE endpoint.
    for (const item of history) {
      try {
        await api.delete(`/ai/history/${item.id}`);
        deletedIds.push(item.id);
      } catch (err) {
        console.error(`Failed to delete history ${item.id}:`, err);
        failedIds.push(item.id);
      }
    }

    setHistory((previous) =>
      previous.filter((item) => !deletedIds.includes(item.id))
    );
    if (selectedHistory && deletedIds.includes(selectedHistory.id)) {
      setSelectedHistory(null);
    }
    if (failedIds.length > 0) {
      setError(
        `${deletedIds.length} session(s) deleted. ${failedIds.length} could not be deleted. Please try again.`
      );
    }
    setDeletingAll(false);
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code || "");
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy code.");
    }
  };

  const renderResult = (item) => {
    const result = parseResult(item.result);

    if (item.learningMode === "EXPLANATION") {
      return (
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>
            {typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2)}
          </ReactMarkdown>
        </div>
      );
    }

    if (
      item.learningMode === "INTERACTIVE_LESSON" &&
      result &&
      typeof result === "object"
    ) {
      return (
        <div className="space-y-5">
          <h3 className="text-xl font-semibold text-white">
            {result.title || "Interactive Lesson"}
          </h3>

          <p className="text-gray-300">
            {result.introduction}
          </p>

          {result.steps?.map((step, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-[#0b0b16] p-5"
            >
              <p className="mb-2 text-xs font-semibold text-purple-400">
                STEP {index + 1}
              </p>

              <h4 className="mb-3 font-semibold">
                {step.title}
              </h4>

              <p className="whitespace-pre-wrap leading-7 text-gray-300">
                {step.explanation}
              </p>

              {step.codeSnippet && (
                <pre className="mt-4 overflow-x-auto rounded-lg bg-black/30 p-4 text-sm text-blue-300">
                  <code>{step.codeSnippet}</code>
                </pre>
              )}

              {step.tip && (
                <p className="mt-3 text-sm text-purple-300">
                  Tip: {step.tip}
                </p>
              )}

              {step.question && (
                <div className="mt-4 rounded-lg border border-blue-500/20 p-4">
                  <p className="font-medium text-blue-300">
                    {step.question.text}
                  </p>

                  <div className="mt-3 space-y-2">
                    {step.question.options?.map(
                      (option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`rounded-lg border p-3 text-sm ${
                            optionIndex ===
                            step.question.correctAnswerIndex
                              ? "border-green-500/40 bg-green-500/10 text-green-300"
                              : "border-white/10 text-gray-400"
                          }`}
                        >
                          {option}
                        </div>
                      )
                    )}
                  </div>

                  {step.question.explanation && (
                    <p className="mt-3 text-sm text-gray-400">
                      {step.question.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {result.conclusion && (
            <p className="text-purple-300">
              {result.conclusion}
            </p>
          )}
        </div>
      );
    }

    if (
      item.learningMode === "VISUAL_LESSON" &&
      result &&
      typeof result === "object"
    ) {
      return (
        <div className="space-y-5">
          <h3 className="text-xl font-semibold">
            {result.title || "Visual Learning"}
          </h3>

          {result.introduction && (
            <p className="leading-7 text-gray-300">
              {result.introduction}
            </p>
          )}

          {result.scenes?.map((scene, index) => (
            <div
              key={index}
              className="rounded-xl border border-fuchsia-500/20 bg-[#0b0b16] p-5"
            >
              <p className="mb-2 text-xs font-semibold text-fuchsia-400">
                SCENE {index + 1}
              </p>

              <h4 className="font-semibold">
                {scene.title || `Scene ${index + 1}`}
              </h4>

              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-gray-300">
                {JSON.stringify(scene, null, 2)}
              </pre>
            </div>
          ))}

          {result.conclusion && (
            <p className="text-purple-300">
              {result.conclusion}
            </p>
          )}
        </div>
      );
    }

    return (
      <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-gray-300">
        {typeof result === "string"
          ? result
          : JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <div className="min-h-screen bg-[#080812] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0c18] shadow-lg shadow-black/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/code-explainer")}
              className="rounded-xl border border-white/10 p-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
              title="Back to Code Explainer"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
              <History size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                My AI Learning History
              </h1>

              <p className="text-xs text-gray-500">
                CODEVERSE Learning Platform
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/code-explainer")}
            className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
          >
            <Code2 size={18} />
            Back to Code Explainer
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        {/* Introduction */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-purple-400">
            <History size={17} />
            Your Learning Journey
          </div>

          <h2 className="text-3xl font-bold md:text-4xl">
            Continue Your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Learning Journey
            </span>
          </h2>

          <p className="mt-4 text-gray-400">
            Explore your previously generated AI explanations,
            interactive lessons, and visual learning sessions.
          </p>
        </section>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Sessions",
              value: history.length,
              icon: History,
              color: "text-purple-400",
            },
            {
              title: "Code Explanations",
              value: history.filter(
                (item) => item.learningMode === "EXPLANATION"
              ).length,
              icon: BookOpen,
              color: "text-blue-400",
            },
            {
              title: "Interactive Lessons",
              value: history.filter(
                (item) =>
                  item.learningMode === "INTERACTIVE_LESSON"
              ).length,
              icon: GraduationCap,
              color: "text-fuchsia-400",
            },
            {
              title: "Visual Lessons",
              value: history.filter(
                (item) => item.learningMode === "VISUAL_LESSON"
              ).length,
              icon: Film,
              color: "text-cyan-400",
            },
          ].map(({ title, value, icon: Icon, color }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-[#11111f] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {title}
                </p>

                <Icon size={22} className={color} />
              </div>

              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-3.5 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search by title, language, or code..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#11111f] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#11111f] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
          >
            {FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchHistory(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#11111f] px-5 py-3 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={loading || refreshing || deletingAll || deletingId !== null || history.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            title="Permanently delete all saved AI learning history"
          >
            {deletingAll ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Trash2 size={17} />
            )}
            {deletingAll ? "Deleting..." : "Delete All"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
            <LoaderCircle
              size={35}
              className="animate-spin text-purple-400"
            />

            <p className="text-gray-400">
              Loading your learning history...
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#11111f] px-6 py-20 text-center">
            <History
              size={48}
              className="mx-auto mb-5 text-purple-400"
            />

            <h3 className="text-xl font-semibold">
              {history.length === 0
                ? "No Learning History Yet"
                : "No Matching Results"}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-400">
              {history.length === 0
                ? "Generate your first AI explanation to start building your learning history."
                : "Try another search term or learning mode."}
            </p>

            {history.length === 0 && (
              <button
                onClick={() => navigate("/code-explainer")}
                className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold"
              >
                Start Learning
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredHistory.map((item) => {
              const Icon =
                item.learningMode === "EXPLANATION"
                  ? Code2
                  : item.learningMode === "INTERACTIVE_LESSON"
                  ? GraduationCap
                  : Film;

              return (
                <div
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-white/10 bg-[#11111f] p-6 transition hover:border-purple-500/40"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      <Icon size={23} />
                    </div>

                    <span className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                      {item.language}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold">
                    {item.title || "AI Learning Session"}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {MODE_LABELS[item.learningMode] ||
                      item.learningMode}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays size={14} />
                    {formatDate(item.createdAt)}
                  </div>

                  <div className="mt-3">
                    <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-gray-400">
                      {item.explanationLevel}
                    </span>
                  </div>

                  <pre className="mt-5 max-h-28 overflow-hidden whitespace-pre-wrap break-all rounded-xl bg-[#080812] p-4 text-xs leading-6 text-gray-400">
                    {item.code}
                  </pre>

                  <div className="mt-auto flex gap-3 pt-6">
                    <button
                      onClick={() => setSelectedHistory(item)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold hover:from-purple-500 hover:to-blue-500"
                    >
                      <Eye size={17} />
                      View
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingAll || deletingId !== null}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                      title="Delete History"
                    >
                      {deletingId === item.id ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* History Details Modal */}
      {selectedHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Learning history details"
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-purple-500/20 bg-[#11111f]">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedHistory.title}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {selectedHistory.language} ·{" "}
                  {selectedHistory.explanationLevel}
                </p>
              </div>

              <button
                onClick={() => setSelectedHistory(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-7 overflow-y-auto p-5 md:p-7">
              {/* Saved Code */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-purple-300">
                    <Code2 size={18} />
                    Your Code
                  </h3>

                  <button
                    onClick={() => copyCode(selectedHistory.code)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                  >
                    {copied ? (
                      <Check size={16} />
                    ) : (
                      <Clipboard size={16} />
                    )}

                    {copied ? "Copied" : "Copy Code"}
                  </button>
                </div>

                <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#080812] p-5 text-sm leading-7 text-blue-300">
                  <code>{selectedHistory.code}</code>
                </pre>
              </section>

              {/* Saved AI Result */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-purple-300">
                  <BookOpen size={18} />
                  Saved AI Learning Content
                </h3>

                <div className="rounded-xl border border-white/10 bg-[#151426] p-5 leading-7 text-gray-200">
                  {renderResult(selectedHistory)}
                </div>
              </section>
            </div>

            <div className="flex justify-end border-t border-white/10 p-5">
              <button
                onClick={() => setSelectedHistory(null)}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiLearningHistory;
