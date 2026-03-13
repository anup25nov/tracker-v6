import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { updateQuizAttempt, type PersonalizedQuiz, type PersonalizedQuizQuestion } from "@/lib/personalizedQuiz";

interface Props {
  quiz: PersonalizedQuiz;
  onBack: () => void;
  onComplete: () => void;
}

const PersonalizedQuizPlayScreen = ({ quiz, onBack, onComplete }: Props) => {
  const { language } = useTranslation();
  const isHi = language === "hi";
  const questions = quiz.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { answer: string; correct: boolean }>>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const currentQ = questions[currentIndex];
  const isMcq = currentQ?.type === "mcq";

  const checkAnswer = () => {
    if (isAnswered) return;

    const userAnswer = isMcq ? selectedAnswer : shortAnswer.trim();
    if (!userAnswer) return;

    setIsAnswered(true);

    let correct = false;
    if (isMcq) {
      correct = userAnswer === currentQ.correctAnswer;
    } else {
      // For short answer, do case-insensitive partial match
      correct = userAnswer.toLowerCase().includes(currentQ.correctAnswer.toLowerCase()) ||
                currentQ.correctAnswer.toLowerCase().includes(userAnswer.toLowerCase());
    }

    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: { answer: userAnswer!, correct },
    }));
  };

  const handleNext = async () => {
    setShowSolution(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShortAnswer("");
      setIsAnswered(false);
    } else {
      // Compute final score
      const allAnswers = { ...answers };
      if (!allAnswers[currentIndex]) {
        const userAnswer = isMcq ? selectedAnswer : shortAnswer.trim();
        let correct = false;
        if (isMcq) correct = userAnswer === currentQ.correctAnswer;
        else correct = (userAnswer || "").toLowerCase().includes(currentQ.correctAnswer.toLowerCase());
        if (correct) allAnswers[currentIndex] = { answer: userAnswer!, correct: true };
      }

      const finalScore = Object.values(allAnswers).filter((a) => a.correct).length;
      setScore(finalScore);
      setQuizComplete(true);

      // Update Firestore
      await updateQuizAttempt(quiz.id, finalScore);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShortAnswer("");
    setIsAnswered(false);
    setScore(0);
    setAnswers({});
    setQuizComplete(false);
    setShowSolution(false);
  };

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
            {isHi ? "क्विज़ पूरी!" : "Quiz Complete!"}
          </h2>
          <p className="text-sm text-muted-foreground truncate">{quiz.title}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-extrabold text-primary">{score}</span>
            <span className="text-lg text-muted-foreground">/ {questions.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">({percent}%)</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { onComplete(); onBack(); }}
              className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
            >
              {isHi ? "लाइब्रेरी" : "Library"}
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              {isHi ? "दोबारा" : "Retry"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-6 sm:pt-8 pb-8 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary active:scale-90 transition-transform">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-foreground truncate">{quiz.title}</h1>
          <p className="text-[10px] text-muted-foreground">
            {currentQ.type === "mcq" ? "MCQ" : (isHi ? "लघु उत्तर" : "Short Answer")}
          </p>
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

      {/* Question Card */}
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
            {currentQ.question}
          </p>

          {/* MCQ Options */}
          {isMcq && currentQ.options && (
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQ.correctAnswer;

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
                    onClick={() => { if (!isAnswered) setSelectedAnswer(option); }}
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
          )}

          {/* Short Answer Input */}
          {!isMcq && (
            <div className="space-y-2">
              <input
                type="text"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                disabled={isAnswered}
                placeholder={isHi ? "अपना उत्तर लिखें..." : "Type your answer..."}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-70"
                onKeyDown={(e) => { if (e.key === "Enter" && !isAnswered) checkAnswer(); }}
              />
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-xl bg-success/10 border border-success/20"
                >
                  <p className="text-xs text-foreground">
                    <span className="font-semibold">{isHi ? "सही उत्तर: " : "Correct answer: "}</span>
                    {currentQ.correctAnswer}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Solution */}
          {isAnswered && currentQ.solution && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="text-xs text-primary font-medium underline"
              >
                {showSolution ? (isHi ? "समाधान छुपाएं" : "Hide Solution") : (isHi ? "समाधान देखें" : "View Solution")}
              </button>
              {showSolution && (
                <motion.div
                  className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-xs text-foreground leading-relaxed">{currentQ.solution}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Submit / Next Button */}
      {!isAnswered ? (
        <motion.button
          onClick={checkAnswer}
          disabled={isMcq ? !selectedAnswer : shortAnswer.trim().length === 0}
          className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isHi ? "उत्तर जमा करें" : "Submit Answer"}
        </motion.button>
      ) : (
        <motion.button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-95 transition-transform"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentIndex < questions.length - 1
            ? (isHi ? "अगला सवाल →" : "Next Question →")
            : (isHi ? "रिज़ल्ट देखें" : "See Results")}
        </motion.button>
      )}
    </div>
  );
};

export default PersonalizedQuizPlayScreen;
