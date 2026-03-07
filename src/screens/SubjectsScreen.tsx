import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import ProgressBar from "@/components/ProgressBar";

interface SubjectsScreenProps {
  onSelectSubject: (subjectId: string) => void;
}

const SubjectsScreen = ({ onSelectSubject }: SubjectsScreenProps) => {
  const { t, language } = useTranslation();
  const syllabus = useAppStore((s) => s.syllabus);
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress);

  return (
    <div className="px-4 pt-12 pb-24 max-w-md mx-auto space-y-6">
      <motion.h1
        className="text-2xl font-bold text-foreground"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {t("subjects")}
      </motion.h1>

      <div className="space-y-4">
        {syllabus.map((subject, index) => {
          const progress = getSubjectProgress(subject.id);
          const completed = subject.topics.filter((t) => t.completed).length;
          const total = subject.topics.length;

          return (
            <motion.button
              key={subject.id}
              className="glass-card w-full p-5 text-left active:scale-[0.98] transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => onSelectSubject(subject.id)}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl w-14 h-14 flex items-center justify-center rounded-2xl bg-secondary">
                  {subject.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-foreground">
                    {language === "hi" ? subject.nameHi : subject.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {completed} {t("of")} {total} {t("topicsCompleted")}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">{progress}%</span>
              </div>
              <ProgressBar percent={progress} height={8} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectsScreen;
