import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import MuiToolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Button } from "../components/ui";
import { Heatmap } from "../components/dashboard/Heatmap";
import { WeeklyStats } from "../components/dashboard/WeeklyStats";
import { StatsOverview } from "../components/dashboard/StatsOverview";
import { ProjectCard } from "../components/dashboard/ProjectCard";
import { NewProjectModal } from "../components/dashboard/NewProjectModal";
import { MemoQuickAdd } from "../components/memo/MemoQuickAdd";
import { MemoList } from "../components/memo/MemoList";
import { useProjectStore } from "../stores/projectStore";
import { useWritingLogStore } from "../stores/writingLogStore";
import { useTheme } from "../components/ui/ThemeProvider";
import type { MemoInfo } from "../types/memo";
import * as commands from "../lib/tauri-commands";
import { on } from "../lib/events";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";

export default function HomePage() {
  const { projects, loading: projectLoading, loadProjects, createProject } =
    useProjectStore();
  const {
    dailyStats,
    weeklySummary,
    loading: logLoading,
    loadDashboardData,
  } = useWritingLogStore();
  const { theme, toggleTheme } = useTheme();

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [heatmapPeriodLabel, setHeatmapPeriodLabel] = useState("1年");

  // メモ関連
  const [memos, setMemos] = useState<MemoInfo[]>([]);
  const [memoLoading, setMemoLoading] = useState(false);

  const loadMemos = useCallback(async () => {
    setMemoLoading(true);
    try {
      const list = await commands.listMemos();
      setMemos(list);
    } catch {
      // バックエンド未実装時は空リスト
      setMemos([]);
    } finally {
      setMemoLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    loadDashboardData();
    loadMemos();
    return on("memo:changed", loadMemos);
  }, []);

  const total7Days = weeklySummary?.total_chars ?? 0;
  const averageChars = weeklySummary?.average_chars ?? 0;
  const last7Days = weeklySummary?.days ?? [];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* トップバー */}
      <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <MuiToolbar variant="dense" sx={{ minHeight: '48px !important', px: 3 }}>
          <EditIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
          <Typography variant="h3" sx={{ fontWeight: 600, fontSize: '1rem', color: 'text.primary', flexGrow: 0 }}>
            MyPWriter
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="small"
            onClick={toggleTheme}
            aria-label="テーマ切替"
            sx={{ color: 'text.secondary' }}
          >
            {theme === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
          <Link to="/settings" style={{ textDecoration: 'none' }}>
            <Button
              variant="ghost"
              size="sm"
              icon={<SettingsIcon sx={{ fontSize: 16 }} />}
            >
              設定
            </Button>
          </Link>
        </MuiToolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Box component="main" sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 統計サマリー */}
        <section>
          <StatsOverview
            averageChars={averageChars}
            totalLast7Days={total7Days}
            projectCount={projects.length}
          />
        </section>

        {/* ヒートマップ */}
        <section>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="body1" fontWeight={500} color="text.primary" sx={{ mb: 2 }}>
              執筆記録（過去{heatmapPeriodLabel}）
            </Typography>
            {logLoading ? (
              <Typography variant="body2" color="text.disabled">読み込み中...</Typography>
            ) : (
              <Heatmap summaries={dailyStats} onPeriodLabelChange={setHeatmapPeriodLabel} />
            )}
          </Paper>
        </section>

        {/* 直近7日 */}
        <section>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="body1" fontWeight={500} color="text.primary" sx={{ mb: 2 }}>
              直近7日間の執筆量
            </Typography>
            <WeeklyStats summaries={last7Days} />
          </Paper>
        </section>

        {/* プロジェクト一覧 */}
        <section>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Typography variant="body1" fontWeight={500} color="text.primary">
              プロジェクト
            </Typography>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setNewProjectOpen(true)}
              icon={<AddIcon sx={{ fontSize: 14 }} />}
            >
              新規プロジェクト
            </Button>
          </Box>

          {projectLoading ? (
            <Typography variant="body2" color="text.disabled" textAlign="center" py={4}>
              読み込み中...
            </Typography>
          ) : projects.length === 0 ? (
            <Box textAlign="center" py={6} sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 'var(--radius-xl)' }}>
              <Typography variant="body2" color="text.disabled" mb={2}>
                プロジェクトがありません
              </Typography>
              <Button
                variant="primary"
                onClick={() => setNewProjectOpen(true)}
              >
                最初のプロジェクトを作成
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </Box>
          )}
        </section>

        {/* アイデアメモ */}
        <section>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Typography variant="body1" fontWeight={500} color="text.primary">
              アイデアメモ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <MemoQuickAdd onCreated={loadMemos} />
            <MemoList memos={memos} loading={memoLoading} onDeleted={loadMemos} onUpdated={loadMemos} />
          </Box>
        </section>
      </Box>

      {/* 新規プロジェクトモーダル */}
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreate={async (name, target) => {
          await createProject(name, target);
        }}
      />
    </Box>
  );
}
