import { useRef, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";

interface WheelColumnProps {
  items: string[];
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const WheelColumn = memo(({ items, value, onChange }: WheelColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const scrollToValue = useCallback(
    (val: string, smooth = false) => {
      const idx = items.indexOf(val);
      if (idx < 0 || !containerRef.current) return;
      const top = idx * ITEM_HEIGHT;
      containerRef.current.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    },
    [items]
  );

  useEffect(() => {
    scrollToValue(value, false);
  }, [value, scrollToValue]);

  const handleScroll = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isScrollingRef.current = true;

    timeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const idx = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIdx = Math.max(0, Math.min(idx, items.length - 1));
      const newVal = items[clampedIdx];
      if (newVal !== value) onChange(newVal);
      // Snap
      containerRef.current.scrollTo({ top: clampedIdx * ITEM_HEIGHT, behavior: "smooth" });
    }, 80);
  };

  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);

  return (
    <div className="relative" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
      {/* Selection highlight */}
      <div
        className="absolute left-1 right-1 rounded-lg bg-primary/10 border border-primary/20 pointer-events-none z-10"
        style={{ top: ITEM_HEIGHT * paddingItems, height: ITEM_HEIGHT }}
      />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Top padding */}
        {Array.from({ length: paddingItems }).map((_, i) => (
          <div key={`pt-${i}`} style={{ height: ITEM_HEIGHT }} />
        ))}
        {items.map((item) => (
          <div
            key={item}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: "start" }}
            className={cn(
              "flex items-center justify-center text-lg font-bold transition-colors cursor-pointer select-none",
              item === value ? "text-primary" : "text-muted-foreground/50"
            )}
            onClick={() => {
              onChange(item);
              scrollToValue(item, true);
            }}
          >
            {item}
          </div>
        ))}
        {/* Bottom padding */}
        {Array.from({ length: paddingItems }).map((_, i) => (
          <div key={`pb-${i}`} style={{ height: ITEM_HEIGHT }} />
        ))}
      </div>
    </div>
  );
});

WheelColumn.displayName = "WheelColumn";

interface AlarmTimePickerProps {
  hour: string;
  minute: string;
  ampm: "AM" | "PM";
  onHourChange: (h: string) => void;
  onMinuteChange: (m: string) => void;
  onAmpmChange: (a: "AM" | "PM") => void;
}

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const ampmOptions = ["AM", "PM"];

const AlarmTimePicker = memo(({ hour, minute, ampm, onHourChange, onMinuteChange, onAmpmChange }: AlarmTimePickerProps) => {
  return (
    <div className="flex items-center justify-center gap-1 rounded-2xl bg-secondary/50 p-3">
      <div className="flex-1 max-w-[72px]">
        <WheelColumn items={hours} value={hour} onChange={onHourChange} />
      </div>
      <span className="text-2xl font-black text-muted-foreground pb-1">:</span>
      <div className="flex-1 max-w-[72px]">
        <WheelColumn items={minutes} value={minute} onChange={onMinuteChange} />
      </div>
      <div className="flex-1 max-w-[64px]">
        <WheelColumn items={ampmOptions} value={ampm} onChange={(v) => onAmpmChange(v as "AM" | "PM")} />
      </div>
    </div>
  );
});

AlarmTimePicker.displayName = "AlarmTimePicker";

export default AlarmTimePicker;
