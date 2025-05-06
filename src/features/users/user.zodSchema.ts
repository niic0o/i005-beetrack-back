import { z } from "zod";
import { zodEnumFromPrisma } from "@/lib/zodEnumFromPrisma";
import { Status } from "@prisma/client";

const userSafeDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  last_name: z.string(),
  birthdate: z.coerce.date(),
  email: z.string().email(),
  status: zodEnumFromPrisma(Status),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const storeDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  tel: z.string().nullable(),
  address: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  status: zodEnumFromPrisma(Status),
});

export const myDataSchema = z.object({
    userId: z.string(),
    storeId: z.string(),
    name: z.string(),
})

export const profileDataSchema = userSafeDataSchema.extend({
  store: storeDataSchema.nullable(),
});

