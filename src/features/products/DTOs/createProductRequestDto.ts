import { z } from 'zod';
import { ProductStatus } from '@prisma/client';
import { zodEnumFromPrisma } from '@/lib/zodEnumFromPrisma';

export const createProductRequestDto = z.object({
  barcode: z.string().regex(/^[0-9-]{8,16}$/, {
    message:
      'Debe tener entre 8 y 16 caracteres y solo puede contener números y guiones medios',
  }),
  name: z
    .string()
    .nonempty()
    .max(50, { message: 'Debe contener un máximo de 50 caracteres' }),
  alerts: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  storeId: z.string().nonempty(),
  salesPrice: z.coerce.number().positive(),
  costPrice: z.coerce.number().positive(),
  stock: z.coerce
    .number()
    .int()
    .min(1, { message: 'El stock mínimo para registrar un producto es 1' }),
  stock_optimus: z.coerce
    .number()
    .int()
    .min(1, { message: 'El stock_optimus mínimo es 1' }),
  stock_min: z.coerce
    .number()
    .int()
    .min(1, { message: 'El stock_min mínimo es 1' }),
  imagePath: z.string().max(255),
  cloudinary_id: z.string().max(255),
  description: z.string().max(255),
  status: zodEnumFromPrisma(ProductStatus),
});

export type CreateProductRequestDtoType = z.infer<
  typeof createProductRequestDto
>;
