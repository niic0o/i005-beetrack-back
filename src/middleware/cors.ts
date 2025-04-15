import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = ['http://localhost:3000']; // agregá prod acá

export function corsMiddleware(req: NextRequest) {
  const origin = req.headers.get('origin') || '';
  const res = NextResponse.next();
  const isAllowed = allowedOrigins.includes(origin);

  if (isAllowed) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Opcional: manejar el preflight si querés abortarlo rápido
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: res.headers,
    });
  }

  return res;
}
