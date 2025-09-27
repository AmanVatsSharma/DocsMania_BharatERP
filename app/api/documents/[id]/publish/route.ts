import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import crypto from "node:crypto";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startedAt = Date.now();
  try {
    try {
      const doc = await prisma.document.findUnique({ where: { id: params.id }, include: { project: true } });
      if (!doc) {
        return NextResponse.json(
          { ok: false, error: { code: "NOT_FOUND", message: "Document not found" } },
          { status: 404 }
        );
      }

      const draftContent = (doc.meta as any)?.draftContent ?? null;
      if (!draftContent) {
        return NextResponse.json(
          { ok: false, error: { code: "NO_CONTENT", message: "No draft content to publish" } },
          { status: 400 }
        );
      }

      const latest = await prisma.documentVersion.findFirst({
        where: { documentId: doc.id },
        orderBy: { version: "desc" },
      });
      const nextVersion = (latest?.version ?? 0) + 1;

      const version = await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          version: nextVersion,
          content: draftContent,
        },
      });

      const durationMs = Date.now() - startedAt;
      logger.info("Published document", { id: doc.id, version: version.version, durationMs });
      return NextResponse.json({ ok: true, data: { version: version.version, url: `/p/${(doc as any).project.key}/${doc.slug}` }, meta: { durationMs } });
    } catch (typedError: any) {
      logger.warn("Publish typed path failed; falling back to raw", { code: typedError?.code, message: typedError?.message });
      const rows = await prisma.$queryRaw<Array<{ id: string; slug: string; meta: any; projectId: string; projectKey: string }>>`
        SELECT d."id", d."slug", d."meta", d."projectId", p."key" AS "projectKey"
        FROM "Document" d
        JOIN "Project" p ON p."id" = d."projectId"
        WHERE d."id" = ${params.id}
        LIMIT 1
      `;
      const doc = rows[0];
      if (!doc) {
        return NextResponse.json(
          { ok: false, error: { code: "NOT_FOUND", message: "Document not found" } },
          { status: 404 }
        );
      }
      const draftContent = (doc.meta as any)?.draftContent ?? null;
      if (!draftContent) {
        return NextResponse.json(
          { ok: false, error: { code: "NO_CONTENT", message: "No draft content to publish" } },
          { status: 400 }
        );
      }
      const latestRows = await prisma.$queryRaw<Array<{ max: number }>>`
        SELECT COALESCE(MAX("version"), 0)::int AS max FROM "DocumentVersion" WHERE "documentId" = ${params.id}
      `;
      const nextVersion = (latestRows[0]?.max ?? 0) + 1;
      const id = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "DocumentVersion" ("id","documentId","version","content","createdAt")
        VALUES (${id}, ${params.id}, ${nextVersion}, ${draftContent as any}, NOW())
      `;
      const durationMs = Date.now() - startedAt;
      logger.info("Published document (raw)", { id: params.id, version: nextVersion, durationMs });
      return NextResponse.json({ ok: true, data: { version: nextVersion, url: `/p/${doc.projectKey}/${doc.slug}` }, meta: { durationMs } });
    }
  } catch (error: any) {
    const durationMs = Date.now() - startedAt;
    logger.error("POST /api/documents/[id]/publish error", { error, durationMs });
    const payload: any = { ok: false, error: { code: "PUBLISH_FAILED", message: "Failed to publish" }, meta: { durationMs } };
    if (process.env.NODE_ENV !== "production") {
      payload.error.details = { code: error?.code, message: error?.message, meta: error?.meta };
    }
    return NextResponse.json(payload, { status: 500 });
  }
}
