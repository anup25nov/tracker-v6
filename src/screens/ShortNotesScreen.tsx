import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, StickyNote, Trash2, Pencil, Loader2, X, Save, LogIn } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { ShortNote, loadNotes, saveNote, deleteNote, MAX_CONTENT_LENGTH } from "@/lib/firestoreNotes";
import { format } from "date-fns";
import { toast } from "sonner";
import { QueryDocumentSnapshot } from "firebase/firestore";

interface Props {
  onBack: () => void;
}

const ShortNotesScreen = ({ onBack }: Props) => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const [notes, setNotes] = useState<ShortNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editNote, setEditNote] = useState<{ id?: string; title: string; content: string } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isHi = language === "hi";

  const fetchNotes = useCallback(async (append = false) => {
    if (!user?.uid) { setLoading(false); return; }
    if (append) setLoadingMore(true); else setLoading(true);

    try {
      const result = await loadNotes(user.uid, append ? lastDocRef.current : null);
      lastDocRef.current = result.lastVisible;
      setHasMore(result.hasMore);
      setNotes((prev) => append ? [...prev, ...result.notes] : result.notes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [user?.uid]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Infinite scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        fetchNotes(true);
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore, fetchNotes]);

  const handleSave = async () => {
    if (!user?.uid) { toast.error(isHi ? "कृपया पहले लॉगिन करें" : "Please login first"); return; }
    if (!editNote || !editNote.title.trim()) { toast.error(isHi ? "टाइटल ज़रूरी है" : "Title is required"); return; }

    setSaving(true);
    try {
      await saveNote(user.uid, { id: editNote.id, title: editNote.title.trim(), content: editNote.content.trim() });
      lastDocRef.current = null;
      await fetchNotes();
      setEditNote(null);
      toast.success(isHi ? "नोट सेव ✏️" : "Note saved ✏️");
    } catch (e) { console.error(e); toast.error(isHi ? "सेव विफल" : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    try {
      await deleteNote(user.uid, id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success(isHi ? "नोट हटाया" : "Note deleted");
    } catch (e) { console.error(e); }
  };

  // Editor overlay
  if (editNote) {
    return (
      <div className="min-h-screen px-3 sm:px-4 pt-6 pb-8 max-w-lg mx-auto space-y-4">
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setEditNote(null)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
            <X size={18} className="text-foreground" />
          </button>
          <h1 className="flex-1 text-base font-bold text-foreground">
            {editNote.id ? (isHi ? "नोट एडिट करें" : "Edit Note") : (isHi ? "नया नोट" : "New Note")}
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
        <div className="relative">
          <textarea
            placeholder={isHi ? "नोट लिखें..." : "Write your note..."}
            value={editNote.content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                setEditNote({ ...editNote, content: e.target.value });
              }
            }}
            maxLength={MAX_CONTENT_LENGTH}
            rows={6}
            className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors resize-none"
          />
          <p className="text-[10px] text-muted-foreground text-right mt-1">
            {editNote.content.length}/{MAX_CONTENT_LENGTH}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="min-h-screen max-h-screen overflow-y-auto px-3 sm:px-4 pt-6 pb-8 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-base sm:text-lg font-bold text-foreground">
            {isHi ? "📝 शॉर्ट नोट्स" : "📝 Short Notes"}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {isHi ? "त्वरित रिवीज़न नोट्स" : "Quick revision notes"}
          </p>
        </div>
        {user && (
          <button
            onClick={() => setEditNote({ title: "", content: "" })}
            className="px-3 py-2 rounded-xl flex items-center gap-1.5 active:scale-90 transition-transform bg-primary text-primary-foreground text-xs font-semibold"
          >
            <Plus size={14} />
            {isHi ? "नया" : "New"}
          </button>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : !user ? (
        <motion.div className="flex flex-col items-center justify-center py-16 text-center space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-primary/10">
            <LogIn size={32} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">{isHi ? "नोट्स के लिए लॉगिन करें" : "Login to save notes"}</p>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">{isHi ? "सभी डिवाइसों पर सिंक करें" : "Sync across all devices"}</p>
          </div>
        </motion.div>
      ) : notes.length === 0 ? (
        <motion.div className="flex flex-col items-center justify-center py-16 text-center space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-primary/10">
            <StickyNote size={32} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">{isHi ? "कोई नोट्स नहीं" : "No notes yet"}</p>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
              {isHi ? "महत्वपूर्ण पॉइंट्स लिखें और रिवीज़न करें!" : "Write key points for quick revision!"}
            </p>
          </div>
          <button
            onClick={() => setEditNote({ title: "", content: "" })}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition-transform inline-flex items-center gap-2"
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-primary/10">
                  <StickyNote size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                  {n.content && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.content}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-[10px] text-muted-foreground/60">
                      {format(new Date(n.updatedAt), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditNote({ id: n.id, title: n.title, content: n.content })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform bg-primary/10"
                  >
                    <Pencil size={13} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform bg-destructive/10"
                  >
                    <Trash2 size={13} className="text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Load more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          )}
          {!hasMore && notes.length > 0 && (
            <p className="text-center text-[10px] text-muted-foreground py-2">
              {isHi ? "सभी नोट्स दिखाए गए" : "All notes shown"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ShortNotesScreen;
