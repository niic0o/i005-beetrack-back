import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '../../user/user.service';
import { generateToken } from '../../user/utils';

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();

    const newUser = await createUser(userData);

    const token = generateToken(newUser.email);

    const response = NextResponse.json(
      { status: 'OK', message: 'Usuario creado exitosamente' },
      { status: 201 }
    );
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
