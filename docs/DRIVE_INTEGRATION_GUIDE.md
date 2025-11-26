# AWS S3 Drive Integration Guide

This guide explains how to integrate DocsMania editor with your existing AWS S3-driven Next.js drive.

## Overview

DocsMania now supports:
1. **Importing external documents** (DOCX, PDF, HTML, Markdown, TXT)
2. **Browsing files from AWS S3** drive
3. **Opening files directly** in the editor from your drive

## Setup

### 1. Install Required Dependencies

For full document conversion support, install these optional packages:

```bash
# For DOCX conversion
npm install mammoth

# For PDF conversion
npm install pdf-parse

# AWS SDK (already included if using AWS)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Configure Environment Variables

Add these to your `.env.local` or `.env`:

```env
# AWS S3 Configuration
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Optional: Public bucket name (for client-side access)
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_AWS_REGION=us-east-1
```

**Note:** If running on AWS (EC2, Lambda, etc.), you can use IAM roles instead of access keys.

### 3. Database Migration

No database changes needed for drive integration - files are accessed directly from S3.

## Usage

### Opening Files from Drive

1. **In the Editor:**
   - Click the "More" menu (three dots) → "Open from Drive"
   - Browse your S3 files and folders
   - Click "Open with DocsMania" on any file
   - File is imported and opened in the editor

2. **From Your Existing Drive Interface:**
   - Add an "Open with DocsMania" button/link to your file list
   - Link format: `/editor/new?importFromS3=true&key=path/to/file.docx`
   - Or use the API directly (see below)

### Importing External Documents

1. **In the Editor:**
   - Click "More" menu → "Import Document"
   - Drag & drop or browse for a file
   - Supported formats: DOCX, PDF, HTML, Markdown, TXT
   - File is converted to Tiptap JSON and loaded

2. **Via API:**
   ```bash
   curl -X POST /api/documents/import \
     -F "file=@document.docx" \
     -F "type=docx"
   ```

## API Endpoints

### 1. List Files from S3
```
GET /api/drive/list?path=folder/path
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "files": [
      {
        "key": "folder/document.docx",
        "name": "document.docx",
        "size": 12345,
        "lastModified": "2024-01-01T00:00:00Z",
        "type": "file",
        "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      },
      {
        "key": "folder/subfolder/",
        "name": "subfolder",
        "type": "folder"
      }
    ],
    "path": "folder",
    "bucket": "your-bucket"
  }
}
```

### 2. Import File from S3
```
POST /api/drive/import?key=path/to/file.docx
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "content": { /* Tiptap JSON */ },
    "title": "Document Title",
    "fileName": "document.docx",
    "key": "path/to/file.docx"
  }
}
```

### 3. Import External Document
```
POST /api/documents/import
Content-Type: multipart/form-data

file: [binary]
type: docx
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "content": { /* Tiptap JSON */ },
    "title": "Document Title",
    "fileName": "document.docx"
  }
}
```

## Integration with Your Existing Drive

### Option 1: Add "Open with DocsMania" Button

In your existing file list component:

```tsx
import { useRouter } from 'next/navigation';

function FileListItem({ file }) {
  const router = useRouter();
  
  const handleOpenInDocsMania = async () => {
    // Import file from S3
    const res = await fetch(`/api/drive/import?key=${file.key}`);
    const json = await res.json();
    
    if (json.ok) {
      // Create new document with imported content
      const docRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: json.data.title,
          content: json.data.content,
          projectId: 'your-project-id',
        }),
      });
      
      const docJson = await docRes.json();
      if (docJson.ok) {
        // Navigate to editor
        router.push(`/editor/${docJson.data.id}`);
      }
    }
  };
  
  return (
    <div>
      <span>{file.name}</span>
      <button onClick={handleOpenInDocsMania}>
        Open with DocsMania
      </button>
    </div>
  );
}
```

### Option 2: Direct Link Integration

Add a link that opens the file directly:

```tsx
<Link href={`/editor/new?importKey=${encodeURIComponent(file.key)}`}>
  Open with DocsMania
</Link>
```

Then handle in your editor page:

```tsx
// In app/editor/[id]/page.tsx or app/editor/new/page.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const importKey = params.get('importKey');
  
  if (importKey) {
    // Import and load file
    fetch(`/api/drive/import?key=${importKey}`)
      .then(res => res.json())
      .then(json => {
        if (json.ok && editor) {
          editor.commands.setContent(json.data.content);
          setTitle(json.data.title);
        }
      });
  }
}, []);
```

### Option 3: Embed Drive Browser

Use the DriveBrowser component in your drive interface:

```tsx
import DriveBrowser from '@/app/editor/_components/DriveBrowser';

function MyDrivePage() {
  const [showBrowser, setShowBrowser] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowBrowser(true)}>
        Open in DocsMania Editor
      </button>
      
      <DriveBrowser
        open={showBrowser}
        onOpenChange={setShowBrowser}
        onOpenFile={(file) => {
          // Handle file opening
          router.push(`/editor/new?content=${encodeURIComponent(JSON.stringify(file.content))}`);
        }}
        driveConfig={{
          bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
          region: process.env.NEXT_PUBLIC_AWS_REGION,
        }}
      />
    </>
  );
}
```

## Supported File Formats

| Format | Extension | Conversion Library | Status |
|--------|-----------|-------------------|--------|
| Word Document | .docx | mammoth | ✅ Full support |
| PDF | .pdf | pdf-parse | ✅ Text extraction |
| HTML | .html, .htm | Built-in | ✅ Full support |
| Markdown | .md, .markdown | Built-in | ✅ Full support |
| Plain Text | .txt | Built-in | ✅ Full support |

## File Conversion Details

### DOCX Conversion
- Uses `mammoth` library to convert DOCX to HTML
- HTML is then converted to Tiptap JSON
- Preserves headings, paragraphs, lists, bold, italic
- Tables and images require additional processing

### PDF Conversion
- Uses `pdf-parse` to extract text
- Text is converted to paragraphs
- Formatting is not preserved (text only)

### HTML Conversion
- Parses HTML and converts to Tiptap nodes
- Supports headings, paragraphs, lists, links, formatting
- Complex HTML may need manual cleanup

### Markdown Conversion
- Converts Markdown syntax to Tiptap JSON
- Supports headings, lists, paragraphs, links
- Code blocks and tables require extensions

## Security Considerations

1. **S3 Access:**
   - Use IAM roles when possible (more secure)
   - Limit S3 bucket policies to specific prefixes
   - Use presigned URLs for temporary access

2. **File Size Limits:**
   - Default max: 50MB per file
   - Adjust in `ImportDialog.tsx` if needed

3. **File Type Validation:**
   - Server validates file extensions
   - MIME type checking recommended for production

## Troubleshooting

### "S3 bucket not configured" Error
- Check environment variables are set
- Verify AWS credentials are correct
- Ensure bucket exists and is accessible

### "PDF conversion failed" Error
- Install `pdf-parse`: `npm install pdf-parse`
- Some PDFs may be encrypted or corrupted

### "DOCX conversion failed" Error
- Install `mammoth`: `npm install mammoth`
- Complex DOCX files may need manual cleanup

### Files Not Showing in Drive Browser
- Check S3 bucket permissions
- Verify path prefix is correct
- Check AWS region matches bucket region

## Example: Complete Integration

```tsx
// app/drive/page.tsx - Your existing drive page
'use client';

import { useState } from 'react';
import DriveBrowser from '@/app/editor/_components/DriveBrowser';
import { useRouter } from 'next/navigation';

export default function DrivePage() {
  const [showBrowser, setShowBrowser] = useState(false);
  const router = useRouter();
  
  return (
    <div>
      <h1>My Drive</h1>
      
      {/* Your existing file list */}
      <FileList />
      
      {/* Open Drive Browser */}
      <button onClick={() => setShowBrowser(true)}>
        Browse & Open in DocsMania
      </button>
      
      <DriveBrowser
        open={showBrowser}
        onOpenChange={setShowBrowser}
        onOpenFile={async (file) => {
          // Create new document
          const res = await fetch('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: file.title || file.name,
              content: file.content,
              projectId: 'default-project-id',
            }),
          });
          
          const json = await res.json();
          if (json.ok) {
            router.push(`/editor/${json.data.id}`);
          }
        }}
      />
    </div>
  );
}
```

## Next Steps

1. **Install conversion libraries** (mammoth, pdf-parse)
2. **Configure AWS credentials** in environment variables
3. **Add "Open with DocsMania" buttons** to your drive interface
4. **Test file imports** with various formats
5. **Customize conversion logic** if needed for your use case

---

**Need Help?** Check the API routes in `app/api/drive/` and `app/api/documents/import/` for implementation details.
