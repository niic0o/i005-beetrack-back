/*
El usuario se loguea, generamos un token y se lo damos para que el navegador lo guarde en una cookie
*/
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '../../../../features/users/utils';
import { getUserByEmail } from '../../../../features/users/user.service';
import { compareHash } from '../../../../features/users/utils';
import { successResponse } from '@/lib/responses';
import { UnauthorizedError } from '@/lib/errors/customErrors';
import { handleError } from '@/lib/errors/errorHandler';

const ORIGIN = process.env.ORIGIN_URL!;
const isProd = process.env.NODE_ENV === 'production';

export async function OPTIONS() {
  // responder preflight con CORS
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': ORIGIN,
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1) Validación del body
    const body = await req.json().catch(() => { throw new Error('JSON inválido'); });
    const { email, password } = body;
    if (!email || !password) throw new Error('Email y contraseña son requeridos');

    // 2) Authenticate
    const user = await getUserByEmail(email);
    if (!user) throw new UnauthorizedError('Datos incorrectos');
    if (user.status === 'BLOCKED') throw new UnauthorizedError('Cuenta bloqueada');
    const valid = await compareHash(user, password);
    if (!valid) throw new UnauthorizedError('Contraseña incorrecta');

    // 3) Generar token y enviar cookie
    const store = user.userStores[0]?.store;
    if (!store) throw new Error('Usuario sin tienda asociada');
    const token = generateToken(user.id, store.id, user.name);

    const res = successResponse('Usuario autenticado correctamente', 200);

    // seteamos la cookie ANTES de cualquier .json()
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    // le inyectamos CORS también
    res.headers.set('Access-Control-Allow-Origin', ORIGIN);
    res.headers.set('Access-Control-Allow-Credentials', 'true');

    return res;
  } catch (err: unknown) {
    // el errorHandler debe devolver un NextResponse
    const errorResp = handleError(err, 'Error al iniciar sesión');
    // y asegurarnos de exponer CORS allí también
    errorResp.headers.set('Access-Control-Allow-Origin', ORIGIN);
    errorResp.headers.set('Access-Control-Allow-Credentials', 'true');
    return errorResp;
  }
}