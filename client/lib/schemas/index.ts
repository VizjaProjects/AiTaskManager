import { z } from "zod";
import { TaskPriority, TaskSource, ProposedBy, EventStatus } from "../types";
import { tr } from "../i18n";

/**
 * Lazy message so these module-level schemas pick up the active language:
 * a plain string would be frozen at import time.
 */
function m(key: string) {
  return { error: () => tr(key) };
}

const passwordSchema = z
  .string()
  .min(8, m("valid.passwordMin"))
  .regex(/[a-z]/, m("valid.passwordLower"))
  .regex(/[A-Z]/, m("valid.passwordUpper"))
  .regex(/[0-9]/, m("valid.passwordDigit"))
  .regex(/[^A-Za-z0-9]/, m("valid.passwordSpecial"));

export const loginSchema = z.object({
  email: z.string().email(m("valid.emailInvalid")),
  password: z.string().min(1, m("valid.passwordRequired")),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, m("valid.fullNameMin")),
    email: z.string().email(m("valid.emailInvalid")),
    rawPassword: passwordSchema,
    confirmPassword: z.string(),
    termsAccepted: z.boolean(),
  })
  .refine((data) => data.rawPassword === data.confirmPassword, {
    ...m("valid.passwordsMismatch"),
    path: ["confirmPassword"],
  })
  .refine((data) => data.termsAccepted === true, {
    ...m("valid.acceptTerms"),
    path: ["termsAccepted"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email(m("valid.emailInvalid")),
});

export const setupPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    ...m("valid.passwordsMismatch"),
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    token: z.string().uuid(),
    rawPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.rawPassword === data.confirmPassword, {
    ...m("valid.passwordsMismatch"),
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, m("valid.oldPasswordRequired")),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    ...m("valid.passwordsMismatch"),
    path: ["confirmPassword"],
  });

export const changeFullNameSchema = z.object({
  newFullName: z.string().min(2, m("valid.fullNameMin")),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, m("valid.titleRequired")),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  categoryId: z.string().uuid().optional().nullable(),
  estimatedDuration: z.number().int().positive().optional(),
  dueDateTime: z.string().optional(),
  statusId: z.string().uuid(m("valid.statusRequired")),
  source: z.nativeEnum(TaskSource),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, m("valid.nameRequired")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, m("valid.colorHex")),
});

export const createTaskStatusSchema = z.object({
  name: z.string().min(1, m("valid.nameRequired")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, m("valid.colorHex")),
});

export const createEventSchema = z.object({
  title: z.string().min(1, m("valid.titleRequired")),
  taskId: z.string().uuid().optional().nullable(),
  startDateTime: z.string().min(1, m("valid.startRequired")),
  endDateTime: z.string().min(1, m("valid.endRequired")),
  allDay: z.boolean(),
  proposedBy: z.nativeEnum(ProposedBy),
});

export const editEventSchema = z.object({
  title: z.string().min(1, m("valid.titleRequired")),
  startDateTime: z.string().min(1, m("valid.startRequired")),
  endDateTime: z.string().min(1, m("valid.endRequired")),
  allDay: z.boolean(),
  status: z.nativeEnum(EventStatus),
});

export const generateAiPlanSchema = z.object({
  text: z.string().min(10, m("valid.aiTextMin")),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type SetupPasswordFormData = z.infer<typeof setupPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ChangeFullNameFormData = z.infer<typeof changeFullNameSchema>;
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type CreateTaskStatusFormData = z.infer<typeof createTaskStatusSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type EditEventFormData = z.infer<typeof editEventSchema>;
export type GenerateAiPlanFormData = z.infer<typeof generateAiPlanSchema>;
