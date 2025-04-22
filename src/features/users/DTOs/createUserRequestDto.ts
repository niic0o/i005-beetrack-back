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

export const checkEmailDto = registerUserAndStoreDto.pick({
  email: true
});

export type CheckEmailDtoType = z.infer<typeof checkEmailDto>;