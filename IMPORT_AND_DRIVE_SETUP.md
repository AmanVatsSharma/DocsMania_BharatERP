# 📥 Import & Drive Integration - Quick Setup Guide

## ✅ What's Been Implemented

### 1. **Document Import Feature**
- ✅ Import DOCX, PDF, HTML, Markdown, TXT files
- ✅ Convert to Tiptap JSON format
- ✅ Drag & drop support
- ✅ File size validation (50MB max)

### 2. **AWS S3 Drive Integration**
- ✅ Browse files and folders from S3
- ✅ Search files
- ✅ Navigate folders
- ✅ Open files directly in editor
- ✅ "Open with DocsMania" functionality

## 🚀 Quick Setup

### Step 1: Install Optional Dependencies

For full document conversion support:

```bash
# DOCX conversion (recommended)
npm install mammoth

# PDF conversion (recommended)
npm install pdf-parse

# AWS SDK (if not already installed)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Step 2: Configure AWS S3

Add to your `.env.local`:

```env
# AWS S3 Configuration
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Optional: For client-side access
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_AWS_REGION=us-east-1
```

**Note:** If running on AWS infrastructure, you can use IAM roles instead of access keys.

### Step 3: Test the Features

1. **Import a Document:**
   - Open any document in the editor
   - Click "More" menu → "Import Document"
   - Drag & drop or browse for a file
   - File is converted and loaded

2. **Open from Drive:**
   - Click "More" menu → "Open from Drive"
   - Browse your S3 files
   - Click "Open with DocsMania" on any file
   - File opens in the editor

## 🔗 Integrating with Your Existing Drive

### Option 1: Add "Open with DocsMania" Button

In your existing file list component:

```tsx
async function handleOpenInDocsMania(fileKey: string) {
  // Import file from S3
  const res = await fetch(`/api/drive/import?key=${fileKey}`);
  const json = await res.json();
  
  if (json.ok) {
    // Create new document
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
      window.location.href = `/editor/${docJson.data.id}`;
    }
  }
}

// In your file list:
<button onClick={() => handleOpenInDocsMania(file.key)}>
  Open with DocsMania
</button>
```

### Option 2: Direct Link

Add a link that opens files directly:

```tsx
<Link href={`/editor/new?importKey=${encodeURIComponent(file.key)}`}>
  Open with DocsMania
</Link>
```

Then handle in your editor page (see full guide below).

## 📋 API Endpoints

### List Files from S3
```
GET /api/drive/list?path=folder/path
```

### Import File from S3
```
POST /api/drive/import?key=path/to/file.docx
```

### Import External Document
```
POST /api/documents/import
Content-Type: multipart/form-data
file: [binary]
type: docx
```

## 📚 Full Documentation

See `docs/DRIVE_INTEGRATION_GUIDE.md` for:
- Complete integration examples
- Security considerations
- Troubleshooting
- Advanced configuration

## 🎯 Supported Formats

| Format | Extension | Status | Library Required |
|--------|-----------|--------|------------------|
| Word Document | .docx | ✅ | mammoth |
| PDF | .pdf | ✅ | pdf-parse |
| HTML | .html, .htm | ✅ | Built-in |
| Markdown | .md | ✅ | Built-in |
| Plain Text | .txt | ✅ | Built-in |

## ⚠️ Important Notes

1. **DOCX & PDF conversion** require optional libraries (`mammoth`, `pdf-parse`)
2. **Without libraries**, DOCX/PDF will show error messages
3. **HTML/Markdown/TXT** work without any additional dependencies
4. **S3 access** requires proper AWS credentials or IAM roles

## 🐛 Troubleshooting

**"S3 bucket not configured"**
- Check environment variables are set correctly
- Verify AWS credentials have S3 access

**"PDF conversion failed"**
- Install: `npm install pdf-parse`
- Some PDFs may be encrypted

**"DOCX conversion failed"**
- Install: `npm install mammoth`
- Complex DOCX files may need cleanup

**Files not showing in Drive Browser**
- Check S3 bucket permissions
- Verify path prefix is correct
- Check AWS region matches bucket region

---

**Ready to use!** All features are integrated and ready for testing.
