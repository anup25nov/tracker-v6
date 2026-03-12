import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft, Sun, Moon, Phone, Save, Loader2, User as UserIcon, Mail, LogOut, Sparkles, RotateCcw, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserProfile, firebaseSignOut } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isProfileBoosterQuizEnabled } from "@/lib/featureFlags";
import { getAllQuizResults, getAvailableQuizTopics, type QuizResult } from "@/lib/boosterQuiz";
import { useAppStore } from "@/store/useAppStore";

interface ProfileScreenProps {
  onBack: () => void;
  onStartQuiz?: (topicId: string, topicName: string, topicNameHi: string) => void;
}

const ProfileScreen = ({ onBack, onStartQuiz }: ProfileScreenProps) => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const syllabus = useAppStore((s) => s.syllabus);
  const [userProfile, setUserProfile] = useState<{ displayName: string | null; email: string | null } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedPhone, setSavedPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") !== "light");
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [availableQuizTopics, setAvailableQuizTopics] = useState<string[]>([]);
  const featureEnabled = isProfileBoosterQuizEnabled();

  useEffect(() => {
    if (!user) return;
    getCurrentUserProfile().then(setUserProfile);
    const loadPhone = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const phone = snap.data()?.phoneNumber || "";
          setPhoneNumber(phone);
          setSavedPhone(phone);
        }
      } catch (e) {
        console.error("Error loading phone:", e);
      }
    };
    loadPhone();

    if (featureEnabled) {
      getAllQuizResults(user.uid).then(setQuizResults);
      getAvailableQuizTopics().then(setAvailableQuizTopics);
    }
  }, [user?.uid, featureEnabled]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const savePhoneNumber = async () => {
    if (!user || phoneNumber === savedPhone) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { phoneNumber }, { merge: true });
      setSavedPhone(phoneNumber);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error("Error saving phone:", e);
    } finally {
      setSaving(false);
    }
  };

  // Build quiz topic info from syllabus
  const getTopicInfo = (topicId: string) => {
    for (const subject of syllabus) {
      const topic = subject.topics.find((t) => t.id === topicId);
      if (topic) return { name: topic.name, nameHi: topic.nameHi };
    }
    return null;
  };

  // Get latest result per topic
  const latestResultsByTopic = new Map<string, QuizResult>();
  for (const r of quizResults) {
    if (!latestResultsByTopic.has(r.topicId)) {
      latestResultsByTopic.set(r.topicId, r);
    }
  }

  const displayName = userProfile?.displayName || user?.displayName || (language === "hi" ? "उपयोगकर्ता" : "User");
  const email = userProfile?.email || user?.email || "";
  const photoURL = user?.photoURL || null;
  const initial = displayName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-6 sm:pt-8 pb-8 max-w-lg mx-auto space-y-4 sm:space-y-5">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary active:scale-90 transition-transform">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-foreground">
          {language === "hi" ? "प्रोफ़ाइल" : "Profile"}
        </h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-card border border-border" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-4">
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-primary/20" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <span className="text-2xl sm:text-3xl font-bold text-primary">{initial}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">{displayName}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{email}</p>
          </div>
        </div>
      </motion.div>

      {/* Details Card */}
      <motion.div className="rounded-2xl bg-card border border-border overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center gap-3 p-3.5 sm:p-4 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <UserIcon size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{language === "hi" ? "नाम" : "Name"}</p>
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 sm:p-4 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Mail size={16} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{language === "hi" ? "ईमेल" : "Email"}</p>
            <p className="text-sm font-medium text-foreground truncate">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 sm:p-4">
          <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
            <Phone size={16} className="text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{language === "hi" ? "फ़ोन नंबर" : "Phone Number"}</p>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+\-\s]/g, ''))}
                placeholder={language === "hi" ? "फ़ोन नंबर दर्ज करें" : "Enter phone number"}
                className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {phoneNumber !== savedPhone && (
                <button onClick={savePhoneNumber} disabled={saving} className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="text-primary-foreground animate-spin" /> : <Save size={14} className="text-primary-foreground" />}
                </button>
              )}
              {saveSuccess && (
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs text-success font-medium">✓</motion.span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theme Toggle */}
      <motion.div className="rounded-2xl bg-card border border-border overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-3.5 sm:p-4 active:bg-secondary/50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            {isDark ? <Sun size={16} className="text-warning" /> : <Moon size={16} className="text-muted-foreground" />}
          </div>
          <span className="text-sm font-medium text-foreground flex-1 text-left">{language === "hi" ? "थीम बदलें" : "Toggle Theme"}</span>
          <span className="text-xs text-muted-foreground">{isDark ? (language === "hi" ? "डार्क" : "Dark") : (language === "hi" ? "लाइट" : "Light")}</span>
        </button>
      </motion.div>

      {/* Booster Quiz Section */}
      {featureEnabled && availableQuizTopics.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles size={14} className="text-primary" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              {language === "hi" ? "बूस्टर क्विज़" : "Booster Quizzes"}
            </h2>
          </div>
          <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
            {availableQuizTopics.map((topicId) => {
              const topicInfo = getTopicInfo(topicId);
              const result = latestResultsByTopic.get(topicId);
              const topicDisplayName = topicInfo
                ? (language === "hi" ? topicInfo.nameHi : topicInfo.name)
                : topicId;

              return (
                <button
                  key={topicId}
                  className="w-full flex items-center gap-3 p-3.5 sm:p-4 active:bg-secondary/50 transition-colors text-left"
                  onClick={() => {
                    if (onStartQuiz && topicInfo) {
                      onStartQuiz(topicId, topicInfo.name, topicInfo.nameHi);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{topicDisplayName}</p>
                    {result ? (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {language === "hi" ? "स्कोर" : "Score"}: {result.score}/{result.totalQuestions} ({Math.round((result.score / result.totalQuestions) * 100)}%)
                      </p>
                    ) : (
                      <p className="text-[10px] text-primary mt-0.5">
                        {language === "hi" ? "अभी तक नहीं किया" : "Not attempted"}
                      </p>
                    )}
                  </div>
                  {result ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <RotateCcw size={12} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{language === "hi" ? "दोबारा" : "Re-test"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-medium text-primary">{language === "hi" ? "शुरू करें" : "Start"}</span>
                      <ChevronRight size={12} className="text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Logout */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {!showLogout ? (
            <button
              className="w-full rounded-2xl bg-destructive/5 border border-destructive/20 p-3.5 sm:p-4 flex items-center gap-3 active:bg-destructive/10 transition-colors"
              onClick={() => setShowLogout(true)}
            >
              <LogOut size={18} className="text-destructive" />
              <span className="text-xs sm:text-sm font-medium text-destructive">{language === "hi" ? "लॉग आउट" : "Logout"}</span>
            </button>
          ) : (
            <div className="rounded-2xl bg-card border border-destructive/30 p-4 space-y-3">
              <p className="text-xs sm:text-sm text-foreground">{language === "hi" ? "क्या आप लॉग आउट करना चाहते हैं?" : "Are you sure you want to logout?"}</p>
              <div className="flex gap-3">
                <button className="flex-1 bg-secondary rounded-xl p-3 text-xs sm:text-sm font-medium text-foreground active:scale-95 transition-transform" onClick={() => setShowLogout(false)}>
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  className="flex-1 bg-destructive rounded-xl p-3 text-xs sm:text-sm font-medium text-destructive-foreground active:scale-95 transition-transform"
                  onClick={() => { firebaseSignOut(); localStorage.removeItem("skipped-login"); setShowLogout(false); onBack(); }}
                >
                  {language === "hi" ? "लॉग आउट" : "Logout"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ProfileScreen;
