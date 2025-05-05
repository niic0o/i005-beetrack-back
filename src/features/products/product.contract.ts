import { z } from 'zod';
import { createProductRequestDto } from './DTOs/createProductRequestDto';
import { updateProductRequestDto } from './DTOs/updateProductRequestDto';
import { querySearchParamsValidator } from './DTOs/querySearchParamsValidator';
import { initContract } from '@ts-rest/core';
import { productResponseDto } from './DTOs/productResponseDto';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
extendZodWithOpenApi(z);
const c = initContract();

export const productContract = c.router({
  createProduct: {
    method: 'POST',
    path: '/api/products',
    responses: {
      201: z.array(productResponseDto),
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
    contentType: 'multipart/form-data',
    body: createProductRequestDto.omit({
      cloudinary_id: true,
      imagePath: true,
      status: true,
      storeId: true,
    }),
    summary: 'Create a product',
    metadata: { requiresAuth: true },
  },
  getProducts: {
    method: 'GET',
    path: '/api/products',
    responses: {
      200: z.object({
        status: z.string().openapi({ example: 'OK' }),
        data: z.object({
          items: z.array(productResponseDto),
          total: z.number().int(),
        }),
      }),
      401: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'No ha iniciado sesión' }),
      }),
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
    },
    query: querySearchParamsValidator,
    summary: 'Get all products from the store',
    metadata: { requiresAuth: true },
  },
  getProduct: {
    method: 'GET',
    path: '/api/products/:id',
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: productResponseDto,
      401: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'No ha iniciado sesión' }),
      }),
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
    },
    summary: 'Get a single product by barcode or id',
    metadata: { requiresAuth: true },
  },
  updateProduct: {
    method: 'PATCH',
    path: '/api/products/:id',
    pathParams: z.object({ id: z.string() }),
    contentType: 'multipart/form-data',
    responses: {
      200: productResponseDto,
      401: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'No ha iniciado sesión' }),
      }),
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
    },
    body: updateProductRequestDto.omit({
      cloudinary_id: true,
      imagePath: true,
      status: true,
      storeId: true,
    }),
    summary: 'Update a product',
    metadata: { requiresAuth: true },
  },
});
