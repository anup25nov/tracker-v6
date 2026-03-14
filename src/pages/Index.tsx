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
const BoosterQuizLibraryScreen = lazy(() => import("@/screens/BoosterQuizLibraryScreen"));
const PersonalizedQuizLibraryScreen = lazy(() => import("@/screens/PersonalizedQuizLibraryScreen"));
const PersonalizedQuizUploadScreen = lazy(() => import("@/screens/PersonalizedQuizUploadScreen"));
const PersonalizedQuizPlayScreen = lazy(() => import("@/screens/PersonalizedQuizPlayScreen"));
const RemindersScreen = lazy(() => import("@/screens/RemindersScreen"));
const ShortNotesScreen = lazy(() => import("@/screens/ShortNotesScreen"));

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
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  const [showQuizUpload, setShowQuizUpload] = useState(false);
  const [activePersonalizedQuiz, setActivePersonalizedQuiz] = useState<any>(null);
  const [showReminders, setShowReminders] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showBoosterLibrary, setShowBoosterLibrary] = useState(false);
  const [skippedLogin, setSkippedLogin] = useState(() => {
    return localStorage.getItem("skippedLogin") === "true";
  });

  const selectedSubjectRef = useRef<string | null>(null);
  const showExamSelectRef = useRef(false);
  const showChatRef = useRef(false);
  const showProfileRef = useRef(false);
  const activeQuizRef = useRef<QuizInfo | null>(null);
  const showMyQuizzesRef = useRef(false);
  const showQuizUploadRef = useRef(false);
  const activePersonalizedQuizRef = useRef<any>(null);
  const showRemindersRef = useRef(false);
  const showNotesRef = useRef(false);
  const showBoosterLibraryRef = useRef(false);

  useEffect(() => { selectedSubjectRef.current = selectedSubject; }, [selectedSubject]);
  useEffect(() => { showExamSelectRef.current = showExamSelect; }, [showExamSelect]);
  useEffect(() => { showChatRef.current = showChat; }, [showChat]);
  useEffect(() => { showProfileRef.current = showProfile; }, [showProfile]);
  useEffect(() => { activeQuizRef.current = activeQuiz; }, [activeQuiz]);
  useEffect(() => { showMyQuizzesRef.current = showMyQuizzes; }, [showMyQuizzes]);
  useEffect(() => { showQuizUploadRef.current = showQuizUpload; }, [showQuizUpload]);
  useEffect(() => { activePersonalizedQuizRef.current = activePersonalizedQuiz; }, [activePersonalizedQuiz]);
  useEffect(() => { showRemindersRef.current = showReminders; }, [showReminders]);
  useEffect(() => { showNotesRef.current = showNotes; }, [showNotes]);
  useEffect(() => { showBoosterLibraryRef.current = showBoosterLibrary; }, [showBoosterLibrary]);

  // Load Firestore data when user logs in + seed quiz data once
  useEffect(() => {
    if (user?.uid) {
      const store = useAppStore.getState();
      if (store.selectedExamId && store.syllabus.length > 0) {
        store.loadFromFirestore(user.uid);
      }
      // Seed sample quiz data (idempotent - uses setDoc)
      const seeded = localStorage.getItem("quiz_seeded");
      if (!seeded) {
        import("@/lib/seedQuiz").then(({ seedSampleQuiz }) => {
          seedSampleQuiz().then(() => {
            localStorage.setItem("quiz_seeded", "true");
          }).catch(console.error);
        });
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
      if (showBoosterLibraryRef.current) { setShowBoosterLibrary(false); return; }
      if (showNotesRef.current) { setShowNotes(false); return; }
      if (showRemindersRef.current) { setShowReminders(false); return; }
      if (activePersonalizedQuizRef.current) { setActivePersonalizedQuiz(null); return; }
      if (showQuizUploadRef.current) { setShowQuizUpload(false); return; }
      if (showMyQuizzesRef.current) { setShowMyQuizzes(false); return; }
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
          onComplete={(score, total) => {
            useAppStore.getState().saveQuizResult({
              topicId: activeQuiz.topicId,
              topicName: activeQuiz.topicName,
              score,
              totalQuestions: total,
              attemptedAt: Date.now(),
            });
          }}
        />
      </Suspense>
    );
  }

  if (activePersonalizedQuiz) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <PersonalizedQuizPlayScreen
          quiz={activePersonalizedQuiz}
          onBack={() => setActivePersonalizedQuiz(null)}
          onComplete={() => {
            // Score already saved in the play screen
          }}
        />
      </Suspense>
    );
  }

  if (showQuizUpload) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <PersonalizedQuizUploadScreen
          onBack={() => setShowQuizUpload(false)}
          onQuizGenerated={() => {
            setShowQuizUpload(false);
            setShowMyQuizzes(true);
          }}
        />
      </Suspense>
    );
  }

  if (showMyQuizzes) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <PersonalizedQuizLibraryScreen
          onBack={() => setShowMyQuizzes(false)}
          onCreateNew={() => {
            setShowMyQuizzes(false);
            setShowQuizUpload(true);
          }}
          onPlayQuiz={(quiz) => {
            setShowMyQuizzes(false);
            setActivePersonalizedQuiz(quiz);
          }}
        />
      </Suspense>
    );
  }

  if (showReminders) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <RemindersScreen onBack={() => setShowReminders(false)} />
      </Suspense>
    );
  }

  if (showBoosterLibrary) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <BoosterQuizLibraryScreen
          onBack={() => setShowBoosterLibrary(false)}
          onStartQuiz={(topicId, topicName, topicNameHi) => {
            setShowBoosterLibrary(false);
            setActiveQuiz({ topicId, topicName, topicNameHi });
          }}
        />
      </Suspense>
    );
  }

  if (showNotes) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ShortNotesScreen onBack={() => setShowNotes(false)} />
      </Suspense>
    );
  }

  if (showProfile) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ProfileScreen
          onBack={() => setShowProfile(false)}
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
        onOpenMyQuizzes={() => setShowMyQuizzes(true)}
        onOpenReminders={() => setShowReminders(true)}
        onOpenNotes={() => setShowNotes(true)}
        onOpenBoosterQuizzes={() => setShowBoosterLibrary(true)}
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
