import bcrypt from "bcrypt";
import { User } from "@prisma/client";

export const createHash = async (password:string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};


export const compareHash = async (user:User, password:string) => {
  return await bcrypt.compare(password, user.password);
};
