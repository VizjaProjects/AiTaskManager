import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "../api";
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

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await taskApi.getAll();
      return data.tasks;
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useEditTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: EditTaskRequest }) =>
      taskApi.edit(taskId, data),
    onMutate: async ({ taskId, data }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const previous = qc.getQueryData<Task[]>(["tasks"]);
      if (previous) {
        qc.setQueryData<Task[]>(["tasks"], (old) =>
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
      if (ctx?.previous) qc.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskApi.delete(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryApi.getMy();
      return data.categories;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useEditCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: EditCategoryRequest;
    }) => categoryApi.edit(categoryId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => categoryApi.delete(categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useTaskStatuses() {
  return useQuery({
    queryKey: ["taskStatuses"],
    queryFn: async () => {
      const { data } = await taskStatusApi.getMy();
      return data.statuses;
    },
  });
}

export function useCreateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskStatusRequest) => taskStatusApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taskStatuses"] }),
  });
}

export function useEditTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      statusId,
      data,
    }: {
      statusId: string;
      data: EditTaskStatusRequest;
    }) => taskStatusApi.edit(statusId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taskStatuses"] }),
  });
}

export function useDeleteTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (statusId: string) => taskStatusApi.delete(statusId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taskStatuses"] }),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await eventApi.getAll();
      return data.events;
    },
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useEditEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: EditEventRequest;
    }) => eventApi.edit(eventId, data),
    onMutate: async ({ eventId, data }) => {
      await qc.cancelQueries({ queryKey: ["events"] });
      const previous = qc.getQueryData<CalendarEvent[]>(["events"]);
      if (previous) {
        qc.setQueryData<CalendarEvent[]>(["events"], (old) =>
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
      if (ctx?.previous) qc.setQueryData(["events"], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventApi.delete(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useGenerateAiPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateAiPlanRequest) => aiApi.generatePlan(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aiProposals"] }),
  });
}

export function useAiProposals() {
  return useQuery({
    queryKey: ["aiProposals"],
    queryFn: async () => {
      const { data } = await aiApi.getPendingProposals();
      return data;
    },
  });
}

export function useAcceptAiTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: AcceptAiTaskRequest;
    }) => aiApi.acceptTask(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aiProposals"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useRejectAiTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => aiApi.rejectTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aiProposals"] }),
  });
}

export function useAcceptAiEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: AcceptAiEventRequest;
    }) => aiApi.acceptEvent(eventId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aiProposals"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useRejectAiEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => aiApi.rejectEvent(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aiProposals"] }),
  });
}

export function useAiStatistics() {
  return useQuery({
    queryKey: ["aiStatistics"],
    queryFn: async () => {
      const { data } = await aiStatisticApi.getMy();
      return data.statistics;
    },
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
      const { data } = await questionApi.getAllForSurvey(surveyId);
      return data;
    },
    enabled: !!surveyId,
    staleTime: 30_000,
  });
}

export function useQuestionOptions(questionId: string | undefined) {
  return useQuery({
    queryKey: ["question-options", questionId],
    queryFn: async () => {
      if (!questionId) return [];
      const { data } = await questionApi.getOptions(questionId);
      return data;
    },
    enabled: !!questionId,
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

export function useMyResponses() {
  return useQuery({
    queryKey: ["my-responses"],
    queryFn: async () => {
      const { data } = await userResponseApi.getAll();
      return data.userResponseResultSet ?? [];
    },
    staleTime: 30_000,
  });
}

export function useActiveSurveys() {
  return useQuery({
    queryKey: ["active-surveys"],
    queryFn: async () => {
      const data = await surveyApi.getAllActive();
      return data.surveys;
    },
    staleTime: 30_000,
  });
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
      answer: string;
    }) => userResponseApi.submit(surveyId, { questionId, answer }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-responses"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-responses"] }),
  });
}
