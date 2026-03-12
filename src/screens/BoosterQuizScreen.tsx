import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Trophy, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { getBoosterQuizQuestions, saveBoosterQuizResult, type QuizQuestion } from "@/lib/boosterQuiz";

interface BoosterQuizScreenProps {
  topicId: string;
  topicName: string;
  topicNameHi: string;
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

const BoosterQuizScreen = ({ topicId, topicName, topicNameHi, onBack, onComplete }: BoosterQuizScreenProps) => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [noQuestions, setNoQuestions] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const qs = await getBoosterQuizQuestions(topicId);
      if (qs.length === 0) {
        setNoQuestions(true);
      } else {
        setQuestions(qs);
      }
      setLoading(false);
    };
    load();
  }, [topicId]);

  const currentQ = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQ?.correctAnswer;
  const displayName = language === "hi" ? topicNameHi : topicName;

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    const correct = answer === currentQ.correctAnswer;
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => ({ ...prev, [currentQ.id]: answer }));
  };

  const handleNext = async () => {
    setShowSolution(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz complete
      setQuizComplete(true);
      const finalScore = score;
      if (user) {
        await saveBoosterQuizResult({
          userId: user.uid,
          topicId,
          topicName,
          score: finalScore,
          totalQuestions: questions.length,
          answers,
        });
      }
      onComplete(finalScore, questions.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (noQuestions) {
    return (
      <div className="min-h-screen px-4 pt-8 pb-8 max-w-lg mx-auto space-y-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary active:scale-90 transition-transform">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="text-center space-y-3 pt-20">
          <p className="text-4xl">📝</p>
          <p className="text-sm text-muted-foreground">
            {language === "hi" ? "इस टॉपिक के लिए अभी कोई क्विज़ उपलब्ध नहीं है।" : "No quiz available for this topic yet."}
          </p>
          <button onClick={onBack} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium active:scale-95 transition-transform">
            {language === "hi" ? "वापस जाएं" : "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percent = Math.round((score / questions.length) * 100);
    const emoji = percent >= 80 ? "🏆" : percent >= 50 ? "👍" : "💪";
    return (
      <div className="min-h-screen px-4 pt-8 pb-8 max-w-lg mx-auto">
        <motion.div
          className="rounded-2xl p-6 bg-card border border-border text-center space-y-4 mt-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p className="text-5xl">{emoji}</p>
          <h2 className="text-xl font-bold text-foreground">
            {language === "hi" ? "क्विज़ पूरी हुई!" : "Quiz Complete!"}
          </h2>
          <p className="text-sm text-muted-foreground">{displayName}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-extrabold text-primary">{score}</span>
            <span className="text-lg text-muted-foreground">/ {questions.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">({percent}%)</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
            >
              {language === "hi" ? "वापस जाएं" : "Go Back"}
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setScore(0);
                setAnswers({});
                setQuizComplete(false);
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              {language === "hi" ? "दोबारा करें" : "Retry"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const options = language === "hi" && currentQ.optionsHi ? currentQ.optionsHi : currentQ.options;
  const solution = language === "hi" && currentQ.solutionHi ? currentQ.solutionHi : currentQ.solution;

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-6 sm:pt-8 pb-8 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary active:scale-90 transition-transform">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-foreground truncate">
            {language === "hi" ? "बूस्टर क्विज़" : "Booster Quiz"}
          </h1>
          <p className="text-[10px] text-muted-foreground truncate">{displayName}</p>
        </div>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
          {currentIndex + 1}/{questions.length}
        </span>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="rounded-2xl p-5 bg-card border border-border space-y-5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
            {language === "hi" && currentQ.questionHi ? currentQ.questionHi : currentQ.question}
          </p>

          <div className="space-y-2.5">
            {options.map((option, idx) => {
              const originalOption = currentQ.options[idx];
              const isSelected = selectedAnswer === originalOption;
              const isCorrectOption = originalOption === currentQ.correctAnswer;

              let borderColor = "hsl(var(--border))";
              let bgColor = "transparent";
              if (isAnswered) {
                if (isCorrectOption) {
                  borderColor = "hsl(var(--success))";
                  bgColor = "hsl(var(--success) / 0.1)";
                } else if (isSelected && !isCorrectOption) {
                  borderColor = "hsl(var(--destructive))";
                  bgColor = "hsl(var(--destructive) / 0.1)";
                }
              } else if (isSelected) {
                borderColor = "hsl(var(--primary))";
                bgColor = "hsl(var(--primary) / 0.1)";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(originalOption)}
                  disabled={isAnswered}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-[0.98] disabled:cursor-default"
                  style={{ border: `2px solid ${borderColor}`, background: bgColor }}
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-secondary text-foreground">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-foreground flex-1">{option}</span>
                  {isAnswered && isCorrectOption && <CheckCircle2 size={18} className="text-success shrink-0" />}
                  {isAnswered && isSelected && !isCorrectOption && <XCircle size={18} className="text-destructive shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Solution */}
          {isAnswered && solution && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="text-xs text-primary font-medium underline"
              >
                {showSolution
                  ? (language === "hi" ? "समाधान छुपाएं" : "Hide Solution")
                  : (language === "hi" ? "समाधान देखें" : "View Solution")}
              </button>
              {showSolution && (
                <motion.div
                  className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-xs text-foreground leading-relaxed">{solution}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next Button */}
      {isAnswered && (
        <motion.button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-95 transition-transform"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentIndex < questions.length - 1
            ? (language === "hi" ? "अगला सवाल →" : "Next Question →")
            : (language === "hi" ? "रिज़ल्ट देखें" : "See Results")}
        </motion.button>
      )}
    </div>
  );
};

export default BoosterQuizScreen;
