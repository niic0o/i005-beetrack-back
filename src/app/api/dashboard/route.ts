/*
route.ts: recibe la request, valida con Zod, y llama a dashboardService.

dashboardService.ts: hace toda la lógica (consultas, cálculos, etc.).

dashboard.mapper.ts: transforma modelos Prisma en objetos listos para devolver al frontend.

dashboard.dto.ts: define y valida inputs esperados desde el frontend (view, fechas, etc.).
*/

// app/api/dashboard/route.ts

import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard/dashboard.service";
import { dashboardQuerySchema } from "./dto";
import { parseLocalDate } from "@/lib/dashboard/utils/date";
import { getUserFromToken } from "@/lib/dashboard/getUserFromToken";

/**
  Funcion que permite obtener reportes estadísticos del comercio
 * @param req recibe por solicitud tienda id, tipo de reporte, date?, fromDate? y toDate?
 * @returns devuelve un objeto json con los datos solicitados
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const parse = dashboardQuerySchema.safeParse(params);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.format() }, { status: 400 });
  }

  const { view, date, fromDate, toDate } = parse.data;
  const token = req.headers.get("cookie")?.split('; ').find(c => c.startsWith('token='))?.split('=')[1];
  const user = await getUserFromToken(token);

  if (!user?.storeId) {
    return NextResponse.json({ error: "Token inválido o faltante" }, { status: 401 });
  }

  const storeId = user.storeId;
  try {
    const result = await getDashboardData({
      storeId,
      view,
      date: date ? parseLocalDate(date) : undefined,
      fromDate: fromDate ? parseLocalDate(fromDate) : undefined,
      toDate: toDate ? parseLocalDate(toDate) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener dashboard" }, { status: 500 });
  }
}

