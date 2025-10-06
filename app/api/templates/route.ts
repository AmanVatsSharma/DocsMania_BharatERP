import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Templates API
 * CRUD operations for document templates
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePrivate = searchParams.get("includePrivate") === "true";
    
    const where = includePrivate ? {} : { isPublic: true };
    
    const templates = await (prisma as any).template.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, data: templates });
  } catch (error: any) {
    console.error("[Templates] GET error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, tags, thumbnail, content, isPublic } = body;

    // Validate required fields
    if (!name || !description || !content) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Validate content is valid Tiptap JSON
    try {
      const parsed = typeof content === "string" ? JSON.parse(content) : content;
      if (!parsed.type || parsed.type !== "doc") {
        throw new Error("Invalid document structure");
      }
    } catch (error: any) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_CONTENT", message: "Content must be valid Tiptap JSON" } },
        { status: 400 }
      );
    }

    const template = await (prisma as any).template.create({
      data: {
        name,
        description,
        category: category || "Custom",
        tags: JSON.stringify(tags || []),
        thumbnail: thumbnail || null,
        content: typeof content === "string" ? content : JSON.stringify(content),
        isPublic: isPublic ?? false,
      },
    });

    return NextResponse.json({ ok: true, data: template });
  } catch (error: any) {
    console.error("[Templates] POST error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
