/*
El usuario se loguea, generamos un token y se lo damos para que el navegador lo guarde en una cookie
*/

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateToken } from '../../user/utils';
import { getUserByEmail } from '../../user/user.service';
import { compareHash } from '../../user/utils';

// Simulación de base de datos
// const users = [
//   { id: 1, email: "admin@admin.com", password: "1234", name: "pedro" },
//   { id: 2, email: "user@user.com", password: "1234", name: "juan" },
//   { id: 3, email: "nico@user.com", password: "nico", name: "nico" },
// ];

// // Simula búsqueda asincrónica de usuario
// async function findUserByEmail(email: string) {
//   await new Promise((resolve) => setTimeout(resolve, 100));
//   return users.find((u) => u.email === email);
// }

// Valida que el body tenga los campos necesarios
async function validateRequestBody(
  req: NextRequest
): Promise<{ email: string; password: string }> {
  let body: any;

  try {
    body = await req.json();
  } catch {
    const err = new Error('Formato de JSON inválido');
    (err as any).statusCode = 400;
    throw err;
  }

  const { email, password } = body;

  if (!email || !password) {
    const err = new Error('Email y contraseña son requeridos');
    (err as any).statusCode = 400;
    throw err;
  }

  return { email, password };
}

// Verifica usuario y contraseña
async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    const err = new Error('Datos incorrectos');
    (err as any).statusCode = 401;
    throw err;
  }
  const isValidPassword = await compareHash(user, password);
  if (!isValidPassword) {
    const err = new Error('Contraseña incorrecta');
    (err as any).statusCode = 401;
    throw err;
  }

  return user;
}

// Responde con cookie y token
function sendAuthResponse(token: string) {
  const response = NextResponse.json(
    {
      status: 'OK',
      // token,
      message: 'Usuario autenticado correctamente',
    },
    { status: 200 }
  );

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return response;
}

/*
valido la solicitud
autentico el usuario (busca en la bdd)
genera el token
responde con el token en una cookie
Manejo el error si los hubiera
*/
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await validateRequestBody(req);
    const user = await authenticateUser(email, password);
    //Ojo, funciona solo si el usuario tiene una sola tienda.
    const token = generateToken(user.id, user.stores[0].id, user.name);
    return sendAuthResponse(token);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    const status =
      err instanceof Error && (err as any).statusCode
        ? (err as any).statusCode
        : 500;

    return NextResponse.json(
      {
        status: 'ERROR',
        message,
      },
      { status }
    );
  }
}
