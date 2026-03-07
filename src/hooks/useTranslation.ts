import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/data/translations";

export const useTranslation = () => {
  const language = useAppStore((s) => s.language);
  const t = (key: string) => translations[language][key] || key;
  return { t, language };
};
