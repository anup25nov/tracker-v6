import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { allExams } from "@/data/syllabus";
import { getSubjectColor } from "@/lib/subjectColors";
import ProgressBar from "@/components/ProgressBar";
import { ChevronRight, CheckCircle2, BookOpen } from "lucide-react";

interface SubjectsScreenProps {
  onSelectSubject: (subjectId: string) => void;
}

const SubjectsScreen = ({ onSelectSubject }: SubjectsScreenProps) => {
  const { t, language } = useTranslation();
  const syllabus = useAppStore((s) => s.syllabus);
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress);

  const exam = allExams.find((e) => e.id === selectedExamId);

  return (
    <div className="px-4 pt-10 pb-24 max-w-md mx-auto space-y-5">
      {/* Header with exam info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-foreground">{t("subjects")}</h1>
        {exam && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <BookOpen size={12} />
            {exam.icon} {language === "hi" ? exam.nameHi : exam.name} — {syllabus.reduce((a, s) => a + s.topics.length, 0)} {t("topics")}
          </p>
        )}
      </motion.div>

      {/* Subject list - detailed cards */}
      <div className="space-y-3">
        {syllabus.map((subject, index) => {
          const progress = getSubjectProgress(subject.id);
          const completed = subject.topics.filter((t) => t.completed).length;
          const total = subject.topics.length;
          const color = getSubjectColor(subject.id);
          const isComplete = progress === 100;

          return (
            <motion.button
              key={subject.id}
              className="w-full rounded-2xl p-4 text-left active:scale-[0.98] transition-transform overflow-hidden relative"
              style={{
                background: `hsl(var(--card))`,
                border: `1px solid hsl(${color} / 0.25)`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              onClick={() => onSelectSubject(subject.id)}
            >
              {/* Colored accent strip */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ background: `hsl(${color})` }}
              />

              <div className="flex items-center gap-4 pl-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `hsl(${color} / 0.15)` }}
                >
                  {subject.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {language === "hi" ? subject.nameHi : subject.name}
                    </h3>
                    {isComplete && <CheckCircle2 size={16} className="text-success shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {completed} {t("of")} {total} {t("topicsCompleted")}
                  </p>
                  <div className="mt-2">
                    <ProgressBar percent={progress} height={6} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-lg font-extrabold" style={{ color: `hsl(${color})` }}>
                    {progress}%
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>

              {/* Topic preview chips */}
              <div className="flex flex-wrap gap-1.5 mt-3 pl-2">
                {subject.topics.slice(0, 5).map((topic) => (
                  <span
                    key={topic.id}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      topic.completed
                        ? "bg-success/20 text-success"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {language === "hi" ? topic.nameHi : topic.name}
                  </span>
                ))}
                {subject.topics.length > 5 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                    +{subject.topics.length - 5}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectsScreen;
