import { UserRole } from '@prisma/client'; // Asegurate de importar los enums de Prisma

export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};
// COMO LA TABLA userTypes se convirio en un enum no hace falta esta logica
/*

import { prisma } from '@/lib/prisma';

export const getUserTypeByRole = async (role: string) => {
  try {
    const userTypeFound = await prisma.userType.findFirst({
      where: {
        role,
      },
    });
    return userTypeFound;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Internal server error');
  }
};

export const createUserType = async (role: string) => {
  try {
    const userTypeCreated = await prisma.userType.create({
      data: {
        role,
      },
    });
    return userTypeCreated;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Internal server error');
  }
};
*/