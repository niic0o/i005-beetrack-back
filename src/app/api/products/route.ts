import { NextRequest } from 'next/server';
import { writeFile, removeFile } from './utils';
import { uploadFile } from '@/lib/cloudinary';
import { createProduct, getAllProducts } from './product.service';
import { failResponse, successResponse } from '@/lib/responses';
import { handleError } from '@/lib/errorHandler';
import { isValidFile } from './utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    if (!storeId) {
      return failResponse('storeId es requerido');
    }
    const products = await getAllProducts(storeId);
    return successResponse(products);
  } catch (error) {
    handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!isValidFile(file)) {
      return failResponse('Archivo no válido');
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

    const productCreated = await createProduct(formData);

    return successResponse(productCreated, 201);
  } catch (error) {
    handleError(error);
  }
}
