import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { uploadToS3 } from "@/lib/s3";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const documentId = form.get("documentId") as string | null;
    
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { ok: false, error: { code: "NO_FILE", message: "No file uploaded" } },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: { code: "FILE_TOO_LARGE", message: "Max size is 10MB" } },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;

    // Upload to S3 (falls back to local if S3 not configured)
    const result = await uploadToS3(buffer, filename, file.type || 'image/jpeg');

    console.info("Uploaded file", { 
      filename, 
      size: file.size, 
      url: result.url, 
      bucket: result.bucket,
      key: result.key,
      documentId 
    });

    // Track image in document if documentId provided
    if (documentId) {
      try {
        const prisma = (await import("@/lib/prisma")).default;
        const doc = await prisma.document.findUnique({
          where: { id: documentId },
          select: { meta: true }
        });
        
        if (doc) {
          const meta = (doc.meta || {}) as any;
          const images = meta.images || [];
          images.push({
            key: result.key,
            url: result.url,
            uploadedAt: new Date().toISOString(),
            filename: file.name,
            size: file.size,
          });
          
          await prisma.document.update({
            where: { id: documentId },
            data: { meta: { ...meta, images } }
          });
        }
      } catch (error) {
        console.error("Failed to track image in document", error);
        // Don't fail the upload if tracking fails
      }
    }

    return NextResponse.json({ 
      ok: true, 
      data: { 
        url: result.url,
        key: result.key,
        bucket: result.bucket
      } 
    });
  } catch (error) {
    console.error("POST /api/upload error", error);
    return NextResponse.json(
      { ok: false, error: { code: "UPLOAD_FAILED", message: "Failed to upload file" } },
      { status: 500 }
    );
  }
}

