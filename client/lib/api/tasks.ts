import { api } from "./client";
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
  Task,
  Category,
  TaskStatus,
  CalendarEvent,
} from "../types";

export const taskApi = {
  getAll: () => api.get<{ tasks: Task[] }>("/task"),

  create: (data: CreateTaskRequest) =>
    api.post<{ taskId: string; createdAt: string }>("/task", data),

  edit: (taskId: string, data: EditTaskRequest) =>
    api.put(`/task/${encodeURIComponent(taskId)}`, data),

  delete: (taskId: string) => api.delete(`/task/${encodeURIComponent(taskId)}`),
};

export const categoryApi = {
  getAll: () => api.get<{ categories: Category[] }>("/category"),

  getMy: () => api.get<{ categories: Category[] }>("/category/my"),

  create: (data: CreateCategoryRequest) =>
    api.post<{ categoryId: string; createdAt: string }>("/category", data),

  edit: (categoryId: string, data: EditCategoryRequest) =>
    api.put(`/category/${encodeURIComponent(categoryId)}`, data),

  delete: (categoryId: string) =>
    api.delete(`/category/${encodeURIComponent(categoryId)}`),
};

export const taskStatusApi = {
  getAll: () => api.get<{ statuses: TaskStatus[] }>("/task-status"),

  getMy: () => api.get<{ statuses: TaskStatus[] }>("/task-status/my"),

  create: (data: CreateTaskStatusRequest) =>
    api.post<{ statusId: string; createdAt: string }>("/task-status", data),

  edit: (statusId: string, data: EditTaskStatusRequest) =>
    api.put(`/task-status/${encodeURIComponent(statusId)}`, data),

  delete: (statusId: string) =>
    api.delete(`/task-status/${encodeURIComponent(statusId)}`),
};

export const eventApi = {
  getAll: () => api.get<{ events: CalendarEvent[] }>("/event"),

  create: (data: CreateEventRequest) =>
    api.post<{ eventId: string; createdAt: string }>("/event", data),

  edit: (eventId: string, data: EditEventRequest) =>
    api.put(`/event/${encodeURIComponent(eventId)}`, data),

  delete: (eventId: string) =>
    api.delete(`/event/${encodeURIComponent(eventId)}`),
};

export const aiApi = {
  generatePlan: (data: GenerateAiPlanRequest) =>
    api.post("/ai/plan", data, {
      headers: {
        "X-Time-Zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }),

  getPendingProposals: () =>
    api.get<{ tasks: Task[]; events: CalendarEvent[] }>("/ai/proposals"),

  acceptTask: (taskId: string, data: AcceptAiTaskRequest) =>
    api.post(`/ai/proposals/tasks/${encodeURIComponent(taskId)}/accept`, data),

  rejectTask: (taskId: string) =>
    api.delete(`/ai/proposals/tasks/${encodeURIComponent(taskId)}`),

  acceptEvent: (eventId: string, data: AcceptAiEventRequest) =>
    api.post(
      `/ai/proposals/events/${encodeURIComponent(eventId)}/accept`,
      data,
    ),

  rejectEvent: (eventId: string) =>
    api.delete(`/ai/proposals/events/${encodeURIComponent(eventId)}`),
};
