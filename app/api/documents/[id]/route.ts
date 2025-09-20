import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import logger from "@/lib/logger";

const UpdateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  meta: z.any().optional(),
  content: z.any().optional(), // tiptap json for draft save
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: params.id },
      include: { versions: { orderBy: { version: "desc" }, take: 5 } },
    });
    if (!doc) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, data: doc });
  } catch (error) {
    logger.error("GET /api/documents/[id] error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to read document" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = UpdateDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() },
        },
        { status: 422 }
      );
    }

    const { title, meta, content } = parsed.data;

    const updated = await prisma.document.update({
      where: { id: params.id },
      data: { title, meta },
    });

    if (content !== undefined) {
      await prisma.document.update({
        where: { id: params.id },
        data: { meta: { ...(updated.meta as any), draftContent: content } as any },
      });
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    logger.error("PATCH /api/documents/[id] error", error);
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_FAILED", message: "Failed to update document" } },
      { status: 500 }
    );
  }
}
