import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  X, Plus, Trash2, Edit3, Download, Upload, GripVertical,
  Copy, Eye, ChevronDown, ChevronUp, Save, ArrowLeft
} from "lucide-react";
import type { Question } from "../types";

interface Props {
  questions: Question[];
  onChange: (qs: Question[]) => void;
  onClose: () => void;
}

const EMPTY_Q: Omit<Question, "id"> = {
  emoji: "🎬",
  answer: "",
  poster: "",
  difficulty: "easy",
  category: "hollywood",
};

function QuestionCard({
  q,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
}: {
  q: Question;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
}) {
  return (
    <Reorder.Item
      value={q}
      className="glass glass-hover rounded-2xl p-4 flex items-center gap-4 cursor-default select-none"
    >
      <span className="text-white/20 cursor-grab active:cursor-grabbing">
        <GripVertical size={18} />
      </span>
      <span className="text-2xl w-10 text-center">{q.emoji || "🖼️"}</span>
      <div className="flex-1 min-w-0">
        <div className="text-white/90 font-medium truncate">{q.answer || "Untitled"}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`text-xs font-mono px-1.5 py-0.5 rounded-full border ${
              q.difficulty === "easy"
                ? "text-green-400 border-green-400/20"
                : q.difficulty === "medium"
                ? "text-yellow-400 border-yellow-400/20"
                : "text-red-400 border-red-400/20"
            }`}
          >
            {q.difficulty}
          </span>
          <span className="text-white/30 text-xs font-mono">{q.category}</span>
          {q.image && <span className="text-blue-400 text-xs font-mono">IMG clue</span>}
          {q.poster && <span className="text-purple-400 text-xs font-mono">Poster ✓</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onPreview}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          title="Preview"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={onDuplicate}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-purple-900/40 text-white/40 hover:text-purple-400 transition-colors"
          title="Edit"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-900/40 text-white/40 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </Reorder.Item>
  );
}

function EditModal({
  q,
  onSave,
  onClose,
}: {
  q: Question;
  onSave: (updated: Question) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...q });
  const posterInputRef = useRef<HTMLInputElement>(null);
  const clueInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof Question, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "poster") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setForm((f) => ({ ...f, [field]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative glass rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl neon-purple">EDIT QUESTION</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-mono uppercase tracking-wider block mb-1.5">
              Movie Name *
            </label>
            <input
              value={form.answer}
              onChange={(e) => set("answer", e.target.value)}
              placeholder="e.g. Titanic"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-mono uppercase tracking-wider block mb-1.5">
              Emoji Clue
            </label>
            <input
              value={form.emoji || ""}
              onChange={(e) => set("emoji", e.target.value)}
              placeholder="e.g. 🚢💙❤️"
              className="w-full text-2xl"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-mono uppercase tracking-wider block mb-1.5">
              Clue Image URL (optional)
            </label>
            <div className="flex gap-2">
              <input
                value={form.image || ""}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://... or upload below"
                className="flex-1"
              />
              <button
                className="btn-secondary px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                onClick={() => clueInputRef.current?.click()}
              >
                Upload
              </button>
              <input
                ref={clueInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "image")}
              />
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs font-mono uppercase tracking-wider block mb-1.5">
              Poster URL
            </label>
            <div className="flex gap-2">
              <input
                value={form.poster || ""}
                onChange={(e) => set("poster", e.target.value)}
                placeholder="https://... or upload below"
                className="flex-1"
              />
              <button
                className="btn-secondary px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                onClick={() => posterInputRef.current?.click()}
              >
                Upload
              </button>
              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "poster")}
              />
            </div>
            {form.poster && (
              <img
                src={form.poster}
                alt="poster preview"
                className="mt-2 h-24 rounded-xl object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs font-mono uppercase tracking-wider block mb-1.5">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => set("difficulty", e.target.value)}
                className="w-full"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs font-mono uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full"
              >
                <option value="hollywood">Hollywood</option>
                <option value="bollywood">Bollywood</option>
                <option value="tollywood">Tollywood</option>
                <option value="korean">Korean</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold"
            onClick={() => onSave(form)}
            whileTap={{ scale: 0.97 }}
          >
            <Save size={16} /> Save Question
          </motion.button>
          <button
            className="btn-secondary px-4 py-3 rounded-xl text-white/60"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PreviewModal({ q, onClose }: { q: Question; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative glass rounded-3xl p-8 w-full max-w-sm text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X size={16} />
        </button>
        <div className="text-xs font-mono text-white/30 mb-4 uppercase tracking-widest">
          Preview
        </div>
        {q.emoji && <div className="text-6xl mb-4">{q.emoji}</div>}
        {q.image && (
          <img src={q.image} alt="clue" className="mx-auto rounded-xl mb-4 max-h-32 object-contain" />
        )}
        <div className="text-white/30 text-xs mb-6 font-mono">↑ Clue shown to players</div>
        {q.poster && (
          <img
            src={q.poster}
            alt={q.answer}
            className="mx-auto rounded-2xl mb-4 h-48 object-cover shadow-xl"
          />
        )}
        <div className="font-display text-3xl neon-yellow">{q.answer.toUpperCase()}</div>
        <div className="text-white/30 text-xs mt-2 font-mono">↑ Answer revealed after timer</div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminPanel({ questions, onChange, onClose }: Props) {
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [previewQ, setPreviewQ] = useState<Question | null>(null);
  const [filter, setFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextId = () => Math.max(0, ...questions.map((q) => q.id)) + 1;

  const addQuestion = () => {
    const diff = filter === "all" ? "easy" : filter;
    const newQ: Question = { ...EMPTY_Q, difficulty: diff, id: nextId() };
    onChange([...questions, newQ]);
    setEditingQ(newQ);
  };

  const saveEdit = (updated: Question) => {
    if (!updated.answer.trim()) {
      alert("Movie name cannot be empty.");
      return;
    }
    onChange(questions.map((q) => (q.id === updated.id ? updated : q)));
    setEditingQ(null);
  };

  const handleCancelEdit = () => {
    if (editingQ && !editingQ.answer.trim()) {
      onChange(questions.filter((q) => q.id !== editingQ.id));
    }
    setEditingQ(null);
  };

  const deleteQ = (id: number) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      onChange(questions.filter((q) => q.id !== id));
    }
  };

  const duplicateQ = (q: Question) => {
    const dup = { ...q, id: nextId() };
    onChange([...questions, dup]);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "movie-quiz-questions.json";
    a.click();
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          onChange(data);
        } else {
          alert("Invalid JSON format. Expected an array of questions.");
        }
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filtered = filter === "all" ? questions : questions.filter((q) => q.difficulty === filter);
  const counts = {
    all: questions.length,
    easy: questions.filter((q) => q.difficulty === "easy").length,
    medium: questions.filter((q) => q.difficulty === "medium").length,
    hard: questions.filter((q) => q.difficulty === "hard").length,
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col px-4 py-8 max-w-3xl mx-auto"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="btn-secondary p-2 rounded-xl flex items-center gap-2 text-white/60"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-3xl neon-purple">ADMIN PANEL</h1>
            <p className="text-white/30 text-xs font-mono">{questions.length} questions total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} />
            Import
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importJSON} />
          <button
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70"
            onClick={exportJSON}
          >
            <Download size={14} />
            Export
          </button>
          <button
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
            onClick={addQuestion}
          >
            <Plus size={14} />
            Add Movie
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "easy", "medium", "hard"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              filter === f
                ? f === "all"
                  ? "bg-purple-700 text-white"
                  : f === "easy"
                  ? "bg-green-800 text-green-200"
                  : f === "medium"
                  ? "bg-yellow-800 text-yellow-200"
                  : "bg-red-800 text-red-200"
                : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Drag-to-reorder list */}
      <Reorder.Group
        axis="y"
        values={filtered}
        onReorder={(reordered) => {
          if (filter !== "all") return; // only reorder in "all" view
          onChange(reordered);
        }}
        className="space-y-2 flex-1"
      >
        <AnimatePresence>
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              onEdit={() => setEditingQ(q)}
              onDelete={() => deleteQ(q.id)}
              onDuplicate={() => duplicateQ(q)}
              onPreview={() => setPreviewQ(q)}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {filtered.length === 0 && (
        <div className="text-center text-white/20 font-mono mt-20">
          No questions yet. Click "Add Movie" to get started.
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {editingQ && (
          <EditModal
            key="edit"
            q={editingQ}
            onSave={saveEdit}
            onClose={handleCancelEdit}
          />
        )}
        {previewQ && (
          <PreviewModal
            key="preview"
            q={previewQ}
            onClose={() => setPreviewQ(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
