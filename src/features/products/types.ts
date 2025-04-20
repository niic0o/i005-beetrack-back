import { Product } from "@prisma/client";

export interface PaginationResult {
  items: Product[];
  total: number;
}
