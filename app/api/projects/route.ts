import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import logger from "@/lib/logger";
import { randomUUID } from "crypto";

const CreateProjectSchema = z.object({
  key: z.string().min(2).max(48).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  description: z.string().max(512).optional(),
});

export async function GET() {
  const startedAt = Date.now();
  try {
    // Prefer typed client; fall back to raw if model mapping is stale
    let projects: Array<{ id: string; key: string; name: string; description: string | null; updatedAt: Date }> = [];
    try {
      projects = await prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        select: { id: true, key: true, name: true, description: true, updatedAt: true },
      }) as any;
    } catch (typedError: any) {
      logger.warn("GET /api/projects typed client failed, falling back to raw", { code: typedError?.code, message: typedError?.message });
      const rows = await prisma.$queryRaw<Array<{ id: string; key: string; name: string; description: string | null; updatedAt: Date }>>`
        SELECT "id","key","name","description","updatedAt"
        FROM "Project"
        ORDER BY "updatedAt" DESC
      `;
      projects = rows;
    }
    const durationMs = Date.now() - startedAt;
    logger.info("GET /api/projects ok", { count: projects.length, durationMs });
    return NextResponse.json({ ok: true, data: projects, meta: { durationMs } });
  } catch (error: any) {
    const durationMs = Date.now() - startedAt;
    logger.error("GET /api/projects error", { error, durationMs });
    const payload: any = { ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to list projects" }, meta: { durationMs } };
    if (process.env.NODE_ENV !== "production") {
      payload.error.details = { code: error?.code, message: error?.message, meta: error?.meta };
    }
    return NextResponse.json(payload, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await req.json();
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() } },
        { status: 422 }
      );
    }

    const { key, name, description } = parsed.data;
    // Prefer typed client; fall back to raw on model mapping mismatch
    let created: { id: string; key: string; name: string } | null = null;
    try {
      created = await prisma.project.create({ data: { key, name, description }, select: { id: true, key: true, name: true } }) as any;
    } catch (typedError: any) {
      logger.warn("POST /api/projects typed client failed, falling back to raw", { code: typedError?.code, message: typedError?.message });
      const id = randomUUID();
      try {
        await prisma.$executeRaw`
          INSERT INTO "Project" ("id","key","name","description","createdAt","updatedAt")
          VALUES (${id}, ${key}, ${name}, ${description ?? null}, NOW(), NOW())
        `;
      } catch (rawErr: any) {
        if ((rawErr?.code ?? "") === "23505" || /unique/i.test(rawErr?.message ?? "")) {
          const durationMs = Date.now() - startedAt;
          return NextResponse.json(
            { ok: false, error: { code: "CREATE_FAILED", message: "Project key already exists" }, meta: { durationMs } },
            { status: 409 }
          );
        }
        throw rawErr;
      }
      created = { id, key, name };
    }
    const durationMs = Date.now() - startedAt;
    logger.info("POST /api/projects created", { id: created!.id, key: created!.key, durationMs });
    return NextResponse.json({ ok: true, data: created, meta: { durationMs } }, { status: 201 });
  } catch (error: any) {
    const durationMs = Date.now() - startedAt;
    logger.error("POST /api/projects error", { error, durationMs });
    const message = error?.code === "P2002" ? "Project key already exists" : "Failed to create project";
    const status = error?.code === "P2002" ? 409 : 500;
    const payload: any = { ok: false, error: { code: "CREATE_FAILED", message }, meta: { durationMs } };
    if (process.env.NODE_ENV !== "production") {
      payload.error.details = { code: error?.code, message: error?.message, meta: error?.meta };
    }
    return NextResponse.json(payload, { status });
  }
}


