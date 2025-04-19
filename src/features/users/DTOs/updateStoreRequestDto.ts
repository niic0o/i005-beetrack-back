import { z } from 'zod';
import { registerUserAndStoreDto } from './createUserRequestDto';

export const updateStoreRequestDto = registerUserAndStoreDto
  .pick({
    storeName: true,
    storeAddress: true,
    storeTel: true,
  })  
  .partial() // permite modificar solo los campos necesarios
  .transform(( data ) => ({
    name: data.storeName,
    address: data.storeAddress,
    tel: data.storeTel,
  }));

export type UpdateStoreRequestDtoType = z.infer<
  typeof updateStoreRequestDto
>;