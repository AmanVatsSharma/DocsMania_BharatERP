import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Single Template API
 * GET, PUT, DELETE operations
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await (prisma as any).template.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Template not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: template });
  } catch (error: any) {
    console.error("[Templates] GET error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, category, tags, thumbnail, content, isPublic } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (tags) updateData.tags = JSON.stringify(tags);
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (content) {
      updateData.content = typeof content === "string" ? content : JSON.stringify(content);
    }
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const template = await (prisma as any).template.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, data: template });
  } catch (error: any) {
    console.error("[Templates] PUT error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await (prisma as any).template.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Templates] DELETE error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
