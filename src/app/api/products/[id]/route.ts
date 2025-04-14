import {
  deleteProduct,
  getProductById,
  updateProduct,
} from '../../../../features/products/product.service';
import { deleteFile, uploadFile } from '@/lib/cloudinary';
import {
  isValidFile,
  removeFile,
  writeFile,
} from '../../../../features/products/utils';
import { handleError } from '@/lib/errors/errorHandler';
import { successResponse } from '@/lib/responses';
import { getTokenFromCookie } from '@/lib/getTokenFromCookie';
import { ResourceNotFound, UnauthorizedError, ValidationError } from '@/lib/errors/customErrors';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const productToUpdate = await getProductById(productId);
    if (!productToUpdate) {
      throw new ResourceNotFound('El producto no existe');
    }
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
    if (file) {
      if (!isValidFile(file)) {
        throw new ValidationError('Archivo no válido');
      }
      await deleteFile(productToUpdate.cloudinary_id!);
      const filePath = await writeFile(file);
      const cloudinaryResult = await uploadFile(filePath, 'products', 'webp');
      if (!cloudinaryResult) {
        throw new Error('Error al subir el archivo a Cloudinary');
      }
      removeFile(filePath);

      formData.delete('file');
      formData.append('imagePath', cloudinaryResult.secure_url);
      formData.append('cloudinary_id', cloudinaryResult.public_id);
    }
    formData.append('storeId', user.storeId);
    const updatedProduct = await updateProduct(productToUpdate, formData);
    return successResponse(updatedProduct);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const deletedProduct = await deleteProduct(productId);
    if (!deletedProduct) {
      throw new Error('Error al eliminar el producto');
    }
    await deleteFile(deletedProduct.cloudinary_id!);
    return successResponse('Producto eliminado correctamente');
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const requiredProduct = await getProductById(productId);
    if (!requiredProduct) {
      throw new ResourceNotFound(
        'El producto requerido no existe en la base de datos'
      );
    }

    return successResponse(requiredProduct);
  } catch (error) {
    return handleError(error);
  }
}
