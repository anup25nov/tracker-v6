import { motion } from "framer-motion";

interface ProgressBarProps {
  percent: number;
  height?: number;
  showLabel?: boolean;
}

const ProgressBar = ({ percent, height = 8, showLabel = false }: ProgressBarProps) => {
  const getColor = () => {
    if (percent >= 100) return "bg-success";
    if (percent >= 75) return "bg-accent";
    if (percent >= 50) return "bg-warning";
    return "bg-primary";
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-muted-foreground">{percent}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full bg-secondary overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className={`h-full rounded-full ${getColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
