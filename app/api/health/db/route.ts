import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET() {
  const startedAt = Date.now();
  try {
    // Simple connectivity check; avoids scanning user tables
    await prisma.$queryRaw`SELECT 1`;
    const durationMs = Date.now() - startedAt;
    // eslint-disable-next-line no-console
    console.debug("[health] DB OK", { durationMs });
    return NextResponse.json({ ok: true, data: { status: "up", durationMs } });
  } catch (error: any) {
    const durationMs = Date.now() - startedAt;
    logger.error("/api/health/db error", { error, durationMs });
    return NextResponse.json(
      { ok: false, error: { code: "DB_UNAVAILABLE", message: error?.message ?? "Database check failed" }, meta: { durationMs } },
      { status: 503 }
    );
  }
}


