import { NextRequest } from 'next/server';
import { createUser } from '../../users/user.service';
import { generateToken } from '../../users/utils';
import { successResponse } from '@/lib/responses';
import { handleError } from '@/lib/errorHandler';

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();

    const newUser = await createUser(userData);

    const token = generateToken(newUser.email);

    const response = successResponse('Usuario creado correctamente', 201);
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día
    });

    return response;
  } catch (error) {
    handleError(error);
  }
}
