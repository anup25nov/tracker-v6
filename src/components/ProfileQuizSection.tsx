import { motion } from "framer-motion";
import { BookOpen, ChevronDown, ChevronRight, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import { useAppStore, type LocalQuizResult } from "@/store/useAppStore";
import { getSubjectColor } from "@/lib/subjectColors";

interface ProfileQuizSectionProps {
  language: "en" | "hi";
  onStartQuiz: (topicId: string, topicName: string, topicNameHi: string) => void;
}

const ProfileQuizSection = ({ language, onStartQuiz }: ProfileQuizSectionProps) => {
  const syllabus = useAppStore((s) => s.syllabus);
  const quizResults = useAppStore((s) => s.quizResults);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Build results map
  const resultsByTopic = new Map<string, LocalQuizResult>();
  for (const r of quizResults) {
    resultsByTopic.set(r.topicId, r);
  }

  // Build subject → topics structure (only topics that have subtopics)
  const subjectsWithTopics = syllabus
    .map((subject) => {
      const topics = subject.topics.filter((t) => t.subtopics && t.subtopics.length > 0);
      return { ...subject, quizTopics: topics };
    })
    .filter((s) => s.quizTopics.length > 0);

  if (subjectsWithTopics.length === 0) return null;

  // Stats
  const totalTopics = subjectsWithTopics.reduce((acc, s) => acc + s.quizTopics.length, 0);
  const attemptedTopics = subjectsWithTopics.reduce(
    (acc, s) => acc + s.quizTopics.filter((t) => resultsByTopic.has(t.id)).length,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-3"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen size={16} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              {language === "hi" ? "बूस्टर क्विज़" : "Booster Quizzes"}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {attemptedTopics}/{totalTopics} {language === "hi" ? "पूर्ण" : "attempted"}
            </p>
          </div>
        </div>
        {attemptedTopics > 0 && (
          <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full">
            <Trophy size={12} className="text-primary" />
            <span className="text-[10px] font-semibold text-primary">{attemptedTopics}</span>
          </div>
        )}
      </div>

      {/* Subject Cards */}
      <div className="space-y-2">
        {subjectsWithTopics.map((subject) => {
          const color = getSubjectColor(subject.id);
          const isExpanded = expandedSubject === subject.id;
          const subjectAttempted = subject.quizTopics.filter((t) => resultsByTopic.has(t.id)).length;
          const subjectTotal = subject.quizTopics.length;

          return (
            <div key={subject.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Subject Header */}
              <button
                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                className="w-full flex items-center gap-3 p-3.5 active:bg-secondary/30 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: `hsl(${color} / 0.12)` }}
                >
                  {subject.icon}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {language === "hi" ? subject.nameHi : subject.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {subjectAttempted}/{subjectTotal} {language === "hi" ? "क्विज़ पूर्ण" : "quizzes done"}
                  </p>
                </div>

                {/* Mini progress */}
                <div className="flex items-center gap-2 shrink-0">
                  {subjectAttempted > 0 && (
                    <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(subjectAttempted / subjectTotal) * 100}%`,
                          background: `hsl(${color})`,
                        }}
                      />
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={16} className="text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Topics List */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border"
                >
                  <div className="divide-y divide-border">
                    {subject.quizTopics.map((topic) => {
                      const result = resultsByTopic.get(topic.id);
                      const topicName = language === "hi" ? topic.nameHi : topic.name;
                      const allDone = topic.subtopics?.every((st) => st.completed);
                      const percent = result
                        ? Math.round((result.score / result.totalQuestions) * 100)
                        : 0;

                      return (
                        <button
                          key={topic.id}
                          className="w-full flex items-center gap-3 px-4 py-3 active:bg-secondary/30 transition-colors text-left"
                          onClick={() => onStartQuiz(topic.id, topic.name, topic.nameHi)}
                        >
                          {/* Score circle or status */}
                          {result ? (
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{
                                background:
                                  percent >= 80
                                    ? "hsl(var(--success) / 0.12)"
                                    : percent >= 50
                                    ? "hsl(38 92% 50% / 0.12)"
                                    : "hsl(var(--destructive) / 0.12)",
                              }}
                            >
                              <span
                                className="text-xs font-bold"
                                style={{
                                  color:
                                    percent >= 80
                                      ? "hsl(var(--success))"
                                      : percent >= 50
                                      ? "hsl(38 92% 50%)"
                                      : "hsl(var(--destructive))",
                                }}
                              >
                                {percent}%
                              </span>
                            </div>
                          ) : (
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `hsl(${color} / 0.08)` }}
                            >
                              <Sparkles size={14} style={{ color: `hsl(${color})` }} />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                              {topicName}
                            </p>
                            {result ? (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {result.score}/{result.totalQuestions} {language === "hi" ? "सही" : "correct"}
                              </p>
                            ) : allDone ? (
                              <p className="text-[10px] mt-0.5" style={{ color: `hsl(${color})` }}>
                                {language === "hi" ? "क्विज़ लें" : "Take quiz"}
                              </p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {language === "hi" ? "टॉपिक पूरा करें" : "Complete topic first"}
                              </p>
                            )}
                          </div>

                          {result ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <RotateCcw size={12} className="text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                {language === "hi" ? "दोबारा" : "Retry"}
                              </span>
                            </div>
                          ) : (
                            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ProfileQuizSection;
