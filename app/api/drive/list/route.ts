import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import logger from "@/lib/logger";

/**
 * GET /api/drive/list
 * List files and folders from AWS S3 bucket
 * Query params:
 *   - path: Folder path prefix (optional)
 *   - bucket: S3 bucket name (optional, uses env var if not provided)
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const path = searchParams.get("path") || "";
    const bucket = searchParams.get("bucket") || process.env.AWS_S3_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NO_BUCKET",
            message: "S3 bucket not configured. Set AWS_S3_BUCKET environment variable.",
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
        : undefined, // Use IAM role if credentials not provided
    });

    // List objects with prefix
    const prefix = path ? (path.endsWith("/") ? path : `${path}/`) : "";
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: "/", // Group by folders
    });

    const response = await s3Client.send(command);

    const files: Array<{
      key: string;
      name: string;
      size?: number;
      lastModified?: Date;
      type: "file" | "folder";
      mimeType?: string;
    }> = [];

    // Add folders (CommonPrefixes)
    if (response.CommonPrefixes) {
      for (const prefix of response.CommonPrefixes) {
        if (prefix.Prefix) {
          const name = prefix.Prefix.replace(prefix, "").replace("/", "");
          files.push({
            key: prefix.Prefix,
            name,
            type: "folder",
          });
        }
      }
    }

    // Add files
    if (response.Contents) {
      for (const object of response.Contents) {
        if (!object.Key) continue;
        
        // Skip if it's a folder marker (ends with /)
        if (object.Key.endsWith("/")) continue;

        // Get file metadata
        let mimeType: string | undefined;
        try {
          const headCommand = new HeadObjectCommand({
            Bucket: bucket,
            Key: object.Key,
          });
          const headResponse = await s3Client.send(headCommand);
          mimeType = headResponse.ContentType;
        } catch (error) {
          // Ignore errors getting metadata
          logger.warn("Failed to get object metadata", { key: object.Key, error });
        }

        const name = object.Key.replace(prefix, "");
        files.push({
          key: object.Key,
          name,
          size: object.Size,
          lastModified: object.LastModified,
          type: "file",
          mimeType,
        });
      }
    }

    // Sort: folders first, then files, both alphabetically
    files.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    logger.info("Listed S3 files", { bucket, path, count: files.length });

    return NextResponse.json({
      ok: true,
      data: {
        files,
        path,
        bucket,
      },
    });
  } catch (error: any) {
    logger.error("GET /api/drive/list error", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "LIST_FAILED",
          message: error.message || "Failed to list files from S3",
        },
      },
      { status: 500 }
    );
  }
}
