import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Play, FileText, Loader2, Trophy, BookOpen, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { getUserQuizzes, deletePersonalizedQuiz, type PersonalizedQuiz } from "@/lib/personalizedQuiz";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  onCreateNew: () => void;
  onPlayQuiz: (quiz: PersonalizedQuiz) => void;
}

const PersonalizedQuizLibraryScreen = ({ onBack, onCreateNew, onPlayQuiz }: Props) => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<PersonalizedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isHi = language === "hi";

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    loadQuizzes();
  }, [user?.uid]);

  const loadQuizzes = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const data = await getUserQuizzes(user.uid);
    setQuizzes(data);
    setLoading(false);
  };

  const handleDelete = async (quizId: string) => {
    const confirmed = window.confirm(
      isHi ? "क्या आप इस क्विज़ को डिलीट करना चाहते हैं?" : "Delete this quiz?"
    );
    if (!confirmed) return;

    setDeletingId(quizId);
    try {
      await deletePersonalizedQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      toast.success(isHi ? "क्विज़ डिलीट हो गई" : "Quiz deleted");
    } catch {
      toast.error(isHi ? "डिलीट करने में त्रुटि" : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct >= 80) return "hsl(var(--success))";
    if (pct >= 50) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getTypeLabel = (type: string) => {
    if (type === "mcq") return "MCQ";
    if (type === "short") return isHi ? "लघु उत्तर" : "Short Answer";
    return isHi ? "मिश्रित" : "Mixed";
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-6 sm:pt-8 pb-8 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary active:scale-90 transition-transform">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground">
            {isHi ? "मेरी क्विज़ लाइब्रेरी" : "My Quiz Library"}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {quizzes.length}/5 {isHi ? "क्विज़ बनाई गई" : "quizzes created"}
          </p>
        </div>

        {quizzes.length < 5 && (
          <button
            onClick={onCreateNew}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-primary-foreground active:scale-90 transition-transform"
          >
            <Plus size={18} />
          </button>
        )}
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && quizzes.length === 0 && (
        <motion.div
          className="text-center space-y-4 pt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <BookOpen size={32} className="text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              {isHi ? "अभी कोई क्विज़ नहीं" : "No quizzes yet"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
              {isHi
                ? "अपनी स्टडी मटीरियल अपलोड करें और AI से पर्सनलाइज़्ड क्विज़ बनवाएं!"
                : "Upload your study material and let AI create a personalized quiz!"}
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition-transform inline-flex items-center gap-2"
          >
            <Plus size={16} />
            {isHi ? "पहली क्विज़ बनाएं" : "Create First Quiz"}
          </button>
        </motion.div>
      )}

      {/* Quiz List */}
      <div className="space-y-3">
        {quizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            className="rounded-2xl bg-card border border-border overflow-hidden"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <div className="p-4 space-y-3">
              {/* Title & Type */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">{quiz.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                      {getTypeLabel(quiz.quizType)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {quiz.totalQuestions} {isHi ? "प्रश्न" : "Qs"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  disabled={deletingId === quiz.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  {deletingId === quiz.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4">
                {quiz.attemptCount > 0 ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Trophy size={12} style={{ color: getScoreColor(quiz.bestScore || 0, quiz.totalQuestions) }} />
                      <span className="text-xs font-bold" style={{ color: getScoreColor(quiz.bestScore || 0, quiz.totalQuestions) }}>
                        {quiz.bestScore}/{quiz.totalQuestions}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {isHi ? "सर्वश्रेष्ठ" : "best"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {quiz.attemptCount} {isHi ? "बार" : "attempts"}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">
                    {isHi ? "अभी तक कोई प्रयास नहीं" : "Not attempted yet"}
                  </span>
                )}
              </div>

              {/* Play Button */}
              <button
                onClick={() => onPlayQuiz(quiz)}
                className="w-full py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:bg-primary/15"
              >
                <Play size={14} />
                {quiz.attemptCount > 0
                  ? (isHi ? "दोबारा खेलें" : "Play Again")
                  : (isHi ? "क्विज़ शुरू करें" : "Start Quiz")}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedQuizLibraryScreen;
