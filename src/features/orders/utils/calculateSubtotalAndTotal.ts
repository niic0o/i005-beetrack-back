import { CalculationResult, ProductsData } from '../types';

export default function calculateSubtotalAndTotal(
  productData: ProductsData,
  discountRate?: number
): CalculationResult {
  let subtotal: number = 0;
  let total: number = 0;
  for (const product of productData) {
    subtotal += product.salesPrice;
  }
  if (discountRate) {
    total = subtotal - subtotal * (discountRate / 100);
  } else {
    total = subtotal;
  }
  return {
    subtotal,
    total,
  };
}
