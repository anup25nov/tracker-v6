import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, StickyNote, Trash2, Pencil, Loader2, X, Save, LogIn } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { ShortNote, loadNotes, saveNote, deleteNote } from "@/lib/firestoreNotes";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
}

const ShortNotesScreen = ({ onBack }: Props) => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const [notes, setNotes] = useState<ShortNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editNote, setEditNote] = useState<{ id?: string; title: string; content: string } | null>(null);

  const isHi = language === "hi";

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadNotes(user.uid)
      .then(setNotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) {
      toast.error(isHi ? "कृपया पहले लॉगिन करें" : "Please login first");
      return;
    }
    if (!editNote || !editNote.title.trim()) {
      toast.error(isHi ? "टाइटल ज़रूरी है" : "Title is required");
      return;
    }
    setSaving(true);
    try {
      await saveNote(user.uid, {
        id: editNote.id,
        title: editNote.title.trim(),
        content: editNote.content.trim(),
      });
      const updated = await loadNotes(user.uid);
      setNotes(updated);
      setEditNote(null);
      toast.success(isHi ? "नोट सेव हो गया ✏️" : "Note saved ✏️");
    } catch (e) {
      console.error(e);
      toast.error(isHi ? "सेव करने में विफल" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    try {
      await deleteNote(user.uid, id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success(isHi ? "नोट हटाया गया" : "Note deleted");
    } catch (e) {
      console.error(e);
    }
  };

  // Editor overlay
  if (editNote) {
    return (
      <div className="min-h-screen px-3 sm:px-4 pt-6 pb-8 max-w-lg mx-auto space-y-4">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => setEditNote(null)}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform"
          >
            <X size={18} className="text-foreground" />
          </button>
          <h1 className="flex-1 text-base font-bold text-foreground">
            {editNote.id
              ? isHi ? "नोट एडिट करें" : "Edit Note"
              : isHi ? "नया नोट" : "New Note"}
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isHi ? "सेव" : "Save"}
          </button>
        </motion.div>

        <input
          type="text"
          placeholder={isHi ? "नोट का टाइटल" : "Note title"}
          value={editNote.title}
          onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
          maxLength={100}
          className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
        />
        <textarea
          placeholder={isHi ? "नोट लिखें..." : "Write your note..."}
          value={editNote.content}
          onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
          maxLength={5000}
          rows={12}
          className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors resize-none"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-6 pb-8 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-base sm:text-lg font-bold text-foreground">
            {isHi ? "शॉर्ट नोट्स" : "Short Notes"}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {isHi ? "त्वरित रिवीज़न के लिए नोट्स" : "Quick revision notes"}
          </p>
        </div>
        {user && (
          <button
            onClick={() => setEditNote({ title: "", content: "" })}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "hsl(38 92% 50% / 0.15)" }}
          >
            <Plus size={18} style={{ color: "hsl(38 92% 50%)" }} />
          </button>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : !user ? (
        /* Not logged in */
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "hsl(38 92% 50% / 0.1)" }}>
            <LogIn size={32} style={{ color: "hsl(38 92% 50%)" }} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">
              {isHi ? "नोट्स सेव करने के लिए लॉगिन करें" : "Login to save notes"}
            </p>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
              {isHi ? "अपने नोट्स सभी डिवाइसों पर सिंक करें" : "Sync your notes across all devices"}
            </p>
          </div>
        </motion.div>
      ) : notes.length === 0 ? (
        /* Empty state with CTA */
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "hsl(38 92% 50% / 0.1)" }}>
            <StickyNote size={32} style={{ color: "hsl(38 92% 50%)" }} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">
              {isHi ? "कोई नोट्स नहीं" : "No notes yet"}
            </p>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
              {isHi
                ? "अपने महत्वपूर्ण पॉइंट्स यहाँ लिखें और रिवीज़न करें!"
                : "Write down key points for quick revision anytime!"}
            </p>
          </div>
          <button
            onClick={() => setEditNote({ title: "", content: "" })}
            className="px-6 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-transform inline-flex items-center gap-2 text-white"
            style={{ background: "hsl(38 92% 50%)" }}
          >
            <Plus size={16} />
            {isHi ? "पहला नोट बनाएं" : "Create First Note"}
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          {notes.map((n, i) => (
            <motion.div
              key={n.id}
              className="rounded-xl p-3.5 bg-card border border-border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "hsl(38 92% 50% / 0.15)" }}
                >
                  <StickyNote size={16} style={{ color: "hsl(38 92% 50%)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                  {n.content && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.content}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {format(new Date(n.updatedAt), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditNote({ id: n.id, title: n.title, content: n.content })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: "hsl(var(--primary) / 0.1)" }}
                  >
                    <Pencil size={13} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: "hsl(var(--destructive) / 0.1)" }}
                  >
                    <Trash2 size={13} className="text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShortNotesScreen;
