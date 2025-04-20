import { getProductById } from '@/features/products/product.service';
import { ResourceNotFound, ValidationError } from '@/lib/errors/customErrors';
import { Errors, OrderItems, ProductsData } from '../types';

export default async function getProductsData(
  orderItems: OrderItems[]
): Promise<ProductsData | Errors> {
  try {
    const results = await Promise.all(
      orderItems.map(async (i) => {
        const product = await getProductById(i.productId);
        if (!product) {
          return {
            error: new ResourceNotFound(
              `Producto con id ${i.productId} no encontrado`
            ),
          };
        }
        if (product.stock < i.quantity) {
          return {
            error: new ValidationError(
              `Stock insuficiente del producto con id ${i.productId}`
            ),
          };
        }
        return {
          productId: i.productId,
          name: product.name,
          quantity: i.quantity,
          salesPrice: Number(product.salesPrice),
        };
      })
    );

    const result: ProductsData = [];
    const errors: Errors = [];

    for (const res of results) {
      if ('error' in res) {
        errors.push({ name: res.error?.name!, message: res.error?.message! });
      } else {
        result.push(res);
      }
    }
    if (errors.length > 0) throw errors;
    return result;
  } catch (error) {
    throw error;
  }
}
