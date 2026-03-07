import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { allExams } from "@/data/syllabus";
import ProgressRing from "@/components/ProgressRing";
import ProgressBar from "@/components/ProgressBar";
import { BookOpen, Target, TrendingUp, ChevronRight } from "lucide-react";

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const { t, language } = useTranslation();
  const syllabus = useAppStore((s) => s.syllabus);
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const getOverallProgress = useAppStore((s) => s.getOverallProgress);
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress);
  const getWeakestSubject = useAppStore((s) => s.getWeakestSubject);
  const getFirstIncompleteSubject = useAppStore((s) => s.getFirstIncompleteSubject);

  const overall = getOverallProgress();
  const exam = allExams.find((e) => e.id === selectedExamId);
  const weakest = getWeakestSubject();
  const firstIncomplete = getFirstIncompleteSubject();

  return (
    <div className="px-4 pt-12 pb-24 max-w-md mx-auto space-y-5">
      {/* Greeting + Exam badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">{t("greeting")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("greetingSub")}</p>
        {exam && (
          <div
            className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: `hsl(${exam.color} / 0.15)`,
              color: `hsl(${exam.color})`,
            }}
          >
            {exam.icon} {language === "hi" ? exam.nameHi : exam.name}
          </div>
        )}
      </motion.div>

      {/* Overall Progress Card */}
      <motion.div
        className="glass-card p-6 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t("overallProgress")}
        </h2>
        <ProgressRing percent={overall.percent} size={130} strokeWidth={10} />
        <p className="text-sm text-muted-foreground">
          {overall.completed} / {overall.total} {t("topicsCompleted")}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="glass-card p-3 text-center">
          <BookOpen size={18} className="text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{overall.total}</p>
          <p className="text-[10px] text-muted-foreground">{t("totalTopics")}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Target size={18} className="text-success mx-auto mb-1" />
          <p className="text-lg font-bold text-success">{overall.completed}</p>
          <p className="text-[10px] text-muted-foreground">{t("completedTopics")}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <TrendingUp size={18} className="text-warning mx-auto mb-1" />
          <p className="text-lg font-bold text-warning">{overall.total - overall.completed}</p>
          <p className="text-[10px] text-muted-foreground">{t("remainingTopics")}</p>
        </div>
      </motion.div>

      {/* Continue Studying - goes to weakest/first incomplete subject */}
      {firstIncomplete && (
        <motion.button
          className="w-full bg-primary rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-transform"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => onNavigate(`topics-${firstIncomplete.id}`)}
        >
          <div className="text-2xl">{firstIncomplete.icon}</div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-primary-foreground">{t("continueStudying")}</p>
            <p className="text-xs text-primary-foreground/70">
              {language === "hi" ? firstIncomplete.nameHi : firstIncomplete.name}
            </p>
          </div>
          <ChevronRight size={20} className="text-primary-foreground" />
        </motion.button>
      )}

      {/* Weakest Subject Alert */}
      {weakest && overall.completed > 0 && (
        <motion.button
          className="w-full glass-card p-4 flex items-center gap-3 border-warning/30 active:scale-[0.97] transition-transform"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={() => onNavigate(`topics-${weakest.id}`)}
        >
          <div className="text-2xl">{weakest.icon}</div>
          <div className="flex-1 text-left">
            <p className="text-xs font-medium text-warning">{t("weakestSubject")}</p>
            <p className="text-sm font-semibold text-foreground">
              {language === "hi" ? weakest.nameHi : weakest.name}
            </p>
          </div>
          <span className="text-sm font-bold text-warning">
            {getSubjectProgress(weakest.id)}%
          </span>
        </motion.button>
      )}

      {/* Subject Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("subjectProgress")}
        </h3>
        <div className="space-y-2">
          {syllabus.map((subject) => {
            const progress = getSubjectProgress(subject.id);
            return (
              <button
                key={subject.id}
                className="w-full glass-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
                onClick={() => onNavigate(`topics-${subject.id}`)}
              >
                <span className="text-xl">{subject.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {language === "hi" ? subject.nameHi : subject.name}
                  </p>
                  <div className="mt-1.5">
                    <ProgressBar percent={progress} height={5} />
                  </div>
                </div>
                <span className="text-xs font-bold text-primary min-w-[36px] text-right">{progress}%</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
