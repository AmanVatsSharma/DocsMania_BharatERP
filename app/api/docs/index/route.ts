import { NextResponse } from "next/server";
import { ensureDocsIndex } from "../../../../lib/docs/indexer";

export async function GET() {
  try {
    // Build or return cached index
    const index = await ensureDocsIndex(process.cwd());
    return NextResponse.json({ ok: true, data: index });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("/api/docs/index GET error", error);
    return NextResponse.json({ ok: false, error: { message: error?.message ?? "Failed to load docs index" } }, { status: 500 });
  }
}

