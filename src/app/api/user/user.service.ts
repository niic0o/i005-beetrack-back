/*
import { prisma } from '@/lib/prisma';
import {
} from '../userTypes/userTypes.service';
import { CreateUserRequestDtoType } from './DTOs/createUserRequestDto';
import { toCreateUserResponseDto } from './Mappers/toCreateUserResponseDto';
import { createHash } from './utils';

export const getUserByEmail = async (email: string) => {
  try {
    const userFound = await prisma.user.findUnique({
      where: { email },
      include: {
        userStores: {
          include: {
            store: true, // Trae también los datos de cada tienda
          },
        },
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

    // Verificamos si el usuario ya existe
    const userFound = await getUserByEmail(email);
    if (userFound) {
      throw new Error('User already exists');
    }

    const hashedPassword = await createHash(password);
    const parsedDate = new Date(birthdate);

    // Por defecto, el nuevo esquema usa el enum UserRole y se asigna ADMIN automáticamente.
    const userCreated = await prisma.user.create({
      data: {
        name,
        last_name,
        email,
        birthdate: parsedDate,
        password: hashedPassword,
        userRole: 'ADMIN', // Enum de Prisma, si no lo pasás, toma ADMIN por default según el esquema
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
*/
import { prisma } from '@/lib/prisma';
import { createHash } from './utils';
/*
import { toCreateUserResponseDto } from './Mappers/toCreateUserResponseDto';
*/

// esta funcion hay que reveer para el login
export const getUserByEmail = async (email: string) => {
  try {
    const userFound = await prisma.user.findUnique({
      where: { email },
      include: {
        userStores: {
          include: {
            store: true, // Trae también los datos de cada tienda
          },
        },
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


export const registerUserAndStore = async (data: {
  name: string;
  last_name: string;
  email: string;
  birthdate: string;
  password: string;
  storeName: string;
  storeAddress: string;
  storeTel?: string;
}) => {
  const {
    name,
    last_name,
    email,
    birthdate,
    password,
    storeName,
    storeAddress,
    storeTel,
  } = data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Chequear si ya existe el usuario
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('El usuario ya existe');

      // 2. Crear el usuario
      const hashedPassword = await createHash(password);
      const parsedBirthdate = new Date(birthdate);

      const newUser = await tx.user.create({
        data: {
          name,
          last_name,
          email,
          birthdate: parsedBirthdate,
          password: hashedPassword,
        },
      });

      // 3. Crear la tienda
      const newStore = await tx.store.create({
        data: {
          name: storeName,
          address: storeAddress,
          tel: storeTel,
        },
      });

      // 4. Crear relación en UserStore
      await tx.userStore.create({
        data: {
          userId: newUser.id,
          storeId: newStore.id,
        },
      });

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        store: {
          id: newStore.id,
        },
      };
      
    });

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Registro fallido: ${error.message}`);
    }
    throw new Error('Error interno del servidor');
  }
};