import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface QuizQuestion {
  id: string;
  question: string;
  questionHi?: string;
  options: string[];
  optionsHi?: string[];
  correctAnswer: string;
  correctAnswerHi?: string;
  solution?: string;
  solutionHi?: string;
}

export interface QuizResult {
  id?: string;
  userId: string;
  topicId: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  attemptedAt: any;
  answers?: Record<string, string>;
}

/**
 * Fetch quiz questions for a topic from Firestore.
 * Path: booster_quizzes/{topicId}/questions
 */
export const getBoosterQuizQuestions = async (topicId: string): Promise<QuizQuestion[]> => {
  try {
    const questionsRef = collection(db, "booster_quizzes", topicId, "questions");
    const snapshot = await getDocs(questionsRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as QuizQuestion));
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return [];
  }
};

/**
 * Save quiz result to Firestore.
 * Path: booster_quiz_results/{auto-id}
 */
export const saveBoosterQuizResult = async (result: Omit<QuizResult, "id" | "attemptedAt">): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, "booster_quiz_results"), {
      ...result,
      attemptedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return null;
  }
};

/**
 * Get latest quiz result for a user + topic.
 */
export const getLatestQuizResult = async (userId: string, topicId: string): Promise<QuizResult | null> => {
  try {
    const q = query(
      collection(db, "booster_quiz_results"),
      where("userId", "==", userId),
      where("topicId", "==", topicId),
      orderBy("attemptedAt", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as QuizResult;
  } catch (error) {
    console.error("Error fetching quiz result:", error);
    return null;
  }
};

/**
 * Get all quiz results for a user.
 */
export const getAllQuizResults = async (userId: string): Promise<QuizResult[]> => {
  try {
    const q = query(
      collection(db, "booster_quiz_results"),
      where("userId", "==", userId),
      orderBy("attemptedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as QuizResult));
  } catch (error) {
    console.error("Error fetching all quiz results:", error);
    return [];
  }
};

/**
 * Get topics that have quizzes available.
 */
export const getAvailableQuizTopics = async (): Promise<string[]> => {
  try {
    const snapshot = await getDocs(collection(db, "booster_quizzes"));
    return snapshot.docs.map((d) => d.id);
  } catch (error) {
    console.error("Error fetching quiz topics:", error);
    return [];
  }
};
