import { registerUserAndStoreDto } from '../../../../features/users/DTOs/createUserRequestDto';
import { registerUserAndStore } from '../../../../features/users/user.service';
import { generateToken } from '../../../../features/users/utils';
import { successResponse } from '@/lib/responses';
import { handleError } from '@/lib/errors/errorHandler';

export async function POST(req: Request) {
  try {
    // Validación con Zod
    const body = registerUserAndStoreDto.parse(await req.json());

    // Lógica principal: crear usuario + tienda + userStore
    const createdUser = await registerUserAndStore(body);
    
    if (!createdUser) {
      throw new Error('Error al crear el usuario o la tienda');
    }

      const token = generateToken(
        createdUser.id,
        createdUser.store.id,
        createdUser.name
      );

      const response = successResponse(
        'Usuario y tienda creados exitosamente',
        201
      );

      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 día
      });

      return response;
  } catch (error) {
    return handleError(error);
  }
}
