import {
  EventStatus,
  TaskPriority,
  type CalendarEvent,
  type Category,
  type Question,
  type Survey,
  type Task,
  type TaskStatus,
} from "../types";
import { parseApiDateTime, toLocalDateTimeString } from "../utils";

const PRIORITY_BY_NUMBER: Record<number, TaskPriority> = {
  0: TaskPriority.LOW,
  1: TaskPriority.MEDIUM,
  2: TaskPriority.HIGH,
  3: TaskPriority.CRITICAL,
};

function mapPriority(priority: unknown): TaskPriority {
  if (typeof priority === "number") {
    return PRIORITY_BY_NUMBER[priority] ?? TaskPriority.MEDIUM;
  }
  const value = String(priority);
  if (value === "URGENT") return TaskPriority.CRITICAL;
  if (Object.values(TaskPriority).includes(value as TaskPriority)) {
    return value as TaskPriority;
  }
  return TaskPriority.MEDIUM;
}

function mapPriorityToApi(priority: TaskPriority): string {
  if (priority === TaskPriority.CRITICAL) return "URGENT";
  return priority;
}

export function mapTaskDto(raw: Record<string, unknown>): Task {
  return {
    taskId: raw.taskId as string,
    workspaceId: raw.workspaceId as string,
    title: raw.title as string,
    description: (raw.description as string) ?? "",
    priority: mapPriority(raw.priority),
    categoryId: (raw.categoryId as string) ?? null,
    estimatedDuration: raw.estimatedDuration as number,
    dueDateTime: raw.dueDateTime
      ? toLocalDateTimeString(parseApiDateTime(raw.dueDateTime as string))
      : null,
    statusId: raw.statusId as string,
    source: raw.source as Task["source"],
    accepted: true,
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.updatedAt as string).toISOString(),
  };
}

export function mapPendingTaskDto(raw: Record<string, unknown>): Task {
  return {
    ...mapTaskDto({ ...raw, workspaceId: "", updatedAt: raw.createdAt }),
    accepted: false,
    updatedAt: new Date(raw.createdAt as string).toISOString(),
  };
}

export function mapCategoryDto(raw: Record<string, unknown>): Category {
  return {
    categoryId: raw.categoryId as string,
    workspaceId: raw.workspaceId as string,
    name: raw.name as string,
    color: raw.color as string,
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.updatedAt as string).toISOString(),
  };
}

export function mapStatusDto(raw: Record<string, unknown>): TaskStatus {
  return {
    statusId: raw.statusId as string,
    workspaceId: raw.workspaceId as string,
    name: raw.name as string,
    color: raw.color as string,
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.updatedAt as string).toISOString(),
  };
}

export function mapEventDto(raw: Record<string, unknown>): CalendarEvent {
  const status = raw.status as string;
  return {
    eventId: raw.eventId as string,
    title: raw.title as string,
    taskId: (raw.taskId as string) ?? null,
    startDateTime: toLocalDateTimeString(
      parseApiDateTime(raw.startDateTime as string),
    ),
    endDateTime: toLocalDateTimeString(
      parseApiDateTime(raw.endDateTime as string),
    ),
    allDay: raw.allDay as boolean,
    proposedBy: raw.proposedBy as CalendarEvent["proposedBy"],
    status:
      status === "REJECTED"
        ? EventStatus.CANCELLED
        : (status as EventStatus),
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.updatedAt as string).toISOString(),
  };
}

export function mapPendingEventDto(raw: Record<string, unknown>): CalendarEvent {
  return {
    eventId: raw.eventId as string,
    title: raw.title as string,
    taskId: (raw.taskId as string) ?? null,
    startDateTime: toLocalDateTimeString(
      parseApiDateTime(raw.startDateTime as string),
    ),
    endDateTime: toLocalDateTimeString(
      parseApiDateTime(raw.endDateTime as string),
    ),
    allDay: raw.allDay as boolean,
    proposedBy: raw.proposedBy as CalendarEvent["proposedBy"],
    status: EventStatus.PROPOSED,
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.createdAt as string).toISOString(),
  };
}

export function mapSurveyDto(raw: Record<string, unknown>): Survey {
  return {
    surveyId: raw.surveyId as string,
    title: raw.title as string,
    description: raw.description as string,
    isVisible: raw.isVisible as boolean,
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.updatedAt as string).toISOString(),
  };
}

export function mapQuestionDto(raw: Record<string, unknown>): Question {
  return {
    questionId: raw.questionId as string,
    surveyId: raw.surveyId as string,
    questionText: raw.questionText as string,
    questionType: ((raw.questionType as string) ?? "TEXT") as Question["questionType"],
    isRequired: raw.isRequired as boolean,
    hint: (raw.hint as string) ?? "",
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(
      (raw.updatedAt as string) ?? (raw.createdAt as string),
    ).toISOString(),
  };
}

export function normalizeArray<T>(
  data: unknown,
  mapper: (raw: Record<string, unknown>) => T,
): T[] {
  if (Array.isArray(data)) {
    return data.map((item) => mapper(item as Record<string, unknown>));
  }
  return [];
}

export { mapPriorityToApi };
