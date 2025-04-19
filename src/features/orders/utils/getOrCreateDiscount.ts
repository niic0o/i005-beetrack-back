import { prisma } from '@/lib/prisma';

export default async function getOrCreateDiscount(discountRate: number) {
  try {
    const discount = await prisma.discount.findFirst({
      where: {
        rate: discountRate,
      },
    });
    if (!discount) {
      const newDiscount = await prisma.discount.create({
        data: {
          rate: discountRate,
          description: 'por ahora hardcodeada',
        },
      });
      return newDiscount;
    }
    return discount;
  } catch (error) {
    throw error;
  }
}
