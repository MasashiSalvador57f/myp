import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { FileList } from './FileList';
import { MemoPanel } from './MemoPanel';
import { TaskPanel } from './TaskPanel';
import type { ManuscriptFile } from '@/types';

interface LeftSidebarTabsProps {
  projectId: string;
  onFileSelect?: (file: ManuscriptFile) => void;
  onCreateFile?: (filename: string) => void;
  onOpenChatSession?: (sessionId: string) => void;
}

export function LeftSidebarTabs({ projectId, onFileSelect, onCreateFile, onOpenChatSession }: LeftSidebarTabsProps) {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          minHeight: 36,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          '& .MuiTab-root': {
            minHeight: 36,
            py: 0.5,
            fontSize: '0.7rem',
          },
        }}
      >
        <Tab icon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="原稿" />
        <Tab icon={<StickyNote2OutlinedIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="メモ" />
        <Tab icon={<CheckBoxOutlinedIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="タスク" />
      </Tabs>
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 0 ? (
          <FileList onFileSelect={onFileSelect} onCreateFile={onCreateFile} />
        ) : tab === 1 ? (
          <MemoPanel projectId={projectId} onOpenChatSession={onOpenChatSession} />
        ) : (
          <TaskPanel projectId={projectId} />
        )}
      </Box>
    </Box>
  );
}
