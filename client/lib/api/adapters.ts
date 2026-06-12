import {
  EventStatus,
  TaskPriority,
  type CalendarEvent,
  type Category,
  type Note,
  type NoteContentEnvelope,
  type NoteFolder,
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
    isDefault: (raw.isDefault as boolean) ?? false,
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
      status === "REJECTED" ? EventStatus.CANCELLED : (status as EventStatus),
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.updatedAt as string).toISOString(),
  };
}

export function mapPendingEventDto(
  raw: Record<string, unknown>,
): CalendarEvent {
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
    questionType: ((raw.questionType as string) ??
      "TEXT") as Question["questionType"],
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

/* ───────── Notes ───────── */

const EMPTY_NOTE_HTML = "<p><br/></p>";

export function emptyNoteContent(): NoteContentEnvelope {
  return { version: 1, format: "html", html: EMPTY_NOTE_HTML, text: "" };
}

/** Strip HTML tags to a plain-text preview (used for list previews + search). */
export function htmlToPreviewText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|pre|tr)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build the JSON envelope string stored in Note.contentJson from raw HTML. */
export function buildNoteContentJson(html: string): string {
  const safeHtml = html && html.trim().length > 0 ? html : EMPTY_NOTE_HTML;
  const envelope: NoteContentEnvelope = {
    version: 1,
    format: "html",
    html: safeHtml,
    text: htmlToPreviewText(safeHtml),
  };
  return JSON.stringify(envelope);
}

/** Parse a stored contentJson string into an envelope, tolerating legacy/raw values. */
export function parseNoteContent(raw: unknown): NoteContentEnvelope {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return emptyNoteContent();
  }
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<NoteContentEnvelope>;
      if (typeof parsed.html === "string") {
        return {
          version: typeof parsed.version === "number" ? parsed.version : 1,
          format: "html",
          html: parsed.html,
          text:
            typeof parsed.text === "string"
              ? parsed.text
              : htmlToPreviewText(parsed.html),
        };
      }
    } catch {
      // fall through — treat as raw HTML
    }
  }
  // Legacy / plain HTML stored directly
  return {
    version: 1,
    format: "html",
    html: trimmed,
    text: htmlToPreviewText(trimmed),
  };
}

export function mapNoteFolderDto(raw: Record<string, unknown>): NoteFolder {
  return {
    id: raw.id as string,
    workspaceId: raw.workspaceId as string,
    title: (raw.noteTitle as string) ?? (raw.title as string) ?? "",
    description: (raw.description as string) ?? null,
    createdBy: raw.createdBy as string,
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.updatedAt as string).toISOString(),
  };
}

export function mapNoteDto(raw: Record<string, unknown>): Note {
  const contentJson = (raw.contentJson as string) ?? "";
  return {
    id: raw.id as string,
    workspaceId: raw.workspaceId as string,
    noteFolderId: (raw.noteFolderId as string) ?? null,
    title: (raw.title as string) ?? "",
    noteColor: (raw.noteColor as string) ?? "#FFFFFF",
    contentJson,
    content: parseNoteContent(contentJson),
    noteDescription: (raw.noteDescription as string) ?? null,
    createdBy: raw.createdBy as string,
    createdAt: new Date(raw.createdAt as string).toISOString(),
    updatedAt: new Date(raw.updatedAt as string).toISOString(),
  };
}
