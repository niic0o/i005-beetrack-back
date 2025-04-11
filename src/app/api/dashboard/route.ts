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

  const { storeId, view, date, fromDate, toDate } = parse.data;

  console.log("Request dashboard", { storeId, view, date, fromDate, toDate }); //para debuggear

  try {
    const result = await getDashboardData({
      storeId,
      view,
      date: date ? new Date(date) : undefined,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener dashboard" }, { status: 500 });
  }
}

