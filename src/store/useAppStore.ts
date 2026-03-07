import { create } from "zustand";
import { persist } from "zustand/middleware";
import { allExams, Subject } from "@/data/syllabus";
import { Language } from "@/data/translations";

interface AchievementEvent {
  subjectId: string;
  milestone: 25 | 50 | 75 | 100;
  timestamp: number;
}

interface AppState {
  selectedExamId: string | null;
  syllabus: Subject[];
  language: Language;
  achievedMilestones: Record<string, number[]>;
  lastAchievement: AchievementEvent | null;

  selectExam: (examId: string) => void;
  toggleTopic: (subjectId: string, topicId: string) => void;
  setLanguage: (lang: Language) => void;
  resetProgress: () => void;
  clearAchievement: () => void;
  getSubjectProgress: (subjectId: string) => number;
  getOverallProgress: () => { completed: number; total: number; percent: number };
  getWeakestSubject: () => Subject | null;
  getStrongestSubject: () => Subject | null;
  getFirstIncompleteSubject: () => Subject | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedExamId: null,
      syllabus: [],
      language: "en",
      achievedMilestones: {},
      lastAchievement: null,

      selectExam: (examId) => {
        const state = get();
        // If same exam is selected again and we already have syllabus loaded,
        // keep existing progress instead of resetting everything.
        if (state.selectedExamId === examId && state.syllabus.length > 0) {
          set({ selectedExamId: examId });
          return;
        }

        const exam = allExams.find((e) => e.id === examId);
        if (!exam) return;
        const freshSyllabus = JSON.parse(JSON.stringify(exam.subjects)) as Subject[];
        set({
          selectedExamId: examId,
          syllabus: freshSyllabus,
          achievedMilestones: {},
          lastAchievement: null,
        });
      },

      toggleTopic: (subjectId, topicId) => {
        const state = get();
        const newSyllabus = state.syllabus.map((subject) => {
          if (subject.id !== subjectId) return subject;
          return {
            ...subject,
            topics: subject.topics.map((topic) =>
              topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
            ),
          };
        });

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

        set({ syllabus: newSyllabus, achievedMilestones: newMilestones, lastAchievement: newAchievement });
      },

      setLanguage: (lang) => set({ language: lang }),

      resetProgress: () => {
        const state = get();
        if (!state.selectedExamId) return;
        const exam = allExams.find((e) => e.id === state.selectedExamId);
        if (!exam) return;
        set({
          syllabus: JSON.parse(JSON.stringify(exam.subjects)),
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
        const completed = syllabus.reduce((acc, s) => acc + s.topics.filter((t) => t.completed).length, 0);
        return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
      },

      getWeakestSubject: () => {
        const state = get();
        if (state.syllabus.length === 0) return null;
        let weakest = state.syllabus[0];
        let minProgress = 100;
        for (const s of state.syllabus) {
          const completed = s.topics.filter((t) => t.completed).length;
          const p = s.topics.length > 0 ? (completed / s.topics.length) * 100 : 0;
          if (p < minProgress) { minProgress = p; weakest = s; }
        }
        return weakest;
      },

      getStrongestSubject: () => {
        const state = get();
        if (state.syllabus.length === 0) return null;
        let strongest = state.syllabus[0];
        let maxProgress = -1;
        for (const s of state.syllabus) {
          const completed = s.topics.filter((t) => t.completed).length;
          const p = s.topics.length > 0 ? (completed / s.topics.length) * 100 : 0;
          if (p > maxProgress) { maxProgress = p; strongest = s; }
        }
        return strongest;
      },

      getFirstIncompleteSubject: () => {
        const state = get();
        return state.syllabus.find((s) => s.topics.some((t) => !t.completed)) || null;
      },
    }),
    { name: "ssc-tracker-v2" }
  )
);
