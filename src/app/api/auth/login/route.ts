/*
El usuario se loguea, generamos un token y se lo damos para que el navegador lo guarde en una cookie
*/
import type { NextRequest } from 'next/server';
import { generateToken } from '../../../../features/users/utils';
import { getUserByEmail } from '../../../../features/users/user.service';
import { compareHash } from '../../../../features/users/utils';
import { successResponse } from '@/lib/responses';
import { UnauthorizedError } from '@/lib/errors/customErrors';
import { handleError } from '@/lib/errors/errorHandler';

// Valida que el body tenga los campos necesarios
async function validateRequestBody(
  req: NextRequest
): Promise<{ email: string; password: string }> {
  let body: any;

  try {
    body = await req.json();
  } catch {
    throw new Error('Formato de JSON inválido');
  }

  const { email, password } = body;

  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }

  return { email, password };
}

async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Datos incorrectos');
  }

  if (user.status === "BLOCKED") {
    throw new UnauthorizedError('Tu cuenta ha sido bloqueada');
  }

  const isValidPassword = await compareHash(user, password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Contraseña incorrecta');
  }

  return user;
}

// Responde con cookie y token
function sendAuthResponse(token: string) {
  const response = successResponse('Usuario autenticado correctamente', 200);

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    /*sameSite = 'none' permite que cualquier dominio haga fetch puede ser peligroso */
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
    // Funciona solo si tiene una tienda asociada. Considerar en el futuro esto.
    const store = user.userStores[0]?.store;
    if (!store) {
      throw new Error('El usuario no tiene tiendas asociadas');
    }

    const token = generateToken(user.id, store.id, user.name);
    return sendAuthResponse(token);
  } catch (err: unknown) {
    return handleError(err, 'Error al iniciar sesión');
  }
}
