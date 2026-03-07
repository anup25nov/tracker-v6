import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { allExams } from "@/data/syllabus";

const ExamSelectScreen = () => {
  const { t, language } = useTranslation();
  const selectExam = useAppStore((s) => s.selectExam);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-5xl mb-4">📚</div>
        <h1 className="text-2xl font-bold text-foreground">{t("selectExam")}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t("selectExamSub")}</p>
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        {allExams.map((exam, index) => {
          const totalTopics = exam.subjects.reduce((a, s) => a + s.topics.length, 0);
          return (
            <motion.button
              key={exam.id}
              className="glass-card w-full p-5 text-left active:scale-[0.97] transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              onClick={() => selectExam(exam.id)}
              style={{
                borderColor: `hsl(${exam.color} / 0.3)`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="text-3xl w-14 h-14 flex items-center justify-center rounded-2xl"
                  style={{ background: `hsl(${exam.color} / 0.15)` }}
                >
                  {exam.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-foreground">
                    {language === "hi" ? exam.nameHi : exam.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {language === "hi" ? exam.descriptionHi : exam.description}
                  </p>
                  <p className="text-xs mt-1" style={{ color: `hsl(${exam.color})` }}>
                    {exam.subjects.length} {t("subjects")} • {totalTopics} {t("topics")}
                  </p>
                </div>
                <div className="text-muted-foreground text-xl">→</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ExamSelectScreen;
