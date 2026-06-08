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
  assignedAt: string;
}

export interface Workspace {
  workspaceId: UUID;
  workspaceName: string;
  createdBy: UUID;
  assignedUsers: WorkspaceUser[];
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  eventId: UUID;
  title: string;
  taskId: UUID | null;
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
}

export interface EditEventRequest {
  title: string;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  status: EventStatus;
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
