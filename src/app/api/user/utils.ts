import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const createHash = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const compareHash = async (user: User, password: string) => {
  return await bcrypt.compare(password, user.password);
};

export const generateToken = (email: string): string => {
  const secret = process.env.SECRET_KEY;
  if (!secret) throw new Error('SECRET_KEY no definida');

  return jwt.sign({ email }, secret, { expiresIn: '24h' });
};
