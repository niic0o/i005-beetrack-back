import { jwtVerify } from "jose";

const secret_key = new TextEncoder().encode(process.env.SECRET_KEY);

export async function getUserFromToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret_key);
    return payload as {
      userId: string;
      storeId: string;
      name: string;
      // agregá más si querés
    };
  } catch {
    return null;
  }
}