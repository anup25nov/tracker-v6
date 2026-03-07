import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import AchievementPopup from "@/components/AchievementPopup";
import HomeScreen from "@/screens/HomeScreen";
import SubjectsScreen from "@/screens/SubjectsScreen";
import TopicsScreen from "@/screens/TopicsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import ExamSelectScreen from "@/screens/ExamSelectScreen";
import { useAppStore } from "@/store/useAppStore";

const Index = () => {
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showExamSelect, setShowExamSelect] = useState(false);

  // Show exam select if no exam chosen
  if (!selectedExamId || showExamSelect) {
    return (
      <ExamSelectScreen
        key="exam-select"
      />
    );
  }

  const handleNavigate = (target: string) => {
    if (target.startsWith("topics-")) {
      setSelectedSubject(target.replace("topics-", ""));
      setActiveTab("topics");
    } else {
      setActiveTab(target);
      setSelectedSubject(null);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedSubject(null);
  };

  const handleChangeExam = () => {
    setShowExamSelect(true);
  };

  const renderScreen = () => {
    if (activeTab === "topics" && selectedSubject) {
      return (
        <TopicsScreen
          subjectId={selectedSubject}
          onBack={() => {
            setActiveTab("subjects");
            setSelectedSubject(null);
          }}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return <HomeScreen onNavigate={handleNavigate} />;
      case "subjects":
        return (
          <SubjectsScreen
            onSelectSubject={(id) => {
              setSelectedSubject(id);
              setActiveTab("topics");
            }}
          />
        );
      case "profile":
        return <ProfileScreen onChangeExam={handleChangeExam} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AchievementPopup />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + (selectedSubject || "")}
          initial={{ opacity: 0, x: activeTab === "topics" ? 30 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === "topics" ? -30 : 0 }}
          transition={{ duration: 0.25 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      <BottomNav
        activeTab={activeTab === "topics" ? "subjects" : activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default Index;
