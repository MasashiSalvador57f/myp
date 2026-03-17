import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Button } from "../components/ui";
import { ProjectHeader } from "../components/project/ProjectHeader";
import { ChapterList } from "../components/project/ChapterList";
import { ProgressBar } from "../components/project/ProgressBar";
import { RecentChats } from "../components/project/RecentChats";
import { ChatPanel } from "../components/chat/ChatPanel";
import { useProjectStore } from "../stores/projectStore";
import * as commands from "../lib/tauri-commands";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    currentProject,
    loading,
    error,
    loadProject,
    updateProject,
    deleteProject,
  } = useProjectStore();

  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!projectId) return;
    await deleteProject(projectId);
    navigate("/");
  };

  const handleCreateFile = async (filename: string) => {
    if (!projectId) return;
    await commands.createChapter(projectId, filename);
    await loadProject(projectId);
  };

  const handleDeleteFile = async (filename: string) => {
    if (!projectId) return;
    await commands.deleteChapter(projectId, filename);
    await loadProject(projectId);
  };

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--bg-primary)' }}>
        <Typography variant="body2" color="text.disabled">読み込み中...</Typography>
      </Box>
    );
  }

  if (error || !currentProject) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--bg-primary)', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {error ?? "プロジェクトが見つかりません"}
        </Typography>
        <Button variant="secondary" onClick={() => navigate("/")}>
          ホームへ戻る
        </Button>
      </Box>
    );
  }

  const { config, manuscripts, materials, total_char_count } = currentProject;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* メインコンテンツ */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左ペイン: プロジェクト情報 */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* ヘッダー */}
          <ProjectHeader
            projectId={projectId!}
            config={config}
            onUpdate={(name, targetCharCount) => updateProject(projectId!, name, targetCharCount)}
            onDelete={handleDeleteProject}
          />

          {/* 進捗バー */}
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <ProgressBar
              current={total_char_count}
              target={config.target_char_count}
            />
          </Paper>

          {/* 原稿ファイル一覧 */}
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <ChapterList
              projectId={projectId!}
              manuscripts={manuscripts}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
            />
          </Paper>

          {/* 最近のAI相談 */}
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Typography variant="body1" fontWeight={500} color="text.primary">
                最近のAI相談
              </Typography>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setChatOpen(true)}
                icon={<ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />}
              >
                AI相談を開始
              </Button>
            </Box>
            <RecentChats materials={materials} />
          </Paper>
        </Box>

        {/* 右ペイン: チャットパネル（開いている時） */}
        {chatOpen && projectId && (
          <Box sx={{ width: 320, borderLeft: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0, bgcolor: 'var(--bg-secondary)' }}>
              <Typography variant="caption" color="text.disabled">AI相談パネル</Typography>
              <IconButton
                size="small"
                onClick={() => setChatOpen(false)}
                aria-label="パネルを閉じる"
                sx={{ color: 'text.disabled' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <ChatPanel projectId={projectId} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
