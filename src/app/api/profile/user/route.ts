import { getTokenFromCookie } from '@/lib/getTokenFromCookie';
import {
  ResourceNotFound,
  UnauthorizedError,
  ValidationError,
} from '@/lib/errors/customErrors';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { handleError } from '@/lib/errors/errorHandler';
import { getUserProfile, updateUser } from '@/features/users/user.service';
import { successResponse } from '@/lib/responses';
import { ProfileData } from '@/features/users/user.dto';
import { NextRequest } from 'next/server';
import { isValidFile, removeFile, writeFile } from '@/features/products/utils';
import { deleteFile, uploadFile } from '@/lib/cloudinary';

export async function PATCH(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req);

    if (!token) {
      throw new UnauthorizedError('Token inválido o faltante');
    }
    const user = await getUserFromToken(token);
    if (!user) {
      throw new ResourceNotFound('Usuario no encontrado');
    }
    const formData = await req.formData();
    const file = formData.get('file');

    const profile = await getUserProfile(user.userId, user.storeId);
    if (!profile || !profile.store) {
      throw new ResourceNotFound('Usuario no encontrado');
    }
    if (file) {
      if (!isValidFile(file)) {
        throw new ValidationError('Archivo no válido');
      }
      if (profile.cloudinary_id) {
        await deleteFile(profile.cloudinary_id);
      }
      const filePath = await writeFile(file);
      const cloudinaryResult = await uploadFile(filePath, 'avatars', 'webp');
      if (!cloudinaryResult) {
        throw new Error('Error al subir el archivo a Cloudinary');
      }
      removeFile(filePath);

      formData.delete('file');
      formData.append('avatar', cloudinaryResult.secure_url);
      formData.append('cloudinary_id', cloudinaryResult.public_id);
    }

    const { store, ...userEntity } = profile;

    const { password, userRole, ...safeUser } = await updateUser(
      userEntity,
      formData
    );
    const updatedProfile: ProfileData = { ...safeUser, store };

    return successResponse(updatedProfile);
  } catch (error) {
    return handleError(error);
  }
}
