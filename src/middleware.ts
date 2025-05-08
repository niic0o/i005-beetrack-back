// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';

const ORIGIN = process.env.ORIGIN_URL!;

export async function middleware(req: NextRequest) {
  // 1) Preflight CORS
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': ORIGIN,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  // 2) Rutas públicas
  const excluded = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/register/check-email',
    '/api/health',
    '/api/report',
    '/api/docs',
  ];
  if (!excluded.includes(req.nextUrl.pathname)) {
    // ¡await aquí!
    const resp = await authMiddleware(req);
    if (resp) {
      resp.headers.set('Access-Control-Allow-Origin', ORIGIN);
      resp.headers.set('Access-Control-Allow-Credentials', 'true');
      return resp;
    }
  }

  // 3) Resto de rutas: permito CORS y sigo
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', ORIGIN);
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  return res;
}

export const config = { matcher: '/api/:path*' };
