import { NextResponse } from 'next/server';

export const failResponse = (message: string, code = 400) =>
  NextResponse.json({ status: 'fail', message }, { status: code });

export const successResponse = (data: any, code = 200) =>
  NextResponse.json({ status: 'OK', data }, { status: code });
