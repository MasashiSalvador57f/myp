import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import type { MaterialFile } from "../../types";

interface RecentChatsProps {
  materials: MaterialFile[];
  onOpen?: (material: MaterialFile) => void;
  onChatClick?: (filename: string) => void;
}

export function RecentChats({ materials, onOpen, onChatClick }: RecentChatsProps) {
  const chatMaterials = materials
    .filter((m) => m.kind === "chat")
    .slice(0, 5);

  if (chatMaterials.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled" textAlign="center" py={2}>
        AI相談の履歴がありません
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {chatMaterials.map((material) => {
        const date = new Date(material.updated_at).toLocaleDateString("ja-JP", {
          month: "numeric",
          day: "numeric",
        });
        const title = material.filename.replace(/\.md$/, "");

        return (
          <ListItemButton
            key={material.filename}
            onClick={() => {
              onChatClick?.(material.filename);
              onOpen?.(material);
            }}
            sx={{
              borderRadius: 'var(--radius-lg)',
              py: 1,
              px: 1.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            </ListItemIcon>
            <ListItemText
              primary={title}
              primaryTypographyProps={{ fontSize: '0.875rem', color: 'text.secondary', noWrap: true }}
            />
            <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
              {date}
            </Typography>
          </ListItemButton>
        );
      })}
    </List>
  );
}
