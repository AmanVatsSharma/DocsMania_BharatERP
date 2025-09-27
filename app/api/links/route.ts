import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import logger from "@/lib/logger";

const CreateLinkSchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  type: z.string().min(1).default("related"),
  notes: z.string().max(1024).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const projectKey = req.nextUrl.searchParams.get("projectKey");
    const docId = req.nextUrl.searchParams.get("docId");
    const where: any = {};
    if (projectKey) {
      // Only links where both endpoints are in this project
      where.AND = [
        { source: { project: { key: projectKey } } },
        { target: { project: { key: projectKey } } },
      ];
    }
    if (docId) {
      where.OR = [{ sourceId: docId }, { targetId: docId }];
    }
    const links = await (prisma as any).docLink.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        source: { select: { id: true, title: true, slug: true, project: { select: { key: true, name: true } } } },
        target: { select: { id: true, title: true, slug: true, project: { select: { key: true, name: true } } } },
      },
    });
    return NextResponse.json({ ok: true, data: links });
  } catch (error) {
    logger.error("GET /api/links error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to list links" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() } },
        { status: 422 }
      );
    }
    const { sourceId, targetId, type, notes } = parsed.data;
    if (sourceId === targetId) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_LINK", message: "Cannot link a document to itself" } },
        { status: 400 }
      );
    }
    const [source, target] = await Promise.all([
      (prisma as any).document.findUnique({ where: { id: sourceId }, include: { project: true } }),
      (prisma as any).document.findUnique({ where: { id: targetId }, include: { project: true } }),
    ]);
    if (!source || !target) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Source or target not found" } },
        { status: 404 }
      );
    }
    if (source.projectId !== target.projectId) {
      return NextResponse.json(
        { ok: false, error: { code: "CROSS_PROJECT", message: "Links must be within the same project" } },
        { status: 400 }
      );
    }
    const created = await (prisma as any).docLink.create({
      data: { sourceId, targetId, type, notes },
      include: {
        source: { select: { id: true, title: true, slug: true, project: { select: { key: true, name: true } } } },
        target: { select: { id: true, title: true, slug: true, project: { select: { key: true, name: true } } } },
      },
    });
    logger.info("Created link", { id: created.id, type });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    logger.error("POST /api/links error", error);
    return NextResponse.json(
      { ok: false, error: { code: "CREATE_FAILED", message: "Failed to create link" } },
      { status: 500 }
    );
  }
}



