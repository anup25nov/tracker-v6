import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { allExams } from "@/data/syllabus";
import { getSubjectColor } from "@/lib/subjectColors";
import ProgressRing from "@/components/ProgressRing";
import { ChevronRight, Flame, Zap } from "lucide-react";

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
}

const MiniDonut = ({ percent, color, size = 52 }: { percent: number; color: string; size?: number }) => {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={`hsl(${color})`} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      />
    </svg>
  );
};

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const { t, language } = useTranslation();
  const syllabus = useAppStore((s) => s.syllabus);
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const getOverallProgress = useAppStore((s) => s.getOverallProgress);
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress);
  const getFirstIncompleteSubject = useAppStore((s) => s.getFirstIncompleteSubject);

  const overall = getOverallProgress();
  const exam = allExams.find((e) => e.id === selectedExamId);
  const firstIncomplete = getFirstIncompleteSubject();

  return (
    <div className="px-4 pt-10 pb-24 max-w-md mx-auto space-y-5">
      {/* Header with exam selector */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("greeting")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("greetingSub")}</p>
        </div>
        {exam && (
          <button
            onClick={() => onNavigate("profile")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-transform"
            style={{
              background: `hsl(${exam.color} / 0.15)`,
              color: `hsl(${exam.color})`,
              border: `1px solid hsl(${exam.color} / 0.3)`,
            }}
          >
            {exam.icon} {language === "hi" ? exam.nameHi : exam.name}
          </button>
        )}
      </motion.div>

      {/* Hero Progress Card */}
      <motion.div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: `linear-gradient(135deg, hsl(${exam?.color || "217 91% 60%"} / 0.15), hsl(${exam?.color || "217 91% 60%"} / 0.05))`,
          border: `1px solid hsl(${exam?.color || "217 91% 60%"} / 0.2)`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-5">
          <ProgressRing percent={overall.percent} size={110} strokeWidth={9} />
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("overallProgress")}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-foreground">{overall.completed}</span>
              <span className="text-sm text-muted-foreground">/ {overall.total}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("topicsCompleted")}</p>
            {overall.percent > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: `hsl(${exam?.color || "217 91% 60%"})` }}>
                <Flame size={14} /> {overall.percent >= 50 ? "🔥" : "📈"} {t("letsGo")}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Continue Studying */}
      {firstIncomplete && (
        <motion.button
          className="w-full rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-transform"
          style={{
            background: `linear-gradient(135deg, hsl(${getSubjectColor(firstIncomplete.id)}), hsl(${getSubjectColor(firstIncomplete.id)} / 0.8))`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onNavigate(`topics-${firstIncomplete.id}`)}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
            {firstIncomplete.icon}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-white">{t("continueStudying")}</p>
            <p className="text-xs text-white/70">
              {language === "hi" ? firstIncomplete.nameHi : firstIncomplete.name}
            </p>
          </div>
          <ChevronRight size={20} className="text-white/80" />
        </motion.button>
      )}

      {/* Subject Cards - 2x2 Grid with Donut Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap size={16} className="text-warning" /> {t("subjectProgress")}
          </h3>
          <button
            onClick={() => onNavigate("subjects")}
            className="text-xs font-medium text-primary"
          >
            {t("viewSubjects")} →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {syllabus.map((subject, index) => {
            const progress = getSubjectProgress(subject.id);
            const color = getSubjectColor(subject.id);
            const completed = subject.topics.filter((t) => t.completed).length;

            return (
              <motion.button
                key={subject.id}
                className="relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.96] transition-transform"
                style={{
                  background: `linear-gradient(145deg, hsl(${color} / 0.12), hsl(${color} / 0.04))`,
                  border: `1px solid hsl(${color} / 0.2)`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.35 + index * 0.08 }}
                onClick={() => onNavigate(`topics-${subject.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl">{subject.icon}</span>
                  <MiniDonut percent={progress} color={color} size={44} />
                </div>
                <p className="text-xs font-bold text-foreground leading-tight mb-1">
                  {language === "hi" ? subject.nameHi : subject.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {completed}/{subject.topics.length} {t("completed")}
                </p>
                <div className="mt-2 w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `hsl(${color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 + index * 0.08 }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
