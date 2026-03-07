import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AchievementPopup from "@/components/AchievementPopup";
import MainScreen from "@/screens/MainScreen";
import TopicsScreen from "@/screens/TopicsScreen";
import ExamSelectScreen from "@/screens/ExamSelectScreen";
import { useAppStore } from "@/store/useAppStore";
import { logScreenView, logExamSelected } from "@/lib/firebase";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

const Index = () => {
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showExamSelect, setShowExamSelect] = useState(false);

  const selectedSubjectRef = useRef<string | null>(null);
  const showExamSelectRef = useRef(false);

  useEffect(() => {
    selectedSubjectRef.current = selectedSubject;
  }, [selectedSubject]);

  useEffect(() => {
    showExamSelectRef.current = showExamSelect;
  }, [showExamSelect]);

  useEffect(() => {
    if (showExamSelect || !selectedExamId) {
      logScreenView("exam_select");
    }
  }, [showExamSelect, selectedExamId]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapacitorApp.addListener("backButton", () => {
      if (selectedSubjectRef.current) {
        setSelectedSubject(null);
        return;
      }

      if (showExamSelectRef.current) {
        setShowExamSelect(false);
        return;
      }

      CapacitorApp.exitApp();
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, []);

  if (!selectedExamId || showExamSelect) {
    return (
      <ExamSelectScreen
        onExamSelected={() => {
          setShowExamSelect(false);
          setSelectedSubject(null);
          logExamSelected(useAppStore.getState().selectedExamId || "");
        }}
      />
    );
  }

  const renderScreen = () => {
    if (selectedSubject) {
      return (
        <TopicsScreen
          subjectId={selectedSubject}
          onBack={() => setSelectedSubject(null)}
        />
      );
    }
    return (
      <MainScreen
        onSelectSubject={(id) => setSelectedSubject(id)}
        onChangeExam={() => setShowExamSelect(true)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AchievementPopup />
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSubject || "main"}
          initial={{ opacity: 0, x: selectedSubject ? 30 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
