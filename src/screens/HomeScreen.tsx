import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import ProgressRing from "@/components/ProgressRing";
import ProgressBar from "@/components/ProgressBar";

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const { t, language } = useTranslation();
  const syllabus = useAppStore((s) => s.syllabus);
  const getOverallProgress = useAppStore((s) => s.getOverallProgress);
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress);

  const overall = getOverallProgress();

  return (
    <div className="px-4 pt-12 pb-24 max-w-md mx-auto space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">{t("greeting")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("greetingSub")}</p>
      </motion.div>

      {/* Overall Progress Card */}
      <motion.div
        className="glass-card p-6 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t("overallProgress")}
        </h2>
        <ProgressRing percent={overall.percent} size={140} strokeWidth={10} />
        <p className="text-sm text-muted-foreground">
          {overall.completed} / {overall.total} {t("topicsCompleted")}
        </p>
      </motion.div>

      {/* Subject Cards */}
      <div className="space-y-3">
        {syllabus.map((subject, index) => {
          const progress = getSubjectProgress(subject.id);
          const completed = subject.topics.filter((t) => t.completed).length;
          return (
            <motion.button
              key={subject.id}
              className="glass-card w-full p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              onClick={() => onNavigate(`topics-${subject.id}`)}
            >
              <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-secondary">
                {subject.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {language === "hi" ? subject.nameHi : subject.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completed} / {subject.topics.length} {t("completed")}
                </p>
                <div className="mt-2">
                  <ProgressBar percent={progress} height={6} />
                </div>
              </div>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </motion.button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <button
          onClick={() => onNavigate("subjects")}
          className="glass-card p-4 text-center active:scale-[0.97] transition-transform"
        >
          <span className="text-sm font-semibold text-primary">{t("viewSubjects")}</span>
        </button>
        <button
          onClick={() => onNavigate("subjects")}
          className="bg-primary rounded-2xl p-4 text-center active:scale-[0.97] transition-transform"
        >
          <span className="text-sm font-semibold text-primary-foreground">{t("continueStudying")}</span>
        </button>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
