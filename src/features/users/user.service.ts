import { prisma } from "@/lib/prisma"; //para realizar queries a la bdd
import { createHash } from "./utils";
import { ProfileData, StoreData, UserSafeData } from "./user.dto";
import { ValidationError, ForbiddenError } from "@/lib/errors/customErrors";
import { Store } from "@prisma/client"; //para tipar un tipo de dato usando el modelo de la bdd
import { updateUserRequestDto } from "./DTOs/updateUserRequestDto";
import { updateStoreRequestDto } from "./DTOs/updateStoreRequestDto";

// checkear email antes de seguir el proceso de registro
export async function checkEmailExists(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return false;
  if (user.status === "BLOCKED") {
    throw new ForbiddenError("El usuario está registado pero se ha dado de baja");
  }
  return true;
}
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
      if (existingUser) throw new ValidationError("El usuario ya existe");

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
    throw error;
  }
};

/**
 * Obtiene el perfil del usuario y los datos de su tienda.
 *
 * @param userId - ID del usuario a obtener
 * @param storeId - ID de la tienda a asociar
 * @returns Los datos del usuario junto con los datos de la tienda
 */
export const getUserProfile = async (
  userId: string,
  storeId?: string
): Promise<ProfileData | null> => {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      last_name: true,
      email: true,
      birthdate: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      userStores: {
        select: {
          store: {
            select: {
              id: true,
              name: true,
              tel: true,
              address: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!profile) return null;

  const stores = profile.userStores.map((us) => us.store);

  const selectedStore = storeId
    ? stores.find((s) => s.id === storeId) || null
    : null;

  return {
    id: profile.id,
    name: profile.name,
    last_name: profile.last_name,
    email: profile.email,
    birthdate: profile.birthdate,
    status: profile.status,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    store: selectedStore, // puede ser null si no hay coincidencia
  };
};

/* Funcion update user */

export const updateUser = async (
  user: UserSafeData,
  userData: Partial<UserSafeData>
) => {
  const parsedData = updateUserRequestDto.parse(userData);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: parsedData,
  });

  return updatedUser;
};

/* Funcion update store */

export const updateStore = async (
  store: Store,
  storeData: Partial<Store>
): Promise<StoreData> => {
  const parsedData = updateStoreRequestDto.parse(storeData);

  const updatedStore = await prisma.store.update({
    where: {
      id: store.id,
    },
    data: parsedData,
  });

  return updatedStore;
};

/* Funcion delete user
Debe setear el status del user como blocked.
Luego destruir el token
*/
