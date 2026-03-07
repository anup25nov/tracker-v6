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
    <div className="min-h-screen px-3 sm:px-4 pt-8 sm:pt-10 pb-24 max-w-lg mx-auto space-y-4 sm:space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">{t("subjects")}</h1>
        {exam && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <BookOpen size={12} />
            {exam.icon} {language === "hi" ? exam.nameHi : exam.name} — {syllabus.reduce((a, s) => a + s.topics.length, 0)} {t("topics")}
          </p>
        )}
      </motion.div>

      <div className="space-y-2.5 sm:space-y-3">
        {syllabus.map((subject, index) => {
          const progress = getSubjectProgress(subject.id);
          const completed = subject.topics.filter((t) => t.completed).length;
          const total = subject.topics.length;
          const color = getSubjectColor(subject.id);
          const isComplete = progress === 100;

          return (
            <motion.button
              key={subject.id}
              className="w-full rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-left active:scale-[0.98] transition-transform overflow-hidden relative"
              style={{
                background: `hsl(var(--card))`,
                border: `1px solid hsl(${color} / 0.25)`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              onClick={() => onSelectSubject(subject.id)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl sm:rounded-l-2xl" style={{ background: `hsl(${color})` }} />

              <div className="flex items-center gap-3 sm:gap-4 pl-2">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0"
                  style={{ background: `hsl(${color} / 0.15)` }}
                >
                  {subject.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {language === "hi" ? subject.nameHi : subject.name}
                    </h3>
                    {isComplete && <CheckCircle2 size={14} className="text-success shrink-0" />}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {completed} {t("of")} {total} {t("topicsCompleted")}
                  </p>
                  <div className="mt-1.5 sm:mt-2">
                    <ProgressBar percent={progress} height={5} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-base sm:text-lg font-extrabold" style={{ color: `hsl(${color})` }}>
                    {progress}%
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </div>

              <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2.5 sm:mt-3 pl-2">
                {subject.topics.slice(0, 4).map((topic) => (
                  <span
                    key={topic.id}
                    className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                      topic.completed ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {language === "hi" ? topic.nameHi : topic.name}
                  </span>
                ))}
                {subject.topics.length > 4 && (
                  <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                    +{subject.topics.length - 4}
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
