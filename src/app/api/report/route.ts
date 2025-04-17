import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$executeRawUnsafe(`SELECT cerrar_caja_diaria();`);
    return NextResponse.json({
      message: "Cierre de caja ejecutado correctamente",
    });
  } catch (error) {
    console.error("Error al ejecutar la funcion en PostgreSQL", error);
    return NextResponse.json(
      { error: "Error al ejecutar cierre de caja" },
      { status: 500 }
    );
  }
}
