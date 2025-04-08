import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        status: "OK",
        message: "Sesión cerrada correctamente",
      },
      { status: 204 }
    );

    response.cookies.delete("token");

    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al cerrar sesión:", error.message);
    } else {
      console.error("Error desconocido al cerrar sesión:", error);
    }

    return NextResponse.json(
      {
        status: "ERROR",
        message: "Ocurrió un error al cerrar sesión",
      },
      { status: 500 }
    );
  }
}
