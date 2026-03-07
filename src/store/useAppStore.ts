import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialSyllabus, Subject } from "@/data/syllabus";
import { Language } from "@/data/translations";

interface AchievementEvent {
  subjectId: string;
  milestone: 25 | 50 | 75 | 100;
  timestamp: number;
}

interface AppState {
  syllabus: Subject[];
  language: Language;
  achievedMilestones: Record<string, number[]>;
  lastAchievement: AchievementEvent | null;

  toggleTopic: (subjectId: string, topicId: string) => void;
  setLanguage: (lang: Language) => void;
  resetProgress: () => void;
  clearAchievement: () => void;
  getSubjectProgress: (subjectId: string) => number;
  getOverallProgress: () => { completed: number; total: number; percent: number };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      syllabus: initialSyllabus,
      language: "en",
      achievedMilestones: {},
      lastAchievement: null,

      toggleTopic: (subjectId, topicId) => {
        const state = get();
        const newSyllabus = state.syllabus.map((subject) => {
          if (subject.id !== subjectId) return subject;
          return {
            ...subject,
            topics: subject.topics.map((topic) =>
              topic.id === topicId
                ? { ...topic, completed: !topic.completed }
                : topic
            ),
          };
        });

        // Check for achievement milestones
        const subject = newSyllabus.find((s) => s.id === subjectId);
        let newAchievement: AchievementEvent | null = null;
        const newMilestones = { ...state.achievedMilestones };

        if (subject) {
          const completed = subject.topics.filter((t) => t.completed).length;
          const total = subject.topics.length;
          const percent = Math.round((completed / total) * 100);

          const milestones: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];
          const existing = newMilestones[subjectId] || [];

          for (const m of milestones) {
            if (percent >= m && !existing.includes(m)) {
              newAchievement = { subjectId, milestone: m, timestamp: Date.now() };
              newMilestones[subjectId] = [...existing, m];
              break;
            }
          }
        }

        set({
          syllabus: newSyllabus,
          achievedMilestones: newMilestones,
          lastAchievement: newAchievement,
        });
      },

      setLanguage: (lang) => set({ language: lang }),

      resetProgress: () => {
        set({
          syllabus: initialSyllabus,
          achievedMilestones: {},
          lastAchievement: null,
        });
      },

      clearAchievement: () => set({ lastAchievement: null }),

      getSubjectProgress: (subjectId) => {
        const subject = get().syllabus.find((s) => s.id === subjectId);
        if (!subject) return 0;
        const completed = subject.topics.filter((t) => t.completed).length;
        return Math.round((completed / subject.topics.length) * 100);
      },

      getOverallProgress: () => {
        const syllabus = get().syllabus;
        const total = syllabus.reduce((acc, s) => acc + s.topics.length, 0);
        const completed = syllabus.reduce(
          (acc, s) => acc + s.topics.filter((t) => t.completed).length,
          0
        );
        return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
      },
    }),
    {
      name: "ssc-cgl-tracker",
    }
  )
);
