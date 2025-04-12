import { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CreateStoreRequestDtoType } from './DTOs/createStoreRequestDto';

export const getAllStores = async (): Promise<Store[]> => {
  const stores = await prisma.store.findMany();
  return stores;
};

export const createStore = async (
  storeData: CreateStoreRequestDtoType
): Promise<Store> => {
  const storeCreated = await prisma.store.create({
    data: storeData,
  });
  return storeCreated;
};
