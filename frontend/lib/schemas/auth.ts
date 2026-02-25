import { z } from 'zod';

/** Shared base object for all registration forms. */
export const baseRegisterFields = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
});

/** Reusable refine predicate so derived schemas can apply the same check. */
export const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

/** Base schema for patient registration (name + email + password + confirm). */
export const baseRegisterSchema = baseRegisterFields.refine(passwordsMatch, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
