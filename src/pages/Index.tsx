import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AchievementPopup from "@/components/AchievementPopup";
import { useAppStore } from "@/store/useAppStore";
import { logScreenView, logExamSelected } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

// Lazy-loaded screens
const LoginScreen = lazy(() => import("@/screens/LoginScreen"));
const MainScreen = lazy(() => import("@/screens/MainScreen"));
const TopicsScreen = lazy(() => import("@/screens/TopicsScreen"));
const ExamSelectScreen = lazy(() => import("@/screens/ExamSelectScreen"));
const ChatScreen = lazy(() => import("@/screens/ChatScreen"));
const ProfileScreen = lazy(() => import("@/screens/ProfileScreen"));
const BoosterQuizScreen = lazy(() => import("@/screens/BoosterQuizScreen"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin"
    />
  </div>
);

interface QuizInfo {
  topicId: string;
  topicName: string;
  topicNameHi: string;
}

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showExamSelect, setShowExamSelect] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizInfo | null>(null);
  const [skippedLogin, setSkippedLogin] = useState(() => {
    return localStorage.getItem("skippedLogin") === "true";
  });

  const selectedSubjectRef = useRef<string | null>(null);
  const showExamSelectRef = useRef(false);
  const showChatRef = useRef(false);
  const showProfileRef = useRef(false);
  const activeQuizRef = useRef<QuizInfo | null>(null);

  useEffect(() => { selectedSubjectRef.current = selectedSubject; }, [selectedSubject]);
  useEffect(() => { showExamSelectRef.current = showExamSelect; }, [showExamSelect]);
  useEffect(() => { showChatRef.current = showChat; }, [showChat]);
  useEffect(() => { showProfileRef.current = showProfile; }, [showProfile]);
  useEffect(() => { activeQuizRef.current = activeQuiz; }, [activeQuiz]);

  // Load Firestore data when user logs in
  useEffect(() => {
    if (user?.uid) {
      const store = useAppStore.getState();
      if (store.selectedExamId && store.syllabus.length > 0) {
        store.loadFromFirestore(user.uid);
      }
    }
  }, [user]);

  useEffect(() => {
    if (showExamSelect || !selectedExamId) {
      logScreenView("exam_select");
    }
  }, [showExamSelect, selectedExamId]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = CapacitorApp.addListener("backButton", () => {
      if (activeQuizRef.current) { setActiveQuiz(null); return; }
      if (showProfileRef.current) { setShowProfile(false); return; }
      if (showChatRef.current) { setShowChat(false); return; }
      if (selectedSubjectRef.current) { setSelectedSubject(null); return; }
      if (showExamSelectRef.current) { setShowExamSelect(false); return; }
      CapacitorApp.exitApp();
    });
    return () => { listener.then((handle) => handle.remove()); };
  }, []);

  // Show loading while auth initializes
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Show login if not authenticated and hasn't skipped
  if (!user && !skippedLogin) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginScreen
          onLoginSuccess={() => {
            setTimeout(() => {
              if (!useAuth) {
                localStorage.setItem("skippedLogin", "true");
                setSkippedLogin(true);
              }
            }, 100);
            localStorage.setItem("skippedLogin", "true");
            setSkippedLogin(true);
          }}
        />
      </Suspense>
    );
  }

  if (!selectedExamId || showExamSelect) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ExamSelectScreen
          onExamSelected={() => {
            setShowExamSelect(false);
            setSelectedSubject(null);
            logExamSelected(useAppStore.getState().selectedExamId || "");
          }}
        />
      </Suspense>
    );
  }

  if (activeQuiz) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <BoosterQuizScreen
          topicId={activeQuiz.topicId}
          topicName={activeQuiz.topicName}
          topicNameHi={activeQuiz.topicNameHi}
          onBack={() => setActiveQuiz(null)}
          onComplete={() => {}}
        />
      </Suspense>
    );
  }

  if (showProfile) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ProfileScreen
          onBack={() => setShowProfile(false)}
          onStartQuiz={(topicId, topicName, topicNameHi) => {
            setShowProfile(false);
            setActiveQuiz({ topicId, topicName, topicNameHi });
          }}
        />
      </Suspense>
    );
  }

  if (showChat) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ChatScreen onBack={() => setShowChat(false)} />
      </Suspense>
    );
  }

  const renderScreen = () => {
    if (selectedSubject) {
      return (
        <TopicsScreen
          subjectId={selectedSubject}
          onBack={() => setSelectedSubject(null)}
          onStartQuiz={(topicId, topicName, topicNameHi) => {
            setActiveQuiz({ topicId, topicName, topicNameHi });
          }}
        />
      );
    }
    return (
      <MainScreen
        onSelectSubject={(id) => setSelectedSubject(id)}
        onChangeExam={() => setShowExamSelect(true)}
        onOpenChat={() => setShowChat(true)}
        onOpenProfile={() => setShowProfile(true)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AchievementPopup />
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSubject || (activeQuiz ? "quiz" : "main")}
            initial={{ opacity: 0, x: selectedSubject ? 30 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default Index;
