import { NextResponse } from "next/server";
import { buildDocsIndex } from "../../../../lib/docs/indexer";

export async function POST() {
  try {
    const index = await buildDocsIndex(process.cwd());
    return NextResponse.json({ ok: true, data: index });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("/api/docs/reindex POST error", error);
    return NextResponse.json({ ok: false, error: { message: error?.message ?? "Failed to reindex docs" } }, { status: 500 });
  }
}

