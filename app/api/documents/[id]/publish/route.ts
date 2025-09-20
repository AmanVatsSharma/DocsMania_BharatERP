import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await prisma.document.findUnique({ where: { id: params.id } });
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

    logger.info("Published document", { id: doc.id, version: version.version });

    return NextResponse.json({ ok: true, data: { version: version.version, url: `/p/${doc.slug}` } });
  } catch (error) {
    logger.error("POST /api/documents/[id]/publish error", error);
    return NextResponse.json(
      { ok: false, error: { code: "PUBLISH_FAILED", message: "Failed to publish" } },
      { status: 500 }
    );
  }
}
