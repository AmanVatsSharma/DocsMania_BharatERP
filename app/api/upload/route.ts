import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
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

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || "";
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    console.info("Uploaded file", { filename, size: file.size, url });
    return NextResponse.json({ ok: true, data: { url } });
  } catch (error) {
    console.error("POST /api/upload error", error);
    return NextResponse.json(
      { ok: false, error: { code: "UPLOAD_FAILED", message: "Failed to upload file" } },
      { status: 500 }
    );
  }
}

