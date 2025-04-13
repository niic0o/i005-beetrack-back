/*
import { z } from 'zod';

export const createUserRequestDto = z.object({
//   userTypeID: z.string(),
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
*/

// src/dtos/register-user-store.dto.ts
import { z } from 'zod';

export const registerUserAndStoreDto = z.object({
  name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  birthdate: z.string().refine(date => !isNaN(Date.parse(date)), { message: 'Invalid date' }),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*[\d\W]).{10,}$/,
      'La contraseña debe tener al menos 10 caracteres, una letra y un numero o caracter especial'
    ),
  storeName: z.string(),
  storeAddress: z.string(),
  storeTel: z.string().optional(),
});

export type RegisterUserAndStoreDtoType = z.infer<typeof registerUserAndStoreDto>;