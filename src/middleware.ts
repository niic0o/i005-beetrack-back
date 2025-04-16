import { NextRequest, NextResponse } from 'next/server';
import { corsMiddleware } from '@/middleware/cors';
import { authMiddleware } from '@/middleware/auth';

export function middleware(req: NextRequest) {
  const res = corsMiddleware(req); // ahora incluye headers

  if (req.method === 'OPTIONS') {
    return res;
  }

  // Autenticación condicional
  const excludedPaths = ['/api/auth/login', '/api/auth/register'];

  if (!excludedPaths.includes(req.nextUrl.pathname)) {
    const authResponse = authMiddleware(req);
    if (authResponse) return authResponse;
  }

  return res;
}

export const config = {
  matcher: '/api/:path*',
};

