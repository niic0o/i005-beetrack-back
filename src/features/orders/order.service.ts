// Prisma
import { PaymentMethod, Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Funciones auxiliares
import getOrCreatePayment from './utils/getOrCreatePayment';
import getOrCreateDiscount from './utils/getOrCreateDiscount';
import getProductsData from './utils/getProductsData';
import calculateSubtotalAndTotal from './utils/calculateSubtotalAndTotal';
import generatePdf from './utils/generatePdf';
import { uploadFile } from '@/lib/cloudinary';
import { removeFile } from '../products/utils';
import createOrderAndUpdateProducts from './utils/createOrderAndUpdateProducts';

// Tipos | DTOs
import { CreateOrderRequestDto } from './DTOs/createOrderRequestDto';
import { ValidationError } from '@/lib/errors/customErrors';
import { Errors, ProductsData } from './types';
import { OrderData } from './types';

// Mappers
import toCreateOrderResponseDto from './Mappers/toOrderResponse';

function isProductsData(
  productData: ProductsData | Errors
): productData is ProductsData {
  return (productData as ProductsData) !== undefined;
}

export const createOrder = async (data: CreateOrderRequestDto) => {
  try {
    // Traer id del paymentMethod
    let paymentId: string = '';
    if (
      data.paymentMethod &&
      Object.values(PaymentMethod).includes(data.paymentMethod)
    ) {
      const payment = await getOrCreatePayment(data.paymentMethod);
      if (!payment) {
        throw new ValidationError(
          'Error en la obtención o creación del medio de pago'
        );
      }
      paymentId = payment.id;
    }

    // Traer info del discount
    let discountId: string = '';
    if (data.discountRate) {
      const discount = await getOrCreateDiscount(data.discountRate);
      if (!discount) {
        throw new ValidationError('Error al obtener o crear el descuento');
      }
      discountId = discount.id;
    }

    // Traer id, nombre, stock y precio de venta de cada producto en orderItems, chequeando que el stock sea suficiente para la cantidad pedida
    const productsData = await getProductsData(data.orderItems);

    if (!isProductsData(productsData)) {
      throw new ValidationError('Error al obtener los datos de los productos');
    }

    // Realizar los cálculos del subtotal y total (si hay descuento)
    const calculationResult = calculateSubtotalAndTotal(
      productsData,
      data.discountRate
    );
    // Obtener el nombre de la tienda para incluirlo en el comprobante
    const store = await prisma.store.findUnique({
      where: { id: data.storeId },
    });
    if (!store) {
      throw new ValidationError('Error al obtener la tienda');
    }
    const storeName = store.name;
    // Generar pdf y guardarlo en cloudinary
    const dateForPdf = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
    const discountForPdf = data.discountRate || 0;
    const pdfPath =  generatePdf(
      dateForPdf,
      storeName,
      productsData,
      calculationResult.subtotal,
      discountForPdf,
      calculationResult.total
    );
    const cloudinaryResult = await uploadFile(pdfPath, 'tickets', 'pdf');
    if (!cloudinaryResult) {
      throw new ValidationError('Error al cargar el archivo en Cloudinary');
    }
    removeFile(pdfPath);

    //Preparar los datos para crear la Orden
    const newOrderData: OrderData = {
      status: OrderStatus.PAID,
      storeId: data.storeId,
      paymentId,
      discountID: discountId,
      subTotalAmount: Prisma.Decimal(calculationResult.subtotal),
      totalAmount: Prisma.Decimal(calculationResult.total),
      pdfPath: cloudinaryResult.secure_url,
      cloudinary_id: cloudinaryResult.public_id,
    };
    //Crear la orden en la base de datos, actualizar stock de productos y crear las OrderLines en una transacción que devuelve la nueva orden
    const createdOrder = await prisma.$transaction(async (tx) => {
      const { newOrder, orderLinesData } = await createOrderAndUpdateProducts(
        tx,
        newOrderData,
        data.orderItems
      );
      if (!newOrder) {
        throw new ValidationError('Error al crear la orden');
      }

      //crear los registros de la tabla OrderLines
      await tx.orderLines.createMany({ data: orderLinesData });
      return newOrder;
    });

    //devolver id, status, pdfPath, subtotal, total, fecha y método de pago
    return toCreateOrderResponseDto(createdOrder, data.paymentMethod || '');
  } catch (error) {
    console.log(error);
    throw error;
  }
};
