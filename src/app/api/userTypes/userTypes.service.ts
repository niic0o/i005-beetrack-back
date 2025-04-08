import { prisma } from '@/lib/prisma';

export const getUserTypeByRole = async (role: string) => {
  try {
    const userTypeFound = await prisma.userType.findUnique({
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
