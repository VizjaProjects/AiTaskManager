import { useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth";
import { Role } from "../types";
import { normalizeSurveyId } from "../surveys/utils";
import {
  taskApi,
  categoryApi,
  taskStatusApi,
  eventApi,
  aiApi,
  aiStatisticApi,
  llmSettingsApi,
  surveyApi,
  questionApi,
  questionOptionApi,
  userResponseApi,
  workspaceApi,
} from "../api";
import { noteApi } from "../api/notes";
import { planApi, adminApi } from "../api";
import { buildNoteContentJson, parseNoteContent } from "../api/adapters";
import { useWorkspaceStore } from "../stores/workspace";
import type {
  Task,
  Note,
  CalendarEvent,
  CreateTaskRequest,
  EditTaskRequest,
  CreateCategoryRequest,
  EditCategoryRequest,
  CreateTaskStatusRequest,
  EditTaskStatusRequest,
  CreateEventRequest,
  EditEventRequest,
  GenerateAiPlanRequest,
  CreateLlmSettingsRequest,
  AcceptAiTaskRequest,
  AcceptAiEventRequest,
  QuestionType,
} from "../types";
import type { WorkspaceVisibility } from "../types";
import type { CreatePlanRequest } from "../types";

function useWorkspaceId() {
  return useWorkspaceStore((s) => s.activeWorkspaceId);
}

function requireWorkspaceId(workspaceId: string | null): string {
  if (!workspaceId) throw new Error("No active workspace selected");
  return workspaceId;
}

const surveyQueryDefaults = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  retry: 1,
} as const;

/* ───────── Workspaces ───────── */

export function useWorkspaces() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const isLoading = useWorkspaceStore((s) => s.isLoading);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);
  return { workspaces, isLoading, refetch: fetchWorkspaces };
}

export function useActiveWorkspace() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const getActiveWorkspace = useWorkspaceStore((s) => s.getActiveWorkspace);
  return { activeWorkspaceId, workspace: getActiveWorkspace() };
}

export function useCreateWorkspace() {
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace);
  return useMutation({
    mutationFn: ({
      name,
      assignedUserIds,
      visibility,
    }: {
      name: string;
      assignedUserIds?: string[];
      visibility?: WorkspaceVisibility;
    }) => createWorkspace(name, assignedUserIds, visibility),
  });
}

export function useSetWorkspaceVisibility() {
  const setWorkspaceVisibility = useWorkspaceStore(
    (s) => s.setWorkspaceVisibility,
  );
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceId,
      visibility,
    }: {
      workspaceId: string;
      visibility: WorkspaceVisibility;
    }) => setWorkspaceVisibility(workspaceId, visibility),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSetActiveWorkspace() {
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => setActiveWorkspace(workspaceId),
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useDeleteWorkspace() {
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => deleteWorkspace(workspaceId),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useAssignWorkspaceUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceId,
      userIds,
    }: {
      workspaceId: string;
      userIds: string[];
    }) => workspaceApi.assignUsers(workspaceId, userIds),
    onSuccess: async () => {
      await useWorkspaceStore.getState().fetchWorkspaces();
      qc.invalidateQueries();
    },
  });
}

export function useAssignWorkspaceUsersByEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceId,
      emails,
    }: {
      workspaceId: string;
      emails: string[];
    }) => workspaceApi.assignUsersByEmail(workspaceId, emails),
    onSuccess: async () => {
      await useWorkspaceStore.getState().fetchWorkspaces();
      qc.invalidateQueries();
    },
  });
}

export function useRemoveWorkspaceUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceId,
      userIds,
    }: {
      workspaceId: string;
      userIds: string[];
    }) => workspaceApi.removeUsers(workspaceId, userIds),
    onSuccess: async () => {
      await useWorkspaceStore.getState().fetchWorkspaces();
      qc.invalidateQueries();
    },
  });
}

/* ───────── Tasks ───────── */

export function useTasks() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: ["tasks", workspaceId],
    queryFn: async () => {
      const id = requireWorkspaceId(workspaceId);
      const { tasks } = await taskApi.getAll(id);
      return tasks;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateTask() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskRequest) =>
      taskApi.create(requireWorkspaceId(workspaceId), data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", workspaceId] }),
  });
}

export function useEditTask() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: EditTaskRequest }) =>
      taskApi.edit(requireWorkspaceId(workspaceId), taskId, data),
    onMutate: async ({ taskId, data }) => {
      await qc.cancelQueries({ queryKey: ["tasks", workspaceId] });
      const previous = qc.getQueryData<Task[]>(["tasks", workspaceId]);
      if (previous) {
        qc.setQueryData<Task[]>(["tasks", workspaceId], (old) =>
          (old ?? []).map((t) =>
            t.taskId === taskId
              ? { ...t, ...data, updatedAt: new Date().toISOString() }
              : t,
          ),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["tasks", workspaceId], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      qc.invalidateQueries({ queryKey: ["events", workspaceId] });
    },
  });
}

export function useDeleteTask() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      taskApi.delete(requireWorkspaceId(workspaceId), taskId),
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: ["tasks", workspaceId] });
      const previous = qc.getQueryData<Task[]>(["tasks", workspaceId]);
      qc.setQueryData<Task[]>(["tasks", workspaceId], (old) =>
        (old ?? []).filter((t) => t.taskId !== taskId),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["tasks", workspaceId], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks", workspaceId] }),
  });
}

export function useSetTaskAssignees() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, userIds }: { taskId: string; userIds: string[] }) =>
      taskApi.setAssignees(requireWorkspaceId(workspaceId), taskId, userIds),
    onMutate: async ({ taskId, userIds }) => {
      await qc.cancelQueries({ queryKey: ["tasks", workspaceId] });
      const previous = qc.getQueryData<Task[]>(["tasks", workspaceId]);
      qc.setQueryData<Task[]>(["tasks", workspaceId], (old) =>
        (old ?? []).map((t) =>
          t.taskId === taskId ? { ...t, assignedUserIds: userIds } : t,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["tasks", workspaceId], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks", workspaceId] }),
  });
}

export function useCategories() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: ["categories", workspaceId],
    queryFn: async () => {
      const id = requireWorkspaceId(workspaceId);
      const { categories } = await categoryApi.getAll(id);
      return categories;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateCategory() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoryApi.create(requireWorkspaceId(workspaceId), data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["categories", workspaceId] }),
  });
}

export function useEditCategory() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: EditCategoryRequest;
    }) => categoryApi.edit(requireWorkspaceId(workspaceId), categoryId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["categories", workspaceId] }),
  });
}

export function useDeleteCategory() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) =>
      categoryApi.delete(requireWorkspaceId(workspaceId), categoryId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["categories", workspaceId] }),
  });
}

export function useTaskStatuses() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: ["taskStatuses", workspaceId],
    queryFn: async () => {
      const id = requireWorkspaceId(workspaceId);
      const { statuses } = await taskStatusApi.getAll(id);
      return statuses;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateTaskStatus() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskStatusRequest) =>
      taskStatusApi.create(requireWorkspaceId(workspaceId), data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["taskStatuses", workspaceId] }),
  });
}

export function useEditTaskStatus() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      statusId,
      data,
    }: {
      statusId: string;
      data: EditTaskStatusRequest;
    }) => taskStatusApi.edit(requireWorkspaceId(workspaceId), statusId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["taskStatuses", workspaceId] }),
  });
}

export function useDeleteTaskStatus() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (statusId: string) =>
      taskStatusApi.delete(requireWorkspaceId(workspaceId), statusId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["taskStatuses", workspaceId] }),
  });
}

export function useEvents() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: ["events", workspaceId],
    queryFn: async () => {
      const id = requireWorkspaceId(workspaceId);
      const { events } = await eventApi.getAll(id);
      return events;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateEvent() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) =>
      eventApi.create(requireWorkspaceId(workspaceId), data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["events", workspaceId] }),
  });
}

export function useEditEvent() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: EditEventRequest;
    }) => eventApi.edit(requireWorkspaceId(workspaceId), eventId, data),
    onMutate: async ({ eventId, data }) => {
      await qc.cancelQueries({ queryKey: ["events", workspaceId] });
      await qc.cancelQueries({ queryKey: ["tasks", workspaceId] });
      const previousEvents = qc.getQueryData<CalendarEvent[]>([
        "events",
        workspaceId,
      ]);
      const previousTasks = qc.getQueryData<Task[]>(["tasks", workspaceId]);

      if (previousEvents) {
        qc.setQueryData<CalendarEvent[]>(["events", workspaceId], (old) =>
          (old ?? []).map((e) =>
            e.eventId === eventId
              ? { ...e, ...data, updatedAt: new Date().toISOString() }
              : e,
          ),
        );
      }

      const linked = previousEvents?.find((e) => e.eventId === eventId);
      if (linked?.taskId && data.endDateTime && previousTasks) {
        qc.setQueryData<Task[]>(["tasks", workspaceId], (old) =>
          (old ?? []).map((t) =>
            t.taskId === linked.taskId
              ? {
                  ...t,
                  dueDateTime: data.endDateTime!,
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        );
      }

      return { previousEvents, previousTasks };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousEvents)
        qc.setQueryData(["events", workspaceId], ctx.previousEvents);
      if (ctx?.previousTasks)
        qc.setQueryData(["tasks", workspaceId], ctx.previousTasks);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["events", workspaceId] });
      qc.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });
}

export function useDeleteEvent() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      eventApi.delete(requireWorkspaceId(workspaceId), eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events", workspaceId] });
      qc.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });
}

export function useGenerateAiPlan() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateAiPlanRequest) =>
      aiApi.generatePlan(requireWorkspaceId(workspaceId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aiProposals", workspaceId] });
      // Each generation consumes an AI call, so refresh the plan usage counter.
      qc.invalidateQueries({ queryKey: ["userPlan"] });
    },
  });
}

export function useAiProposals() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: ["aiProposals", workspaceId],
    queryFn: () => aiApi.getPendingProposals(requireWorkspaceId(workspaceId)),
    enabled: !!workspaceId,
  });
}

export function useAcceptAiTask() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: AcceptAiTaskRequest;
    }) => aiApi.acceptTask(requireWorkspaceId(workspaceId), taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aiProposals", workspaceId] });
      qc.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });
}

export function useRejectAiTask() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      aiApi.rejectTask(requireWorkspaceId(workspaceId), taskId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aiProposals", workspaceId] }),
  });
}

export function useAcceptAiEvent() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: AcceptAiEventRequest;
    }) => aiApi.acceptEvent(requireWorkspaceId(workspaceId), eventId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aiProposals", workspaceId] });
      qc.invalidateQueries({ queryKey: ["events", workspaceId] });
    },
  });
}

export function useRejectAiEvent() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      aiApi.rejectEvent(requireWorkspaceId(workspaceId), eventId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aiProposals", workspaceId] }),
  });
}

/* ───────── LLM Settings ───────── */

export function useLlmSettings() {
  return useQuery({
    queryKey: ["llmSettings"],
    queryFn: async () => {
      const { settings } = await llmSettingsApi.getAll();
      return settings;
    },
  });
}

export function useLlmProviders() {
  return useQuery({
    queryKey: ["llmProviders"],
    queryFn: () => llmSettingsApi.getProviders(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useLlmModels() {
  return useQuery({
    queryKey: ["llmModels"],
    queryFn: () => llmSettingsApi.getModels(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useCreateLlmSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLlmSettingsRequest) => llmSettingsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["llmSettings"] }),
  });
}

export function useUpdateLlmSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      llmSettingsId,
      data,
    }: {
      llmSettingsId: string;
      data: CreateLlmSettingsRequest;
    }) => llmSettingsApi.update(llmSettingsId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["llmSettings"] }),
  });
}

export function useDeleteLlmSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (llmSettingsId: string) => llmSettingsApi.delete(llmSettingsId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["llmSettings"] }),
  });
}

/** In Progress — AI statistics not in .NET backend */
export function useAiStatistics() {
  return useQuery({
    queryKey: ["aiStatistics"],
    queryFn: async () => {
      const { statistics } = await aiStatisticApi.getMy();
      return statistics;
    },
    meta: { inProgress: true },
  });
}

export function useDeleteAiStatistic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiStatisticApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aiStatistics"] }),
  });
}

/* ───────── Plans & limits ───────── */

/** Current user's plan limits + live usage (AI calls, workspaces). */
export function useUserPlan() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["userPlan"],
    queryFn: () => planApi.getUserPlan(),
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
  });
}

/** Admin: all plans in the system. */
export function useAdminPlans() {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery({
    queryKey: ["adminPlans"],
    queryFn: () => adminApi.getPlans(),
    enabled: role === Role.ADMIN,
  });
}

/** Admin: create a new plan. */
export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => adminApi.createPlan(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPlans"] }),
  });
}

/** Admin: all users with their plan and current usage. */
export function useAdminUsers() {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => adminApi.getUsers(),
    enabled: role === Role.ADMIN,
  });
}

/* ───────── Surveys ───────── */

export function useSurveys() {
  return useQuery({
    queryKey: ["surveys"],
    queryFn: async () => {
      const data = await surveyApi.getAll();
      return data.surveys;
    },
  });
}

export function useCreateSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description: string }) =>
      surveyApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["surveys"] }),
  });
}

export function useEditSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      surveyId,
      data,
    }: {
      surveyId: string;
      data: { title: string; description: string };
    }) => surveyApi.edit(surveyId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["surveys"] }),
  });
}

export function useChangeSurveyVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      surveyId,
      isVisible,
    }: {
      surveyId: string;
      isVisible: boolean;
    }) => surveyApi.changeVisibility(surveyId, isVisible),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["surveys"] });
      qc.invalidateQueries({ queryKey: ["active-surveys"] });
    },
  });
}

export function useDeleteSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (surveyId: string) => surveyApi.delete(surveyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["surveys"] }),
  });
}

export function useSurveyQuestions(surveyId: string | undefined) {
  return useQuery({
    queryKey: ["survey-questions", surveyId],
    queryFn: async () => {
      if (!surveyId) return [];
      return questionApi.getAllForSurvey(surveyId);
    },
    enabled: !!surveyId,
    ...surveyQueryDefaults,
  });
}

export function useQuestionOptions(questionId: string | undefined) {
  return useQuery({
    queryKey: ["question-options", questionId],
    queryFn: async () => {
      if (!questionId) return [];
      return questionApi.getOptions(questionId);
    },
    enabled: !!questionId,
    staleTime: 30_000,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      surveyId,
      data,
    }: {
      surveyId: string;
      data: {
        questionText: string;
        questionType: QuestionType;
        optionTextValue: string[];
        isRequired: boolean;
        hint?: string | null;
      };
    }) => questionApi.create(surveyId, data),
    onSuccess: (_r, vars) =>
      qc.invalidateQueries({ queryKey: ["survey-questions", vars.surveyId] }),
  });
}

export function useEditQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string;
      data: {
        questionText: string;
        questionType: QuestionType;
        isRequired: boolean;
        hint?: string | null;
      };
    }) => questionApi.edit(questionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["survey-questions"] }),
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => questionApi.delete(questionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["survey-questions"] }),
  });
}

export function useEditQuestionOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionOptionId,
      optionText,
    }: {
      questionOptionId: string;
      optionText: string;
    }) => questionOptionApi.edit(questionOptionId, optionText),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["question-options"] }),
  });
}

export function useDeleteQuestionOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionOptionId: string) =>
      questionOptionApi.delete(questionOptionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["question-options"] }),
  });
}

export function useUserResponses() {
  return useQuery({
    queryKey: ["user-responses"],
    queryFn: async () => {
      const { data } = await userResponseApi.getAll();
      return data.userResponseResultSet;
    },
  });
}

export function useSurveyResponses(surveyId: string | undefined) {
  return useQuery({
    queryKey: ["survey-responses", surveyId],
    queryFn: async () => {
      if (!surveyId) return [];
      return userResponseApi.getBySurvey(surveyId);
    },
    enabled: !!surveyId,
    staleTime: 30_000,
  });
}

export function useMyResponses(enabled = true) {
  return useQuery({
    queryKey: ["my-responses"],
    queryFn: async () => {
      const { data } = await userResponseApi.getAll();
      return data.userResponseResultSet ?? [];
    },
    enabled,
    ...surveyQueryDefaults,
  });
}

export function useActiveSurveys(enabled = true) {
  return useQuery({
    queryKey: ["active-surveys"],
    queryFn: async () => {
      const data = await surveyApi.getAllActive();
      return data.surveys;
    },
    enabled,
    ...surveyQueryDefaults,
  });
}

export function useHasPendingSurvey(enabled = true) {
  const {
    data: surveys,
    isLoading: surveysLoading,
    isError: surveysError,
  } = useActiveSurveys(enabled);
  const {
    data: responses,
    isLoading: responsesLoading,
    isError: responsesError,
  } = useMyResponses(enabled);

  const surveyIds = useMemo(
    () => (surveys ?? []).map((s) => s.surveyId),
    [surveys],
  );

  const questionQueryDefs = useMemo(
    () =>
      surveyIds.map((surveyId) => ({
        queryKey: ["survey-questions", surveyId] as const,
        queryFn: () => questionApi.getAllForSurvey(surveyId),
        enabled: enabled && surveyIds.length > 0,
        ...surveyQueryDefaults,
      })),
    [surveyIds, enabled],
  );

  const questionQueries = useQueries({ queries: questionQueryDefs });

  if (!enabled) {
    return {
      hasPendingSurvey: false,
      firstPendingSurveyId: null as string | null,
      isLoading: false,
    };
  }

  const questionsLoading = questionQueries.some((q) => q.isLoading);
  const questionsError = questionQueries.some((q) => q.isError);
  const isLoading = surveysLoading || responsesLoading || questionsLoading;

  if (isLoading) {
    return {
      hasPendingSurvey: false,
      firstPendingSurveyId: null,
      isLoading: true,
    };
  }

  if (surveysError || responsesError || questionsError) {
    return {
      hasPendingSurvey: false,
      firstPendingSurveyId: null,
      isLoading: false,
    };
  }

  const answeredQuestionIds = new Set(
    (responses ?? []).map((r) => normalizeSurveyId(r.questionId)),
  );

  let firstPendingSurveyId: string | null = null;
  let hasPendingSurvey = false;

  (surveys ?? []).forEach((survey, index) => {
    const questions = questionQueries[index]?.data ?? [];
    const hasUnanswered = questions.some(
      (q) => !answeredQuestionIds.has(normalizeSurveyId(q.questionId)),
    );
    if (hasUnanswered) {
      hasPendingSurvey = true;
      firstPendingSurveyId ??= survey.surveyId;
    }
  });

  return { hasPendingSurvey, firstPendingSurveyId, isLoading: false };
}

/** Only USER accounts need survey gate checks — avoids duplicate fetches in AuthGate. */
export function useSurveyGate() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const enabled = isAuthenticated && role === Role.USER;
  return useHasPendingSurvey(enabled);
}

type MyResponseCacheRow = {
  surveyId: string;
  surveyDescription: string;
  questionId: string;
  questionText: string;
  userResponseId: string;
  textAnswer: string;
};

function appendMyResponse(
  prev: MyResponseCacheRow[] | undefined,
  entry: {
    surveyId: string;
    questionId: string;
    questionText: string;
    answer: string;
    userResponseId?: string;
    surveyDescription?: string;
  },
) {
  const list = prev ?? [];
  const key = normalizeSurveyId(entry.questionId);
  const idx = list.findIndex((r) => normalizeSurveyId(r.questionId) === key);
  const row = {
    surveyId: entry.surveyId,
    surveyDescription: entry.surveyDescription ?? "",
    questionId: entry.questionId,
    questionText: entry.questionText,
    userResponseId: entry.userResponseId ?? "",
    textAnswer: entry.answer,
  };
  if (idx >= 0) {
    const next = [...list];
    next[idx] = { ...next[idx], ...row, textAnswer: entry.answer };
    return next;
  }
  return [...list, row];
}

export function useSubmitResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      surveyId,
      questionId,
      answer,
    }: {
      surveyId: string;
      questionId: string;
      questionText?: string;
      answer: string;
    }) => userResponseApi.submit(surveyId, { questionId, answer }),
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: ["my-responses"] });
      const previous = qc.getQueryData<MyResponseCacheRow[]>(["my-responses"]);
      qc.setQueryData<MyResponseCacheRow[]>(["my-responses"], (old) =>
        appendMyResponse(old, {
          surveyId: variables.surveyId,
          questionId: variables.questionId,
          questionText: variables.questionText ?? "",
          answer: variables.answer,
        }),
      );
      return { previous };
    },
    onSuccess: (data, variables) => {
      qc.setQueryData<MyResponseCacheRow[]>(["my-responses"], (old) =>
        appendMyResponse(old, {
          surveyId: variables.surveyId,
          questionId: variables.questionId,
          questionText: variables.questionText ?? "",
          answer: variables.answer,
          userResponseId: data.userResponseId,
        }),
      );
    },
    onError: (_error, variables, context) => {
      const status = (_error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) {
        qc.setQueryData<MyResponseCacheRow[]>(["my-responses"], (old) =>
          appendMyResponse(old, {
            surveyId: variables.surveyId,
            questionId: variables.questionId,
            questionText: variables.questionText ?? "",
            answer: variables.answer,
          }),
        );
        return;
      }
      if (context?.previous) {
        qc.setQueryData(["my-responses"], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["my-responses"] });
    },
  });
}

export function useEditResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userResponseId,
      newAnswer,
    }: {
      userResponseId: string;
      newAnswer: string;
    }) => userResponseApi.edit(userResponseId, newAnswer),
    onMutate: async ({ userResponseId, newAnswer }) => {
      await qc.cancelQueries({ queryKey: ["my-responses"] });
      const previous = qc.getQueryData<MyResponseCacheRow[]>(["my-responses"]);
      qc.setQueryData<MyResponseCacheRow[]>(["my-responses"], (old) =>
        (old ?? []).map((r) =>
          r.userResponseId === userResponseId
            ? { ...r, textAnswer: newAnswer }
            : r,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["my-responses"], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["my-responses"] }),
  });
}

/* ───────── Notes ───────── */

export function useNoteFolders() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: ["noteFolders", workspaceId],
    queryFn: async () => {
      const id = requireWorkspaceId(workspaceId);
      const { folders } = await noteApi.getFolders(id);
      return folders;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateNoteFolder() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) =>
      noteApi.createFolder(requireWorkspaceId(workspaceId), { title }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["noteFolders", workspaceId] }),
  });
}

export function useUpdateNoteFolder() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      folderId,
      title,
      description,
    }: {
      folderId: string;
      title: string;
      description?: string | null;
    }) =>
      noteApi.updateFolder(requireWorkspaceId(workspaceId), folderId, {
        title,
        description: description ?? null,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["noteFolders", workspaceId] }),
  });
}

export function useDeleteNoteFolder() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) =>
      noteApi.deleteFolder(requireWorkspaceId(workspaceId), folderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["noteFolders", workspaceId] });
      qc.invalidateQueries({ queryKey: ["notes", workspaceId] });
    },
  });
}

export function useNotes() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: ["notes", workspaceId],
    queryFn: async () => {
      const id = requireWorkspaceId(workspaceId);
      const { notes } = await noteApi.getAll(id);
      return notes;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateNote() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      noteColor: string;
      noteFolderId?: string | null;
      noteDescription?: string;
      html?: string;
    }) =>
      noteApi.create(requireWorkspaceId(workspaceId), {
        title: input.title,
        noteColor: input.noteColor,
        noteFolderId: input.noteFolderId ?? null,
        noteDescription: input.noteDescription ?? "",
        contentJson: buildNoteContentJson(input.html ?? ""),
      }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ["notes", workspaceId] });
      const previous = qc.getQueryData<Note[]>(["notes", workspaceId]);
      const now = new Date().toISOString();
      const contentJson = buildNoteContentJson(input.html ?? "");
      const tempNote = {
        id: `temp-${now}-${Math.random().toString(36).slice(2)}`,
        workspaceId: workspaceId ?? "",
        noteFolderId: input.noteFolderId ?? null,
        title: input.title,
        noteColor: input.noteColor,
        contentJson,
        content: parseNoteContent(contentJson),
        noteDescription: input.noteDescription ?? "",
        createdBy: "",
        createdAt: now,
        updatedAt: now,
        __optimistic: true,
      } as unknown as Note;
      qc.setQueryData<Note[]>(["notes", workspaceId], (old) => [
        tempNote,
        ...(old ?? []),
      ]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["notes", workspaceId], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes", workspaceId] }),
  });
}

export function useUpdateNoteContent() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, html }: { noteId: string; html: string }) =>
      noteApi.updateContent(requireWorkspaceId(workspaceId), noteId, {
        contentJson: buildNoteContentJson(html),
      }),
    onMutate: async ({ noteId, html }) => {
      await qc.cancelQueries({ queryKey: ["notes", workspaceId] });
      const previous = qc.getQueryData<Note[]>(["notes", workspaceId]);
      const contentJson = buildNoteContentJson(html);
      const content = parseNoteContent(contentJson);
      const now = new Date().toISOString();
      qc.setQueryData<Note[]>(["notes", workspaceId], (old) =>
        (old ?? []).map((n) =>
          n.id === noteId ? { ...n, contentJson, content, updatedAt: now } : n,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["notes", workspaceId], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes", workspaceId] }),
  });
}

export function useUpdateNoteMetadata() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      noteId,
      title,
      noteColor,
      noteFolderId,
      noteDescription,
    }: {
      noteId: string;
      title: string;
      noteColor: string;
      noteFolderId?: string | null;
      noteDescription?: string;
    }) =>
      noteApi.updateMetadata(requireWorkspaceId(workspaceId), noteId, {
        title,
        noteColor,
        noteFolderId: noteFolderId ?? null,
        noteDescription: noteDescription ?? "",
      }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["notes", workspaceId] });
      const previous = qc.getQueryData<Note[]>(["notes", workspaceId]);
      const now = new Date().toISOString();
      qc.setQueryData<Note[]>(["notes", workspaceId], (old) =>
        (old ?? []).map((n) =>
          n.id === vars.noteId
            ? {
                ...n,
                title: vars.title,
                noteColor: vars.noteColor,
                noteFolderId:
                  vars.noteFolderId !== undefined
                    ? vars.noteFolderId
                    : n.noteFolderId,
                noteDescription: vars.noteDescription ?? n.noteDescription,
                updatedAt: now,
              }
            : n,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["notes", workspaceId], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes", workspaceId] }),
  });
}

export function useDeleteNote() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) =>
      noteApi.delete(requireWorkspaceId(workspaceId), noteId),
    onMutate: async (noteId) => {
      await qc.cancelQueries({ queryKey: ["notes", workspaceId] });
      const previous = qc.getQueryData<Note[]>(["notes", workspaceId]);
      qc.setQueryData<Note[]>(["notes", workspaceId], (old) =>
        (old ?? []).filter((n) => n.id !== noteId),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["notes", workspaceId], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes", workspaceId] }),
  });
}

export function useSetNoteLinks() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      noteId,
      taskIds,
      eventIds,
    }: {
      noteId: string;
      taskIds: string[];
      eventIds: string[];
    }) =>
      noteApi.setLinks(requireWorkspaceId(workspaceId), noteId, {
        taskIds,
        eventIds,
      }),
    onMutate: async ({ noteId, taskIds, eventIds }) => {
      await qc.cancelQueries({ queryKey: ["notes", workspaceId] });
      const previous = qc.getQueryData<Note[]>(["notes", workspaceId]);
      qc.setQueryData<Note[]>(["notes", workspaceId], (old) =>
        (old ?? []).map((n) =>
          n.id === noteId
            ? { ...n, linkedTaskIds: taskIds, linkedEventIds: eventIds }
            : n,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["notes", workspaceId], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes", workspaceId] }),
  });
}

/** Sync note↔task/event links from the task or event side (updates affected notes). */
export function useSyncEntityNoteLinks() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      kind,
      entityId,
      selectedNoteIds,
    }: {
      kind: "task" | "event";
      entityId: string;
      selectedNoteIds: string[];
    }) => {
      const wsId = requireWorkspaceId(workspaceId);
      const notes = qc.getQueryData<Note[]>(["notes", workspaceId]) ?? [];
      const selected = new Set(selectedNoteIds);
      const updates: Promise<unknown>[] = [];

      for (const note of notes) {
        const linked =
          kind === "task"
            ? note.linkedTaskIds.includes(entityId)
            : note.linkedEventIds.includes(entityId);
        const shouldLink = selected.has(note.id);
        if (linked === shouldLink) continue;

        const taskIds =
          kind === "task"
            ? shouldLink
              ? [...note.linkedTaskIds, entityId]
              : note.linkedTaskIds.filter((id) => id !== entityId)
            : note.linkedTaskIds;
        const eventIds =
          kind === "event"
            ? shouldLink
              ? [...note.linkedEventIds, entityId]
              : note.linkedEventIds.filter((id) => id !== entityId)
            : note.linkedEventIds;

        updates.push(noteApi.setLinks(wsId, note.id, { taskIds, eventIds }));
      }

      await Promise.all(updates);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes", workspaceId] }),
  });
}
