import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import MuiToolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { FontSettings } from "../components/settings/FontSettings";
import { LayoutSettings } from "../components/settings/LayoutSettings";
import { AISettings } from "../components/settings/AISettings";
import { PromptManager } from "../components/settings/PromptManager";
import { StorageSettings } from "../components/settings/StorageSettings";
import { ThemeSettings } from "../components/settings/ThemeSettings";
import { useSettingsStore } from "../stores/settingsStore";

type SettingsTab = "theme" | "font" | "layout" | "storage" | "ai" | "prompts";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "theme", label: "テーマ" },
  { id: "font", label: "フォント" },
  { id: "layout", label: "レイアウト" },
  { id: "storage", label: "保存先" },
  { id: "ai", label: "AI設定" },
  { id: "prompts", label: "プロンプト管理" },
];

export default function SettingsPage() {
  const { loadSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("theme");

  useEffect(() => {
    loadSettings();
  }, []);

  const tabIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* ヘッダー */}
      <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <MuiToolbar variant="dense" sx={{ minHeight: '48px !important', px: 3, gap: 2 }}>
          <Link
            to="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.disabled">ホーム</Typography>
          </Link>
          <Typography variant="h3" sx={{ fontWeight: 600, fontSize: '1rem', color: 'text.primary' }}>
            設定
          </Typography>
        </MuiToolbar>
      </AppBar>

      {/* タブ + コンテンツ */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* サイドバー（タブ） */}
        <Box sx={{ width: 192, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'var(--bg-secondary)', flexShrink: 0 }}>
          <Tabs
            orientation="vertical"
            value={tabIndex}
            onChange={(_e, newValue: number) => setActiveTab(TABS[newValue].id)}
            sx={{
              pt: 1.5,
              '& .MuiTab-root': {
                alignItems: 'flex-start',
                textAlign: 'left',
                pl: 2,
                minHeight: 40,
                fontSize: '0.875rem',
              },
              '& .MuiTabs-indicator': {
                left: 'auto',
                right: 0,
                width: 2,
              },
            }}
          >
            {TABS.map((tab) => (
              <Tab key={tab.id} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* コンテンツ */}
        <Box component="main" sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          <Box sx={{ maxWidth: 560 }}>
            {activeTab === "theme" && (
              <section>
                <Typography variant="h3" fontWeight={500} color="text.primary" mb={2.5}>
                  テーマ設定
                </Typography>
                <ThemeSettings />
              </section>
            )}
            {activeTab === "font" && (
              <section>
                <Typography variant="h3" fontWeight={500} color="text.primary" mb={2.5}>
                  フォント設定
                </Typography>
                <FontSettings />
              </section>
            )}
            {activeTab === "layout" && (
              <section>
                <Typography variant="h3" fontWeight={500} color="text.primary" mb={2.5}>
                  レイアウト設定
                </Typography>
                <LayoutSettings />
              </section>
            )}
            {activeTab === "storage" && (
              <section>
                <Typography variant="h3" fontWeight={500} color="text.primary" mb={2.5}>
                  保存先設定
                </Typography>
                <StorageSettings />
              </section>
            )}
            {activeTab === "ai" && (
              <section>
                <Typography variant="h3" fontWeight={500} color="text.primary" mb={2.5}>
                  AI設定
                </Typography>
                <AISettings />
              </section>
            )}
            {activeTab === "prompts" && (
              <section>
                <Typography variant="h3" fontWeight={500} color="text.primary" mb={2.5}>
                  カスタムプロンプト管理
                </Typography>
                <PromptManager />
              </section>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
