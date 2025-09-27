import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";

export async function GET(req: NextRequest) {
  try {
    const file = req.nextUrl.searchParams.get("file");
    if (!file) return NextResponse.json({ ok: false, error: { message: "Missing file" } }, { status: 400 });
    // Very strict allowlist: file must be under docs/ or app/**/docs/
    if (!/\/(docs)\//.test(file)) {
      return NextResponse.json({ ok: false, error: { message: "Forbidden" } }, { status: 403 });
    }
    const text = await fs.readFile(file, "utf8");
    return new NextResponse(text, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("/api/docs/raw GET error", error);
    return NextResponse.json({ ok: false, error: { message: error?.message ?? "Failed to read file" } }, { status: 500 });
  }
}


