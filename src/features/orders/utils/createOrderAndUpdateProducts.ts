import { CreateOrderLinesData, OrderData, OrderItems } from '../types';
import { ValidationError } from '@/lib/errors/customErrors';
import { Prisma } from '@prisma/client';
import { setProductStatus } from '@/features/products/utils';

export default async function createOrderAndUpdateProducts(
  tx: Prisma.TransactionClient,
  orderData: OrderData,
  orderItems: OrderItems[]
) {
  try {
    const newOrder = await tx.order.create({ data: orderData });
    if (!newOrder) {
      throw new ValidationError('Error al crear la orden');
    }
    let orderLinesData: CreateOrderLinesData[] = [];
    for (const item of orderItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new ValidationError(
          `Producto con id ${item.productId} no encontrado`
        );
      }
      const newStock = product.stock - item.quantity;
      const newProductStatus = setProductStatus(
        newStock,
        product.stock_min,
        product.stock_optimus
      );
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: newStock, status: newProductStatus },
      });

      orderLinesData.push({
        productId: item.productId,
        orderId: newOrder.id,
        quantity: item.quantity,
        totalSalesPrice: new Prisma.Decimal(
          Number(product.salesPrice) * item.quantity
        ),
      });
    }

    return { newOrder, orderLinesData };
  } catch (error) {
    throw error;
  }
}
