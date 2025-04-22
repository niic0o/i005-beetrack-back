import {
  Discount,
  Order,
  OrderLines,
  OrderStatus,
  Payment,
  Prisma,
} from '@prisma/client';

export interface OrderData {
  status: OrderStatus;
  storeId: string;
  paymentId?: string;
  discountID?: string;
  subTotalAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  pdfPath: string;
  cloudinary_id: string;
}

export type CreateOrderLinesData = Omit<OrderLines, 'id'>;

export interface ProductData {
  productId: string;
  name: string;
  quantity: number;
  salesPrice: number;
}

export type ProductsData = ProductData[];

export interface OrderItems {
  productId: string;
  quantity: number;
}

export interface ErrorDetails {
  name: string;
  message: string;
}
export type Errors = ErrorDetails[];

export type CalculationResult = {
  subtotal: number;
  total: number;
};

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  pdfPath: string | null;
  subTotal: number;
  total: number;
  paymentMethod: string;
  date: Date;
}

export type OrderWithPaymentAndDiscount = Omit<
  Order,
  'storeId' | 'cloudinary_id' | 'paymentId' | 'discountID'
> & { payment: Payment | null; discount: Pick<Discount, 'id' | 'rate'> | null };
