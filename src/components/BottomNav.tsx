import { Home, BookOpen, User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { t } = useTranslation();

  const tabs = [
    { id: "home", icon: Home, label: t("home") },
    { id: "subjects", icon: BookOpen, label: t("subjects") },
    { id: "profile", icon: User, label: t("profile") },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border safe-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center w-full h-full gap-0.5"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 w-12 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <tab.icon
                size={22}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
