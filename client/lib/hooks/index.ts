import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi, categoryApi, taskStatusApi, eventApi, aiApi } from "../api";
import type {
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
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
