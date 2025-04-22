import { Order } from '@prisma/client';
import { OrderResponse } from '../types';

export default function toCreateOrderResponseDto(
  order: Order,
  paymentMethod: string
): OrderResponse {
  return {
    id: order.id,
    status: order.status,
    pdfPath: order.pdfPath,
    subTotal: Number(order.subTotalAmount),
    total: Number(order.totalAmount),
    paymentMethod,
    date: order.createdAt,
  };
}
