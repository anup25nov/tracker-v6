import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { allExams, countExamUnits } from "@/data/syllabus";
import { Lock } from "lucide-react";
import SSCLogo from "@/components/SSCLogo";

const EXAM_IDS_ON_SELECT = ["ssc-cgl", "railway", "bank"] as const;

interface ExamSelectScreenProps {
  onExamSelected?: () => void;
}

const ExamSelectScreen = ({ onExamSelected }: ExamSelectScreenProps) => {
  const { t, language } = useTranslation();
  const selectExam = useAppStore((s) => s.selectExam);
  const examsToShow = allExams.filter((e) => EXAM_IDS_ON_SELECT.includes(e.id as (typeof EXAM_IDS_ON_SELECT)[number]));

  const handleSelect = (examId: string) => {
    if (examId !== "ssc-cgl") return; // Only SSC CGL is available; Railway & Bank coming soon
    selectExam(examId);
    onExamSelected?.();
  };

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
        {examsToShow.map((exam, index) => {
          const isAvailable = exam.id === "ssc-cgl";
          const totalTopics = countExamUnits(exam);
          return (
            <motion.button
              key={exam.id}
              className={`glass-card w-full p-5 text-left transition-transform ${
                isAvailable ? "active:scale-[0.97]" : "opacity-60 cursor-not-allowed"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              onClick={() => handleSelect(exam.id)}
              style={{ borderColor: `hsl(${exam.color} / 0.3)` }}
              disabled={!isAvailable}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-2xl overflow-hidden shrink-0"
                  style={{ background: `hsl(${exam.color} / 0.15)` }}
                >
                  {exam.id === "ssc-cgl" ? <SSCLogo size={40} /> : <span className="text-3xl">{exam.icon}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">
                      {language === "hi" ? exam.nameHi : exam.name}
                    </h3>
                    {!isAvailable && (
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
                        {language === "hi" ? "जल्द आ रहा है" : "Coming Soon"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {language === "hi" ? exam.descriptionHi : exam.description}
                  </p>
                  <p className="text-xs mt-1" style={{ color: `hsl(${exam.color})` }}>
                    {isAvailable
                      ? `${exam.subjects.length} ${t("subjects")} • ${totalTopics} ${t("topics")}`
                      : language === "hi"
                        ? "जल्द आ रहा है"
                        : "Coming soon"}
                  </p>
                </div>
                {isAvailable ? (
                  <div className="text-muted-foreground text-xl">→</div>
                ) : (
                  <Lock size={18} className="text-muted-foreground" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ExamSelectScreen;
