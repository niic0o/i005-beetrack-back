import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

//añadir rutas que quiero proteger
export function middleware(req) {
  const protectedPaths = [
    '/api/auth',
    '/api/health',
    '/api/user',
    '/api/store',
    '/api/dashboard',
    '/api/product',
  ];

  const { pathname } = req.nextUrl;

  // Si la ruta no necesita protección, dejala pasar
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  // Obtener el token desde la cookie
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'Token no proporcionado' },
      { status: 401 }
    );
  }

  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY no está definida en las variables de entorno");
  }

  try {
    // Validar token
    jwt.verify(token, process.env.SECRET_KEY);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json(
      { message: 'Token inválido o expirado' },
      { status: 401 }
    );
  }
}

export const config = {
    matcher: [
      '/api/:path*',
    ],
  };
  
