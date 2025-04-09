/*
Esta es la estructura de carpetas:
/app
  /api
    /dashboard
      route.ts               ← Tu handler HTTP (GET, POST, etc.)
      types.ts               ← (Opcional) DTOs o Tipos específicos del endpoint

    /lib/dashboard/
├── dashboardService.ts        ← Lógica principal (`getDashboardData`)
├── dashboard.dto.ts           ← Zod schemas para validar input
├── dashboard.mapper.ts        ← Transforma datos de Prisma a respuesta (opcional)
├── dashboard.utils.ts         ← Función `aggregate()`, helpers de fecha

    ✅ ¿Qué va en cada uno?
route.ts: recibe la request, valida con Zod, y llama a dashboardService.

dashboardService.ts: hace toda la lógica (consultas, cálculos, etc.).

dashboard.mapper.ts: transforma modelos Prisma en objetos listos para devolver al frontend.

dashboard.dto.ts: define y valida inputs esperados desde el frontend (view, fechas, etc.).
*/

// app/api/dashboard/route.ts

import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard/dashboard.service";
import { dashboardQuerySchema } from "./dto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const parse = dashboardQuerySchema.safeParse(params);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.format() }, { status: 400 });
  }

  const { storeId, view, date, fromDate, toDate } = parse.data;

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

