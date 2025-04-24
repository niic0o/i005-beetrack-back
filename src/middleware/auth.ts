/*
  Este middleware extrae el token contenido dentro de una cookie en la aplicacion del cliente
  Lo hace cada vez que el cliente quiere acceder a una ruta protegida de nuestra api
  Si el token no existe, redirecciona a la pagina de login.
  Si el token existe, comprueba que sea valido (que lo consiguió a traves de un login legitimo)
  Si es valido continua con el acceso, si no responde con un error 401 Unauthorized

*/
// middleware/auth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'No ha iniciado sesión' }, { status: 401 });
  }

  try {
    await jwtVerify(token, secretKey);
  } catch (err) {
    console.error('Token inválido:', err);
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }

  return null; // sigue al handler
}
