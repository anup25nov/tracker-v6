import { motion } from "framer-motion";
import { Share2, Globe, RotateCcw, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { allExams } from "@/data/syllabus";
import { useState } from "react";

interface ProfileScreenProps {
  onChangeExam: () => void;
}

// Inline SVG brand icons
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.07 1.32-5.84 3.87-.55.38-1.05.56-1.5.55-.49-.01-1.44-.28-2.15-.51-.87-.29-1.56-.44-1.5-.93.03-.26.38-.52 1.06-.79 4.15-1.81 6.93-3 8.32-3.6 3.97-1.65 4.79-1.94 5.33-1.95.12 0 .38.03.55.17.14.12.18.28.2.45-.01.06.01.24 0 .37z" fill="#29B6F6"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19 31.68 31.68 0 000 12a31.68 31.68 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.68 31.68 0 0024 12a31.68 31.68 0 00-.5-5.81z" fill="#FF0000"/>
    <path d="M9.55 15.57V8.43L15.82 12l-6.27 3.57z" fill="white"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <defs>
      <linearGradient id="ig" x1="0" y1="24" x2="24" y2="0">
        <stop offset="0%" stopColor="#FD5"/>
        <stop offset="50%" stopColor="#FF543E"/>
        <stop offset="100%" stopColor="#C837AB"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)"/>
    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
  </svg>
);

const ProfileScreen = ({ onChangeExam }: ProfileScreenProps) => {
  const { t, language } = useTranslation();
  const setLanguage = useAppStore((s) => s.setLanguage);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const getOverallProgress = useAppStore((s) => s.getOverallProgress);
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const [showReset, setShowReset] = useState(false);

  const overall = getOverallProgress();
  const exam = allExams.find((e) => e.id === selectedExamId);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "SSC Syllabus Tracker",
        text: "Track your SSC syllabus easily with this app.",
        url: window.location.href,
      });
    }
  };

  const menuItems = [
    { icon: <RefreshCw size={20} className="text-primary" />, label: t("changeExam"), onClick: onChangeExam, trailing: exam ? (language === "hi" ? exam.nameHi : exam.name) : "" },
    { icon: <Globe size={20} className="text-primary" />, label: t("changeLanguage"), onClick: () => setLanguage(language === "en" ? "hi" : "en"), trailing: language === "en" ? "हिंदी" : "English" },
    { icon: <Share2 size={20} className="text-primary" />, label: t("shareApp"), onClick: handleShare },
    { icon: <TelegramIcon />, label: t("telegram"), onClick: () => {} },
    { icon: <YouTubeIcon />, label: t("youtube"), onClick: () => {} },
    { icon: <InstagramIcon />, label: t("instagram"), onClick: () => {} },
  ];

  return (
    <div className="px-4 pt-10 pb-24 max-w-md mx-auto space-y-5">
      {/* Profile Header */}
      <motion.div
        className="rounded-3xl p-6 flex flex-col items-center gap-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${exam?.color || "217 91% 60%"} / 0.15), hsl(${exam?.color || "217 91% 60%"} / 0.05))`,
          border: `1px solid hsl(${exam?.color || "217 91% 60%"} / 0.2)`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
          style={{ background: `hsl(${exam?.color || "217 91% 60%"} / 0.2)` }}
        >
          🎯
        </div>
        <h2 className="text-xl font-bold text-foreground">{t("sscAspirant")}</h2>
        {exam && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: `hsl(${exam.color} / 0.15)`, color: `hsl(${exam.color})` }}
          >
            {exam.icon} {language === "hi" ? exam.nameHi : exam.name}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {overall.percent}% {t("completed")} • {overall.completed}/{overall.total} {t("topicsCompleted")}
        </p>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        className="rounded-2xl overflow-hidden divide-y divide-border bg-card border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-4 p-4 active:bg-secondary/50 transition-colors"
            onClick={item.onClick}
          >
            {item.icon}
            <span className="text-sm font-medium text-foreground flex-1 text-left">{item.label}</span>
            {item.trailing && <span className="text-sm text-primary font-medium">{item.trailing}</span>}
          </button>
        ))}
      </motion.div>

      {/* Reset */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {!showReset ? (
          <button
            className="w-full rounded-2xl bg-card border border-border p-4 flex items-center gap-4 active:bg-destructive/10 transition-colors"
            onClick={() => setShowReset(true)}
          >
            <RotateCcw size={20} className="text-destructive" />
            <span className="text-sm font-medium text-destructive">{t("resetProgress")}</span>
          </button>
        ) : (
          <div className="rounded-2xl bg-card border border-destructive/30 p-4 space-y-3">
            <p className="text-sm text-foreground">{t("resetConfirm")}</p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-secondary rounded-xl p-3 text-sm font-medium text-foreground active:scale-95 transition-transform"
                onClick={() => setShowReset(false)}
              >
                {t("cancel")}
              </button>
              <button
                className="flex-1 bg-destructive rounded-xl p-3 text-sm font-medium text-destructive-foreground active:scale-95 transition-transform"
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
