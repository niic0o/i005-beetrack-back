import { createProductRequestDto } from './DTOs/createProductRequestDto';
import { updateProductRequestDto } from './DTOs/updateProductRequestDto';
import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';
import { formDataToObject } from './Mappers/formDataToObject';
import { setProductStatus } from './utils';
import { querySearchParamsValidator } from './DTOs/querySearchParamsValidator';
import { PaginationResult } from './types';

export const createProduct = async (formData: FormData): Promise<Product> => {
  const obj = formDataToObject(formData);

  const productStatus = setProductStatus(
    Number(obj.stock),
    Number(obj.stock_min),
    Number(obj.stock_optimus)
  );
  obj.status = productStatus;
  const productData = createProductRequestDto.parse(obj);

  const productCreated = await prisma.product.create({
    data: productData,
  });
  return productCreated;
};

export const getAllProducts = async (
  storeId: string,
  params?: Record<string, string>
): Promise<Product[] | PaginationResult> => {
  try {
    let whereValues: Record<string, string | boolean> = { storeId };
    if (params) {
      const parsedParams = querySearchParamsValidator.safeParse(params);

      if (parsedParams.data?.isActive) {
        whereValues.is_active = parsedParams.data.isActive;
      }
      if (parsedParams.data?.page && parsedParams.data.limit) {
        const skip = (parsedParams.data?.page - 1) * parsedParams.data.limit;
        const [items, totalItems] = await Promise.all([
          prisma.product.findMany({
            where: whereValues,
            skip,
            take: parsedParams.data.limit,
          }),
          prisma.product.findMany({ where: whereValues }),
        ]);
        const total = totalItems.length;
        return { items, total };
      }
    }
    const products = await prisma.product.findMany({
      where: whereValues,
    });
    return products;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (
  product: Product,
  productData: FormData
): Promise<Product> => {
  const objData = formDataToObject(productData);

  if (objData.stock) {
    objData.status = setProductStatus(
      Number(objData.stock),
      Number(product.stock_min),
      Number(product.stock_optimus)
    );
  }
  const parsedData = updateProductRequestDto.parse(objData);

  const updatedProduct = await prisma.product.update({
    where: {
      id: product.id,
    },
    data: parsedData,
  });

  return updatedProduct;
};

export const getProductById = async (
  productId: string
): Promise<Product | null> => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });
  return product;
};

export const getProductByBarcode = async (
  barcode: string,
  storeId: string,
): Promise<Product | null> => {
  const product = await prisma.product.findFirst({
    where: {
      barcode,
      storeId
    },
  });
  return product;
};
