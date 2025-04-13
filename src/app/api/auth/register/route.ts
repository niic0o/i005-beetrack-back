/*
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
      maxAge: 60 * 60 * 24, // 1 día
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
*/

// src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import { registerUserAndStoreDto } from '../../user/DTOs/createUserRequestDto';
import { registerUserAndStore } from '../../user/user.service';
import { generateToken } from '../../user/utils';

export async function POST(req: Request) {
  try {
    // Validación con Zod
    const body = registerUserAndStoreDto.parse(await req.json());

    // Lógica principal: crear usuario + tienda + userStore
    const createdUser = await registerUserAndStore(body);

    // Generar token
    const token = generateToken( createdUser.id,
      createdUser.store.id,
      createdUser.name);

    const response = NextResponse.json(
      {
        status: 'OK',
        message: 'Usuario y tienda creados exitosamente',
      },
      { status: 201 }
    );

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
    const message = error instanceof Error ? error.message : 'Error del servidor';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
