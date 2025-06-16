import { z } from 'zod';

export const rejectionSchema = z.object({
    reason: z.string().max(250, 'cannot exceed 250 characters')
});

export const genericTextSchema = (fieldName: string, maxLength: number) => {
    return z.object({
        [fieldName]: z.string().max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    });
};

export const reviewTypeSchema = z
    .string()
    .regex(/^[A-Za-z\s]+$/, 'Only letters and spaces allowed')
    .max(20, 'Maximum 20 characters allowed');

export const emailSchema = z.string().email({ message: "Invalid email address" });

export const textAndNumbersOnlySchema = z
  .string()
  .max(20, "Must be at most 20 characters")
  .regex(/^[a-zA-Z0-9]*$/, "Only letters and numbers are allowed");

