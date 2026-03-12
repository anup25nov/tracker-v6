import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Subject } from "@/data/syllabus";

/**
 * Document id per (user, exam) so we track multiple exams per user.
 * Syllabus structure is static in app code — we only store completion state.
 */
function progressDocId(uid: string, examId: string): string {
  return `${uid}_${examId}`;
}

/**
 * Extracts only the completion state from syllabus (minimal payload).
 */
function extractProgress(syllabus: Subject[]): Record<string, Record<string, boolean | Record<string, boolean>>> {
  const progress: Record<string, Record<string, boolean | Record<string, boolean>>> = {};
  for (const subject of syllabus) {
    const topicMap: Record<string, boolean | Record<string, boolean>> = {};
    for (const topic of subject.topics) {
      if (topic.subtopics?.length) {
        const subMap: Record<string, boolean> = {};
        for (const st of topic.subtopics) {
          subMap[st.id] = !!st.completed;
        }
        topicMap[topic.id] = subMap;
      } else {
        topicMap[topic.id] = !!topic.completed;
      }
    }
    progress[subject.id] = topicMap;
  }
  return progress;
}

/**
 * Applies saved progress onto a fresh syllabus structure.
 */
function applyProgress(
  syllabus: Subject[],
  progress: Record<string, Record<string, boolean | Record<string, boolean>>>
): Subject[] {
  return syllabus.map((subject) => {
    const subjectProgress = progress[subject.id];
    if (!subjectProgress) return subject;
    return {
      ...subject,
      topics: subject.topics.map((topic) => {
        const topicProgress = subjectProgress[topic.id];
        if (topicProgress === undefined) return topic;

        if (topic.subtopics?.length && typeof topicProgress === "object") {
          const stProgress = topicProgress as Record<string, boolean>;
          return {
            ...topic,
            subtopics: topic.subtopics.map((st) => ({
              ...st,
              completed: stProgress[st.id] ?? st.completed,
            })),
          };
        }
        if (typeof topicProgress === "boolean") {
          return { ...topic, completed: topicProgress };
        }
        return topic;
      }),
    };
  });
}

// Debounce timer for batching rapid writes
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingWrite: (() => Promise<void>) | null = null;

/**
 * Save user's progress for one exam to Firestore (debounced — 1.5s).
 * One document per (uid, examId) so multiple exams are tracked independently.
 * Only progress + achievedMilestones are stored; syllabus structure lives in app code.
 */
export function saveProgressToFirestore(
  uid: string,
  examId: string,
  syllabus: Subject[],
  achievedMilestones: Record<string, number[]>
) {
  pendingWrite = async () => {
    try {
      const docId = progressDocId(uid, examId);
      const ref = doc(db, "user_progress", docId);
      await setDoc(
        ref,
        {
          uid,
          examId,
          progress: extractProgress(syllabus),
          achievedMilestones,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving progress to Firestore:", error);
    }
  };

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pendingWrite?.();
    pendingWrite = null;
    debounceTimer = null;
  }, 1500);
}

/**
 * Load progress for one (user, exam) and apply to fresh syllabus.
 * Returns null if no saved progress for this exam.
 */
export async function loadProgressFromFirestore(
  uid: string,
  examId: string,
  freshSyllabus: Subject[]
): Promise<{ syllabus: Subject[]; achievedMilestones: Record<string, number[]> } | null> {
  try {
    const docId = progressDocId(uid, examId);
    const ref = doc(db, "user_progress", docId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data();
    const restoredSyllabus = applyProgress(freshSyllabus, data.progress || {});
    return {
      syllabus: restoredSyllabus,
      achievedMilestones: data.achievedMilestones || {},
    };
  } catch (error) {
    console.error("Error loading progress from Firestore:", error);
    return null;
  }
}
