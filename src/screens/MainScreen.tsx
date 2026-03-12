import { motion } from "framer-motion";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { allExams } from "@/data/syllabus";
import { getSubjectColor } from "@/lib/subjectColors";
import ProgressBar from "@/components/ProgressBar";
import ProgressRing from "@/components/ProgressRing";
import { ChevronRight, CheckCircle2, BookOpen, RotateCcw, Sun, Moon, ChevronDown, LogOut, Copy, Share2 } from "lucide-react";
import SSCLogo from "@/components/SSCLogo";
import { logScreenView, logExamSelected, firebaseSignOut, getCurrentUserProfile } from "@/lib/firebase";
import { useEffect } from "react";

interface MainScreenProps {
  onSelectSubject: (subjectId: string) => void;
  onChangeExam: () => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
}

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="shrink-0">
    <rect width="24" height="24" rx="6" fill="#0088CC" />
    <path
      d="M5.4 11.9c2.9-1.3 4.8-2.2 5.8-2.6 2.8-1.2 3.4-1.4 3.7-1.4.08 0 .26.02.38.11.1.08.12.18.13.26.01.05.02.24 0 .38-.17 1.8-.95 6.2-1.35 8.2-.16.85-.48 1.14-.8 1.17-.68.06-1.2-.43-1.85-.85-1.03-.66-1.62-1.06-2.64-1.7-1.15-.74-.4-1.15.25-1.82.17-.17 3.2-2.8 3.26-3.04.01-.02.01-.14-.06-.2-.07-.05-.15-.03-.22-.01-.1.02-1.7 1.08-4.8 3.18-.45.31-1.84.8-1.84.8s-1.36-.25-2.02-.46c-.82-.27-1.46-.42-1.4-.84.03-.23.33-.47.9-.72z"
      fill="white"
    />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="shrink-0">
    <rect width="24" height="24" rx="6" fill="#FF0000" />
    <path
      d="M10 8l6 4-6 4V8z"
      fill="white"
    />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="shrink-0">
    <defs>
      <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FED576" />
        <stop offset="25%" stopColor="#F47133" />
        <stop offset="50%" stopColor="#BC3081" />
        <stop offset="75%" stopColor="#4C63D2" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#instagram-gradient)" />
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="white" strokeWidth="1.8" fill="none" />
    <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.8" fill="none" />
    <circle cx="17.5" cy="6.5" r="1.25" fill="white" />
  </svg>
);

const ChangeExamIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <circle cx="12" cy="12" r="11" fill="hsl(217 91% 60% / 0.12)" stroke="hsl(217 91% 60%)" strokeWidth="1.5" />
    <path d="M8 10l4-3 4 3M8 14l4 3 4-3" stroke="hsl(217 91% 60%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LanguageIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <circle cx="12" cy="12" r="11" fill="hsl(280 73% 60% / 0.12)" stroke="hsl(280 73% 60%)" strokeWidth="1.5" />
    <ellipse cx="12" cy="12" rx="4" ry="10.5" stroke="hsl(280 73% 60%)" strokeWidth="1.2" />
    <line x1="2" y1="12" x2="22" y2="12" stroke="hsl(280 73% 60%)" strokeWidth="1.2" />
    <line x1="4" y1="7.5" x2="20" y2="7.5" stroke="hsl(280 73% 60%)" strokeWidth="0.8" />
    <line x1="4" y1="16.5" x2="20" y2="16.5" stroke="hsl(280 73% 60%)" strokeWidth="0.8" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <circle cx="12" cy="12" r="11" fill="hsl(142 71% 45% / 0.12)" stroke="hsl(142 71% 45%)" strokeWidth="1.5" />
    <path d="M12 5v10M8 9l4-4 4 4" stroke="hsl(142 71% 45%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 15v2h10v-2" stroke="hsl(142 71% 45%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="shrink-0">
    <rect width="24" height="24" rx="6" fill="#25D366" />
    <path
      d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.3-.1-.5-.15-.7.15-.2.3-.75.95-.9 1.15-.15.2-.3.2-.55.05-.25-.15-1-.4-1.9-1.25-.7-.65-1.2-1.45-1.35-1.7-.15-.25 0-.4.1-.5.1-.1.25-.3.35-.45.1-.15.15-.25.25-.4.1-.15.05-.3 0-.4s-.7-1.7-.95-2.3c-.25-.55-.5-.45-.7-.45h-.6c-.2 0-.5.1-.75.45-.25.35-1 1-1 2.4s1 2.8 1.15 3c.15.2 2.1 3.2 5.1 4.4.7.3 1.25.45 1.7.6.7.2 1.35.2 1.85.1.55-.1 1.7-.7 1.95-1.35.25-.65.25-1.2.15-1.35-.1-.15-.25-.2-.45-.35z"
      fill="white"
    />
  </svg>
);

const MainScreen = ({ onSelectSubject, onChangeExam, onOpenChat, onOpenProfile }: MainScreenProps) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const syllabus = useAppStore((s) => s.syllabus);
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress);
  const getSubjectUnits = useAppStore((s) => s.getSubjectUnits);
  const getOverallProgress = useAppStore((s) => s.getOverallProgress);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const [showReset, setShowReset] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [userProfile, setUserProfile] = useState<{ displayName: string | null; email: string | null } | null>(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  const exam = allExams.find((e) => e.id === selectedExamId);
  const overall = getOverallProgress();
  const color = exam?.color || "217 91% 60%";
  const totalTopics = overall.total;

  useEffect(() => {
    logScreenView("main_screen");
  }, []);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    getCurrentUserProfile().then(setUserProfile);
  }, [user?.uid]);

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

  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.sscexamsathi.app";
  const SHARE_TITLE = "SSC Exam Sathi – Track Every Topic, Clear Every Exam";
  const SHARE_TEXT =
    "I'm using SSC Exam Sathi to track my syllabus and never miss a topic. Simple, smart & free – perfect for SSC & Railway prep. Try it!";
  const shareFullMessage = `${SHARE_TEXT} ${PLAY_STORE_URL}`;

  const openShareSheet = () => setShowShareSheet(true);
  const closeShareSheet = () => setShowShareSheet(false);

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareFullMessage)}`, "_blank");
    closeShareSheet();
  };
  const shareViaTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(PLAY_STORE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`,
      "_blank"
    );
    closeShareSheet();
  };
  const copyShareLink = () => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(shareFullMessage);
    closeShareSheet();
  };
  const shareViaOtherApps = () => {
    if (navigator.share) {
      navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: PLAY_STORE_URL });
    }
    closeShareSheet();
  };

  const menuItems = [
    {
      icon: <ChangeExamIcon />,
      label: t("changeExam"),
      onClick: onChangeExam,
      trailing: exam ? (language === "hi" ? exam.nameHi : exam.name) : "",
      accent: "217 91% 60%",
    },
    {
      icon: <LanguageIcon />,
      label: t("changeLanguage"),
      onClick: () => setLanguage(language === "en" ? "hi" : "en"),
      trailing: language === "en" ? "हिंदी" : "English",
      accent: "280 73% 60%",
    },
    {
      icon: <ShareIcon />,
      label: t("shareApp"),
      onClick: openShareSheet,
      accent: "142 71% 45%",
    },
  ];

  const socialItems = [
    {
      icon: <TelegramIcon />,
      label: t("telegram"),
      onClick: () => window.open("https://t.me/warriorsiq", "_blank"),
    },
    {
      icon: <YouTubeIcon />,
      label: t("youtube"),
      onClick: () => window.open("https://youtube.com/@mishra_maths", "_blank"),
    },
    {
      icon: <InstagramIcon />,
      label: t("instagram"),
      onClick: () => window.open("https://www.instagram.com/anupmishra_8", "_blank"),
    },
  ];

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-6 sm:pt-8 pb-8 max-w-lg mx-auto space-y-4 sm:space-y-5">
      {/* Top Bar: Exam selector + Theme toggle */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={onChangeExam}
          className="flex items-center gap-2 px-3 py-2 rounded-xl active:scale-95 transition-transform"
          style={{
            background: `hsl(${color} / 0.1)`,
            border: `1px solid hsl(${color} / 0.25)`,
          }}
        >
          <span className="text-lg flex items-center">{selectedExamId === "ssc-cgl" ? <SSCLogo size={22} /> : (exam?.icon || "📚")}</span>
          <span className="text-xs sm:text-sm font-bold" style={{ color: `hsl(${color})` }}>
            {exam ? (language === "hi" ? exam.nameHi : exam.name) : t("selectExam")}
          </span>
          <ChevronDown size={14} style={{ color: `hsl(${color})` }} />
        </button>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-secondary active:scale-90 transition-transform"
        >
          {isDark ? <Sun size={18} className="text-warning" /> : <Moon size={18} className="text-muted-foreground" />}
        </button>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6"
        style={{
          background: `linear-gradient(135deg, hsl(142 71% 45% / 0.15), hsl(142 71% 45% / 0.04))`,
          border: `1px solid hsl(142 71% 45% / 0.2)`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4 sm:gap-5">
          <ProgressRing percent={overall.percent} size={80} strokeWidth={7} color="142 71% 45%" />
          <div className="flex-1 space-y-1">
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("overallProgress")}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: "hsl(142 71% 45%)" }}>{overall.completed}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">/ {overall.total}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{t("topicsCompleted")}</p>
          </div>

          {/* AI Chat Button */}
          <motion.button
            onClick={onOpenChat}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-visible"
            style={{
              background: `conic-gradient(from var(--ai-angle, 0deg), hsl(280 80% 55%), hsl(200 90% 55%), hsl(330 85% 55%), hsl(45 95% 55%), hsl(280 80% 55%))`,
              padding: '2px',
            }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.85 }}
            animate={{
              "--ai-angle": ["0deg", "360deg"],
              boxShadow: [
                "0 0 15px hsl(280 80% 55% / 0.4), 0 0 30px hsl(200 90% 55% / 0.2)",
                "0 0 25px hsl(330 85% 55% / 0.5), 0 0 50px hsl(45 95% 55% / 0.3)",
                "0 0 15px hsl(280 80% 55% / 0.4), 0 0 30px hsl(200 90% 55% / 0.2)",
              ],
            } as any}
            transition={{
              "--ai-angle": { duration: 3, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            } as any}
          >
            {/* Inner dark circle */}
            <div className="absolute inset-[2px] rounded-[14px] bg-background flex items-center justify-center">
              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: `hsl(${[280, 200, 330, 45, 160, 280][i]} ${80}% ${60}%)`,
                    filter: `blur(0.5px)`,
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.2, 0.8, 0],
                    x: [0, Math.cos((i * Math.PI) / 3) * 20, Math.cos((i * Math.PI) / 3 + 1) * 24, 0],
                    y: [0, Math.sin((i * Math.PI) / 3) * 20, Math.sin((i * Math.PI) / 3 + 1) * 24, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
              {/* Core AI icon */}
              <motion.svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                className="relative z-10"
              >
                <motion.path
                  d="M12 2L13.5 9.5L20 12L13.5 14.5L12 22L10.5 14.5L4 12L10.5 9.5Z"
                  fill="url(#aiGrad)"
                  animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                  transition={{ rotate: { duration: 6, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                  style={{ transformOrigin: "12px 12px" }}
                />
                <motion.path
                  d="M18 3L18.8 5.2L21 6L18.8 6.8L18 9L17.2 6.8L15 6L17.2 5.2Z"
                  fill="url(#aiGrad2)"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1.4, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  style={{ transformOrigin: "18px 6px" }}
                />
                <motion.path
                  d="M6 15L6.6 16.4L8 17L6.6 17.6L6 19L5.4 17.6L4 17L5.4 16.4Z"
                  fill="url(#aiGrad3)"
                  animate={{ opacity: [0.1, 1, 0.1], scale: [0.4, 1.5, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }}
                  style={{ transformOrigin: "6px 17px" }}
                />
                <defs>
                  <linearGradient id="aiGrad" x1="4" y1="2" x2="20" y2="22">
                    <stop offset="0%" stopColor="hsl(280 80% 60%)" />
                    <stop offset="50%" stopColor="hsl(200 90% 60%)" />
                    <stop offset="100%" stopColor="hsl(330 85% 60%)" />
                  </linearGradient>
                  <linearGradient id="aiGrad2" x1="15" y1="3" x2="21" y2="9">
                    <stop offset="0%" stopColor="hsl(45 95% 60%)" />
                    <stop offset="100%" stopColor="hsl(330 85% 60%)" />
                  </linearGradient>
                  <linearGradient id="aiGrad3" x1="4" y1="15" x2="8" y2="19">
                    <stop offset="0%" stopColor="hsl(160 70% 50%)" />
                    <stop offset="100%" stopColor="hsl(200 90% 60%)" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Subjects List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-1.5 mb-3">
          <BookOpen size={14} className="text-primary" />
          <h2 className="text-xs sm:text-sm font-bold text-foreground">
            {t("subjects")} ({syllabus.length})
          </h2>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {syllabus.map((subject, index) => {
            const progress = getSubjectProgress(subject.id);
            const units = getSubjectUnits(subject.id);
            const subjectColor = getSubjectColor(subject.id);
            const isComplete = progress === 100;

            return (
              <motion.button
                key={subject.id}
                className="w-full rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-left active:scale-[0.98] transition-transform overflow-hidden relative bg-card"
                style={{
                  border: `1px solid hsl(${subjectColor} / 0.25)`,
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.2 + index * 0.06 }}
                onClick={() => onSelectSubject(subject.id)}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl sm:rounded-l-2xl" style={{ background: `hsl(${subjectColor})` }} />

                <div className="flex items-center gap-3 sm:gap-4 pl-2">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0"
                    style={{ background: `hsl(${subjectColor} / 0.15)` }}
                  >
                    {subject.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {language === "hi" ? subject.nameHi : subject.name}
                      </h3>
                      {isComplete && <CheckCircle2 size={14} className="text-success shrink-0" />}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      {units.completed} {t("of")} {units.total} {t("topicsCompleted")}
                    </p>
                    <div className="mt-1.5 sm:mt-2">
                      <ProgressBar percent={progress} height={5} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-base sm:text-lg font-extrabold" style={{ color: `hsl(${subjectColor})` }}>
                      {progress}%
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        className="rounded-2xl overflow-hidden bg-card border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-3.5 p-3.5 sm:p-4 active:bg-secondary/50 transition-colors border-b border-border last:border-0"
            onClick={item.onClick}
          >
            {item.icon}
            <span className="text-xs sm:text-sm font-medium text-foreground flex-1 text-left">{item.label}</span>
            {item.trailing && (
              <span className="text-xs font-semibold" style={{ color: `hsl(${item.accent})` }}>
                {item.trailing}
              </span>
            )}
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </motion.div>

      {/* Social Links */}
      <motion.div
        className="flex gap-2.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {socialItems.map((item, index) => (
          <button
            key={index}
            className="flex-1 flex items-center justify-center gap-2 p-3 sm:p-3.5 rounded-2xl bg-card border border-border active:scale-95 transition-transform"
            onClick={item.onClick}
          >
            {item.icon}
            <span className="text-[10px] sm:text-xs font-medium text-foreground hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Reset */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        {!showReset ? (
          <button
            className="w-full rounded-2xl bg-destructive/5 border border-destructive/20 p-3.5 sm:p-4 flex items-center gap-3 active:bg-destructive/10 transition-colors"
            onClick={() => setShowReset(true)}
          >
            <RotateCcw size={18} className="text-destructive" />
            <span className="text-xs sm:text-sm font-medium text-destructive">{t("resetProgress")}</span>
          </button>
        ) : (
          <div className="rounded-2xl bg-card border border-destructive/30 p-4 space-y-3">
            <p className="text-xs sm:text-sm text-foreground">{t("resetConfirm")}</p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-secondary rounded-xl p-3 text-xs sm:text-sm font-medium text-foreground active:scale-95 transition-transform"
                onClick={() => setShowReset(false)}
              >
                {t("cancel")}
              </button>
              <button
                className="flex-1 bg-destructive rounded-xl p-3 text-xs sm:text-sm font-medium text-destructive-foreground active:scale-95 transition-transform"
                onClick={() => { resetProgress(); setShowReset(false); }}
              >
                {t("reset")}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Share sheet */}
      {showShareSheet && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4"
          role="dialog"
          aria-label={t("shareApp")}
        >
          <button
            className="absolute inset-0 bg-black/50"
            onClick={closeShareSheet}
            aria-label={t("cancel")}
          />
          <motion.div
            className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-card border border-border p-5 pb-safe space-y-4 shadow-xl"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <p className="text-sm font-semibold text-foreground text-center">{t("shareApp")}</p>
            <p className="text-xs text-muted-foreground text-center -mt-2">
              {language === "hi" ? "ऐप लिंक शेयर करें" : "Share the app link with friends"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 active:scale-[0.98] transition-transform"
              >
                <WhatsAppIcon />
                <span className="text-xs font-medium text-foreground">WhatsApp</span>
              </button>
              <button
                onClick={shareViaTelegram}
                className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-[#0088CC]/10 border border-[#0088CC]/30 active:scale-[0.98] transition-transform"
              >
                <TelegramIcon />
                <span className="text-xs font-medium text-foreground">Telegram</span>
              </button>
              <button
                onClick={copyShareLink}
                className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-secondary border border-border active:scale-[0.98] transition-transform"
              >
                <Copy size={22} className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{language === "hi" ? "लिंक कॉपी करें" : "Copy link"}</span>
              </button>
              {navigator.share && (
                <button
                  onClick={shareViaOtherApps}
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-secondary border border-border active:scale-[0.98] transition-transform"
                >
                  <Share2 size={22} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{language === "hi" ? "अन्य ऐप्स" : "More apps"}</span>
                </button>
              )}
            </div>
            <button
              onClick={closeShareSheet}
              className="w-full py-3 rounded-xl text-xs font-medium text-muted-foreground bg-secondary active:bg-secondary/80 transition-colors"
            >
              {t("cancel")}
            </button>
          </motion.div>
        </div>
      )}

      {/* Logout */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          {!showLogout ? (
            <button
              className="w-full rounded-2xl bg-card border border-border p-3.5 sm:p-4 flex items-center gap-3 active:bg-secondary/50 transition-colors"
              onClick={() => setShowLogout(true)}
            >
              <LogOut size={18} className="text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium text-foreground">{t("logout")}</span>
              <span className="ml-auto text-[10px] text-muted-foreground truncate max-w-[140px]">
                {userProfile?.displayName || userProfile?.email || user.email || ""}
              </span>
            </button>
          ) : (
            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <p className="text-xs sm:text-sm text-foreground">{t("logoutConfirm")}</p>
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-secondary rounded-xl p-3 text-xs sm:text-sm font-medium text-foreground active:scale-95 transition-transform"
                  onClick={() => setShowLogout(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  className="flex-1 bg-destructive rounded-xl p-3 text-xs sm:text-sm font-medium text-destructive-foreground active:scale-95 transition-transform"
                  onClick={() => {
                    firebaseSignOut();
                    localStorage.removeItem("skipped-login");
                    setShowLogout(false);
                  }}
                >
                  {t("logout")}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MainScreen;
