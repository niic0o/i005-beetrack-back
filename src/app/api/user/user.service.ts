import { prisma } from '@/lib/prisma';
import { CreateUserRequestDtoType } from './DTOs/createUserRequestDto';
import { toCreateUserResponseDto } from './Mappers/toCreateUserResponseDto';
import { createHash } from './utils';

export const getUserByEmail = async (email: string) => {
  try {
    const userFound = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return userFound;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Internal server error');
  }
};

export const createUser = async (user: CreateUserRequestDtoType) => {
  try {
    console.log('Creating user with data:', user);

    const { userTypeID, name, last_name, email, birthdate, password } = user;
    const userFound = await getUserByEmail(email);
    if (userFound) {
      throw new Error('User already exists');
    }

    const hashedPassword = await createHash(password);

    const parsedDate = new Date(birthdate);

    const userCreated = await prisma.user.create({
      data: {
        userTypeID,
        name,
        last_name,
        email,
        birthdate: parsedDate,
        password: hashedPassword,
      },
    });

    return toCreateUserResponseDto(userCreated);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Internal server error');
  }
};
