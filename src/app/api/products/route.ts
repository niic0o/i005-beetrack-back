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
import {
  ResourceNotFound,
  UnauthorizedError,
  ValidationError,
} from '@/lib/errors/customErrors';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { querySearchParamsValidator } from '@/features/products/DTOs/querySearchParamsValidator';

export async function GET(req: Request) {
  try {
    const token = getTokenFromCookie(req);
    if (!token) {
      throw new UnauthorizedError('Token inválido o faltante');
    }
    const user = await getUserFromToken(token);
    if (!user) {
      throw new ResourceNotFound('Usuario no encontrado');
    }
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parse = querySearchParamsValidator.safeParse(params);
    const products = await getAllProducts(user.storeId, parse.data?.isActive);
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
      throw new ResourceNotFound('Usuario no encontrado');
    }

    if (!isValidFile(file)) {
      throw new ValidationError('Archivo no válido');
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
