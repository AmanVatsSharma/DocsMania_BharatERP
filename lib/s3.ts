/**
 * AWS S3 Integration for DocsMania
 * Handles image uploads, deletions, and lifecycle management
 */

export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  try {
    const config = getS3Config();
    
    // Use AWS SDK v3 if available, otherwise fallback to local storage
    if (!config.accessKeyId || !config.bucket) {
      console.warn('[S3] AWS credentials not configured, using local storage');
      return uploadToLocal(file, filename);
    }

    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const key = `uploads/${Date.now()}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await client.send(command);

    const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
    
    console.info('[S3] Upload successful', { key, url });
    
    return { url, key, bucket: config.bucket };
  } catch (error) {
    console.error('[S3] Upload failed, falling back to local storage', error);
    return uploadToLocal(file, filename);
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const config = getS3Config();
    
    if (!config.accessKeyId || !config.bucket) {
      console.warn('[S3] AWS credentials not configured, skipping S3 deletion');
      return deleteFromLocal(key);
    }

    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    await client.send(command);
    
    console.info('[S3] Deletion successful', { key });
    return true;
  } catch (error) {
    console.error('[S3] Deletion failed', error);
    return false;
  }
}

/**
 * Delete multiple files from S3
 */
export async function deleteMultipleFromS3(keys: string[]): Promise<number> {
  try {
    const config = getS3Config();
    
    if (!config.accessKeyId || !config.bucket) {
      console.warn('[S3] AWS credentials not configured');
      return 0;
    }

    const { S3Client, DeleteObjectsCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const command = new DeleteObjectsCommand({
      Bucket: config.bucket,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
      },
    });

    const result = await client.send(command);
    const deletedCount = result.Deleted?.length || 0;
    
    console.info('[S3] Bulk deletion successful', { deletedCount });
    return deletedCount;
  } catch (error) {
    console.error('[S3] Bulk deletion failed', error);
    return 0;
  }
}

/**
 * Extract image keys from document content
 */
export function extractImageKeysFromContent(content: any): string[] {
  const keys: string[] = [];
  
  function traverse(node: any) {
    if (!node) return;
    
    // Check if it's an image node
    if (node.type === 'image' && node.attrs?.src) {
      const src = node.attrs.src;
      // Extract S3 key from URL
      if (src.includes('.s3.') || src.includes('/uploads/')) {
        const key = extractS3KeyFromUrl(src);
        if (key) keys.push(key);
      }
    }
    
    // Traverse sections and their props
    if (node.type === 'section' && node.attrs?.props) {
      const props = node.attrs.props;
      findImagesInObject(props, keys);
    }
    
    // Traverse children
    if (Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }
  
  traverse(content);
  return [...new Set(keys)]; // Remove duplicates
}

/**
 * Find images in nested objects (for component props)
 */
function findImagesInObject(obj: any, keys: string[]) {
  if (!obj || typeof obj !== 'object') return;
  
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      if (value.includes('.s3.') || value.includes('/uploads/')) {
        const key = extractS3KeyFromUrl(value);
        if (key) keys.push(key);
      }
    } else if (typeof value === 'object') {
      findImagesInObject(value, keys);
    }
  }
}

/**
 * Extract S3 key from URL
 */
function extractS3KeyFromUrl(url: string): string | null {
  try {
    // Match S3 URL pattern
    const s3Match = url.match(/\.s3\.[^/]+\.amazonaws\.com\/(.+)$/);
    if (s3Match) return s3Match[1];
    
    // Match local uploads pattern
    const localMatch = url.match(/\/uploads\/(.+)$/);
    if (localMatch) return `uploads/${localMatch[1]}`;
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get S3 configuration from environment
 */
function getS3Config(): S3Config {
  return {
    region: process.env.AWS_REGION || process.env.AWS_S3_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };
}

/**
 * Fallback: Upload to local storage
 */
async function uploadToLocal(file: Buffer, filename: string): Promise<UploadResult> {
  const { promises: fs } = await import('fs');
  const path = await import('path');
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  
  const key = `uploads/${Date.now()}-${filename}`;
  const filepath = path.join(process.cwd(), 'public', key);
  
  await fs.writeFile(filepath, file);
  
  return {
    url: `/${key}`,
    key,
    bucket: 'local',
  };
}

/**
 * Fallback: Delete from local storage
 */
async function deleteFromLocal(key: string): Promise<boolean> {
  try {
    const { promises: fs } = await import('fs');
    const path = await import('path');
    
    const filepath = path.join(process.cwd(), 'public', key);
    await fs.unlink(filepath);
    
    console.info('[Local] Deletion successful', { key });
    return true;
  } catch (error) {
    console.error('[Local] Deletion failed', error);
    return false;
  }
}