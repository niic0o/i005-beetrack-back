import { z } from 'zod';

export const createUserRequestDto = z.object({
  userTypeID: z.string(),
  name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  birthdate: z.string(),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*[\d\W]).{10,}$/,
      'Password must be at least 10 characters long and contain at least one letter and one number or special character'
    ),
});

export type CreateUserRequestDtoType = z.infer<typeof createUserRequestDto>;