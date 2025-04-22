import { NextResponse } from "next/server";
import { ejecutarCierreCajaSQL } from "@/features/report/report.service";

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const cantidad = await ejecutarCierreCajaSQL();
    return NextResponse.json({
      message: "Cierre de caja ejecutado desde función SQL",
      reportesGenerados: cantidad,
    });
  } catch (error) {
    console.error("Error al ejecutar cierre_caja_diaria():", error);
    return NextResponse.json(error, { status: 500 });
  }
}
