import { z } from 'zod';

// Lengths match the VarChar(255) columns on Report.
export const validateNicheSchema = z.object({
  niche: z
    .string()
    .min(3, 'Describe your niche in at least 3 characters')
    .max(255, 'Niche must be at most 255 characters'),
  keyword: z
    .string()
    .min(2, 'Enter a keyword of at least 2 characters')
    .max(255, 'Keyword must be at most 255 characters'),
});

export type ValidateNicheValues = z.infer<typeof validateNicheSchema>;
