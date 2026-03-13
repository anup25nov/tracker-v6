import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Bell, Trash2, Clock, Loader2, X, LogIn } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import {
  Reminder,
  loadReminders,
  saveReminder,
  deleteReminder,
} from "@/lib/firestoreReminders";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
}

const RemindersScreen = ({ onBack }: Props) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [dates, setDates] = useState<string[]>([""]);
  const [time, setTime] = useState("");

  const isHi = language === "hi";

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadReminders(user.uid)
      .then(setReminders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const addDateField = () => {
    if (dates.length >= 7) {
      toast.error(isHi ? "अधिकतम 7 तिथियाँ अनुमत हैं" : "Maximum 7 dates allowed");
      return;
    }
    setDates([...dates, ""]);
  };

  const removeDateField = (index: number) => {
    if (dates.length <= 1) return;
    setDates(dates.filter((_, i) => i !== index));
  };

  const updateDate = (index: number, value: string) => {
    const updated = [...dates];
    updated[index] = value;
    setDates(updated);
  };

  const handleSave = async () => {
    if (!user?.uid) {
      toast.error(isHi ? "कृपया पहले लॉगिन करें" : "Please login first");
      return;
    }
    if (!text.trim() || !time) {
      toast.error(isHi ? "टेक्स्ट और समय भरें" : "Please fill text and time");
      return;
    }
    const validDates = dates.filter((d) => d.trim() !== "");
    if (validDates.length === 0) {
      toast.error(isHi ? "कम से कम एक तिथि चुनें" : "Select at least one date");
      return;
    }

    // Validate all dates are in the future
    const now = Date.now();
    for (const d of validDates) {
      const scheduledAt = new Date(`${d}T${time}`).getTime();
      if (scheduledAt <= now) {
        toast.error(isHi ? "सभी तिथियाँ भविष्य में होनी चाहिए" : "All dates must be in the future");
        return;
      }
    }

    setSaving(true);
    try {
      for (const d of validDates) {
        const scheduledAt = new Date(`${d}T${time}`).getTime();
        await saveReminder(user.uid, { text: text.trim(), scheduledAt });
      }
      const updated = await loadReminders(user.uid);
      setReminders(updated);
      setText("");
      setDates([""]);
      setTime("");
      setShowForm(false);
      toast.success(
        validDates.length > 1
          ? (isHi ? `${validDates.length} रिमाइंडर सेट हो गए ⏰` : `${validDates.length} reminders set ⏰`)
          : (isHi ? "रिमाइंडर सेट हो गया ⏰" : "Reminder set ⏰")
      );
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
      await deleteReminder(user.uid, id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success(isHi ? "रिमाइंडर हटाया गया" : "Reminder deleted");
    } catch (e) {
      console.error(e);
    }
  };

  const now = Date.now();

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
            {isHi ? "रिमाइंडर" : "Reminders"}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {isHi ? "समय पर नोटिफिकेशन पाएं" : "Get notified on time"}
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "hsl(var(--primary) / 0.15)" }}
          >
            <Plus size={18} className="text-primary" />
          </button>
        )}
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="rounded-2xl bg-card border border-border p-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              placeholder={isHi ? "रिमाइंडर टेक्स्ट..." : "Reminder text..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
              className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
            />

            {/* Multi-date fields */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {isHi ? `तिथियाँ (${dates.length}/7)` : `Dates (${dates.length}/7)`}
                </p>
                {dates.length < 7 && (
                  <button
                    onClick={addDateField}
                    className="text-[10px] font-semibold text-primary flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <Plus size={12} />
                    {isHi ? "तिथि जोड़ें" : "Add date"}
                  </button>
                )}
              </div>
              {dates.map((d, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={d}
                    onChange={(e) => updateDate(i, e.target.value)}
                    className="flex-1 bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground outline-none border border-border focus:border-primary transition-colors"
                  />
                  {dates.length > 1 && (
                    <button
                      onClick={() => removeDateField(i)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                      style={{ background: "hsl(var(--destructive) / 0.1)" }}
                    >
                      <X size={14} className="text-destructive" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground outline-none border border-border focus:border-primary transition-colors"
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
              {dates.filter((d) => d).length > 1
                ? (isHi ? `${dates.filter((d) => d).length} रिमाइंडर सेट करें` : `Set ${dates.filter((d) => d).length} Reminders`)
                : (isHi ? "रिमाइंडर सेट करें" : "Set Reminder")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : !user ? (
        /* Not logged in state */
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.1)" }}>
            <LogIn size={32} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">
              {isHi ? "रिमाइंडर सेव करने के लिए लॉगिन करें" : "Login to save reminders"}
            </p>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
              {isHi ? "अपने रिमाइंडर सभी डिवाइसों पर सिंक करें" : "Sync your reminders across all devices"}
            </p>
          </div>
        </motion.div>
      ) : reminders.length === 0 ? (
        /* Empty state with CTA */
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.1)" }}>
            <Bell size={32} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">
              {isHi ? "कोई रिमाइंडर नहीं" : "No reminders yet"}
            </p>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
              {isHi
                ? "अपनी पढ़ाई का शेड्यूल बनाएं और समय पर नोटिफिकेशन पाएं!"
                : "Schedule your study sessions and get notified on time!"}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition-transform inline-flex items-center gap-2"
          >
            <Plus size={16} />
            {isHi ? "पहला रिमाइंडर बनाएं" : "Create First Reminder"}
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          {reminders.map((r, i) => {
            const isPast = r.scheduledAt < now;
            return (
              <motion.div
                key={r.id}
                className={`rounded-xl p-3.5 bg-card border flex items-start gap-3 ${
                  isPast ? "border-muted-foreground/20 opacity-60" : "border-primary/25"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: isPast
                      ? "hsl(var(--muted))"
                      : "hsl(var(--primary) / 0.15)",
                  }}
                >
                  {isPast ? (
                    <Clock size={16} className="text-muted-foreground" />
                  ) : (
                    <Bell size={16} className="text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground break-words">{r.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {format(new Date(r.scheduledAt), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform shrink-0"
                  style={{ background: "hsl(var(--destructive) / 0.1)" }}
                >
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RemindersScreen;
