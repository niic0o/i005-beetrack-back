/*
import { User } from '@prisma/client';
import { createUserResponseDto } from '../DTOs/createUserResponseDto';

export const toCreateUserResponseDto = (user: User) => {
  return createUserResponseDto.parse({
    id: user.id,
    name: user.name,
    last_name: user.last_name,
    email: user.email,
    birthdate: user.birthdate.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
};
*/