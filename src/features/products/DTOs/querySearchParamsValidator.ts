import { z } from 'zod';

export const querySearchParamsValidator = z.object({
  isActive: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }, z.boolean().optional()),
});

export type QuerySearchParamsValidator = z.infer<typeof querySearchParamsValidator>;
