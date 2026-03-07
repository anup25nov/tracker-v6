import { motion } from "framer-motion";
import { ArrowLeft, Check, Trophy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { getSubjectColor } from "@/lib/subjectColors";
import { logScreenView, logTopicToggled } from "@/lib/firebase";
import { useEffect } from "react";

interface TopicsScreenProps {
  subjectId: string;
  onBack: () => void;
}

const TopicsScreen = ({ subjectId, onBack }: TopicsScreenProps) => {
  const { t, language } = useTranslation();
  const syllabus = useAppStore((s) => s.syllabus);
  const toggleTopic = useAppStore((s) => s.toggleTopic);
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress);

  const subject = syllabus.find((s) => s.id === subjectId);

  useEffect(() => {
    logScreenView(`topics_${subjectId}`);
  }, [subjectId]);

  if (!subject) return null;

  const progress = getSubjectProgress(subjectId);
  const completed = subject.topics.filter((t) => t.completed).length;
  const color = getSubjectColor(subjectId);
  const isAllDone = progress === 100;

  const handleToggle = (topicId: string) => {
    const topic = subject.topics.find((t) => t.id === topicId);
    toggleTopic(subjectId, topicId);
    logTopicToggled(subjectId, topicId, !topic?.completed);
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-4 sm:pt-6 pb-8 max-w-lg mx-auto space-y-3 sm:space-y-4">
      {/* Hero Header */}
      <motion.div
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${color} / 0.2), hsl(${color} / 0.06))`,
          border: `1px solid hsl(${color} / 0.25)`,
        }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl active:scale-95 transition-transform"
            style={{ background: `hsl(${color} / 0.15)` }}
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
              {subject.icon} {language === "hi" ? subject.nameHi : subject.name}
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              {completed} / {subject.topics.length} {t("topicsCompleted")}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-extrabold" style={{ color: `hsl(${color})` }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 sm:h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, hsl(${color}), hsl(${color} / 0.7))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Milestone indicators */}
        <div className="flex justify-between mt-1.5 px-0.5">
          {[25, 50, 75, 100].map((m) => (
            <div key={m} className="flex flex-col items-center">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  progress >= m ? "scale-125" : "opacity-30"
                }`}
                style={{ background: progress >= m ? `hsl(${color})` : `hsl(var(--muted-foreground))` }}
              />
              <span className="text-[9px] text-muted-foreground mt-0.5">{m}%</span>
            </div>
          ))}
        </div>

        {isAllDone && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-3 py-2 rounded-xl"
            style={{ background: `hsl(${color} / 0.15)` }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Trophy size={16} style={{ color: `hsl(${color})` }} />
            <span className="text-xs font-bold" style={{ color: `hsl(${color})` }}>
              {t("achievement100")}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Topics List */}
      <div className="space-y-1.5 sm:space-y-2">
        {subject.topics.map((topic, index) => (
          <motion.button
            key={topic.id}
            className="w-full flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all active:scale-[0.97]"
            style={{
              background: topic.completed
                ? `hsl(${color} / 0.08)`
                : `hsl(var(--card))`,
              borderColor: topic.completed
                ? `hsl(${color} / 0.25)`
                : `hsl(var(--border))`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.025 }}
            onClick={() => handleToggle(topic.id)}
          >
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0"
              style={{
                background: topic.completed ? `hsl(${color})` : "transparent",
                borderColor: topic.completed ? `hsl(${color})` : `hsl(var(--muted-foreground) / 0.3)`,
              }}
            >
              {topic.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Check size={12} className="text-white" />
                </motion.div>
              )}
            </div>

            <span
              className="text-[10px] sm:text-xs font-bold w-5 sm:w-6 shrink-0"
              style={{ color: topic.completed ? `hsl(${color})` : `hsl(var(--muted-foreground))` }}
            >
              {index + 1}
            </span>

            <span
              className={`text-xs sm:text-sm font-medium flex-1 text-left leading-snug ${
                topic.completed ? "line-through opacity-70" : ""
              }`}
              style={{ color: topic.completed ? `hsl(${color})` : `hsl(var(--foreground))` }}
            >
              {language === "hi" ? topic.nameHi : topic.name}
            </span>

            {topic.completed && (
              <motion.div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: `hsl(${color})` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TopicsScreen;
