import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import ProgressBar from "@/components/ProgressBar";

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
  if (!subject) return null;

  const progress = getSubjectProgress(subjectId);
  const completed = subject.topics.filter((t) => t.completed).length;

  return (
    <div className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-4">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">
            {language === "hi" ? subject.nameHi : subject.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {completed} / {subject.topics.length} {t("completed")}
          </p>
        </div>
        <span className="text-lg font-bold text-primary">{progress}%</span>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <ProgressBar percent={progress} height={10} />
      </motion.div>

      {/* Topics List */}
      <div className="space-y-2">
        {subject.topics.map((topic, index) => (
          <motion.button
            key={topic.id}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all active:scale-[0.98] ${
              topic.completed
                ? "bg-primary/10 border-primary/30"
                : "bg-card border-border"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            onClick={() => toggleTopic(subjectId, topic.id)}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                topic.completed
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              }`}
            >
              {topic.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Check size={14} className="text-primary-foreground" />
                </motion.div>
              )}
            </div>
            <span className="text-xs font-medium text-muted-foreground w-6">
              {index + 1}.
            </span>
            <span
              className={`text-sm font-medium flex-1 text-left ${
                topic.completed ? "text-primary line-through" : "text-foreground"
              }`}
            >
              {language === "hi" ? topic.nameHi : topic.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TopicsScreen;
