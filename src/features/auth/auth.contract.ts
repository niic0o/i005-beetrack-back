import { z } from 'zod';
import { initContract } from '@ts-rest/core';
import { registerUserAndStoreDto } from '../users/DTOs/createUserRequestDto';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
extendZodWithOpenApi(z);
const c = initContract();

export const authContract = c.router({
  register: {
    method: 'POST',
    path: '/api/auth/register',
    responses: {
      201: z.object({
        status: z.string().openapi({ example: 'OK' }),
        message: z
          .string()
          .openapi({ example: 'Usuario y tienda creados exitosamente' }),
      }),
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
      500: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some internal server error' }),
      }),
    },
    contentType: 'application/json',
    body: registerUserAndStoreDto,
    summary: 'Register a new user and store',
    metadata: { requiresAuth: false },
  },
  login: {
    method: 'POST',
    path: '/api/auth/login',
    responses: {
      200: z.object({
        status: z.string().openapi({ example: 'OK' }),
        message: z
          .string()
          .openapi({ example: 'Usuario autenticado correctamente' }),
      }),
      401: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Token inválido o expirado' }),
      }),
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
      500: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some internal server error' }),
      }),
    },
    contentType: 'application/json',
    body: z.object({ email: z.string().email(), password: z.string() }),
    summary: 'Login with email and password',
    metadata: { requiresAuth: false },
  },
  logout: {
    method: 'POST',
    path: '/api/auth/logout',
    responses: {
      200: z.object({
        status: z.string().openapi({ example: 'OK' }),
        data: z.string().openapi({ example: 'Sesión cerrada correctamente' }),
      }),
      401: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'No ha iniciado sesión' }),
      }),
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
      500: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some internal server error' }),
      }),
    },
    body: z.object({}).optional(),
    summary: 'Logout from de application',
    metadata: { requiresAuth: true },
  },
});
