import { create } from "zustand";
import type { AppSettings, EditorSettings, AiSettings, StorageSettings } from "../types";
import type { CustomPrompt } from "../types";
import * as commands from "../lib/tauri-commands";

const DEFAULT_SETTINGS: AppSettings = {
  editor: {
    font_family: "Noto Serif JP",
    font_size: 16,
    writing_mode: "vertical",
    chars_per_line: 40,
    theme: "dark",
    color_preset: "default",
  },
  ai: {
    api_key: null,
    model: "claude-sonnet-4-6",
    provider: "anthropic",
  },
  storage: {
    data_dir: null,
    memo_dir: null,
  },
};

interface SettingsState {
  settings: AppSettings;
  customPrompts: CustomPrompt[];
  loading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateEditorSettings: (editor: Partial<EditorSettings>) => Promise<void>;
  updateAiSettings: (ai: Partial<AiSettings>) => Promise<void>;
  updateStorageSettings: (storage: Partial<StorageSettings>) => Promise<void>;
  addCustomPrompt: (prompt: Omit<CustomPrompt, "id">) => void;
  updateCustomPrompt: (id: string, updates: Partial<Omit<CustomPrompt, "id">>) => void;
  deleteCustomPrompt: (id: string) => void;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  customPrompts: [],
  loading: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await commands.getSettings();
      set({ settings, loading: false });
    } catch {
      // バックエンド未実装時はデフォルト設定を使用
      set({ settings: DEFAULT_SETTINGS, loading: false });
    }
  },

  updateEditorSettings: async (editor: Partial<EditorSettings>) => {
    const current = get().settings;
    const updated: AppSettings = {
      ...current,
      editor: { ...current.editor, ...editor },
    };
    set({ settings: updated });
    try {
      await commands.saveSettings(updated);
    } catch (e) {
      set({ error: String(e) });
    }
  },

  updateAiSettings: async (ai: Partial<AiSettings>) => {
    const current = get().settings;
    const updated: AppSettings = {
      ...current,
      ai: { ...current.ai, ...ai },
    };
    set({ settings: updated });
    try {
      await commands.saveSettings(updated);
    } catch (e) {
      set({ error: String(e) });
    }
  },

  updateStorageSettings: async (storage: Partial<StorageSettings>) => {
    const current = get().settings;
    const updated: AppSettings = {
      ...current,
      storage: { ...current.storage, ...storage },
    };
    set({ settings: updated });
    try {
      await commands.saveSettings(updated);
    } catch (e) {
      set({ error: String(e) });
    }
  },

  addCustomPrompt: (prompt: Omit<CustomPrompt, "id">) => {
    const id = `prompt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({
      customPrompts: [...state.customPrompts, { ...prompt, id }],
    }));
  },

  updateCustomPrompt: (id: string, updates: Partial<Omit<CustomPrompt, "id">>) => {
    set((state) => ({
      customPrompts: state.customPrompts.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },

  deleteCustomPrompt: (id: string) => {
    set((state) => ({
      customPrompts: state.customPrompts.filter((p) => p.id !== id),
    }));
  },

  clearError: () => set({ error: null }),
}));
