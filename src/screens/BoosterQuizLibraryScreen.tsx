import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import ProfileQuizSection from "@/components/ProfileQuizSection";

interface BoosterQuizLibraryScreenProps {
  onBack: () => void;
  onStartQuiz: (topicId: string, topicName: string, topicNameHi: string) => void;
}

const BoosterQuizLibraryScreen = ({ onBack, onStartQuiz }: BoosterQuizLibraryScreenProps) => {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-foreground">
            {language === "hi" ? "⚡ बूस्टर क्विज़" : "⚡ Booster Quizzes"}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {language === "hi"
              ? "टॉपिक पूरा करें → क्विज़ अनलॉक करें"
              : "Complete all subtopics → Unlock quiz"}
          </p>
        </div>
      </div>

      <div className="px-3 py-4">
        <ProfileQuizSection language={language} onStartQuiz={onStartQuiz} />
      </div>
    </div>
  );
};

export default BoosterQuizLibraryScreen;
