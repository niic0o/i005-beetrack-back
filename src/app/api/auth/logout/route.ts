import { successResponse } from "@/lib/responses";
import { handleError } from "@/lib/errors/errorHandler";

export async function POST() {
  try {
    const response = successResponse('Sesión cerrada correctamente', 200)
    response.cookies.delete("token");

    return response;
  } catch (error) {
    return handleError(error, 'Error al cerrar sesión');
  }
}
