"use client";

import { create } from "zustand";
import type { InterviewStudyPlan, WizardInput } from "@/lib/contentService";
import {
  fetchStudyPlans,
  fetchStudyPlan,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  archiveStudyPlan,
  restoreStudyPlan,
  duplicateStudyPlan,
  markSessionComplete,
  generateStudyPlan,
  regeneratePlan,
  regenerateWeek,
} from "./studyPlanService";
import { generateSessionSubTopics } from "./studyPlanClient";

interface StudyPlanState {
  plans: InterviewStudyPlan[];
  activePlan: InterviewStudyPlan | null;
  loading: boolean;
  generating: boolean;
  error: string | null;

  loadPlans: () => Promise<void>;
  loadPlan: (id: string) => Promise<void>;
  createPlan: (
    plan: Omit<InterviewStudyPlan, "id" | "createdAt" | "updatedAt">,
  ) => Promise<InterviewStudyPlan>;
  updatePlan: (
    id: string,
    patch: Partial<InterviewStudyPlan>,
  ) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  archivePlan: (id: string) => Promise<void>;
  restorePlan: (id: string) => Promise<void>;
  duplicatePlan: (id: string) => Promise<InterviewStudyPlan>;
  toggleSession: (
    planId: string,
    weekNumber: number,
    sessionId: string,
    completed: boolean,
  ) => Promise<void>;
  generatePlan: (input: WizardInput) => Promise<InterviewStudyPlan>;
  regenerateActivePlan: (id: string) => Promise<void>;
  regenerateActivePlanWeek: (id: string, weekNumber: number) => Promise<void>;
  generateSubTopicsForSession: (planId: string, sessionId: string) => Promise<void>;
  clearError: () => void;
}

export const useStudyPlanStore = create<StudyPlanState>((set, get) => ({
  plans: [],
  activePlan: null,
  loading: false,
  generating: false,
  error: null,

  loadPlans: async () => {
    set({ loading: true, error: null });
    try {
      const plans = await fetchStudyPlans();
      set({ plans, loading: false });
    } catch {
      set({ loading: false, error: "Unable to load study plans." });
    }
  },

  loadPlan: async (id) => {
    set({ loading: true, error: null });
    try {
      const plan = await fetchStudyPlan(id);
      set({ activePlan: plan, loading: false });
    } catch {
      set({ loading: false, error: "Unable to load study plan." });
    }
  },

  createPlan: async (plan) => {
    const created = await createStudyPlan(plan);
    set((state) => ({ plans: [created, ...state.plans] }));
    return created;
  },

  updatePlan: async (id, patch) => {
    const updated = await updateStudyPlan(id, patch);
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? updated : p)),
      activePlan: state.activePlan?.id === id ? updated : state.activePlan,
    }));
  },

  deletePlan: async (id) => {
    await deleteStudyPlan(id);
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
      activePlan: state.activePlan?.id === id ? null : state.activePlan,
    }));
  },

  archivePlan: async (id) => {
    const updated = await archiveStudyPlan(id);
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? updated : p)),
      activePlan: state.activePlan?.id === id ? updated : state.activePlan,
    }));
  },

  restorePlan: async (id) => {
    const updated = await restoreStudyPlan(id);
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? updated : p)),
      activePlan: state.activePlan?.id === id ? updated : state.activePlan,
    }));
  },

  duplicatePlan: async (id) => {
    const copy = await duplicateStudyPlan(id);
    set((state) => ({ plans: [copy, ...state.plans] }));
    return copy;
  },

  toggleSession: async (planId, weekNumber, sessionId, completed) => {
    const updated = await markSessionComplete(
      planId,
      weekNumber,
      sessionId,
      completed,
    );
    set((state) => ({
      plans: state.plans.map((p) => (p.id === planId ? updated : p)),
      activePlan:
        state.activePlan?.id === planId ? updated : state.activePlan,
    }));
  },

  generatePlan: async (input) => {
    set({ generating: true, error: null });
    try {
      const plan = await generateStudyPlan(input);
      set({ generating: false });
      return plan;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "AI generation failed.";
      set({ generating: false, error: message });
      throw err;
    }
  },

  regenerateActivePlan: async (id) => {
    set({ generating: true, error: null });
    try {
      const updated = await regeneratePlan(id);
      set((state) => ({
        generating: false,
        plans: state.plans.map((p) => (p.id === id ? updated : p)),
        activePlan:
          state.activePlan?.id === id ? updated : state.activePlan,
      }));
    } catch {
      set({ generating: false, error: "Unable to regenerate plan." });
    }
  },

  regenerateActivePlanWeek: async (id, weekNumber) => {
    set({ generating: true, error: null });
    try {
      const updated = await regenerateWeek(id, weekNumber);
      set((state) => ({
        generating: false,
        plans: state.plans.map((p) => (p.id === id ? updated : p)),
        activePlan:
          state.activePlan?.id === id ? updated : state.activePlan,
      }));
    } catch {
      set({ generating: false, error: "Unable to regenerate week." });
    }
  },

  generateSubTopicsForSession: async (planId, sessionId) => {
    try {
      const updated = await generateSessionSubTopics(planId, sessionId);
      set((state) => ({
        plans: state.plans.map((p) => (p.id === planId ? updated : p)),
        activePlan:
          state.activePlan?.id === planId ? updated : state.activePlan,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate prep list.";
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
