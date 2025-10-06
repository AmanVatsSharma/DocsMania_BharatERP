import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const component = await (prisma as any).customComponent.findUnique({
      where: { id: params.id },
    });

    if (!component) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Component not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: component });
  } catch (error: any) {
    console.error("[CustomComponent] GET error", error);
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
    const { key, name, description, category, tags, code, schema, defaultConfig } = body;

    // Check if component exists
    const existing = await (prisma as any).customComponent.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Component not found" } },
        { status: 404 }
      );
    }

    // If key is changing, check for duplicates
    if (key !== existing.key) {
      const duplicate = await (prisma as any).customComponent.findUnique({
        where: { key },
      });

      if (duplicate) {
        return NextResponse.json(
          { ok: false, error: { code: "DUPLICATE_KEY", message: "Component with this key already exists" } },
          { status: 409 }
        );
      }
    }

    const component = await (prisma as any).customComponent.update({
      where: { id: params.id },
      data: {
        key,
        name,
        description: description || "",
        category: category || "Custom",
        tags: JSON.stringify(tags || []),
        code,
        schema: JSON.stringify(schema || {}),
        defaultConfig: JSON.stringify(defaultConfig || {}),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, data: component });
  } catch (error: any) {
    console.error("[CustomComponent] PUT error", error);
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
    await (prisma as any).customComponent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[CustomComponent] DELETE error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
