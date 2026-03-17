import { useEffect, useMemo, useState } from "react";
import type { DailyStat } from "../../types";

const STORAGE_KEY = "mypwriter-heatmap-period";

interface HeatmapProps {
  summaries: DailyStat[];
  /** 選択中の期間ラベルが変わったときに呼ばれる */
  onPeriodLabelChange?: (label: string) => void;
}

type Period = "1m" | "3m" | "6m" | "1y";

const PERIOD_OPTIONS: { value: Period; label: string; weeks: number }[] = [
  { value: "1m", label: "1ヶ月", weeks: 5 },
  { value: "3m", label: "3ヶ月", weeks: 14 },
  { value: "6m", label: "半年", weeks: 27 },
  { value: "1y", label: "1年", weeks: 53 },
];

const DAYS_OF_WEEK = 7;
const CELL_SIZE = 12;
const CELL_GAP = 2;
const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const DAY_LABELS = ["日", "", "火", "", "木", "", "土"];

function getIntensity(chars: number): number {
  if (chars === 0) return 0;
  if (chars <= 400) return 1;
  if (chars <= 1600) return 2;
  if (chars < 10000) return 3;
  return 4;
}

const INTENSITY_CLASSES: Record<number, string> = {
  0: "fill-[var(--bg-tertiary)] opacity-40",
  1: "fill-[#9be9a8]",
  2: "fill-[#40c463]",
  3: "fill-[#30a14e]",
  4: "fill-[#216e39]",
};

function loadSavedPeriod(): Period {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && PERIOD_OPTIONS.some((p) => p.value === saved)) {
    return saved as Period;
  }
  return "1y";
}

export function Heatmap({ summaries, onPeriodLabelChange }: HeatmapProps) {
  const [period, setPeriod] = useState<Period>(loadSavedPeriod);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    chars: number;
  } | null>(null);

  const currentOption = PERIOD_OPTIONS.find((p) => p.value === period)!;
  const weeks = currentOption.weeks;

  // 期間変更時にlocalStorageに保存 & 親に通知
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, period);
    onPeriodLabelChange?.(currentOption.label);
  }, [period, currentOption.label, onPeriodLabelChange]);

  const { grid, monthPositions } = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7);

    const summaryMap = new Map<string, number>(
      summaries.map((s) => [s.date, s.total_chars])
    );

    const cells: Array<{
      date: string;
      chars: number;
      intensity: number;
      col: number;
      row: number;
    }> = [];

    const seenMonths = new Set<string>();
    const monthPos: Array<{ label: string; col: number }> = [];

    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < DAYS_OF_WEEK; day++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + week * 7 + day);
        if (d > today) continue;

        const dateStr = d.toISOString().slice(0, 10);
        const chars = summaryMap.get(dateStr) ?? 0;
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        if (!seenMonths.has(monthKey) && day === 0) {
          seenMonths.add(monthKey);
          monthPos.push({ label: MONTH_LABELS[d.getMonth()], col: week });
        }

        cells.push({
          date: dateStr,
          chars,
          intensity: getIntensity(chars),
          col: week,
          row: day,
        });
      }
    }

    return { grid: cells, monthPositions: monthPos };
  }, [summaries, weeks]);

  const svgWidth = weeks * (CELL_SIZE + CELL_GAP) + 24;
  const svgHeight = DAYS_OF_WEEK * (CELL_SIZE + CELL_GAP) + 24;

  return (
    <div className="relative">
      {/* 期間切り替え */}
      <div className="flex items-center gap-1 mb-3">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={[
              "px-2.5 py-1 rounded-[var(--radius-md)] text-xs transition-colors",
              period === opt.value
                ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-medium"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]",
            ].join(" ")}
            onClick={() => setPeriod(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight + 20}
          aria-label="執筆ヒートマップ"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* 月ラベル */}
          {monthPositions.map(({ label, col }) => (
            <text
              key={`month-${col}`}
              x={col * (CELL_SIZE + CELL_GAP) + 24}
              y={12}
              className="fill-[var(--text-tertiary)]"
              fontSize={9}
              fontFamily="var(--font-ui)"
            >
              {label}
            </text>
          ))}

          {/* 曜日ラベル */}
          {DAY_LABELS.map((label, i) => (
            <text
              key={`day-${i}`}
              x={8}
              y={i * (CELL_SIZE + CELL_GAP) + 24 + CELL_SIZE / 2 + 3}
              className="fill-[var(--text-tertiary)]"
              fontSize={8}
              fontFamily="var(--font-ui)"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}

          {/* セル */}
          {grid.map((cell) => (
            <rect
              key={cell.date}
              x={cell.col * (CELL_SIZE + CELL_GAP) + 24}
              y={cell.row * (CELL_SIZE + CELL_GAP) + 20}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={2}
              className={`${INTENSITY_CLASSES[cell.intensity]} transition-opacity hover:opacity-80 cursor-pointer`}
              onMouseEnter={() => {
                setTooltip({
                  x: cell.col * (CELL_SIZE + CELL_GAP) + 24,
                  y: cell.row * (CELL_SIZE + CELL_GAP) + 20,
                  date: cell.date,
                  chars: cell.chars,
                });
              }}
            />
          ))}
        </svg>

        {/* ツールチップ */}
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-2 py-1 text-xs text-[var(--text-primary)] shadow-[var(--shadow-md)]"
            style={{
              left: tooltip.x + CELL_SIZE + 4,
              top: tooltip.y,
            }}
          >
            <div className="text-[var(--text-tertiary)]">{tooltip.date}</div>
            <div>
              <span className="text-[#40c463] font-medium">
                {tooltip.chars.toLocaleString()}
              </span>{" "}
              文字
            </div>
          </div>
        )}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[var(--text-tertiary)] text-[10px]">少</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <svg key={level} width={CELL_SIZE} height={CELL_SIZE}>
            <rect
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={2}
              className={INTENSITY_CLASSES[level]}
            />
          </svg>
        ))}
        <span className="text-[var(--text-tertiary)] text-[10px]">多</span>
      </div>
    </div>
  );
}
