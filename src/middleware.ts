import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';

export function middleware(req: NextRequest) {
  //autenticación para todas las rutas excepto login y register
  const excludedPaths = ['/api/auth/login', '/api/auth/register'];

  if (!excludedPaths.includes(req.nextUrl.pathname)) {
    const authResponse = authMiddleware(req);
    if (authResponse) return authResponse;
  }

  return NextResponse.next();
}

//Se aplica el middleware a todas las rutas de la carpeta api
export const config = {
  matcher: '/api/:path*',
};
