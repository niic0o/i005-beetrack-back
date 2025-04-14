import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getUserProfile } from "@/features/users/user.service";

const secret_key = new TextEncoder().encode(process.env.SECRET_KEY);

/**
 * A diferencia de la funcion myData que devuelve solo los id, esta funcion devuelve
 * todos los datos del usuario.
 * @param request solo es necesario haber iniciado sesion
 * @returns devuelve los datos del usuario que inicio sesion con todas sus tiendas asociadas
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "No ha iniciado sesión" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret_key);

    if (
      typeof payload.userId !== "string" ||
      typeof payload.storeId !== "string"
    ) {
      return NextResponse.json({ message: "Token inválido" }, { status: 400 });
    }

    const profile = await getUserProfile(payload.userId, payload.storeId);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json({ message: "Token inválido o expirado" }, { status: 401 });
  }
}