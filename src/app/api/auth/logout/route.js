import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        status: 'OK',
        message: 'Sesión cerrada correctamente',
      },
      { status: 200 }
    );

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0, // Alternativa a expires: new Date(0)
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);

    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Ocurrió un error al cerrar sesión',
      },
      { status: 500 }
    );
  }
}
