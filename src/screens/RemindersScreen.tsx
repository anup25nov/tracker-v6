import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Bell, Trash2, Clock, Loader2, LogIn, CalendarPlus, AlarmClock, X } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import AlarmTimePicker from "@/components/AlarmTimePicker";
import { QueryDocumentSnapshot } from "firebase/firestore";

interface Props {
  onBack: () => void;
}

const RemindersScreen = ({ onBack }: Props) => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isHi = language === "hi";

  const fetchReminders = useCallback(async (append = false) => {
    if (!user?.uid) { setLoading(false); return; }
    if (append) setLoadingMore(true); else setLoading(true);

    try {
      const result = await loadReminders(user.uid, append ? lastDocRef.current : null);
      lastDocRef.current = result.lastVisible;
      setHasMore(result.hasMore);
      setReminders((prev) => append ? [...prev, ...result.reminders] : result.reminders);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [user?.uid]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  // Infinite scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        fetchReminders(true);
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore, fetchReminders]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const exists = selectedDates.some(d => d.toDateString() === date.toDateString());
    if (exists) {
      setSelectedDates(prev => prev.filter(d => d.toDateString() !== date.toDateString()));
    } else {
      if (selectedDates.length >= 7) {
        toast.error(isHi ? "अधिकतम 7 तिथियाँ" : "Max 7 dates");
        return;
      }
      setSelectedDates(prev => [...prev, date]);
    }
  };

  const removeDate = (date: Date) => {
    setSelectedDates(prev => prev.filter(d => d.toDateString() !== date.toDateString()));
  };

  const getScheduledTime = (date: Date): number => {
    let h = parseInt(hour);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    const d = new Date(date);
    d.setHours(h, parseInt(minute), 0, 0);
    return d.getTime();
  };

  const handleSave = async () => {
    if (!user?.uid) { toast.error(isHi ? "कृपया पहले लॉगिन करें" : "Please login first"); return; }
    if (selectedDates.length === 0) { toast.error(isHi ? "कम से कम एक तिथि चुनें" : "Select at least one date"); return; }

    const now = Date.now();
    for (const d of selectedDates) {
      if (getScheduledTime(d) <= now) {
        toast.error(isHi ? "समय भविष्य में होना चाहिए" : "Time must be in the future");
        return;
      }
    }

    setSaving(true);
    try {
      for (const d of selectedDates) {
        await saveReminder(user.uid, { text: text.trim(), scheduledAt: getScheduledTime(d) });
      }
      lastDocRef.current = null;
      await fetchReminders();
      setText(""); setSelectedDates([]); setHour("09"); setMinute("00"); setAmpm("AM");
      setShowForm(false);
      toast.success(
        selectedDates.length > 1
          ? (isHi ? `${selectedDates.length} रिमाइंडर सेट ⏰` : `${selectedDates.length} reminders set ⏰`)
          : (isHi ? "रिमाइंडर सेट ⏰" : "Reminder set ⏰")
      );
    } catch (e) { console.error(e); toast.error(isHi ? "सेव विफल" : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    try {
      await deleteReminder(user.uid, id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success(isHi ? "रिमाइंडर हटाया" : "Reminder deleted");
    } catch (e) { console.error(e); }
  };

  const now = Date.now();
  const upcomingReminders = reminders.filter(r => r.scheduledAt >= now);
  const pastReminders = reminders.filter(r => r.scheduledAt < now);

  return (
    <div ref={scrollRef} className="min-h-screen max-h-screen overflow-y-auto px-3 sm:px-4 pt-6 pb-8 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-base sm:text-lg font-bold text-foreground">
            {isHi ? "⏰ रिमाइंडर" : "⏰ Reminders"}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {isHi ? "फ़ोन पर नोटिफिकेशन पाएं" : "Get phone notifications on time"}
          </p>
        </div>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-2 rounded-xl flex items-center gap-1.5 active:scale-90 transition-transform bg-primary text-primary-foreground text-xs font-semibold"
          >
            <Plus size={14} />
            {isHi ? "नया" : "New"}
          </button>
        )}
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="rounded-2xl bg-card border border-border overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            {/* Optional label */}
            <div className="p-4 border-b border-border">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {isHi ? "📝 लेबल (वैकल्पिक)" : "📝 Label (optional)"}
              </label>
              <input
                type="text"
                placeholder={isHi ? "जैसे: Math Chapter 5..." : "e.g., Revise Math Ch 5..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={200}
                className="w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
              />
            </div>

            {/* Pick dates */}
            <div className="p-4 border-b border-border">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {isHi ? `📅 तिथि चुनें (${selectedDates.length}/7)` : `📅 Pick dates (${selectedDates.length}/7)`}
              </label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className={cn("p-2 pointer-events-auto rounded-xl border border-border bg-secondary/30")}
                  modifiers={{ selected: selectedDates }}
                  modifiersClassNames={{ selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" }}
                />
              </div>
              {selectedDates.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-foreground">
                      {format(d, "dd MMM")}
                      <button onClick={() => removeDate(d)} className="ml-0.5 hover:text-destructive"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Alarm-style time picker */}
            <div className="p-4 border-b border-border">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {isHi ? "🕐 समय चुनें" : "🕐 Pick time"}
              </label>
              <AlarmTimePicker
                hour={hour}
                minute={minute}
                ampm={ampm}
                onHourChange={setHour}
                onMinuteChange={setMinute}
                onAmpmChange={setAmpm}
              />
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-2">
              <button
                onClick={() => { setShowForm(false); setText(""); setSelectedDates([]); }}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-sm font-medium text-foreground active:scale-[0.98] transition-transform"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || selectedDates.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <AlarmClock size={16} />}
                {selectedDates.length > 1
                  ? (isHi ? `${selectedDates.length} सेट करें` : `Set ${selectedDates.length}`)
                  : (isHi ? "सेट करें" : "Set Reminder")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <p className="text-sm font-bold text-foreground">
              {isHi ? "रिमाइंडर के लिए लॉगिन करें" : "Login to save reminders"}
            </p>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
              {isHi ? "सभी डिवाइसों पर सिंक करें" : "Sync across all devices"}
            </p>
          </div>
        </motion.div>
      ) : reminders.length === 0 && !showForm ? (
        <motion.div className="flex flex-col items-center justify-center py-16 text-center space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-primary/10">
            <CalendarPlus size={32} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">{isHi ? "कोई रिमाइंडर नहीं" : "No reminders yet"}</p>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
              {isHi ? "पढ़ाई का शेड्यूल बनाएं!" : "Schedule study sessions!"}
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
        <div className="space-y-4">
          {/* Upcoming */}
          {upcomingReminders.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                {isHi ? "📅 आने वाले" : "📅 Upcoming"}
              </p>
              {upcomingReminders.map((r, i) => (
                <motion.div
                  key={r.id}
                  className="rounded-xl p-3.5 bg-card border border-primary/20 flex items-start gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                    <Bell size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground break-words">{r.text || (isHi ? "रिमाइंडर" : "Reminder")}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={10} className="text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(r.scheduledAt), "dd MMM yyyy, hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform shrink-0 bg-destructive/10"
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Past */}
          {pastReminders.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                {isHi ? "✅ पूरे हुए" : "✅ Completed"}
              </p>
              {pastReminders.map((r, i) => (
                <motion.div
                  key={r.id}
                  className="rounded-xl p-3 bg-card border border-border opacity-60 flex items-start gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                    <Clock size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground break-words">{r.text || (isHi ? "रिमाइंडर" : "Reminder")}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(r.scheduledAt), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform shrink-0 bg-destructive/10"
                  >
                    <Trash2 size={12} className="text-destructive" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          )}
          {!hasMore && reminders.length > 0 && (
            <p className="text-center text-[10px] text-muted-foreground py-2">
              {isHi ? "सभी रिमाइंडर दिखाए गए" : "All reminders shown"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RemindersScreen;
