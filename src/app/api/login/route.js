/*
El usario se loguea, generamos un token y se lo damos
para que el navegador lo guarde en una cookie
*/

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, password } = await req.json();

  if (email === "admin@admin.com" && password === "1234") {
    if (!process.env.SECRET_KEY) throw new Error('SECRET_KEY no está definida en las variables de entorno');
    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "24h",
    });
    const response = NextResponse.json(
      {
        status: "OK",
        token,
        message: "Usuario autenticado correctamente",
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true, // No accesible desde JS del cliente (previene XSS)
      secure: true, // Solo se envía por HTTPS
      sameSite: "strict", // Protege de CSRF
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/", // Disponible en toda la app
    });
    return response;
  } else {
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Credenciales inválidas",
      },
      { status: 401 }
    );
  }
}
