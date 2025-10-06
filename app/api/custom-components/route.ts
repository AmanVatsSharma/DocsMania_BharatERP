import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Custom Components API
 * CRUD operations for user-created React components
 */

export async function GET(request: NextRequest) {
  try {
    // In production, filter by user/team
    // const session = await getSession(request);
    
    const components = await (prisma as any).customComponent.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, data: components });
  } catch (error: any) {
    console.error("[CustomComponents] GET error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, name, description, category, tags, code, schema, defaultConfig } = body;

    // Validate required fields
    if (!key || !name || !code) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Check for duplicate key
    const existing = await (prisma as any).customComponent.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: { code: "DUPLICATE_KEY", message: "Component with this key already exists" } },
        { status: 409 }
      );
    }

    // Validate code (basic check)
    if (!code.includes("export default")) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_CODE", message: "Code must export a default component" } },
        { status: 400 }
      );
    }

    const component = await (prisma as any).customComponent.create({
      data: {
        key,
        name,
        description: description || "",
        category: category || "Custom",
        tags: JSON.stringify(tags || []),
        code,
        schema: JSON.stringify(schema || {}),
        defaultConfig: JSON.stringify(defaultConfig || {}),
      },
    });

    return NextResponse.json({ ok: true, data: component });
  } catch (error: any) {
    console.error("[CustomComponents] POST error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
