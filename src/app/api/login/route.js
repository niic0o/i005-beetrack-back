/*
El usario se loguea, generamos un token y se lo damos
para que el navegador lo guarde en una cookie
*/

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = 'mi_clave_secreta_ultra_segura';

export async function POST(req) {
  const { email, password } = await req.json();

  if (email === 'admin@admin.com' && password === '1234') {
    const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return NextResponse.json({
      status: 'OK',
      token,
      message: 'Usuario autenticado correctamente',
    });
  }

  return NextResponse.json(
    {
      status: 'ERROR',
      message: 'Credenciales inválidas',
    },
    { status: 401 }
  );
}
