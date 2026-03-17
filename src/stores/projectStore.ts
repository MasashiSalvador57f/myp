import { create } from "zustand";
import type { ProjectSummary, GetProjectResult } from "../types";
import * as commands from "../lib/tauri-commands";

interface ProjectState {
  projects: ProjectSummary[];
  currentProject: GetProjectResult | null;
  currentProjectId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createProject: (name: string, targetCharCount?: number) => Promise<string>;
  updateProject: (projectId: string, name?: string, targetCharCount?: number) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  currentProjectId: null,
  loading: false,
  error: null,

  loadProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await commands.listProjects();
      set({ projects, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  loadProject: async (projectId: string) => {
    set({ loading: true, error: null, currentProjectId: projectId });
    try {
      const detail = await commands.getProject(projectId);
      set({ currentProject: detail, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  createProject: async (name: string, targetCharCount?: number) => {
    set({ loading: true, error: null });
    try {
      const summary = await commands.createProject(name, targetCharCount);
      await get().loadProjects();
      return summary.id;
    } catch (e) {
      set({ error: String(e), loading: false });
      throw e;
    }
  },

  updateProject: async (projectId: string, name?: string, targetCharCount?: number) => {
    try {
      await commands.updateProject(projectId, name, targetCharCount);
      if (get().currentProjectId === projectId) {
        await get().loadProject(projectId);
      }
      await get().loadProjects();
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      await commands.deleteProject(projectId);
      if (get().currentProjectId === projectId) {
        set({ currentProject: null, currentProjectId: null });
      }
      await get().loadProjects();
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));
