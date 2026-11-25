
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  UploadCloud,
  FileText,
  Layers,
  ListChecks,
  Brain,
  Search,
  Plus,
  FolderOpen,
  X,
  FileUp,
  Loader2,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

import {
  generateStudyPack, uploadStudyPack, getMyStudyPacks,
  getStudyPackById, renameStudyPack, deleteStudyPack, getStudyPackError,
} from "../services/studyPackService";

const features = [
  {
    title: "Smart Summary",
    description: "Understand complex topics faster.",
    icon: FileText,
    color: "#a78bfa",
  },
  {
    title: "Short Notes",
    description: "Revise important concepts easily.",
    icon: BookOpen,
    color: "#60a5fa",
  },
  {
    title: "Flashcards",
    description: "Remember more with active recall.",
    icon: Layers,
    color: "#34d399",
  },
  {
    title: "Practice Quiz",
    description: "Test your knowledge with MCQs.",
    icon: ListChecks,
    color: "#fbbf24",
  },
  {
    title: "Key Concepts",
    description: "Discover essential learning points.",
    icon: Brain,
    color: "#f472b6",
  },
];

function StudyPractice({ pack }) {
  const cards = pack.flashcards ?? [];
  const questions = pack.quizQuestions ?? [];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length;
  const card = cards[index];
  return (
    <div className="mt-8 space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-emerald-300">Flashcards</h3>
        {card ? <>
          <p className="my-3 text-sm text-gray-400">Card {index + 1} of {cards.length} · Click to reveal</p>
          <button onClick={() => setFlipped(v => !v)} aria-pressed={flipped} className="flex min-h-48 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
            <span className="text-xs uppercase tracking-widest text-emerald-300">{flipped ? "Answer" : "Question"}</span>
            <span className="text-lg">{flipped ? card.answer : card.question}</span>
          </button>
          <div className="mt-3 flex justify-between gap-3">
            <button disabled={index === 0} onClick={() => { setIndex(i => i - 1); setFlipped(false); }} className="rounded-lg bg-white/10 px-4 py-2 disabled:opacity-30">Previous</button>
            <button disabled={index >= cards.length - 1} onClick={() => { setIndex(i => i + 1); setFlipped(false); }} className="rounded-lg bg-purple-600 px-4 py-2 disabled:opacity-30">Next</button>
          </div>
        </> : <p className="mt-2 text-gray-400">No flashcards available.</p>}
      </section>
      <section>
        <h3 className="text-lg font-semibold text-amber-300">Practice Quiz</h3>
        <p className="my-3 text-sm text-gray-400">{Object.keys(answers).length} of {questions.length} answered</p>
        {questions.map((q, i) => <fieldset key={i} className="mb-4 rounded-xl border border-white/10 bg-[#080812] p-4">
          <legend className="px-2 font-medium">{i + 1}. {q.question}</legend>
          <div className="space-y-2">{q.options.map((option, j) => <label key={j} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${submitted && j === q.correctAnswerIndex ? "border-emerald-500 bg-emerald-500/10" : submitted && answers[i] === j ? "border-red-500 bg-red-500/10" : answers[i] === j ? "border-purple-500 bg-purple-500/10" : "border-white/10"}`}>
            <input type="radio" name={`quiz-${pack.id}-${i}`} checked={answers[i] === j} disabled={submitted} onChange={() => setAnswers(old => ({...old, [i]: j}))} />{option}
          </label>)}</div>
          {submitted && <p className="mt-3 text-sm text-gray-300">{answers[i] === q.correctAnswerIndex ? "Correct! " : "Incorrect. "}{q.explanation}</p>}
        </fieldset>)}
        {questions.length > 0 && (submitted ? <div role="status" className="rounded-xl bg-purple-500/10 p-4"><p className="font-bold">Score: {score}/{questions.length} ({Math.round(score / questions.length * 100)}%)</p><button onClick={() => {setAnswers({}); setSubmitted(false);}} className="mt-3 rounded-lg bg-purple-600 px-4 py-2">Retry Quiz</button></div> : <button disabled={Object.keys(answers).length !== questions.length} onClick={() => setSubmitted(true)} className="rounded-lg bg-purple-600 px-5 py-3 disabled:opacity-40">Submit Quiz</button>)}
        {!questions.length && <p className="text-gray-400">No quiz questions available.</p>}
        <p className="mt-4 text-xs text-gray-500">AI-generated study material may contain errors. Check against your original sources. Quiz scores are for practice only.</p>
      </section>
    </div>
  );
}

function StudyPacks() {
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [error, setError] = useState("");

  const [generating, setGenerating] = useState(false);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPack, setSelectedPack] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const previewRef = useRef(null);
  useEffect(() => { if (selectedPack) previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [selectedPack]);
  const generationLock = useRef(false);
  const actionLock = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setListError("");
    const timer = setTimeout(async () => {
      try {
        const data = await getMyStudyPacks();
        if (active) setPacks(data);
      } catch (err) {
        if (active) setListError(getStudyPackError(err));
      } finally {
        if (active) setLoading(false);
      }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [refresh]);

  const query = search.trim().toLowerCase();
  const visiblePacks = packs.filter(pack =>
    [pack.title, pack.summary, pack.sourceFileName, pack.difficulty, pack.sourceType]
      .some(value => String(value ?? "").toLowerCase().includes(query))
  );

  const handleAction = async (action, pack) => {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    setListError("");
    try {
      if (action === "view") {
        setSelectedPack(await getStudyPackById(pack.id));
      } else if (action === "rename") {
        const title = window.prompt("Enter a new title", pack.title);
        if (title === null) return;
        if (!title.trim() || title.trim().length > 200) {
          setListError("Enter a title between 1 and 200 characters.");
          return;
        }
        const updated = await renameStudyPack(pack.id, title.trim());
        setSelectedPack(current => current?.id === pack.id ? updated : current);
        setRefresh(n => n + 1);
      } else if (action === "delete") {
        if (!window.confirm(`Delete "${pack.title}"? This cannot be undone.`)) return;
        await deleteStudyPack(pack.id);
        setSelectedPack(current => current?.id === pack.id ? null : current);
        setRefresh(n => n + 1);
      }
    } catch (err) {
      setListError(getStudyPackError(err));
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };

  const handleFile = (file) => {
    if (!file || generating) return;
    setSelectedFile(null);
    if (!file.size) { setError("Please select a non-empty file."); return; }

    setError("");

    const allowed = /\.(pdf|docx|txt)$/i;

    if (!allowed.test(file.name)) {
      setError("Please select a PDF, DOCX or TXT file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const canGenerate =
    inputMode === "upload"
      ? Boolean(selectedFile)
      : inputMode === "topic"
      ? Boolean(topic.trim())
      : Boolean(notes.trim());

  const handleGenerate = async () => {
    if (!canGenerate || generationLock.current) return;
    const content = (inputMode === "topic" ? topic : notes).trim();
    if (inputMode !== "upload" && content.length > 50000) {
      setError("Study material must not exceed 50,000 characters.");
      return;
    }
    generationLock.current = true;
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      const settings = { difficulty, language: "English" };
      const pack = inputMode === "upload"
        ? await uploadStudyPack({ file: selectedFile, ...settings })
        : await generateStudyPack({
            sourceType: inputMode === "topic" ? "TOPIC" : "TEXT",
            content, ...settings,
          });
      setSelectedPack(pack);
      setSuccess("Study Pack generated and saved successfully!");
      setSearch("");
      setRefresh(n => n + 1);
    } catch (err) {
      setError(getStudyPackError(err));
    } finally {
      generationLock.current = false;
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080812] text-white">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080812]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <div className="flex items-center gap-2 font-bold tracking-widest">
            <Sparkles size={20} className="text-purple-400" />
            CODEVERSE
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/50 via-[#11111f] to-blue-950/30 p-8 md:p-12">

          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />

          <div className="relative">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-purple-300">
              <Sparkles size={14} />
              AI-POWERED LEARNING
            </div>

            <h1 className="text-4xl font-bold md:text-5xl">
              AI Study{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Packs
              </span>
            </h1>

            <p className="mt-4 max-w-2xl leading-relaxed text-gray-400">
              Transform your lecture notes, documents and
              learning topics into personalized study materials.
              Study smarter, practice effectively and learn
              at your own pace.
            </p>

            <button
              onClick={() =>
                document.getElementById("create-pack")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-7 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold transition hover:opacity-90"
            >
              <Plus size={19} />
              Create Study Pack
            </button>

          </div>
        </section>

        {/* Features */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-[#11111f] p-5 transition hover:border-purple-500/40"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${feature.color}20`,
                    color: feature.color,
                  }}
                >
                  <Icon size={22} />
                </div>

                <h3 className="font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </section>

        {/* Create Study Pack */}
        <section
          id="create-pack"
          className="mt-10 scroll-mt-24 rounded-3xl border border-white/10 bg-[#11111f] p-6 md:p-8"
        >

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-xl bg-purple-500/15 p-3 text-purple-400">
              <Sparkles size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Create a Study Pack
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Choose how you want to provide your study material.
              </p>
            </div>

          </div>

          {/* Input modes */}
          <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl bg-[#080812] p-2">

            {[
              {
                id: "upload",
                label: "Upload File",
                icon: UploadCloud,
              },
              {
                id: "text",
                label: "Paste Text",
                icon: FileText,
              },
              {
                id: "topic",
                label: "Enter Topic",
                icon: Brain,
              },
            ].map((mode) => {
              const Icon = mode.icon;

              return (
                <button
                  key={mode.id}
                  disabled={generating}
                  onClick={() => {
                    setInputMode(mode.id);
                    setError("");
                  }}
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg px-2 py-3 text-xs font-medium transition sm:flex-row sm:text-sm ${
                    inputMode === mode.id
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  {mode.label}
                </button>
              );
            })}

          </div>

          {/* File upload */}
          {inputMode === "upload" && (
            <div>

              {!selectedFile ? (
                <label
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleFile(event.dataTransfer.files[0]);
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 px-5 py-12 text-center transition hover:border-purple-400 hover:bg-purple-500/10"
                >

                  <UploadCloud
                    size={45}
                    className="mb-4 text-purple-400"
                  />

                  <h3 className="font-semibold">
                    Drag and drop your study material
                  </h3>

                  <p className="mt-2 text-sm text-gray-400">
                    or click to browse files
                  </p>

                  <p className="mt-4 text-xs text-gray-500">
                    PDF, DOCX, TXT · Maximum 10 MB
                  </p>

                  <input
                    type="file"
                    disabled={generating}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(event) =>
                      handleFile(event.target.files[0])
                    }
                  />

                </label>
              ) : (
                <div className="flex items-center gap-4 rounded-xl border border-purple-500/30 bg-purple-500/5 p-5">

                  <FileUp
                    size={30}
                    className="shrink-0 text-purple-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <button
                    aria-label="Remove selected file"
                    disabled={generating}
                    onClick={() => {
                      setSelectedFile(null);
                      setError("");
                    }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                  >
                    <X size={20} />
                  </button>

                </div>
              )}

            </div>
          )}

          {/* Paste text */}
          {inputMode === "text" && (
            <textarea
              value={notes}
              disabled={generating}
              maxLength={50000}
              onChange={(event) => {
                setNotes(event.target.value);
                setError("");
              }}
              placeholder="Paste your lecture notes or study material here..."
              rows={9}
              className="w-full resize-y rounded-xl border border-white/10 bg-[#080812] p-4 text-sm leading-relaxed outline-none transition focus:border-purple-500"
            />
          )}

          {/* Topic input */}
          {inputMode === "topic" && (
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                What would you like to learn?
              </label>

              <input
                value={topic}
                disabled={generating}
                maxLength={50000}
                onChange={(event) => {
                  setTopic(event.target.value);
                  setError("");
                }}
                placeholder="e.g. Object-Oriented Programming"
                className="w-full rounded-xl border border-white/10 bg-[#080812] px-4 py-4 outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* Settings */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Difficulty Level
              </label>

              <select
                value={difficulty}
                disabled={generating}
                onChange={(event) =>
                  setDifficulty(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-[#080812] p-3 outline-none focus:border-purple-500"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Output Language
              </label>

              <select className="w-full rounded-xl border border-white/10 bg-[#080812] p-3 outline-none">
                <option>English</option>
              </select>
            </div>

          </div>

          <p className="mt-4 text-xs text-gray-400">Study material is processed by AI. Avoid uploading confidential information. Verify generated content against your sources.</p>
          {success && <p role="status" className="mt-4 text-sm text-emerald-400">{success}</p>}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300"
            >
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-4 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {generating ? "Generating your Study Pack..." : "Generate AI Study Pack"}
          </button>

        </section>

        {/* My Study Packs */}
        <section className="mt-10">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                My Study Packs
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Access and revise your saved study materials.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#11111f] px-4 py-3">
              <Search size={18} className="text-gray-500" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search study packs..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

          </div>

          {listError && <div role="alert" className="mb-4 rounded-xl bg-red-500/10 p-4 text-red-300">{listError} <button className="underline" onClick={() => setRefresh(n => n + 1)}>Refresh</button></div>}
          {loading ? (
            <div role="status" className="flex justify-center gap-3 p-10 text-purple-300"><Loader2 className="animate-spin" /> Loading Study Packs...</div>
          ) : listError && packs.length === 0 ? null : visiblePacks.length === 0 ? (
            search.trim() ? <p className="p-10 text-center text-gray-400">No matching Study Packs.</p> : (
<div className="rounded-3xl border border-dashed border-white/10 bg-[#11111f] px-6 py-14 text-center">

            <FolderOpen
              size={48}
              className="mx-auto mb-4 text-purple-400"
            />

            <h3 className="text-lg font-semibold">
              No Study Packs Yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-400">
              Create your first AI Study Pack and start
              building your personal learning library.
            </p>

            <button
              onClick={() =>
                document.getElementById("create-pack")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mx-auto mt-5 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
            >
              <Plus size={18} />
              Create First Study Pack
            </button>

          </div>
            )
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visiblePacks.map(pack => (
                <article key={pack.id} className="rounded-2xl border border-white/10 bg-[#11111f] p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-purple-300"><BookOpen size={18} /> {pack.sourceType} · {pack.difficulty}</div>
                  <h3 className="break-words text-lg font-semibold">{pack.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-400">{pack.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button disabled={busy} onClick={() => handleAction("view", pack)} className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm disabled:opacity-50"><Eye size={16}/> View</button>
                    <button disabled={busy} onClick={() => handleAction("rename", pack)} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm disabled:opacity-50"><Pencil size={16}/> Rename</button>
                    <button disabled={busy} onClick={() => handleAction("delete", pack)} className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 disabled:opacity-50"><Trash2 size={16}/> Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}

        </section>

        {selectedPack && (
          <section ref={previewRef} className="mt-10 scroll-mt-24 rounded-3xl border border-purple-500/30 bg-[#11111f] p-6" aria-label="Study Pack preview">
            <div className="flex items-start justify-between gap-4">
              <h2 className="break-words text-2xl font-bold">{selectedPack.title}</h2>
              <button aria-label="Close preview" onClick={() => setSelectedPack(null)}><X size={22}/></button>
            </div>
            <p className="mt-2 text-sm text-purple-300">{selectedPack.difficulty} · {selectedPack.language}</p>
            <h3 className="mt-6 text-lg font-semibold text-purple-300">Smart Summary</h3>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-gray-300">{selectedPack.summary}</p>
            <h3 className="mt-6 text-lg font-semibold text-blue-300">Short Notes</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-300">{selectedPack.shortNotes?.map((note, i) => <li key={i}>{note}</li>)}</ul>
            <h3 className="mt-6 text-lg font-semibold text-pink-300">Key Concepts</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">{selectedPack.keyConcepts?.map((concept, i) => <div key={i} className="rounded-xl bg-[#080812] p-4"><h4 className="font-semibold">{concept.term}</h4><p className="mt-2 text-sm text-gray-400">{concept.definition}</p></div>)}</div>
            <StudyPractice key={selectedPack.id} pack={selectedPack} />
          </section>
        )}

        <footer className="mt-12 border-t border-white/10 py-6 text-center text-xs tracking-widest text-gray-500">
          CODEVERSE • AI STUDY PACKS
        </footer>

      </main>
    </div>
  );
}

export default StudyPacks;
