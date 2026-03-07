import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { allExams } from "@/data/syllabus";
import { useState } from "react";
import { RotateCcw, ChevronRight } from "lucide-react";

interface ProfileScreenProps {
  onChangeExam: () => void;
}

// Proper brand SVG icons
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <circle cx="12" cy="12" r="12" fill="#2AABEE" />
    <path d="M5.43 11.87c2.94-1.28 4.9-2.12 5.88-2.53 2.8-1.17 3.38-1.37 3.76-1.38.08 0 .27.02.39.12.1.08.13.2.14.28.01.05.03.26.01.4-.18 1.92-.98 6.58-1.38 8.73-.17.91-.5 1.22-.82 1.25-.7.06-1.23-.46-1.9-.91-1.06-.7-1.66-1.13-2.69-1.82-1.18-.79-.42-1.23.26-1.94.18-.18 3.25-2.98 3.31-3.23.01-.03.01-.15-.06-.21s-.16-.04-.23-.02c-.1.02-1.74 1.1-4.9 3.24-.46.32-1.88.82-1.88.82s-1.39-.27-2.07-.49c-.83-.28-1.49-.43-1.43-.9.03-.25.34-.5.93-.76z" fill="white" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <rect width="24" height="24" rx="6" fill="#FF0000" />
    <path d="M17.6 8.4c-.2-.7-.7-1.2-1.4-1.4C15 6.7 12 6.7 12 6.7s-3 0-4.2.3c-.7.2-1.2.7-1.4 1.4C6 9.6 6 12 6 12s0 2.4.4 3.6c.2.7.7 1.2 1.4 1.4 1.2.3 4.2.3 4.2.3s3 0 4.2-.3c.7-.2 1.2-.7 1.4-1.4.4-1.2.4-3.6.4-3.6s0-2.4-.4-3.6z" fill="#FF0000" />
    <path d="M10.5 14.5l3.5-2.5-3.5-2.5v5z" fill="white" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <defs>
      <radialGradient id="ig-g1" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#ig-g1)" />
    <rect x="3" y="3" width="18" height="18" rx="4.5" stroke="white" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="none" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
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

const ProfileScreen = ({ onChangeExam }: ProfileScreenProps) => {
  const { t, language } = useTranslation();
  const setLanguage = useAppStore((s) => s.setLanguage);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const syllabus = useAppStore((s) => s.syllabus);
  const [showReset, setShowReset] = useState(false);

  const exam = allExams.find((e) => e.id === selectedExamId);
  const color = exam?.color || "217 91% 60%";
  const totalTopics = syllabus.reduce((a, s) => a + s.topics.length, 0);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "SSC Syllabus Tracker",
        text: `Track your ${exam?.name || "SSC"} syllabus easily with this app!`,
        url: window.location.href,
      });
    }
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
      onClick: handleShare,
      accent: "142 71% 45%",
    },
  ];

  const socialItems = [
    {
      icon: <TelegramIcon />,
      label: t("telegram"),
      onClick: () => window.open("https://t.me/warriorsiq", "_blank"),
      bg: "#2AABEE",
    },
    {
      icon: <YouTubeIcon />,
      label: t("youtube"),
      onClick: () => window.open("https://youtube.com/@mishra_maths", "_blank"),
      bg: "#FF0000",
    },
    {
      icon: <InstagramIcon />,
      label: t("instagram"),
      onClick: () => window.open("https://www.instagram.com/anupmishra_8", "_blank"),
      bg: "#E1306C",
    },
  ];

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-8 sm:pt-10 pb-24 max-w-lg mx-auto space-y-4 sm:space-y-5">
      {/* Profile Header - Exam focused */}
      <motion.div
        className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${color}), hsl(${color} / 0.75))`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: "white" }} />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10" style={{ background: "white" }} />

        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl sm:text-4xl shadow-lg">
            {exam?.icon || "🎯"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-white/60 font-medium uppercase tracking-wider">{t("changeExam")}</p>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {exam ? (language === "hi" ? exam.nameHi : exam.name) : t("selectExam")}
            </h2>
            <p className="text-[10px] sm:text-xs text-white/70 mt-1">
              {syllabus.length} {t("subjects")} • {totalTopics} {t("topics")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings Menu */}
      <motion.div
        className="rounded-2xl overflow-hidden bg-card border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
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
        transition={{ delay: 0.2 }}
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
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
    </div>
  );
};

export default ProfileScreen;
