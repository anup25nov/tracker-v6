import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface BoosterQuizPopupProps {
  topicName: string;
  topicNameHi: string;
  language: "en" | "hi";
  onStartQuiz: () => void;
  onTakeLater: () => void;
  onClose: () => void;
}

const BoosterQuizPopup = ({ topicName, topicNameHi, language, onStartQuiz, onTakeLater, onClose }: BoosterQuizPopupProps) => {
  const displayName = language === "hi" ? topicNameHi : topicName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <button className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Close" />
      <motion.div
        className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"
        >
          <X size={14} className="text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles size={28} className="text-primary" />
          </motion.div>

          <h3 className="text-base font-bold text-foreground">
            {language === "hi" ? "🎉 टॉपिक पूरा हुआ!" : "🎉 Topic Complete!"}
          </h3>

          <p className="text-xs text-muted-foreground">
            {language === "hi"
              ? `आपने "${displayName}" के सभी subtopics पूरे कर लिए। बूस्टर क्विज़ लें और अपनी तैयारी जांचें!`
              : `You've completed all subtopics in "${displayName}". Take a Booster Quiz to test your preparation!`}
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onStartQuiz}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            {language === "hi" ? "बूस्टर क्विज़ शुरू करें" : "Start Booster Quiz"}
          </button>
          <button
            onClick={onTakeLater}
            className="w-full py-3 rounded-xl bg-secondary text-foreground font-medium text-sm active:scale-95 transition-transform"
          >
            {language === "hi" ? "बाद में करें" : "Take Later"}
          </button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground">
          {language === "hi"
            ? "आप बाद में प्रोफ़ाइल से भी क्विज़ ले सकते हैं"
            : "You can also take the quiz later from your Profile"}
        </p>
      </motion.div>
    </div>
  );
};

export default BoosterQuizPopup;
