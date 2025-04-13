import { writeFile, removeFile } from '../../../features/products/utils';
import { uploadFile } from '@/lib/cloudinary';
import {
  createProduct,
  getAllProducts,
} from '../../../features/products/product.service';
import { successResponse } from '@/lib/responses';
import { handleError } from '@/lib/errors/errorHandler';
import { isValidFile } from '../../../features/products/utils';
import { getTokenFromCookie } from '@/lib/getTokenFromCookie';
import { UnauthorizedError } from '@/lib/errors/customErrors';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function GET(req: Request) {
  try {
    const token = getTokenFromCookie(req);
    if (!token) {
      throw new UnauthorizedError('Token inválido o faltante');
    }
    const user = await getUserFromToken(token);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const products = await getAllProducts(user.storeId);
    return successResponse(products);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const token = getTokenFromCookie(req);

    if (!token) {
      throw new UnauthorizedError('Token inválido o faltante');
    }
    const user = await getUserFromToken(token);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!isValidFile(file)) {
      throw new Error('Archivo no válido');
    }

    const filePath = await writeFile(file);
    const cloudinaryResult = await uploadFile(filePath, 'products', 'webp');
    if (!cloudinaryResult) {
      throw new Error('Error al subir el archivo a Cloudinary');
    }
    removeFile(filePath);

    formData.delete('file');
    formData.append('imagePath', cloudinaryResult.secure_url);
    formData.append('cloudinary_id', cloudinaryResult.public_id);
    formData.append('storeId', user.storeId);

    const productCreated = await createProduct(formData);

    return successResponse(productCreated, 201);
  } catch (error) {
    return handleError(error);
  }
}
