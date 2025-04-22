import { prisma } from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';

export default async function getOrCreatePayment(method: PaymentMethod) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        name: method,
      },
    });
    if (!payment) {
      const newPayment = await prisma.payment.create({
        data: { name: method },
      });
      return newPayment;
    }
    return payment;
  } catch (error) {
    throw error;
  }
}
