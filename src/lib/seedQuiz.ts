/**
 * Run this script once to seed a sample booster quiz question in Firestore.
 * Import and call seedSampleQuiz() from a useEffect or button click.
 */
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const seedSampleQuiz = async () => {
  const topicId = "quant-basic-maths";

  // Create the topic document
  await setDoc(doc(db, "booster_quizzes", topicId), {
    topicName: "Basic Maths",
    topicNameHi: "मूल गणित",
  });

  // Add sample questions
  const questions = [
    {
      question: "What is the LCM of 12 and 18?",
      questionHi: "12 और 18 का LCM क्या है?",
      options: ["36", "24", "54", "72"],
      optionsHi: ["36", "24", "54", "72"],
      correctAnswer: "36",
      correctAnswerHi: "36",
      solution: "LCM of 12 and 18:\n12 = 2² × 3\n18 = 2 × 3²\nLCM = 2² × 3² = 4 × 9 = 36",
      solutionHi: "12 और 18 का LCM:\n12 = 2² × 3\n18 = 2 × 3²\nLCM = 2² × 3² = 4 × 9 = 36",
    },
    {
      question: "If a number is divisible by both 3 and 4, it must be divisible by:",
      questionHi: "यदि कोई संख्या 3 और 4 दोनों से विभाज्य है, तो वह किससे विभाज्य होनी चाहिए?",
      options: ["12", "7", "8", "24"],
      optionsHi: ["12", "7", "8", "24"],
      correctAnswer: "12",
      correctAnswerHi: "12",
      solution: "Since 3 and 4 are coprime (HCF = 1), a number divisible by both must be divisible by 3 × 4 = 12.",
      solutionHi: "चूँकि 3 और 4 सहअभाज्य हैं (HCF = 1), दोनों से विभाज्य संख्या 3 × 4 = 12 से भी विभाज्य होगी।",
    },
    {
      question: "The digital sum of 9875 is:",
      questionHi: "9875 का अंक योग है:",
      options: ["2", "29", "11", "9"],
      optionsHi: ["2", "29", "11", "9"],
      correctAnswer: "2",
      correctAnswerHi: "2",
      solution: "Digital sum: 9+8+7+5 = 29 → 2+9 = 11 → 1+1 = 2",
      solutionHi: "अंक योग: 9+8+7+5 = 29 → 2+9 = 11 → 1+1 = 2",
    },
    {
      question: "HCF of 36 and 48 is:",
      questionHi: "36 और 48 का HCF है:",
      options: ["12", "6", "24", "18"],
      optionsHi: ["12", "6", "24", "18"],
      correctAnswer: "12",
      correctAnswerHi: "12",
      solution: "36 = 2² × 3²\n48 = 2⁴ × 3\nHCF = 2² × 3 = 12",
      solutionHi: "36 = 2² × 3²\n48 = 2⁴ × 3\nHCF = 2² × 3 = 12",
    },
    {
      question: "Simplify: √(144) + √(81)",
      questionHi: "सरल करें: √(144) + √(81)",
      options: ["21", "15", "23", "25"],
      optionsHi: ["21", "15", "23", "25"],
      correctAnswer: "21",
      correctAnswerHi: "21",
      solution: "√144 = 12, √81 = 9\n12 + 9 = 21",
      solutionHi: "√144 = 12, √81 = 9\n12 + 9 = 21",
    },
  ];

  const questionsCol = collection(db, "booster_quizzes", topicId, "questions");
  for (let i = 0; i < questions.length; i++) {
    await setDoc(doc(questionsCol, `q${i + 1}`), questions[i]);
  }

  console.log("[SeedQuiz] Sample quiz seeded for", topicId);
};
