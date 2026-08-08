import { z } from "zod";

export const loginEmailSchema = z
  .string()
  .trim()
  .min(1, "Укажите email.")
  .pipe(z.email("Введите корректный email."));

export type LoginEmailInput = z.input<typeof loginEmailSchema>;
