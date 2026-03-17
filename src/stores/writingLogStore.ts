import { create } from "zustand";
import type { DailyStat, WeeklySummary } from "../types";
import * as commands from "../lib/tauri-commands";

interface WritingLogState {
  dailyStats: DailyStat[];
  weeklySummary: WeeklySummary | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadDailyStats: (days?: number) => Promise<void>;
  loadWeeklySummary: () => Promise<void>;
  loadDashboardData: () => Promise<void>;
  /** 執筆ログを追記し、ストア内のdailyStats/weeklySummaryもリアルタイム更新する */
  recordWriting: (projectId: string, chapter: string, charsDelta: number, sessionChars: number) => Promise<void>;
}

export const useWritingLogStore = create<WritingLogState>((set) => ({
  dailyStats: [],
  weeklySummary: null,
  loading: false,
  error: null,

  loadDailyStats: async (days = 365) => {
    set({ loading: true, error: null });
    try {
      const dailyStats = await commands.getDailyStats(days);
      set({ dailyStats, loading: false });
    } catch {
      set({ dailyStats: [], loading: false });
    }
  },

  loadWeeklySummary: async () => {
    try {
      const weeklySummary = await commands.getWeeklySummary();
      set({ weeklySummary });
    } catch {
      set({ weeklySummary: null });
    }
  },

  loadDashboardData: async () => {
    const store = useWritingLogStore.getState();
    await Promise.all([store.loadDailyStats(365), store.loadWeeklySummary()]);
  },

  recordWriting: async (projectId, chapter, charsDelta, sessionChars) => {
    if (charsDelta === 0) return;
    try {
      await commands.appendWritingLog(projectId, chapter, charsDelta, sessionChars);

      // インメモリのdailyStatsをリアルタイム更新
      const today = new Date().toISOString().slice(0, 10);
      const positiveDelta = charsDelta > 0 ? charsDelta : 0;

      set((state) => {
        const updatedStats = state.dailyStats.map((stat) => {
          if (stat.date === today) {
            return { ...stat, total_chars: stat.total_chars + positiveDelta };
          }
          return stat;
        });
        // 今日のエントリがなければ追加
        if (!updatedStats.find((s) => s.date === today)) {
          updatedStats.push({ date: today, total_chars: positiveDelta });
        }

        // weeklySummaryも更新
        let weeklySummary = state.weeklySummary;
        if (weeklySummary) {
          const updatedDays = weeklySummary.days.map((d) => {
            if (d.date === today) {
              return { ...d, total_chars: d.total_chars + positiveDelta };
            }
            return d;
          });
          const totalChars = updatedDays.reduce((sum, d) => sum + d.total_chars, 0);
          const activeDays = updatedDays.filter((d) => d.total_chars > 0).length;
          weeklySummary = {
            days: updatedDays,
            total_chars: totalChars,
            average_chars: activeDays > 0 ? Math.floor(totalChars / activeDays) : 0,
            active_days: activeDays,
          };
        }

        return { dailyStats: updatedStats, weeklySummary };
      });
    } catch (err) {
      console.error("執筆ログの記録に失敗:", err);
    }
  },
}));
