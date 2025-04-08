/*
  Este middleware extrae el token contenido dentro de una cookie en la aplicacion del cliente
  Lo hace cada vez que el cliente quiere acceder a una ruta protegida de nuestra api
  Si el token no existe, redirecciona a la pagina de login.
  Si el token existe, comprueba que sea valido (que lo consiguió a traves de un login legitimo)
  Si es valido continua con el acceso, si no responde con un error 401 Unauthorized

*/

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const config = {
  //Ejecuta el middleware para todos menos:
  matcher: [
    '/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)',
  ],
};

const secret_key = new TextEncoder().encode(process.env.SECRET_KEY);

export async function middleware(request) {
  const jwt = request.cookies.get("token")?.value;

    if (jwt === undefined) {
      // Cuando tengamos front esto redirige a la pagina del login: return NextResponse.redirect(new URL("/auth/login", request.url));

     return NextResponse.json({ message: "No ha iniciado sesión" }, { status: 401 });
      }
    try {
      const { payload } = await jwtVerify(jwt, secret_key);
    } catch (error) {
      console.log(error);
    }
  return NextResponse.next();
}