import { NextRequest, NextResponse } from 'next/server';

//Agregar la url del frontend cuando esté en producción
const allowedOrigins = ['http://localhost:3000'];

export async function corsMiddleware(req: NextRequest) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = allowedOrigins.includes(origin);

  const res = NextResponse.next();

  if (isAllowed) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,OPTIONS'
    );
    res.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: res.headers,
    });
  }

  return null;
}
