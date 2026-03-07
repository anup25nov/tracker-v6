import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect } from "react";

const AchievementPopup = () => {
  const lastAchievement = useAppStore((s) => s.lastAchievement);
  const clearAchievement = useAppStore((s) => s.clearAchievement);
  const syllabus = useAppStore((s) => s.syllabus);
  const { t, language } = useTranslation();

  useEffect(() => {
    if (lastAchievement) {
      const timer = setTimeout(clearAchievement, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAchievement, clearAchievement]);

  if (!lastAchievement) return null;

  const subject = syllabus.find((s) => s.id === lastAchievement.subjectId);
  const subjectName = subject ? (language === "hi" ? subject.nameHi : subject.name) : "";

  const milestoneKey = `achievement${lastAchievement.milestone}` as string;
  const msgKey = `achievementMsg${lastAchievement.milestone}` as string;

  const getBgGradient = () => {
    switch (lastAchievement.milestone) {
      case 100: return "from-achievement-gold/20 to-achievement-gold/5 border-achievement-gold/50";
      case 75: return "from-accent/20 to-accent/5 border-accent/50";
      case 50: return "from-warning/20 to-warning/5 border-warning/50";
      default: return "from-primary/20 to-primary/5 border-primary/50";
    }
  };

  const getEmoji = () => {
    switch (lastAchievement.milestone) {
      case 100: return "🏆";
      case 75: return "💪";
      case 50: return "🔥";
      default: return "🌟";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={clearAchievement}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        <motion.div
          className={`relative glass-card bg-gradient-to-b ${getBgGradient()} border p-8 text-center max-w-sm w-full`}
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {getEmoji()}
          </motion.div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {t(milestoneKey)}
          </h2>
          <p className="text-sm text-muted-foreground mb-2">{subjectName}</p>
          <p className="text-sm text-muted-foreground">{t(msgKey)}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementPopup;
