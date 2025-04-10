import { prisma } from '@/lib/prisma';
import {
  getUserTypeByRole,
  createUserType,
} from '../userTypes/userTypes.service';
import { CreateUserRequestDtoType } from './DTOs/createUserRequestDto';
import { toCreateUserResponseDto } from './Mappers/toCreateUserResponseDto';
import { createHash } from './utils';

export const getUserByEmail = async (email: string) => {
  try {
    const userFound = await prisma.user.findUnique({
      where: { email },
      include: {
        stores: true, // Esto trae las tiendas asociadas al usuario
      },
    });
    return userFound;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error interno del servidor');
  }
};

export const createUser = async (user: CreateUserRequestDtoType) => {
  try {
    const { name, last_name, email, birthdate, password } = user;
    const userFound = await getUserByEmail(email);
    if (userFound) {
      throw new Error('User already exists');
    }

    const hashedPassword = await createHash(password);

    const parsedDate = new Date(birthdate);

    //Por defecto el rol es admin, eventualmente se pueden agregar mas roles y pedir el campo "rol" en el cuerpo de la solicitud
    let userType;
    const userTypeFound = await getUserTypeByRole('admin');
    userTypeFound
      ? (userType = userTypeFound.id)
      : (userType = (await createUserType('admin')).id);

    const userCreated = await prisma.user.create({
      data: {
        userTypeID: userType,
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
