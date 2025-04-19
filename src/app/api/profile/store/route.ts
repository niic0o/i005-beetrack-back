import { getTokenFromCookie } from "@/lib/getTokenFromCookie";
import { ResourceNotFound, UnauthorizedError } from "@/lib/errors/customErrors";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { handleError } from "@/lib/errors/errorHandler";
import { getUserProfile, updateUser } from "@/features/users/user.service";
import { successResponse } from "@/lib/responses";
import { ProfileData } from "@/features/users/user.dto";
import { NextRequest} from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req);

    if (!token) {
      throw new UnauthorizedError('Token inválido o faltante');
    }
    const user = await getUserFromToken(token);
    if (!user) {
      throw new ResourceNotFound('Usuario no encontrado');
    }

    const body = await req.json();

    const profile = await getUserProfile(user.userId, user.storeId);

    if(!profile || !profile.store) {
      throw new ResourceNotFound('Usuario no encontrado');
    }

    const { store, ...userEntity } = profile;

    const { password, userRole, ...safeUser } = await updateUser(userEntity, body);
    const updatedProfile: ProfileData = { ...safeUser, store }

    return successResponse(updatedProfile);
  } catch (error) {
    return handleError(error);
  }
}