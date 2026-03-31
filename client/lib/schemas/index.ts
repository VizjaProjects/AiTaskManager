import { z } from "zod";
import { TaskPriority, TaskSource, ProposedBy, EventStatus } from "../types";

export const loginSchema = z.object({
  email: z.string().email("Podaj poprawny adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Imię i nazwisko musi mieć min. 2 znaki"),
    email: z.string().email("Podaj poprawny adres email"),
    rawPassword: z
      .string()
      .min(8, "Hasło musi mieć min. 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
      .regex(/[0-9]/, "Hasło musi zawierać cyfrę"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.rawPassword === data.confirmPassword, {
    message: "Hasła nie są takie same",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Podaj poprawny adres email"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    token: z.string().uuid(),
    rawPassword: z
      .string()
      .min(8, "Hasło musi mieć min. 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
      .regex(/[0-9]/, "Hasło musi zawierać cyfrę"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.rawPassword === data.confirmPassword, {
    message: "Hasła nie są takie same",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Stare hasło jest wymagane"),
    newPassword: z
      .string()
      .min(8, "Hasło musi mieć min. 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
      .regex(/[0-9]/, "Hasło musi zawierać cyfrę"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hasła nie są takie same",
    path: ["confirmPassword"],
  });

export const changeFullNameSchema = z.object({
  newFullName: z.string().min(2, "Imię i nazwisko musi mieć min. 2 znaki"),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  categoryId: z.string().uuid().optional().nullable(),
  estimatedDuration: z.number().int().positive().optional(),
  dueDateTime: z.string().optional(),
  statusId: z.string().uuid("Wybierz status"),
  source: z.nativeEnum(TaskSource),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Podaj kolor w formacie HEX"),
});

export const createTaskStatusSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Podaj kolor w formacie HEX"),
});

export const createEventSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  taskId: z.string().uuid().optional().nullable(),
  startDateTime: z.string().min(1, "Data rozpoczęcia jest wymagana"),
  endDateTime: z.string().min(1, "Data zakończenia jest wymagana"),
  allDay: z.boolean(),
  proposedBy: z.nativeEnum(ProposedBy),
});

export const editEventSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  startDateTime: z.string().min(1, "Data rozpoczęcia jest wymagana"),
  endDateTime: z.string().min(1, "Data zakończenia jest wymagana"),
  allDay: z.boolean(),
  status: z.nativeEnum(EventStatus),
});

export const generateAiPlanSchema = z.object({
  text: z.string().min(10, "Opis musi mieć min. 10 znaków"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ChangeFullNameFormData = z.infer<typeof changeFullNameSchema>;
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type CreateTaskStatusFormData = z.infer<typeof createTaskStatusSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type EditEventFormData = z.infer<typeof editEventSchema>;
export type GenerateAiPlanFormData = z.infer<typeof generateAiPlanSchema>;
