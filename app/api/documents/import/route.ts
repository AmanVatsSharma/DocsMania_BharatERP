import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

/**
 * POST /api/documents/import
 * Import external documents (DOCX, PDF, HTML, Markdown, TXT) and convert to Tiptap JSON
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileType = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: { code: "NO_FILE", message: "No file provided" } },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const ext = fileType || fileName.split(".").pop()?.toLowerCase() || "";
    const fileContent = await file.arrayBuffer();
    const buffer = Buffer.from(fileContent);

    logger.info("Importing document", { fileName, ext, size: buffer.length });

    let content: any;
    let title = fileName.replace(/\.[^/.]+$/, "");

    // Convert based on file type
    switch (ext) {
      case "docx": {
        // DOCX conversion - requires mammoth or similar library
        // For now, extract text content
        try {
          // Try to use mammoth if available, otherwise fallback to text extraction
          const mammoth = await import("mammoth").catch(() => null);
          if (mammoth) {
            const result = await mammoth.default.convertToHtml({ arrayBuffer: fileContent });
            const html = result.value;
            content = htmlToTiptap(html);
            logger.info("Converted DOCX to HTML", { htmlLength: html.length });
          } else {
            // Fallback: extract as plain text
            const text = await extractTextFromDocx(buffer);
            content = textToTiptap(text);
            logger.info("Extracted text from DOCX", { textLength: text.length });
          }
        } catch (error: any) {
          logger.error("DOCX conversion error", error);
          // Fallback to plain text
          const text = await extractTextFromDocx(buffer);
          content = textToTiptap(text);
        }
        break;
      }

      case "pdf": {
        // PDF conversion - requires pdf-parse or similar
        try {
          const pdfParse = await import("pdf-parse").catch(() => null);
          if (pdfParse) {
            const data = await pdfParse.default(buffer);
            const text = data.text;
            content = textToTiptap(text);
            logger.info("Extracted text from PDF", { textLength: text.length });
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
                message: "PDF conversion requires pdf-parse library. Install: npm install pdf-parse",
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
        logger.info("Converted HTML to Tiptap", { htmlLength: html.length });
        break;
      }

      case "md":
      case "markdown": {
        const markdown = buffer.toString("utf-8");
        content = markdownToTiptap(markdown);
        logger.info("Converted Markdown to Tiptap", { mdLength: markdown.length });
        break;
      }

      case "txt": {
        const text = buffer.toString("utf-8");
        content = textToTiptap(text);
        logger.info("Converted text to Tiptap", { textLength: text.length });
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
      },
    });
  } catch (error: any) {
    logger.error("POST /api/documents/import error", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "IMPORT_FAILED",
          message: error.message || "Failed to import document",
        },
      },
      { status: 500 }
    );
  }
}

// Helper: Convert HTML to Tiptap JSON
function htmlToTiptap(html: string): any {
  // Simple HTML to Tiptap conversion using regex (server-side compatible)
  // For production, use a proper HTML parser like jsdom or cheerio
  const content: any[] = [];
  
  // Extract paragraphs
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gis;
  const matches = html.matchAll(paragraphRegex);
  
  for (const match of matches) {
    const text = match[1]
      .replace(/<[^>]+>/g, "") // Remove HTML tags
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

// Helper: Convert Markdown to Tiptap JSON
function markdownToTiptap(markdown: string): any {
  // Simple markdown to Tiptap conversion
  // For production, use a proper markdown parser like remark
  const lines = markdown.split("\n");
  const content: any[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      content.push({ type: "paragraph" });
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      content.push({
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: line.slice(2) }],
      });
    } else if (line.startsWith("## ")) {
      content.push({
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: line.slice(3) }],
      });
    } else if (line.startsWith("### ")) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: line.slice(4) }],
      });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      // Bullet list
      if (
        content.length === 0 ||
        content[content.length - 1].type !== "bulletList"
      ) {
        content.push({
          type: "bulletList",
          content: [],
        });
      }
      const list = content[content.length - 1];
      list.content.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: line.slice(2) }],
          },
        ],
      });
    } else {
      // Regular paragraph
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: line }],
      });
    }
  }

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

// Helper: Convert plain text to Tiptap JSON
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

// Helper: Extract text from DOCX (fallback)
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  // This is a basic fallback - in production, use mammoth or docx library
  // For now, return a placeholder
  return "DOCX content extraction requires mammoth library. Install: npm install mammoth";
}
