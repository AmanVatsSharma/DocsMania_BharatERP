import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "node:crypto";
import { z } from "zod";
import logger from "@/lib/logger";

const CreateDocumentSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  projectKey: z.string().min(1),
  meta: z.any().optional(),
});

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const projectKey = req.nextUrl.searchParams.get("projectKey");
    const where: any = projectKey ? { project: { key: projectKey } } : {};
    let documents: any[] = [];
    try {
      documents = await (prisma as any).document.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: { project: { select: { key: true, name: true } } },
      });
    } catch (typedError: any) {
      logger.warn("GET /api/documents typed client failed, falling back to raw", { code: typedError?.code, message: typedError?.message });
      // join Project manually to supply project key/name
      if (where?.project?.key) {
        const key = where.project.key;
        documents = await prisma.$queryRaw<any[]>`
          SELECT d."id", d."title", d."slug", d."updatedAt",
                 json_build_object('key', p."key", 'name', p."name") as project
          FROM "Document" d
          JOIN "Project" p ON p."id" = d."projectId"
          WHERE p."key" = ${key}
          ORDER BY d."updatedAt" DESC
        `;
      } else {
        documents = await prisma.$queryRaw<any[]>`
          SELECT d."id", d."title", d."slug", d."updatedAt",
                 json_build_object('key', p."key", 'name', p."name") as project
          FROM "Document" d
          JOIN "Project" p ON p."id" = d."projectId"
          ORDER BY d."updatedAt" DESC
        `;
      }
    }
    const durationMs = Date.now() - startedAt;
    logger.info("GET /api/documents ok", { count: documents.length, projectKey, durationMs });
    return NextResponse.json({ ok: true, data: documents, meta: { durationMs } });
  } catch (error: any) {
    const durationMs = Date.now() - startedAt;
    logger.error("GET /api/documents error", { error, durationMs });
    const payload: any = { ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to list documents" }, meta: { durationMs } };
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
    const parsed = CreateDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() },
        },
        { status: 422 }
      );
    }

    const { title, slug, meta, projectKey } = parsed.data as any;
    let project: { id: string; key: string } | null = null;
    try {
      project = await (prisma as any).project.findUnique({ where: { key: projectKey }, select: { id: true, key: true } });
    } catch (typedError: any) {
      logger.warn("POST /api/documents project lookup via typed client failed, falling back to raw", { code: typedError?.code, message: typedError?.message });
      const rows = await prisma.$queryRaw<Array<{ id: string; key: string }>>`
        SELECT "id", "key" FROM "Project" WHERE "key" = ${projectKey} LIMIT 1
      `;
      project = rows[0] ?? null;
    }
    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: "PROJECT_NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }
    let created: { id: string; title: string; slug: string; project: { key: string } } | null = null;
    try {
      created = await (prisma as any).document.create({
        data: { title, slug, meta, projectId: project.id },
        include: { project: { select: { key: true } } },
      });
    } catch (typedError: any) {
      logger.warn("POST /api/documents typed client failed, falling back to raw", { code: typedError?.code, message: typedError?.message });
      const id = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "Document" ("id","title","slug","meta","projectId","createdAt","updatedAt")
        VALUES (${id}, ${title}, ${slug}, ${meta ?? null}, ${project.id}, NOW(), NOW())
      `;
      created = { id, title, slug, project: { key: project.key } } as any;
    }

    const durationMs = Date.now() - startedAt;
    logger.info("POST /api/documents created", { id: created.id, slug, projectKey: created.project.key, durationMs });
    return NextResponse.json({ ok: true, data: { id: created.id, title: created.title, slug: created.slug, project: created.project }, meta: { durationMs } }, { status: 201 });
  } catch (error: any) {
    const durationMs = Date.now() - startedAt;
    logger.error("POST /api/documents error", { error, durationMs });
    const message = error?.code === "P2002" ? "Slug already exists in this project" : "Failed to create document";
    const status = error?.code === "P2002" ? 409 : 500;
    const payload: any = { ok: false, error: { code: "CREATE_FAILED", message }, meta: { durationMs } };
    if (process.env.NODE_ENV !== "production") {
      payload.error.details = { code: error?.code, message: error?.message, meta: error?.meta };
    }
    return NextResponse.json(payload, { status });
  }
}
