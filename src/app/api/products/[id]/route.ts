import {
  deleteProduct,
  getProductById,
  updateProduct,
} from '../product.service';
import { deleteFile, uploadFile } from '@/lib/cloudinary';
import { isValidFile, removeFile, writeFile } from '../utils';
import { handleError } from '@/lib/errorHandler';
import { failResponse, successResponse } from '@/lib/responses';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const productToUpdate = await getProductById(productId);
    if (!productToUpdate) {
      return failResponse('El producto no existe');
    }
    const formData = await req.formData();
    const file = formData.get('file');
    if (file) {
      if (!isValidFile(file)) {
        return failResponse('Archivo no válido');
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
    const updatedProduct = await updateProduct(productToUpdate, formData);
    return successResponse(updatedProduct);
  } catch (error) {
    handleError(error);
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
      return failResponse('Error al eliminar el producto');
    }
    await deleteFile(deletedProduct.cloudinary_id!);
    return successResponse('Producto eliminado correctamente');
  } catch (error) {
    handleError(error);
  }
}
