import { useState } from "react";
import Box from "@mui/material/Box";
import { Modal, Button, Input } from "../ui";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, targetCharCount?: number) => Promise<void>;
}

export function NewProjectModal({ open, onClose, onCreate }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [targetStr, setTargetStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("プロジェクト名を入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const target = targetStr ? parseInt(targetStr, 10) : undefined;
      await onCreate(name.trim(), isNaN(target ?? NaN) ? undefined : target);
      setName("");
      setTargetStr("");
      onClose();
    } catch {
      setError("作成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setTargetStr("");
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="新規プロジェクト"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            作成
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Input
          label="プロジェクト名"
          placeholder="例: 夏の短編小説"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
          error={error}
        />
        <Input
          label="目標文字数（任意）"
          placeholder="例: 100000"
          type="number"
          min={0}
          value={targetStr}
          onChange={(e) => setTargetStr(e.target.value)}
          hint="入力しない場合は目標なしになります"
        />
      </Box>
    </Modal>
  );
}
