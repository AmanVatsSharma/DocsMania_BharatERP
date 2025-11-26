import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * GET /api/documents/[id]/versions
 * Get all versions for a document
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const versions = await prisma.$queryRaw<Array<{
      id: string;
      documentId: string;
      version: number;
      content: any;
      createdAt: Date;
    }>>`
      SELECT * FROM "DocumentVersion"
      WHERE "documentId" = ${params.id}
      ORDER BY "version" DESC
    `;

    return NextResponse.json({ ok: true, data: versions });
  } catch (error) {
    logger.error("GET /api/documents/[id]/versions error", error);
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_FAILED", message: "Failed to fetch versions" } },
      { status: 500 }
    );
  }
}
