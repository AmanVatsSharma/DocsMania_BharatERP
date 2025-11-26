import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "@/lib/logger";

/**
 * POST /api/drive/import
 * Import a file from S3 and convert to Tiptap JSON
 * Query params:
 *   - key: S3 object key
 *   - bucket: S3 bucket name (optional)
 */

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const key = searchParams.get("key");
    const bucket = searchParams.get("bucket") || process.env.AWS_S3_BUCKET;

    if (!key) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NO_KEY", message: "S3 key not provided" },
        },
        { status: 400 }
      );
    }

    if (!bucket) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NO_BUCKET",
            message: "S3 bucket not configured",
          },
        },
        { status: 400 }
      );
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
          }
        : undefined,
    });

    // Get object from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    const buffer = await streamToBuffer(response.Body as any);
    const fileName = key.split("/").pop() || "document";
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    logger.info("Importing file from S3", { key, fileName, ext, size: buffer.length });

    // Convert to Tiptap JSON (reuse import logic)
    // Import the conversion functions from the import route
    let content: any;
    let title = fileName.replace(/\.[^/.]+$/, "");

    switch (ext) {
      case "docx": {
        try {
          const mammoth = await import("mammoth").catch(() => null);
          if (mammoth) {
            const result = await mammoth.default.convertToHtml({
              arrayBuffer: buffer.buffer,
            });
            content = htmlToTiptap(result.value);
          } else {
            content = textToTiptap("DOCX conversion requires mammoth library");
          }
        } catch (error: any) {
          logger.error("DOCX conversion error", error);
          content = textToTiptap("Failed to convert DOCX");
        }
        break;
      }

      case "pdf": {
        try {
          const pdfParse = await import("pdf-parse").catch(() => null);
          if (pdfParse) {
            const data = await pdfParse.default(buffer);
            content = textToTiptap(data.text);
          } else {
            throw new Error("PDF parsing library not available");
          }
        } catch (error: any) {
          logger.error("PDF conversion error", error);
          return NextResponse.json(
            {
              ok: false,
              error: {
                code: "PDF_CONVERSION_FAILED",
                message: "PDF conversion requires pdf-parse library",
              },
            },
            { status: 400 }
          );
        }
        break;
      }

      case "html":
      case "htm": {
        const html = buffer.toString("utf-8");
        content = htmlToTiptap(html);
        break;
      }

      case "md":
      case "markdown": {
        const markdown = buffer.toString("utf-8");
        content = markdownToTiptap(markdown);
        break;
      }

      case "txt": {
        const text = buffer.toString("utf-8");
        content = textToTiptap(text);
        break;
      }

      default:
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "UNSUPPORTED_FORMAT",
              message: `Unsupported file format: .${ext}`,
            },
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ok: true,
      data: {
        content,
        title,
        fileName,
        key,
      },
    });
  } catch (error: any) {
    logger.error("POST /api/drive/import error", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "IMPORT_FAILED",
          message: error.message || "Failed to import file from S3",
        },
      },
      { status: 500 }
    );
  }
}

// Helper: Convert stream to buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Helper functions (same as import route)
function htmlToTiptap(html: string): any {
  // Simple HTML to Tiptap conversion using regex (server-side compatible)
  const content: any[] = [];
  
  // Extract paragraphs
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gis;
  const matches = html.matchAll(paragraphRegex);
  
  for (const match of matches) {
    const text = match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
    
    if (text) {
      content.push({
        type: "paragraph",
        content: [{ type: "text", text }],
      });
    }
  }
  
  // Extract headings
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gis;
  const headingMatches = html.matchAll(headingRegex);
  
  for (const match of headingMatches) {
    const level = parseInt(match[1]);
    const text = match[2]
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    
    if (text) {
      content.push({
        type: "heading",
        attrs: { level },
        content: [{ type: "text", text }],
      });
    }
  }
  
  // If no structured content found, treat as plain text
  if (content.length === 0) {
    const plainText = html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => ({
        type: "paragraph",
        content: [{ type: "text", text: line.trim() }],
      }));
    
    return {
      type: "doc",
      content: plainText.length > 0 ? plainText : [{ type: "paragraph" }],
    };
  }
  
  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

function markdownToTiptap(markdown: string): any {
  const lines = markdown.split("\n").filter((line) => line.trim());
  const content = lines.map((line) => ({
    type: "paragraph",
    content: [{ type: "text", text: line.trim() }],
  }));

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

function textToTiptap(text: string): any {
  const lines = text.split("\n").filter((line) => line.trim());
  const content = lines.map((line) => ({
    type: "paragraph",
    content: [{ type: "text", text: line.trim() }],
  }));

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}
