/*
El usario se loguea, generamos un token y se lo damos
para que el navegador lo guarde en una cookie
*/

import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  // Acá iría tu lógica de autenticación y generación de token

  return NextResponse.json({
    status: 'OK',
    email,
    password,
    message: 'El usuario se logueó correctamente',
  });
}
