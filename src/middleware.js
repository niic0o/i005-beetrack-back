// middleware.ts
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/api/:path*'],
};

export function middleware() {
  console.log('Middleware ejecutado');
  return NextResponse.next();
}

/* chatgtp dice: 
export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  const publicPaths = ['/api/auth/login', '/api/user/register'];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // Si es ruta pública, dejá pasar
  if (isPublic) return NextResponse.next();

  // Si no hay token, bloqueá el request
  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'Token no proporcionado' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Verificar token con SECRET_KEY
  try {
    if (!process.env.SECRET_KEY) {
      console.error('SECRET_KEY no está definida');
      return new NextResponse(JSON.stringify({ message: 'Error interno del servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    jwt.verify(token, process.env.SECRET_KEY);
    return NextResponse.next();

  } catch (err) {
    console.error('Token inválido:', err.message);
    return new NextResponse(JSON.stringify({ message: 'Token inválido o expirado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
*/