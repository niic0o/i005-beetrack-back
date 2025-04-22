import { handleError } from "@/lib/errors/errorHandler";
import { checkEmailDto } from "@/features/users/DTOs/createUserRequestDto";
import { checkEmailExists } from "@/features/users/user.service";
import { successResponse } from "@/lib/responses";

export async function POST(req: Request) {
  try {
    const { email } = checkEmailDto.parse(await req.json());
    const isEmailRegistered = await checkEmailExists(email);
    return successResponse({ isEmailRegistered });
  } catch (error) {
    return handleError(error);
  }
}
