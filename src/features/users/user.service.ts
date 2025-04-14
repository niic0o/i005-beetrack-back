import { prisma } from '@/lib/prisma';
import { createHash } from './utils';
import { handleError } from '@/lib/errors/errorHandler';

// esta funcion es para el login
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      userStores: {
        include: {
          store: true,
        },
      },
    },
  });
}

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
    return handleError(error, 'Error al registrar el usuario y la tienda');
  }
};
