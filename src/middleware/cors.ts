import { NextRequest, NextResponse } from 'next/server';

// Permitir todos los orígenes en desarrollo (dev)
const devOrigins = '*'; // Esto permite cualquier dominio en desarrollo

// Reemplazar con el dominio real de producción
const prodOrigins = ['https://tuapp.com']; // Cambia por tu dominio real en producción

const allowedOrigins =
  process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins;

export function corsMiddleware(req: NextRequest) {
  const origin = req.headers.get('origin') || '';
  const res = NextResponse.next();

  // En producción, solo se permite acceso desde orígenes específicos
  const isAllowed = allowedOrigins === '*' || allowedOrigins.includes(origin);

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
