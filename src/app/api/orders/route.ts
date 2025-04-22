import { createOrderRequestDto } from '@/features/orders/DTOs/createOrderRequestDto';
import { createOrder, getOrders } from '@/features/orders/order.service';
import {
  ResourceNotFound,
  UnauthorizedError,
  ValidationError,
} from '@/lib/errors/customErrors';
import { handleError } from '@/lib/errors/errorHandler';
import { getTokenFromCookie } from '@/lib/getTokenFromCookie';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { successResponse } from '@/lib/responses';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const token = getTokenFromCookie(req);
    if (!token) {
      throw new UnauthorizedError('Token inválido o faltante');
    }
    const user = await getUserFromToken(token);
    if (!user) {
      throw new ResourceNotFound('Usuario no encontrado');
    }

    const orderData = await req.json();
    if (!orderData) {
      throw new ValidationError(
        'No se han enviado campos en el cuerpo de la solicitud'
      );
    }
    orderData.storeId = user.storeId;
    const validatedData = createOrderRequestDto.parse(orderData);
    const serviceResponse = await createOrder(validatedData);
    return successResponse(serviceResponse);
  } catch (error) {
    if (error instanceof Array) {
      return NextResponse.json(
        {
          status: 'fail',
          errors: error,
        },
        { status: 400 }
      );
    }
    return handleError(error);
  }
}

export async function GET (req: NextRequest) {
  try {
    const token = getTokenFromCookie(req);
    if (!token) {
      throw new UnauthorizedError('Token inválido o faltante');
    }
    const user = await getUserFromToken(token);
    if (!user) {
      throw new ResourceNotFound('Usuario no encontrado');
    }
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const orders = await getOrders(user.storeId, params)
    return successResponse(orders)
  } catch (error) {
    return handleError(error)
  }
}