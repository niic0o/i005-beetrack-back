import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { status: 'fail', message: error.issues },
      { status: 400 }
    );
  }
  if (error instanceof Error) {
    return NextResponse.json(
      { status: 'fail', message: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ status: 'fail', data: error }, { status: 500 });
}
