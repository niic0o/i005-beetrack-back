import { createProductRequestDto } from './DTOs/createProductRequestDto';
import { updateProductRequestDto } from './DTOs/updateProductRequestDto';
import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';
import { formDataToObject } from './Mappers/formDataToObject';
import { setProductStatus } from './utils';

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

export const getAllProducts = async (storeId: string): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: {
      storeId,
    },
  });
  return products;
};

export const updateProduct = async (
  product: Product,
  productData: FormData
): Promise<Product> => {
  const objData = formDataToObject(productData);
  console.log(objData);

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
  barcode: string
): Promise<Product | null> => {
  const product = await prisma.product.findUnique({
    where: {
      barcode,
    },
  });
  return product;
};

export const deleteProduct = async (productId: string): Promise<Product> => {
  const deletedProduct = await prisma.product.delete({
    where: {
      id: productId,
    }
  });
  return deletedProduct;
};
