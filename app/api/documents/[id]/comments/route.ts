import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import logger from "@/lib/logger";
import crypto from "node:crypto";

const CreateCommentSchema = z.object({
  content: z.string().min(1),
  from: z.number().int().min(0),
  to: z.number().int().min(0),
  authorName: z.string().optional().default("Anonymous"),
  authorEmail: z.string().email().optional(),
  parentId: z.string().uuid().optional(),
});

const UpdateCommentSchema = z.object({
  content: z.string().min(1).optional(),
  resolved: z.boolean().optional(),
});

/**
 * GET /api/documents/[id]/comments
 * Get all comments for a document
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.$queryRaw<Array<{
      id: string;
      documentId: string;
      versionId: string | null;
      authorId: string | null;
      authorName: string;
      authorEmail: string | null;
      content: string;
      resolved: boolean;
      from: number;
      to: number;
      parentId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM "Comment"
      WHERE "documentId" = ${params.id}
      ORDER BY "createdAt" ASC
    `;

    // Organize into tree structure
    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    // First pass: create comment objects
    for (const comment of comments) {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
      });
    }

    // Second pass: build tree
    for (const comment of comments) {
      const commentObj = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentObj);
        } else {
          rootComments.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    }

    return NextResponse.json({ ok: true, data: rootComments });
  } catch (error) {
    logger.error("GET /api/documents/[id]/comments error", error);
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_FAILED", message: "Failed to fetch comments" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/[id]/comments
 * Create a new comment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = CreateCommentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() },
        },
        { status: 422 }
      );
    }

    // Verify document exists
    const doc = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "Document" WHERE "id" = ${params.id} LIMIT 1
    `;
    
    if (doc.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    const { content, from, to, authorName, authorEmail, parentId } = parsed.data;

    // If parentId provided, verify it exists
    if (parentId) {
      const parent = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Comment" WHERE "id" = ${parentId} AND "documentId" = ${params.id} LIMIT 1
      `;
      if (parent.length === 0) {
        return NextResponse.json(
          { ok: false, error: { code: "INVALID_PARENT", message: "Parent comment not found" } },
          { status: 404 }
        );
      }
    }

    const id = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "Comment" (
        "id", "documentId", "authorName", "authorEmail", "content", 
        "from", "to", "parentId", "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${params.id}, ${authorName}, ${authorEmail ?? null}, ${content},
        ${from}, ${to}, ${parentId ?? null}, NOW(), NOW()
      )
    `;

    const newComment = await prisma.$queryRaw<Array<{
      id: string;
      documentId: string;
      authorName: string;
      authorEmail: string | null;
      content: string;
      resolved: boolean;
      from: number;
      to: number;
      parentId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM "Comment" WHERE "id" = ${id} LIMIT 1
    `;

    logger.info("Created comment", { id, documentId: params.id });
    return NextResponse.json({ ok: true, data: newComment[0] });
  } catch (error) {
    logger.error("POST /api/documents/[id]/comments error", error);
    return NextResponse.json(
      { ok: false, error: { code: "CREATE_FAILED", message: "Failed to create comment" } },
      { status: 500 }
    );
  }
}
