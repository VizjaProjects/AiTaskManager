export type UUID = string;

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum TaskPriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum TaskSource {
  MANUAL = "MANUAL",
  AI_PARSED = "AI_PARSED",
}

export enum QuestionType {
  TEXT = "TEXT",
  LIST = "LIST",
}

export enum ProposedBy {
  AI = "AI",
  USER = "USER",
}

export enum EventStatus {
  PROPOSED = "PROPOSED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  RESCHEDULED = "RESCHEDULED",
  CANCELLED = "CANCELLED",
}

export interface User {
  userId: UUID;
  email: string;
  fullName: string;
  role: Role;
}

export interface WorkspaceUser {
  userId: UUID;
  email?: string | null;
  fullName?: string | null;
  assignedAt: string;
}

export interface WorkspaceMember {
  userId: UUID;
  fullName: string;
  email: string;
}

export interface Workspace {
  workspaceId: UUID;
  workspaceName: string;
  createdBy: UUID;
  visibility: WorkspaceVisibility;
  assignedUsers: WorkspaceUser[];
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceVisibility = "Public" | "Private";

/* ───────── Plans & limits ───────── */

export interface Plan {
  planId: UUID;
  planName: string;
  aiTaskLimit: number;
  publicWorkspaceLimit: number;
  privateWorkspaceLimit: number;
  isActive: boolean;
}

export interface CreatePlanRequest {
  planName: string;
  aiTaskLimit: number;
  publicWorkspaceLimit: number;
  privateWorkspaceLimit: number;
  isActive: boolean;
}

/** Current user's plan limits plus their current usage of each resource. */
export interface UserPlanUsage {
  planId: UUID;
  planName: string;
  isActive: boolean;
  aiTaskLimit: number;
  aiTaskUsage: number;
  publicWorkspaceLimit: number;
  publicWorkspaceUsage: number;
  privateWorkspaceLimit: number;
  privateWorkspaceUsage: number;
}

export interface AdminUser {
  userId: UUID;
  fullName: string;
  email: string;
  role: string;
  isEnable: boolean;
  planId: UUID | null;
  planName: string | null;
  planIsActive: boolean;
  aiTaskUsage: number;
  aiTaskLimit: number;
  publicWorkspaceUsage: number;
  publicWorkspaceLimit: number;
  privateWorkspaceUsage: number;
  privateWorkspaceLimit: number;
}

export interface Task {
  taskId: UUID;
  workspaceId?: UUID;
  title: string;
  description: string;
  priority: TaskPriority;
  categoryId: UUID | null;
  estimatedDuration: number;
  dueDateTime: string | null;
  statusId: UUID;
  source: TaskSource;
  accepted: boolean;
  assignedUserIds: UUID[];
  steps: TaskStep[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskStep {
  stepId: UUID;
  taskId: UUID;
  title: string;
  position: number;
  completed: boolean;
  assignedUserId: UUID | null;
  createdBy: UUID;
  source: TaskSource;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskStepInput {
  title: string;
  assignedUserId?: UUID;
}

export interface TaskComment {
  commentId: UUID;
  taskId: UUID;
  authorId: UUID;
  authorName: string;
  authorEmail: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type HistoryAction = "CREATE" | "UPDATE";

export interface TaskHistoryRecord {
  recordId: UUID;
  field: string;
  prevValue: string;
  nextValue: string;
}

export interface TaskHistoryEntry {
  historyId: UUID;
  taskId: UUID;
  userId: UUID;
  action: HistoryAction;
  versionNumber: number;
  /** UTC (DateTime.UtcNow z domeny) — parsowane jawnie jako UTC, nie parseApiDateTime. */
  historyDate: string;
  records: TaskHistoryRecord[];
}

export interface Category {
  categoryId: UUID;
  workspaceId?: UUID;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatus {
  statusId: UUID;
  workspaceId?: UUID;
  name: string;
  color: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  eventId: UUID;
  title: string;
  taskId: UUID | null;
  color: string;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  proposedBy: ProposedBy;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Survey {
  surveyId: UUID;
  title: string;
  description: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  questionId: UUID;
  surveyId: UUID;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  hint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  questionOptionId: UUID;
  questionId: UUID;
  optionText: string;
  order: number;
}

export interface UserResponse {
  userResponseId: UUID;
  surveyId: UUID;
  questionId: UUID;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: UUID;
  email: string;
  fullName: string;
  role: Role;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: UUID;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetCode: string;
  newPassword: string;
}

/** @deprecated Use ResetPasswordRequest */
export interface RemindPasswordRequest {
  email: string;
  token: UUID;
  rawPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeFullNameRequest {
  newFullName: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  categoryId?: UUID;
  estimatedDuration?: number;
  dueDateTime?: string;
  statusId: UUID;
  source: TaskSource;
  steps?: CreateTaskStepInput[];
}

export interface CreateTaskStepRequest {
  title: string;
  assignedUserId?: UUID;
}

export interface EditTaskStepRequest {
  title: string;
  assignedUserId: UUID | null;
}

export interface EditTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  categoryId?: UUID;
  estimatedDuration?: number;
  dueDateTime?: string;
  statusId: UUID;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
}

export interface EditCategoryRequest {
  name: string;
  color: string;
}

export interface CreateTaskStatusRequest {
  name: string;
  color: string;
}

export interface EditTaskStatusRequest {
  name: string;
  color: string;
}

export interface CreateEventRequest {
  title: string;
  taskId?: UUID;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  proposedBy: ProposedBy;
  color?: string;
}

export interface EditEventRequest {
  title: string;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  status: EventStatus;
  color: string;
}

export interface GenerateAiPlanRequest {
  text: string;
  llmSettingsId?: UUID;
}

export interface LlmSettings {
  llmSettingsId: UUID;
  userId: UUID;
  provider: string | null;
  model: string;
  customUrl: string | null;
}

export interface CreateLlmSettingsRequest {
  provider: string | null;
  model: string;
  apiKey: string;
  customUrl: string | null;
}

export type LlmConnectionMode = "provider" | "custom";

export interface AcceptAiTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  categoryId?: UUID;
  estimatedDuration?: number;
  dueDateTime?: string;
  statusId: UUID;
}

export interface AcceptAiEventRequest {
  title: string;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  status: EventStatus;
}

export interface AiStatistic {
  aiStatisticId: UUID;
  promptText: string;
  inputTokens: number;
  userId: UUID;
  createdAt: string;
  updatedAt: string;
}

/* ───────── Notes ───────── */

export interface NoteFolder {
  id: UUID;
  workspaceId: UUID;
  title: string;
  description: string | null;
  createdBy: UUID;
  createdAt: string;
  updatedAt: string;
}

/* ───────── Ink (handwritten) note documents ───────── */

/**
 * Shape tools draw the same `InkStroke` a pen does — the outline is generated
 * from the drag instead of sampled from the stylus — so erasing, undo and
 * serialization need no special cases for them.
 */
export type InkShapeTool = "line" | "rect" | "ellipse" | "arrow";
export type InkTool = "pen" | "highlighter" | "eraser" | InkShapeTool;
export type InkPageTemplate = "blank" | "lines" | "grid" | "dots";

export const INK_SHAPE_TOOLS: readonly InkShapeTool[] = [
  "line",
  "rect",
  "ellipse",
  "arrow",
];

export function isInkShapeTool(tool: InkTool): tool is InkShapeTool {
  return (INK_SHAPE_TOOLS as readonly string[]).includes(tool);
}

/**
 * One handwritten stroke.
 *
 * `d` is a flat, quantized, delta-encoded point list — triplets of
 * [dx, dy, pressure]. Always a plain number array at runtime; the wire form may
 * be compacted (see InkEncoding) and is decoded by lib/notes/inkDocument.ts.
 */
export interface InkStroke {
  /**
   * "p" = pen, "h" = highlighter, "s" = geometric shape.
   *
   * Shapes are stored as an ordinary point list but painted as a stroked
   * polyline of constant width rather than a pressure-varying filled outline,
   * which is what keeps a rectangle's corners square.
   */
  t: "p" | "h" | "s";
  /** ink color, hex */
  c: string;
  /** base width in logical page units */
  w: number;
  /**
   * Coordinate scale for `d`. Missing means 4 (legacy 1/4 page px).
   * New strokes use 32 so writing at high zoom does not collapse to a dot.
   */
  cs?: number;
  d: number[];
}

export interface InkPage {
  id: string;
  template: InkPageTemplate;
  strokes: InkStroke[];
}

export interface InkDocument {
  /** logical page size in CSS px; A4 @96dpi = 794 x 1123 */
  pageSize: { w: number; h: number };
  pages: InkPage[];
}

/** Wire encoding of stroke point data. Always decoded to plain arrays after parsing. */
export type InkEncoding = "none" | "b64v";

/* ───────── Note content envelope ───────── */

/**
 * Parsed shape of the JSON envelope stored in Note.contentJson.
 *
 * Discriminated on `format`: a note is either rich text or handwritten, never
 * both. `text` exists on every variant so previews and search work uniformly.
 */
export type NoteContentEnvelope = NoteHtmlEnvelope | NoteInkEnvelope;

export interface NoteHtmlEnvelope {
  version: number;
  format: "html";
  html: string;
  text: string;
}

export interface NoteInkEnvelope {
  version: number;
  format: "ink";
  enc: InkEncoding;
  doc: InkDocument;
  text: string;
  /**
   * True when this came from the workspace list, which strips strokes to keep
   * the response small. `doc` is empty in that case — fetch the note by id
   * before opening it in the editor.
   */
  truncated?: boolean;
}

export type NoteMode = NoteContentEnvelope["format"];

export interface Note {
  id: UUID;
  workspaceId: UUID;
  noteFolderId: UUID | null;
  title: string;
  noteColor: string;
  /** Raw JSON string as stored/returned by the backend */
  contentJson: string;
  /** Parsed convenience view of contentJson */
  content: NoteContentEnvelope;
  noteDescription: string | null;
  linkedTaskIds: UUID[];
  linkedEventIds: UUID[];
  createdBy: UUID;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteFolderRequest {
  title: string;
}

export interface UpdateNoteFolderRequest {
  title: string;
  description?: string | null;
}

export interface CreateNoteRequest {
  noteFolderId?: UUID | null;
  title: string;
  noteColor: string;
  noteDescription?: string;
  contentJson: string;
}

export interface UpdateNoteContentRequest {
  contentJson: string;
}

export interface UpdateNoteMetadataRequest {
  title: string;
  noteColor: string;
  noteFolderId?: UUID | null;
  noteDescription?: string;
}
