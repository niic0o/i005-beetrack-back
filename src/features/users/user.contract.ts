import { z } from 'zod';
import { initContract } from '@ts-rest/core';
import { profileDataSchema, myDataSchema } from './user.zodSchema';
import { updateUserRequestDto } from './DTOs/updateUserRequestDto';
import { updateStoreRequestDto } from './DTOs/updateStoreRequestDto';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
extendZodWithOpenApi(z);
const c = initContract();

export const userContract = c.router({
  profile: {
    method: 'GET',
    path: '/api/profile',
    responses: {
      200: profileDataSchema,
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
      401: z.object({
        message: z.string().openapi({ example: 'No ha iniciado sesión' }),
      }),
      500: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some internal server error' }),
      }),
    },
    summary: 'Returns current user and store/s data',
    metadata: { requiresAuth: true },
  },
  myData: {
    method: 'GET',
    path: '/api/myData',
    responses: {
      200: myDataSchema,
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
      401: z.object({
        message: z.string().openapi({ example: 'No ha iniciado sesión' }),
      }),
      500: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some internal server error' }),
      }),
    },
    summary: 'Returns current user and store data',
    metadata: { requiresAuth: true },
  },
  updateUser: {
    method: 'PATCH',
    path: '/api/profile/user',
    responses: {
      200: z.object({
        status: z.string().openapi({ example: 'OK' }),
        data: profileDataSchema,
      }),
      401: z.object({
        message: z.string().openapi({ example: 'Token inválido o faltante' }),
      }),
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
      404: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Usuario no encontrado' }),
      }),
      500: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some internal server error' }),
      }),
    },
    contentType: 'multipart/form-data',
    body: updateUserRequestDto
      .omit({
        cloudinary_id: true,
        avatar: true,
      })
      .extend({
        file: z.any().openapi({
          type: 'string',
          format: 'binary',
          example: 'avatar.png',
        }),
      }),
    summary: 'Update user data',
    metadata: { requiresAuth: true },
  },
  updateStore: {
    method: 'PATCH',
    path: '/api/profile/store',
    responses: {
      200: z.object({
        status: z.string().openapi({ example: 'OK' }),
        data: profileDataSchema,
      }),
      401: z.object({
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
    body: updateStoreRequestDto,
    summary: 'Update store data',
    metadata: { requiresAuth: true },
  },
});
