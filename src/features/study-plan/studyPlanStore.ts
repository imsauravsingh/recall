import { create } from "zustand";
import type { StudyPlan } from "../../lib/contentService";
import {
  archiveStudyPlan,
  duplicateStudyPlan,
  loadStudyPlan,
  saveStudyPlan,
} from "./studyPlanService";

interface StudyPlanState {
  plan: StudyPlan | null;
  loading: boolean;
  error?: string;
  loadPlan: () => Promise<void>;
  savePlan: (plan: StudyPlan) => Promise<void>;
  duplicatePlan: () => Promise<void>;
  archivePlan: () => Promise<void>;
  restorePlan: () => Promise<void>;
}

export const useStudyPlanStore = create<StudyPlanState>((set, get) => ({
  plan: null,
  loading: false,
  loadPlan: async () => {
    set({ loading: true, error: undefined });
    try {
      const plan = await loadStudyPlan();
      set({ plan, loading: false });
    } catch (error) {
      set({ loading: false, error: "Unable to load study plan." });
    }
  },
  savePlan: async (plan) => {
    set({ loading: true, error: undefined });
    try {
      const saved = await saveStudyPlan(plan);
      set({ plan: saved, loading: false });
    } catch (error) {
      set({ loading: false, error: "Unable to save study plan." });
    }
  },
  duplicatePlan: async () => {
    const current = get().plan;
    if (!current) {
      return;
    }

    set({ loading: true, error: undefined });
    try {
      const duplicate = await duplicateStudyPlan(current);
      set({ plan: duplicate, loading: false });
    } catch (error) {
      set({ loading: false, error: "Unable to duplicate study plan." });
    }
  },
  archivePlan: async () => {
    const current = get().plan;
    if (!current) {
      return;
    }

    set({ loading: true, error: undefined });
    try {
      const archived = await archiveStudyPlan({
        ...current,
        status: "archived",
      });
      set({ plan: archived, loading: false });
    } catch (error) {
      set({ loading: false, error: "Unable to archive study plan." });
    }
  },
  restorePlan: async () => {
    const current = get().plan;
    if (!current) {
      return;
    }

    set({ loading: true, error: undefined });
    try {
      const restored = await archiveStudyPlan({ ...current, status: "active" });
      set({ plan: restored, loading: false });
    } catch (error) {
      set({ loading: false, error: "Unable to restore study plan." });
    }
  },
}));
