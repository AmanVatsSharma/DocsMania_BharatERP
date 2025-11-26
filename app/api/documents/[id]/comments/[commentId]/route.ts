import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import logger from "@/lib/logger";

const UpdateCommentSchema = z.object({
  content: z.string().min(1).optional(),
  resolved: z.boolean().optional(),
});

/**
 * PATCH /api/documents/[id]/comments/[commentId]
 * Update a comment
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const body = await req.json();
    const parsed = UpdateCommentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() },
        },
        { status: 422 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (parsed.data.content !== undefined) {
      updates.push(`"content" = $${paramIndex}`);
      values.push(parsed.data.content);
      paramIndex++;
    }

    if (parsed.data.resolved !== undefined) {
      updates.push(`"resolved" = $${paramIndex}`);
      values.push(parsed.data.resolved);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: "NO_UPDATES", message: "No fields to update" } },
        { status: 400 }
      );
    }

    updates.push(`"updatedAt" = NOW()`);
    values.push(params.commentId, params.id);

    await prisma.$executeRawUnsafe(
      `UPDATE "Comment" SET ${updates.join(", ")} WHERE "id" = $${paramIndex} AND "documentId" = $${paramIndex + 1}`,
      ...values
    );

    const updated = await prisma.$queryRaw<Array<{
      id: string;
      documentId: string;
      authorName: string;
      content: string;
      resolved: boolean;
      from: number;
      to: number;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM "Comment" WHERE "id" = ${params.commentId} LIMIT 1
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Comment not found" } },
        { status: 404 }
      );
    }

    logger.info("Updated comment", { id: params.commentId });
    return NextResponse.json({ ok: true, data: updated[0] });
  } catch (error) {
    logger.error("PATCH /api/documents/[id]/comments/[commentId] error", error);
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_FAILED", message: "Failed to update comment" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]/comments/[commentId]
 * Delete a comment
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    await prisma.$executeRaw`
      DELETE FROM "Comment" WHERE "id" = ${params.commentId} AND "documentId" = ${params.id}
    `;

    logger.info("Deleted comment", { id: params.commentId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("DELETE /api/documents/[id]/comments/[commentId] error", error);
    return NextResponse.json(
      { ok: false, error: { code: "DELETE_FAILED", message: "Failed to delete comment" } },
      { status: 500 }
    );
  }
}
