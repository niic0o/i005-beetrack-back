// app/api/mydata/route.ts
/*
Este endpoint es para obtener el id del usuario, el id de la tienda y su nombre.
Con esto podrán cargar el userData en react
*/
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret_key = new TextEncoder().encode(process.env.SECRET_KEY);

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "No ha iniciado sesión" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret_key);

    // Validamos que existan los campos necesarios
    if (
      typeof payload.userId !== "string" ||
      typeof payload.storeId !== "string" ||
      typeof payload.name !== "string"
    ) {
      return NextResponse.json({ message: "Token inválido" }, { status: 400 });
    }

    return NextResponse.json({
      userId: payload.userId,
      storeId: payload.storeId,
      name: payload.name,
    });
  } catch (err) {
    return NextResponse.json({ message: "Token inválido o expirado" }, { status: 401 });
  }
}
