import { useState } from 'react';
import { z } from 'zod';

// Zod Schema
const questionSchema = z.object({
    questionTitle: z.string()
        .min(1, 'Question title is required')
        .regex(/[A-Za-z]/, 'Question title must contain characters'),
        
    questionDescription: z.string()
        .min(1, 'Question description is required')
        .regex(/[A-Za-z]/, 'Question description must contain characters'),

    segment: z.string()
        .min(1, 'Segment is required')
        .regex(/[A-Za-z]/, 'Segment must contain characters'),

    ratio: z.preprocess((val) => Number(val), z.number({ invalid_type_error: 'Ratio must be a number' })),
    minRating: z.preprocess((val) => Number(val), z.number({ invalid_type_error: 'Min rating must be a number' })),
    maxRating: z.preprocess((val) => Number(val), z.number({ invalid_type_error: 'Max rating must be a number' }))
});



// Reusable hook for any schema (single error)
export const useZodValidation = (schema: any) => {
    const [error, setError] = useState<string | null>(null);

    const validate = (value: any): boolean => {
        const result = schema.safeParse(value);
        if (!result.success) {
            setError(result.error.issues[0]?.message || 'Invalid input');
            return false;
        }
        setError(null);
        return true;
    };

    const resetError = () => setError(null);

    return { error, validate, resetError };
};

// Specific question validation hook with per-field errors
type ValidationErrors = Partial<Record<keyof z.infer<typeof questionSchema>, string>>;

export const useZodValidationQuestion = () => {
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validate = (value: any): { isValid: boolean; fieldErrors: ValidationErrors } => {
        const result = questionSchema.safeParse(value);
        if (!result.success) {
            const fieldErrors: ValidationErrors = {};
            result.error.issues.forEach(issue => {
                const field = issue.path[0] as keyof z.infer<typeof questionSchema>;
                fieldErrors[field] = issue.message;
            });
            setErrors(fieldErrors);
            return { isValid: false, fieldErrors };
        }
        setErrors({});
        return { isValid: true, fieldErrors: {} };
    };

    const resetError = () => setErrors({});

    return { errors, validate, resetError };
};
