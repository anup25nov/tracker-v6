import { motion } from "framer-motion";
import { Share2, MessageCircle, Youtube, Instagram, Globe, RotateCcw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";

const ProfileScreen = () => {
  const { t, language } = useTranslation();
  const setLanguage = useAppStore((s) => s.setLanguage);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const getOverallProgress = useAppStore((s) => s.getOverallProgress);
  const [showReset, setShowReset] = useState(false);

  const overall = getOverallProgress();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "SSC CGL Tracker",
        text: "Track your SSC CGL syllabus easily with this app.",
        url: window.location.href,
      });
    }
  };

  const menuItems = [
    { icon: Share2, label: t("shareApp"), onClick: handleShare },
    { icon: MessageCircle, label: t("telegram"), onClick: () => {} },
    { icon: Youtube, label: t("youtube"), onClick: () => {} },
    { icon: Instagram, label: t("instagram"), onClick: () => {} },
    {
      icon: Globe,
      label: t("changeLanguage"),
      onClick: () => setLanguage(language === "en" ? "hi" : "en"),
      trailing: language === "en" ? "हिंदी" : "English",
    },
  ];

  return (
    <div className="px-4 pt-12 pb-24 max-w-md mx-auto space-y-6">
      {/* Profile Card */}
      <motion.div
        className="glass-card p-6 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
          🎯
        </div>
        <h2 className="text-xl font-bold text-foreground">{t("sscAspirant")}</h2>
        <p className="text-sm text-muted-foreground">
          {overall.percent}% {t("completed")} • {overall.completed}/{overall.total} {t("topicsCompleted")}
        </p>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        className="glass-card overflow-hidden divide-y divide-border"
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
            <item.icon size={20} className="text-primary" />
            <span className="text-sm font-medium text-foreground flex-1 text-left">
              {item.label}
            </span>
            {item.trailing && (
              <span className="text-sm text-primary font-medium">{item.trailing}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Reset */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {!showReset ? (
          <button
            className="w-full glass-card p-4 flex items-center gap-4 active:bg-destructive/10 transition-colors"
            onClick={() => setShowReset(true)}
          >
            <RotateCcw size={20} className="text-destructive" />
            <span className="text-sm font-medium text-destructive">{t("resetProgress")}</span>
          </button>
        ) : (
          <div className="glass-card p-4 space-y-3 border-destructive/30">
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
                onClick={() => {
                  resetProgress();
                  setShowReset(false);
                }}
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
