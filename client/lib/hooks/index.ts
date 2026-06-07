import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
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
  surveyApi,
  questionApi,
  questionOptionApi,
  userResponseApi,
  workspaceApi,
} from "../api";
import { useWorkspaceStore } from "../stores/workspace";
import type {
  Task,
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
  AcceptAiTaskRequest,
  AcceptAiEventRequest,
  QuestionType,
} from "../types";

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
    }: {
      name: string;
      assignedUserIds?: string[];
    }) => createWorkspace(name, assignedUserIds),
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
    onSuccess: () => useWorkspaceStore.getState().fetchWorkspaces(),
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
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", workspaceId] }),
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
      if (ctx?.previous)
        qc.setQueryData(["tasks", workspaceId], ctx.previous);
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ["tasks", workspaceId] }),
  });
}

export function useDeleteTask() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      taskApi.delete(requireWorkspaceId(workspaceId), taskId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", workspaceId] }),
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
    }) =>
      categoryApi.edit(requireWorkspaceId(workspaceId), categoryId, data),
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
    }) =>
      taskStatusApi.edit(requireWorkspaceId(workspaceId), statusId, data),
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
      const previous = qc.getQueryData<CalendarEvent[]>([
        "events",
        workspaceId,
      ]);
      if (previous) {
        qc.setQueryData<CalendarEvent[]>(["events", workspaceId], (old) =>
          (old ?? []).map((e) =>
            e.eventId === eventId
              ? { ...e, ...data, updatedAt: new Date().toISOString() }
              : e,
          ),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData(["events", workspaceId], ctx.previous);
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ["events", workspaceId] }),
  });
}

export function useDeleteEvent() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      eventApi.delete(requireWorkspaceId(workspaceId), eventId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["events", workspaceId] }),
  });
}

export function useGenerateAiPlan() {
  const workspaceId = useWorkspaceId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateAiPlanRequest) =>
      aiApi.generatePlan(requireWorkspaceId(workspaceId), data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aiProposals", workspaceId] }),
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
    }) =>
      aiApi.acceptTask(requireWorkspaceId(workspaceId), taskId, data),
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
    }) =>
      aiApi.acceptEvent(requireWorkspaceId(workspaceId), eventId, data),
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
  const isLoading =
    surveysLoading || responsesLoading || questionsLoading;

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
  const idx = list.findIndex(
    (r) => normalizeSurveyId(r.questionId) === key,
  );
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
