import { api } from "./client";
import {
  mapCategoryDto,
  mapEventDto,
  mapPendingEventDto,
  mapPendingTaskDto,
  mapPriorityToApi,
  mapStatusDto,
  mapTaskDto,
  normalizeArray,
} from "./adapters";
import type {
  AcceptAiEventRequest,
  AcceptAiTaskRequest,
  CreateCategoryRequest,
  CreateEventRequest,
  CreateTaskRequest,
  CreateTaskStatusRequest,
  EditCategoryRequest,
  EditEventRequest,
  EditTaskRequest,
  EditTaskStatusRequest,
  GenerateAiPlanRequest,
} from "../types";

function ws(workspaceId: string) {
  return `/workspace/${encodeURIComponent(workspaceId)}`;
}

export const taskApi = {
  getAll: async (workspaceId: string) => {
    const { data } = await api.get(ws(workspaceId) + "/task");
    return { tasks: normalizeArray(data, mapTaskDto) };
  },

  create: (workspaceId: string, data: CreateTaskRequest) =>
    api.post<{ taskId: string; createdAt: string }>(
      ws(workspaceId) + "/task",
      {
        ...data,
        priority: mapPriorityToApi(data.priority),
      },
    ),

  edit: (workspaceId: string, taskId: string, data: EditTaskRequest) =>
    api.put(ws(workspaceId) + "/task", {
      taskId,
      ...data,
      priority: mapPriorityToApi(data.priority),
    }),

  delete: (workspaceId: string, taskId: string) =>
    api.delete(`${ws(workspaceId)}/task/${encodeURIComponent(taskId)}`),

  setAssignees: (workspaceId: string, taskId: string, userIds: string[]) =>
    api.put(
      `${ws(workspaceId)}/task/${encodeURIComponent(taskId)}/assignees`,
      { userIds },
    ),
};

export const categoryApi = {
  getAll: async (workspaceId: string) => {
    const { data } = await api.get(ws(workspaceId) + "/category");
    return { categories: normalizeArray(data, mapCategoryDto) };
  },

  create: (workspaceId: string, data: CreateCategoryRequest) =>
    api.post<{ categoryId: string; createdAt: string }>(
      ws(workspaceId) + "/category",
      data,
    ),

  edit: (workspaceId: string, categoryId: string, data: EditCategoryRequest) =>
    api.put(ws(workspaceId) + "/category", {
      categoryId,
      ...data,
    }),

  delete: (workspaceId: string, categoryId: string) =>
    api.delete(
      `${ws(workspaceId)}/category/${encodeURIComponent(categoryId)}`,
    ),
};

export const taskStatusApi = {
  getAll: async (workspaceId: string) => {
    const { data } = await api.get(ws(workspaceId) + "/task-status");
    return { statuses: normalizeArray(data, mapStatusDto) };
  },

  create: (workspaceId: string, data: CreateTaskStatusRequest) =>
    api.post<{ statusId: string; createdAt: string }>(
      ws(workspaceId) + "/task-status",
      data,
    ),

  edit: (
    workspaceId: string,
    statusId: string,
    data: EditTaskStatusRequest,
  ) =>
    api.put(ws(workspaceId) + "/task-status", {
      statusId,
      ...data,
    }),

  delete: (workspaceId: string, statusId: string) =>
    api.delete(
      `${ws(workspaceId)}/task-status/${encodeURIComponent(statusId)}`,
    ),
};

export const eventApi = {
  getAll: async (workspaceId: string) => {
    const { data } = await api.get(ws(workspaceId) + "/event");
    return { events: normalizeArray(data, mapEventDto) };
  },

  create: (workspaceId: string, data: CreateEventRequest) =>
    api.post<{ eventId: string; createdAt: string }>(
      ws(workspaceId) + "/event",
      data,
    ),

  edit: (workspaceId: string, eventId: string, data: EditEventRequest) =>
    api.put(ws(workspaceId) + "/event", {
      eventId,
      ...data,
    }),

  delete: (workspaceId: string, eventId: string) =>
    api.delete(
      `${ws(workspaceId)}/event/${encodeURIComponent(eventId)}`,
    ),
};

export const aiApi = {
  generatePlan: (
    workspaceId: string,
    data: GenerateAiPlanRequest,
    timeZoneId?: string,
  ) =>
    api.post(
      ws(workspaceId) + "/ai/plan",
      {
        ...(data.llmSettingsId ? { llmSettingsId: data.llmSettingsId } : {}),
        userText: data.text,
        timeZoneId:
          timeZoneId ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      { timeout: 300000 },
    ),

  getPendingProposals: async (workspaceId: string) => {
    const { data } = await api.get<{
      tasks: Record<string, unknown>[];
      events: Record<string, unknown>[];
    }>(`${ws(workspaceId)}/proposals`);
    return {
      tasks: (data.tasks ?? []).map(mapPendingTaskDto),
      events: (data.events ?? []).map(mapPendingEventDto),
    };
  },

  acceptTask: (
    workspaceId: string,
    taskId: string,
    data: AcceptAiTaskRequest,
  ) =>
    api.post(
      `${ws(workspaceId)}/proposals/tasks/${encodeURIComponent(taskId)}/accept`,
      { ...data, priority: mapPriorityToApi(data.priority) },
    ),

  rejectTask: (workspaceId: string, taskId: string) =>
    api.delete(
      `${ws(workspaceId)}/proposals/tasks/${encodeURIComponent(taskId)}`,
    ),

  acceptEvent: (
    workspaceId: string,
    eventId: string,
    data: AcceptAiEventRequest,
  ) =>
    api.post(
      `${ws(workspaceId)}/proposals/events/${encodeURIComponent(eventId)}/accept`,
      {
        title: data.title,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        allDay: data.allDay,
      },
    ),

  rejectEvent: (workspaceId: string, eventId: string) =>
    api.delete(
      `${ws(workspaceId)}/proposals/events/${encodeURIComponent(eventId)}`,
    ),
};

/** AI statistics — not implemented in .NET backend yet */
export const aiStatisticApi = {
  getMy: async () => ({ statistics: [] as never[] }),
  delete: async (_id: string) => {
    throw new Error("AI statistics are not available yet");
  },
};
