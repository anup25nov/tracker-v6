import { motion } from "framer-motion";

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

const ProgressRing = ({ percent, size = 120, strokeWidth = 8 }: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  // Responsive: clamp size for very small screens
  const displaySize = size;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={displaySize} height={displaySize} className="-rotate-90">
        <circle
          cx={displaySize / 2}
          cy={displaySize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--progress-track))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={displaySize / 2}
          cy={displaySize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-lg sm:text-2xl font-bold text-foreground"
          key={percent}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          {percent}%
        </motion.span>
      </div>
    </div>
  );
};

export default ProgressRing;
