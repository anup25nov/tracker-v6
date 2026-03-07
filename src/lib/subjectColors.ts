// Subject color mapping - returns HSL values based on subject id
const colorMap: Record<string, string> = {
  quant: "217 91% 60%",      // Blue
  reasoning: "280 73% 60%",   // Purple
  english: "142 71% 45%",     // Green
  ga: "38 92% 50%",           // Orange/Amber
  numerical: "199 89% 48%",   // Cyan
  math: "199 89% 48%",        // Cyan
  "english-hindi": "340 75% 55%", // Pink
};

export const getSubjectColor = (subjectId: string): string => {
  return colorMap[subjectId] || "217 91% 60%";
};

export const subjectGradients: Record<string, [string, string]> = {
  quant: ["217 91% 60%", "217 91% 45%"],
  reasoning: ["280 73% 60%", "280 73% 45%"],
  english: ["142 71% 45%", "142 71% 35%"],
  ga: ["38 92% 50%", "25 95% 45%"],
  numerical: ["199 89% 48%", "199 89% 38%"],
  math: ["199 89% 48%", "199 89% 38%"],
  "english-hindi": ["340 75% 55%", "340 75% 42%"],
};
