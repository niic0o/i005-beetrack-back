import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  ForbiddenError,
  ResourceNotFound,
  UnauthorizedError,
  ValidationError,
} from './customErrors';
import { Prisma } from '@prisma/client';

export function handleError(error: unknown, message?: string) {
  //Zod validation error
  if (error instanceof ZodError) {
    return NextResponse.json(
      { status: 'fail', message: error.issues },
      { status: 400 }
    );
  }
  // Prisma known errors (e.g., unique constraint failed)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          status: 'fail',
          message: `Ya existe un registro con ese valor en el campo: ${error.meta?.target}`,
        },
        { status: 409 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          status: 'fail',
          message:
            'Violación de clave foránea. Verificá que el ID referenciado exista.',
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        status: 'fail',
        message: `Error de base de datos: ${error.message}`,
      },
      { status: 400 }
    );
  }

  // Prisma validation error (inputs inválidos en el modelo)
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { status: 'fail', message: 'Datos inválidos para la base de datos' },
      { status: 400 }
    );
  }

  // Prisma initialization or panic error
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error crítico en el cliente de base de datos',
      },
      { status: 500 }
    );
  }

  //Autorización
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { status: 'fail', message: error.message },
      { status: 401 }
    );
  }
  //Autenticación
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { status: 'fail', message: error.message },
      { status: 403 }
    );
  }
  //No encuentra recurso por id
  if (error instanceof ResourceNotFound) {
    return NextResponse.json(
      { status: 'fail', message: error.message },
      { status: 404 }
    );
  }
  //Otros errores de validación
  //No encuentra recurso por id
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { status: 'fail', message: error.message },
      { status: 404 }
    );
  }
  //Otros errores
  if (error instanceof Error) {
    return NextResponse.json(
      { status: 'fail', message: error.message },
      { status: 500 }
    );
  }
  //Respuesta por defecto
  return NextResponse.json({ status: 'fail', message }, { status: 500 });
}
