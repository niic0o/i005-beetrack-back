import { NextRequest, NextResponse } from 'next/server';

//Agregar la url del frontend cuando esté en producción
const allowedOrigins = ['http://localhost:3000'];

export function corsMiddleware(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = allowedOrigins.includes(origin);

  if (isAllowed) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    res.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }


}
