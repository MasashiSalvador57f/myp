import { useState, useEffect, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Chip from "@mui/material/Chip";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button, Modal } from "../ui";
import { getAllAgents } from "../settings/AgentSettings";
import {
  sendChatMessage as sendAI,
  type AIServiceConfig,
  type AIMessage,
} from "../../lib/ai-service";
import * as commands from "../../lib/tauri-commands";
import type { ManuscriptFile, MemoInfo } from "../../types";

interface AgentExecution {
  id: string;
  agentId: string;
  agentName: string;
  fileName: string;
  fileLabel: string;
  status: "running" | "completed" | "error";
  result: string;
  startedAt: string;
  completedAt?: string;
}

interface AgentRunnerProps {
  projectId: string;
  manuscripts: ManuscriptFile[];
}

const HISTORY_KEY_PREFIX = "mypwriter-agent-history-";

function loadHistory(projectId: string): AgentExecution[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY_PREFIX + projectId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(projectId: string, history: AgentExecution[]) {
  // 最大30件保持
  localStorage.setItem(
    HISTORY_KEY_PREFIX + projectId,
    JSON.stringify(history.slice(0, 30))
  );
}

export function AgentRunner({ projectId, manuscripts }: AgentRunnerProps) {
  const allAgents = getAllAgents();
  const [selectedAgentId, setSelectedAgentId] = useState(allAgents[0]?.id ?? "");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [memos, setMemos] = useState<MemoInfo[]>([]);
  const [history, setHistory] = useState<AgentExecution[]>(() =>
    loadHistory(projectId)
  );
  const [detailExecution, setDetailExecution] = useState<AgentExecution | null>(
    null
  );

  // テキスト選択ツールバー
  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number; y: number; text: string } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // 実行中のAbortControllerを管理
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // 停止確認
  const [stopTargetId, setStopTargetId] = useState<string | null>(null);

  // メモ追記モーダル
  const [appendOpen, setAppendOpen] = useState(false);
  const [appendContent, setAppendContent] = useState("");
  const [memoList, setMemoList] = useState<MemoInfo[]>([]);
  const [memoLoading, setMemoLoading] = useState(false);

  // メモ一覧を読み込み
  useEffect(() => {
    commands.listMemos().then((allMemos) => {
      // このプロジェクトに紐づくメモ + グローバルメモ
      setMemos(
        allMemos.filter(
          (m) => m.project_id === projectId || m.project_id === null
        )
      );
    });
  }, [projectId]);

  // 履歴の永続化
  useEffect(() => {
    saveHistory(projectId, history);
  }, [projectId, history]);

  // テキスト選択検知
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) return;
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
          setSelectionToolbar(null);
          return;
        }
        const container = resultRef.current;
        if (!container) return;
        const anchorNode = sel.anchorNode;
        if (!anchorNode || !container.contains(anchorNode)) {
          setSelectionToolbar(null);
          return;
        }
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        setSelectionToolbar({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + container.scrollTop - 4,
          text: sel.toString(),
        });
      }, 10);
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // メモにする
  const handleSaveAsMemo = useCallback(async (content: string) => {
    try {
      const title = content.split("\n")[0].slice(0, 50) || "エージェント実行メモ";
      const execInfo = detailExecution
        ? `\n\n---\n🤖 エージェント: ${detailExecution.agentName} → ${detailExecution.fileLabel}`
        : "";
      await commands.createMemo(title, content + execInfo, projectId);
    } catch (e) {
      console.error("メモの作成に失敗:", e);
    }
  }, [projectId, detailExecution]);

  // メモに追記 - モーダルを開く
  const handleOpenAppend = useCallback(async (content: string) => {
    setAppendContent(content);
    setMemoLoading(true);
    setAppendOpen(true);
    try {
      const all = await commands.listMemos();
      setMemoList(all.filter((m) => m.project_id === projectId || !m.project_id));
    } catch {
      setMemoList([]);
    } finally {
      setMemoLoading(false);
    }
  }, [projectId]);

  // メモに追記 - 実行
  const handleAppendToMemo = useCallback(async (memo: MemoInfo) => {
    try {
      const detail = await commands.readMemo(memo.filename);
      const execInfo = detailExecution
        ? `\n🤖 エージェント: ${detailExecution.agentName} → ${detailExecution.fileLabel}`
        : "";
      const newBody = detail.body
        ? `${detail.body}\n\n---\n\n${appendContent}${execInfo}`
        : `${appendContent}${execInfo}`;
      await commands.updateMemo(memo.filename, detail.title, newBody, detail.project_id);
      setAppendOpen(false);
      setAppendContent("");
    } catch (e) {
      console.error("メモへの追記に失敗:", e);
    }
  }, [appendContent, detailExecution]);

  // 選択ツールバーのアクション
  const handleSelectionToMemo = useCallback(() => {
    if (!selectionToolbar) return;
    const text = selectionToolbar.text;
    setSelectionToolbar(null);
    window.getSelection()?.removeAllRanges();
    void handleSaveAsMemo(text);
  }, [selectionToolbar, handleSaveAsMemo]);

  const handleSelectionAppend = useCallback(() => {
    if (!selectionToolbar) return;
    const text = selectionToolbar.text;
    setSelectionToolbar(null);
    window.getSelection()?.removeAllRanges();
    void handleOpenAppend(text);
  }, [selectionToolbar, handleOpenAppend]);

  const runningCount = history.filter((h) => h.status === "running").length;

  /** 実行中のエージェントを停止し、一覧から削除 */
  const handleStop = useCallback((executionId: string) => {
    const controller = abortControllersRef.current.get(executionId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(executionId);
    }
    setHistory((prev) => prev.filter((h) => h.id !== executionId));
  }, []);

  /** ファイルキーからラベルを取得 */
  const getFileLabel = useCallback(
    (fileKey: string): string => {
      if (fileKey.startsWith("manuscript:")) {
        return fileKey.replace("manuscript:", "");
      }
      if (fileKey.startsWith("memo:")) {
        const filename = fileKey.replace("memo:", "");
        return memos.find((m) => m.filename === filename)?.title ?? filename;
      }
      return fileKey;
    },
    [memos]
  );

  const handleRun = useCallback(async () => {
    if (!selectedAgentId || selectedFiles.length === 0) return;

    const agent = allAgents.find((a) => a.id === selectedAgentId);
    if (!agent) return;

    // 複数ファイルの内容を読み込み・結合
    const parts: { label: string; content: string }[] = [];
    for (const fileKey of selectedFiles) {
      if (fileKey.startsWith("manuscript:")) {
        const filename = fileKey.replace("manuscript:", "");
        try {
          const res = await commands.readChapter(projectId, filename);
          parts.push({ label: filename, content: res.content });
        } catch (e) {
          console.error("原稿の読み込みに失敗:", e);
        }
      } else if (fileKey.startsWith("memo:")) {
        const filename = fileKey.replace("memo:", "");
        const memo = memos.find((m) => m.filename === filename);
        try {
          const res = await commands.readMemo(filename);
          parts.push({ label: memo?.title ?? filename, content: res.body });
        } catch (e) {
          console.error("メモの読み込みに失敗:", e);
        }
      }
    }

    if (parts.length === 0 || parts.every((p) => !p.content.trim())) return;

    const fileLabel = parts.map((p) => p.label).join(", ");
    const combinedContent =
      parts.length === 1
        ? parts[0].content
        : parts
            .map((p) => `【${p.label}】\n${p.content}`)
            .join("\n\n---\n\n");

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newExecution: AgentExecution = {
      id: executionId,
      agentId: agent.id,
      agentName: agent.name,
      fileName: selectedFiles.join(","),
      fileLabel,
      status: "running",
      result: "",
      startedAt: new Date().toISOString(),
    };

    const abortController = new AbortController();
    abortControllersRef.current.set(executionId, abortController);

    setHistory((prev) => [newExecution, ...prev]);

    // 非同期でAI実行
    try {
      const settings = await commands.getSettings();
      const provider = (settings?.ai?.provider ?? "openai") as
        | "openai"
        | "gemini";
      const apiKey =
        provider === "gemini"
          ? settings?.ai?.gemini_api_key
          : settings?.ai?.api_key;

      if (!apiKey) {
        setHistory((prev) =>
          prev.map((h) =>
            h.id === executionId
              ? {
                  ...h,
                  status: "error" as const,
                  result: "APIキーが設定されていません。設定画面から入力してください。",
                  completedAt: new Date().toISOString(),
                }
              : h
          )
        );
        return;
      }

      const aiConfig: AIServiceConfig = { provider, apiKey };
      const systemPrompt =
        agent.system_prompt +
        `\n\n---\n以下は分析対象のテキストです:\n${combinedContent}`;
      const aiMessages: AIMessage[] = [
        {
          role: "user",
          content: "上記のテキストを分析してください。",
        },
      ];

      const result = await sendAI(aiConfig, systemPrompt, aiMessages, abortController.signal);

      abortControllersRef.current.delete(executionId);
      setHistory((prev) =>
        prev.map((h) =>
          h.id === executionId
            ? {
                ...h,
                status: "completed" as const,
                result,
                completedAt: new Date().toISOString(),
              }
            : h
        )
      );
    } catch (e) {
      abortControllersRef.current.delete(executionId);
      // 停止された場合は一覧から削除済みなので何もしない
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (abortController.signal.aborted) return;
      setHistory((prev) =>
        prev.map((h) =>
          h.id === executionId
            ? {
                ...h,
                status: "error" as const,
                result: e instanceof Error ? e.message : String(e),
                completedAt: new Date().toISOString(),
              }
            : h
        )
      );
    }
  }, [selectedAgentId, selectedFiles, allAgents, projectId, memos]);

  // 詳細ビュー
  if (detailExecution) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            size="small"
            onClick={() => {
              setDetailExecution(null);
              setSelectionToolbar(null);
            }}
            title="一覧に戻る"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" fontWeight={500} color="text.primary">
            {detailExecution.agentName}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            → {detailExecution.fileLabel}
          </Typography>
          <Chip
            label={
              detailExecution.status === "completed" ? "完了" : "エラー"
            }
            size="small"
            color={
              detailExecution.status === "completed" ? "success" : "error"
            }
            sx={{ fontSize: "0.6rem", height: 18 }}
          />
        </Box>
        <Typography variant="caption" color="text.disabled">
          {new Date(detailExecution.startedAt).toLocaleString("ja-JP")}
          {detailExecution.completedAt &&
            ` → ${new Date(detailExecution.completedAt).toLocaleString("ja-JP")}`}
        </Typography>
        <Box
          ref={resultRef}
          sx={{
            position: "relative",
            p: 2,
            borderRadius: "var(--radius-lg)",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "var(--bg-tertiary)",
            maxHeight: 500,
            overflow: "auto",
          }}
        >
          {/* 選択ツールバー */}
          {selectionToolbar && (
            <div
              ref={toolbarRef}
              className="absolute z-50 flex items-center gap-0.5 px-1 py-0.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-md"
              style={{
                left: Math.max(0, selectionToolbar.x - 60),
                top: Math.max(0, selectionToolbar.y - 28),
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <button
                onClick={handleSelectionToMemo}
                className="text-[10px] px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
              >
                メモにする
              </button>
              <div className="w-px h-3 bg-[var(--border-default)]" />
              <button
                onClick={handleSelectionAppend}
                className="text-[10px] px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
              >
                メモに追記
              </button>
            </div>
          )}
          <div className="chat-markdown text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{detailExecution.result}</ReactMarkdown>
          </div>
        </Box>

        {/* メモ追記先選択モーダル */}
        <Modal
          open={appendOpen}
          onClose={() => setAppendOpen(false)}
          title="追記先のメモを選択"
        >
          {memoLoading ? (
            <p className="text-[var(--text-tertiary)] text-sm py-4 text-center">読み込み中...</p>
          ) : memoList.length === 0 ? (
            <p className="text-[var(--text-tertiary)] text-sm py-4 text-center">メモがありません</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {memoList.map((memo) => (
                <button
                  key={memo.filename}
                  onClick={() => handleAppendToMemo(memo)}
                  className="w-full text-left px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="text-sm text-[var(--text-primary)] truncate">{memo.title}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{memo.created_at}</div>
                </button>
              ))}
            </div>
          )}
        </Modal>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* エージェント実行フォーム */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <SmartToyOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body1" fontWeight={500} color="text.primary">
            エージェントを動かす
          </Typography>
          {runningCount > 0 && (
            <Chip
              icon={<CircularProgress size={10} />}
              label={`${runningCount}件実行中`}
              size="small"
              color="primary"
              sx={{ fontSize: "0.6rem", height: 20 }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
          <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
            <InputLabel sx={{ fontSize: "0.8rem" }}>エージェント</InputLabel>
            <Select
              value={selectedAgentId}
              label="エージェント"
              onChange={(e) => setSelectedAgentId(e.target.value)}
              sx={{ fontSize: "0.8rem" }}
            >
              {allAgents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id} sx={{ fontSize: "0.8rem" }}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
            <InputLabel sx={{ fontSize: "0.8rem" }}>入力ファイル</InputLabel>
            <Select
              multiple
              value={selectedFiles}
              label="入力ファイル"
              onChange={(e) => {
                const val = e.target.value;
                setSelectedFiles(typeof val === "string" ? val.split(",") : val);
              }}
              renderValue={(selected) =>
                selected.map((s) => getFileLabel(s)).join(", ")
              }
              sx={{ fontSize: "0.8rem" }}
            >
              {manuscripts.length > 0 && (
                <ListSubheader sx={{ fontSize: "0.7rem", lineHeight: "28px", fontWeight: 600 }}>
                  原稿一覧
                </ListSubheader>
              )}
              {manuscripts.map((m) => {
                const val = `manuscript:${m.filename}`;
                return (
                  <MenuItem key={val} value={val} sx={{ fontSize: "0.8rem", pl: 2 }}>
                    <Checkbox size="small" checked={selectedFiles.includes(val)} sx={{ p: 0.5, mr: 1 }} />
                    <ListItemText
                      primary={m.filename}
                      secondary={`${m.char_count.toLocaleString()}字`}
                      primaryTypographyProps={{ fontSize: "0.8rem" }}
                      secondaryTypographyProps={{ fontSize: "0.65rem" }}
                    />
                  </MenuItem>
                );
              })}
              {memos.length > 0 && (
                <ListSubheader sx={{ fontSize: "0.7rem", lineHeight: "28px", fontWeight: 600 }}>
                  メモ
                </ListSubheader>
              )}
              {memos.map((m) => {
                const val = `memo:${m.filename}`;
                return (
                  <MenuItem key={val} value={val} sx={{ fontSize: "0.8rem", pl: 2 }}>
                    <Checkbox size="small" checked={selectedFiles.includes(val)} sx={{ p: 0.5, mr: 1 }} />
                    <ListItemText
                      primary={m.title}
                      primaryTypographyProps={{ fontSize: "0.8rem" }}
                    />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRun}
            disabled={!selectedAgentId || selectedFiles.length === 0}
            icon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
          >
            実行
          </Button>
        </Box>
      </Box>

      {/* 実行履歴 */}
      {history.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            fontWeight={500}
            color="text.secondary"
            sx={{ display: "block", mb: 1, letterSpacing: "0.04em" }}
          >
            実行履歴
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {history.map((exec) => (
              <Box
                key={exec.id}
                onClick={() =>
                  exec.status !== "running" ? setDetailExecution(exec) : undefined
                }
                sx={{
                  p: 1.5,
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "var(--bg-tertiary)",
                  cursor: exec.status !== "running" ? "pointer" : "default",
                  transition: "border-color 0.15s",
                  "&:hover":
                    exec.status !== "running"
                      ? { borderColor: "text.disabled" }
                      : {},
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={0.5}
                >
                  {exec.status === "running" && (
                    <CircularProgress size={14} />
                  )}
                  {exec.status === "completed" && (
                    <CheckCircleOutlineIcon
                      sx={{ fontSize: 14, color: "success.main" }}
                    />
                  )}
                  {exec.status === "error" && (
                    <ErrorOutlineIcon
                      sx={{ fontSize: 14, color: "error.main" }}
                    />
                  )}
                  <Typography
                    variant="caption"
                    fontWeight={500}
                    color="text.primary"
                  >
                    {exec.agentName}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    → {exec.fileLabel}
                  </Typography>
                  <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
                    {exec.status === "running" && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStopTargetId(exec.id);
                        }}
                        title="停止"
                        sx={{ p: 0.25 }}
                      >
                        <StopIcon sx={{ fontSize: 14, color: "error.main" }} />
                      </IconButton>
                    )}
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ fontSize: "0.6rem" }}
                    >
                      {new Date(exec.startedAt).toLocaleString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </Box>
                {exec.status !== "running" && exec.result && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontSize: "0.65rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {exec.result}
                  </Typography>
                )}
                {exec.status === "running" && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontSize: "0.65rem" }}
                  >
                    実行中...
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 停止確認モーダル */}
      <Modal
        open={!!stopTargetId}
        onClose={() => setStopTargetId(null)}
        title="エージェントの停止"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStopTargetId(null)}>
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (stopTargetId) handleStop(stopTargetId);
                setStopTargetId(null);
              }}
            >
              停止する
            </Button>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary">
          実行中のエージェントを停止しますか？停止すると結果は破棄されます。
        </Typography>
      </Modal>
    </Box>
  );
}
