import { NextResponse } from 'next/server';

export const successResponse = (data: any, code = 200) =>
  NextResponse.json({ status: 'OK', data }, { status: code });
