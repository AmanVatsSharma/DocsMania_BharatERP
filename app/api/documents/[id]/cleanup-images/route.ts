import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { extractImageKeysFromContent, deleteMultipleFromS3 } from "@/lib/s3";

export const runtime = "nodejs";

/**
 * Clean up unused images from S3
 * Compares images in document meta with images actually used in content
 * Deletes unused images from S3
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const { id } = params;

    // Fetch document
    const doc = await prisma.document.findUnique({
      where: { id },
      select: {
        meta: true,
      },
    });

    if (!doc) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    const meta = (doc.meta || {}) as any;
    const draftContent = meta.draftContent;
    const publishedContent = meta.publishedContent;
    const trackedImages = meta.images || [];

    // Extract image keys from both draft and published content
    const usedKeys = new Set<string>();
    if (draftContent) {
      extractImageKeysFromContent(draftContent).forEach((key) => usedKeys.add(key));
    }
    if (publishedContent) {
      extractImageKeysFromContent(publishedContent).forEach((key) => usedKeys.add(key));
    }

    // Find unused images
    const unusedImages = trackedImages.filter((img: any) => !usedKeys.has(img.key));
    
    if (unusedImages.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          cleaned: 0,
          message: "No unused images found",
        },
      });
    }

    // Delete from S3
    const keysToDelete = unusedImages.map((img: any) => img.key);
    const deletedCount = await deleteMultipleFromS3(keysToDelete);

    // Update document meta to remove deleted images
    const remainingImages = trackedImages.filter((img: any) => usedKeys.has(img.key));
    await prisma.document.update({
      where: { id },
      data: {
        meta: {
          ...meta,
          images: remainingImages,
        },
      },
    });

    console.info(`[Cleanup] Deleted ${deletedCount} unused images from document ${id}`);

    return NextResponse.json({
      ok: true,
      data: {
        cleaned: deletedCount,
        unusedImages: unusedImages.map((img: any) => ({
          key: img.key,
          filename: img.filename,
        })),
      },
    });
  } catch (error) {
    console.error("[Cleanup] Error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "CLEANUP_FAILED", message: "Failed to cleanup images" } },
      { status: 500 }
    );
  }
}