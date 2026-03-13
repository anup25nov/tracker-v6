import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { getSubjectColor } from "@/lib/subjectColors";
import { logScreenView, logTopicToggled } from "@/lib/firebase";
import { isProfileBoosterQuizEnabled } from "@/lib/featureFlags";
import BoosterQuizPopup from "@/components/BoosterQuizPopup";
import { toast } from "sonner";
import type { Topic } from "@/data/syllabus";

interface TopicsScreenProps {
  subjectId: string;
  onBack: () => void;
  onStartQuiz?: (topicId: string, topicName: string, topicNameHi: string) => void;
}

function isTopicDone(topic: Topic): boolean {
  if (topic.subtopics?.length) {
    return topic.subtopics.every((st) => st.completed);
  }
  return topic.completed;
}

const TopicsScreen = ({ subjectId, onBack, onStartQuiz }: TopicsScreenProps) => {
  const { t, language } = useTranslation();
  const syllabus = useAppStore((s) => s.syllabus);
  const toggleTopic = useAppStore((s) => s.toggleTopic);
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress);
  const getSubjectUnits = useAppStore((s) => s.getSubjectUnits);

  const subject = syllabus.find((s) => s.id === subjectId);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [quizPopup, setQuizPopup] = useState<{ topicId: string; topicName: string; topicNameHi: string } | null>(null);
  const featureEnabled = isProfileBoosterQuizEnabled();

  useEffect(() => {
    logScreenView(`topics_${subjectId}`);
  }, [subjectId]);

  if (!subject) return null;

  const progress = getSubjectProgress(subjectId);
  const units = getSubjectUnits(subjectId);
  const color = getSubjectColor(subjectId);
  const isAllDone = progress === 100;

  const handleToggleTopic = (topicId: string) => {
    const topic = subject.topics.find((t) => t.id === topicId);
    if (topic?.subtopics?.length) {
      setExpandedTopicId((id) => (id === topicId ? null : topicId));
      return;
    }
    toggleTopic(subjectId, topicId);
    logTopicToggled(subjectId, topicId, !topic?.completed);
  };

  const handleToggleSubtopic = (topicId: string, subtopicId: string) => {
    const topic = subject.topics.find((t) => t.id === topicId);
    const subtopic = topic?.subtopics?.find((st) => st.id === subtopicId);
    const isBeingCompleted = !subtopic?.completed;
    toggleTopic(subjectId, topicId, subtopicId);
    logTopicToggled(subjectId, subtopicId, isBeingCompleted);

    // Show booster quiz popup on every subtopic completion
    if (featureEnabled && isBeingCompleted && topic) {
      setTimeout(() => {
        setQuizPopup({
          topicId,
          topicName: topic.name,
          topicNameHi: topic.nameHi,
        });
      }, 600);
    }
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-4 sm:pt-6 pb-8 max-w-lg mx-auto space-y-3 sm:space-y-4">
      {/* Hero Header */}
      <motion.div
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${color} / 0.2), hsl(${color} / 0.06))`,
          border: `1px solid hsl(${color} / 0.25)`,
        }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl active:scale-95 transition-transform"
            style={{ background: `hsl(${color} / 0.15)` }}
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
              {subject.icon} {language === "hi" ? subject.nameHi : subject.name}
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              {units.completed} / {units.total} {t("topicsCompleted")}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-extrabold" style={{ color: `hsl(${color})` }}>
              {progress}%
            </span>
          </div>
        </div>

        <div className="w-full h-2.5 sm:h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, hsl(${color}), hsl(${color} / 0.7))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Milestones */}
        <div className="relative w-full mt-1.5 h-5">
          {[25, 50, 75, 100].map((m) => (
            <div key={m} className="absolute flex flex-col items-center -translate-x-1/2" style={{ left: `${m}%` }}>
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${progress >= m ? "scale-125" : "opacity-30"}`}
                style={{ background: progress >= m ? `hsl(${color})` : `hsl(var(--muted-foreground))` }}
              />
              <span className="text-[9px] text-muted-foreground mt-0.5 whitespace-nowrap">{m}%</span>
            </div>
          ))}
        </div>

        {isAllDone && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-3 py-2 rounded-xl"
            style={{ background: `hsl(${color} / 0.15)` }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Trophy size={16} style={{ color: `hsl(${color})` }} />
            <span className="text-xs font-bold" style={{ color: `hsl(${color})` }}>
              {t("achievement100")}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Topics List */}
      <div className="space-y-1.5 sm:space-y-2">
        {subject.topics.map((topic, index) => {
          const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
          const isExpanded = expandedTopicId === topic.id;
          const done = isTopicDone(topic);
          const subtopicCompleted = hasSubtopics ? topic.subtopics!.filter((st) => st.completed).length : 0;
          const subtopicTotal = hasSubtopics ? topic.subtopics!.length : 0;

          return (
            <div key={topic.id}>
              <motion.button
                className="w-full flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all active:scale-[0.97]"
                style={{
                  background: done ? `hsl(${color} / 0.08)` : `hsl(var(--card))`,
                  borderColor: done ? `hsl(${color} / 0.25)` : `hsl(var(--border))`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.2 + index * 0.025 }}
                onClick={() => handleToggleTopic(topic.id)}
              >
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0"
                  style={{
                    background: done ? `hsl(${color})` : "transparent",
                    borderColor: done ? `hsl(${color})` : `hsl(var(--muted-foreground) / 0.3)`,
                  }}
                >
                  {done && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                      <Check size={12} className="text-white" />
                    </motion.div>
                  )}
                </div>

                {hasSubtopics ? (
                  <span className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs font-bold w-5 sm:w-6 shrink-0" style={{ color: done ? `hsl(${color})` : `hsl(var(--muted-foreground))` }}>
                    {index + 1}
                  </span>
                )}

                <span
                  className={`text-xs sm:text-sm font-medium flex-1 text-left leading-snug ${done ? "line-through opacity-70" : ""}`}
                  style={{ color: done ? `hsl(${color})` : `hsl(var(--foreground))` }}
                >
                  {language === "hi" ? topic.nameHi : topic.name}
                  {hasSubtopics && (
                    <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                      ({subtopicCompleted}/{subtopicTotal})
                    </span>
                  )}
                </span>

                {done && !hasSubtopics && (
                  <motion.div className="w-2 h-2 rounded-full shrink-0" style={{ background: `hsl(${color})` }} initial={{ scale: 0 }} animate={{ scale: 1 }} />
                )}
              </motion.button>

              <AnimatePresence>
                {hasSubtopics && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 pr-2 py-1.5 space-y-1 border-l-2 border-b border-r rounded-b-xl ml-5 sm:ml-6 border-border" style={{ borderColor: `hsl(${color} / 0.2)` }}>
                      {topic.subtopics!.map((st) => (
                        <button
                          key={st.id}
                          className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg active:scale-[0.98] transition-transform text-left"
                          style={{ background: `hsl(var(--card))` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSubtopic(topic.id, st.id);
                          }}
                        >
                          <div
                            className="w-4 h-4 rounded-md flex items-center justify-center border-2 shrink-0"
                            style={{
                              background: st.completed ? `hsl(${color})` : "transparent",
                              borderColor: st.completed ? `hsl(${color})` : `hsl(var(--muted-foreground) / 0.3)`,
                            }}
                          >
                            {st.completed && <Check size={10} className="text-white" />}
                          </div>
                          <span
                            className={`text-[11px] sm:text-xs font-medium flex-1 ${st.completed ? "line-through opacity-70" : ""}`}
                            style={{ color: st.completed ? `hsl(${color})` : `hsl(var(--foreground))` }}
                          >
                            {language === "hi" ? st.nameHi : st.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Booster Quiz Popup */}
      <AnimatePresence>
        {quizPopup && (
          <BoosterQuizPopup
            topicName={quizPopup.topicName}
            topicNameHi={quizPopup.topicNameHi}
            language={language}
            onStartQuiz={() => {
              setQuizPopup(null);
              onStartQuiz?.(quizPopup.topicId, quizPopup.topicName, quizPopup.topicNameHi);
            }}
            onTakeLater={() => {
              setQuizPopup(null);
              toast(
                language === "hi"
                  ? "आप बाद में प्रोफ़ाइल से क्विज़ ले सकते हैं"
                  : "You can take the quiz later from your Profile",
                { duration: 3000 }
              );
            }}
            onClose={() => setQuizPopup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopicsScreen;
