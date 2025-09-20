import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import logger from "@/lib/logger";

const CreateDocumentSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  meta: z.any().optional(),
});

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, data: documents });
  } catch (error) {
    logger.error("GET /api/documents error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to list documents" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const { title, slug, meta } = parsed.data;

    const created = await prisma.document.create({
      data: { title, slug, meta },
      select: { id: true, title: true, slug: true },
    });

    logger.info("Created document", { id: created.id, slug });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error: any) {
    logger.error("POST /api/documents error", { error });
    const message = error?.code === "P2002" ? "Slug already exists" : "Failed to create document";
    const status = error?.code === "P2002" ? 409 : 500;
    return NextResponse.json(
      { ok: false, error: { code: "CREATE_FAILED", message } },
      { status }
    );
  }
}
