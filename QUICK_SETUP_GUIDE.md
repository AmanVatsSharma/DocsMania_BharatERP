# Quick Setup Guide - New Features

## 🚀 Getting Started

All features have been implemented! Follow these steps to start using them.

## 1. Install Dependencies (Optional for S3)

If you want AWS S3 support for images, install the AWS SDK:

```bash
npm install @aws-sdk/client-s3
```

Without this, images will be stored locally in `public/uploads/` which works perfectly fine for development and small deployments.

## 2. Environment Variables (Optional)

For AWS S3 support, create or update your `.env.local` file:

```env
# AWS S3 Configuration (optional)
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

If not set, the system automatically uses local storage.

## 3. Seed Default Templates

Run the template seeding script to add beautiful default templates:

```bash
npm run seed:templates
```

This adds 6 professional templates:
- Product Launch Page
- Documentation Template
- Pricing Page
- Team Page
- Blog Post Template
- FAQ Page

## 4. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and open the editor.

## 📸 Using the New Image Features

### Upload Images
1. Click the image button in the toolbar
2. Select an image (max 10MB)
3. Image is automatically uploaded to S3 (or local storage)

### Resize & Position Images
1. Click an image to select it
2. Drag the corner handles to resize
3. Use the Inspector panel on the right for:
   - Manual width/height input
   - Alignment (left/center/right)
   - Object fit options
   - Alt text and title

### Cleanup Unused Images
Images are automatically tracked. To remove unused images from S3:

```bash
# Via API (for a specific document)
POST /api/documents/{documentId}/cleanup-images
```

## 🏛️ Using Multi-Column Layouts

### Create Columns
1. Open the editor
2. Click the component library (left sidebar)
3. Find "Column Layout" under Layout category
4. Drag or click to insert

### Adjust Column Widths
1. Select the column component
2. In the right Inspector panel, find "Column Widths"
3. Enter values like:
   - `50%,50%` - Equal columns
   - `30%,70%` - Sidebar layout
   - `1fr,2fr` - Proportional
   - `250px,1fr` - Fixed + flexible

### Add Content to Columns
Each column is a container where you can:
- Add text
- Drop components
- Insert images
- Add nested sections

## 📊 Using Table Features

Tables already have full Inspector integration:

### Insert a Table
1. Use toolbar → Insert Table
2. Choose rows and columns (e.g., 3x3)

### Modify Tables
1. Click inside any table cell
2. The Inspector panel (right) automatically shows table controls:
   - Cell styling (colors, padding, alignment)
   - Row/column operations (add, delete, merge)
   - Table properties (width, borders, caption)
   - CSV import/export
   - Sort, fill, format operations

### Advanced Features
- **Resize rows**: Drag the bottom border of any row
- **Sticky headers**: Toggle in Inspector
- **Freeze columns**: Set number of frozen columns
- **Zebra striping**: Toggle for alternating row colors

## 🎨 Using Templates

### Access Templates
1. In the editor, click the Templates button (top bar)
2. Browse available templates
3. Preview a template
4. Click "Apply" to use it

### Customize Templates
After applying a template:
1. Click any component to select it
2. Use the Inspector panel to modify properties
3. Change colors, text, images, etc.
4. Save your document

## 🛠️ Creating Custom Components

### Open Component Builder
1. Click the "Custom Components" button in top bar
2. Click "Create New Component"

### Write Component Code
```javascript
export default function CustomComponent({ props }) {
  const { title = "Hello", subtitle = "" } = props || {};
  
  return (
    <div style={{
      padding: "48px",
      backgroundColor: "#f8fafc",
      textAlign: "center",
      borderRadius: "12px"
    }}>
      <h2 style={{ fontSize: "32px", fontWeight: "bold" }}>
        {title}
      </h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
```

### Define Props Schema
```json
{
  "title": {
    "type": "string",
    "label": "Title",
    "default": "Hello"
  },
  "subtitle": {
    "type": "string",
    "label": "Subtitle",
    "default": ""
  }
}
```

### Test & Save
1. Switch to "Preview" tab
2. Adjust test props
3. Click "Refresh Preview"
4. If it works, click "Create Component"
5. Your component is now in the library!

## 🔍 Troubleshooting

### Images not uploading
- Check file size (max 10MB)
- If using S3, verify AWS credentials
- Check browser console for errors
- Try without S3 (it will use local storage)

### Column widths not working
- Ensure values are comma-separated
- Use valid units: `%`, `px`, `fr`
- Example: `30%,70%` not `30%, 70%` (no spaces after comma)

### Table controls not showing
- Click inside a table cell
- Right panel should automatically show table controls
- If not, try selecting the table and pressing Tab

### Custom component errors
- Check browser console for compilation errors
- Ensure code has `export default function`
- Use React.createElement for complex JSX
- Test in Preview tab before saving
- Use inline styles (not external CSS)

### Templates not showing
- Run `npm run seed:templates`
- Check database connection
- Look for console errors
- Restart dev server

## 📝 Best Practices

### Images
- Use descriptive alt text for accessibility
- Compress images before upload (recommended)
- Set appropriate dimensions
- Use center alignment for hero images
- Use left/right for inline images

### Columns
- Use 2 columns for text-heavy layouts
- Use 3 columns for feature grids
- Use 4 columns for icon/stat displays
- Set proper gap (24px is good default)
- Use fixed width for sidebars, flexible for content

### Tables
- Add captions for accessibility
- Use header row for data tables
- Enable sticky headers for long tables
- Use zebra striping for readability
- Export important data to CSV for backups

### Custom Components
- Keep components simple and focused
- Use clear, descriptive names
- Document expected props
- Test thoroughly in preview
- Handle missing props gracefully
- Avoid complex logic (keep it presentational)

## 🎯 Quick Wins

### Create a Landing Page in 5 Minutes
1. Run `npm run seed:templates`
2. Apply "Product Launch Page" template
3. Customize hero text in Inspector
4. Replace placeholder images
5. Update feature list
6. Publish!

### Create a Documentation Site
1. Apply "Documentation Template"
2. Use 2-column layout (250px,1fr)
3. Add table of contents in left column
4. Add content in right column
5. Use code blocks for examples

### Build a Pricing Page
1. Apply "Pricing Page" template
2. Modify pricing cards in Inspector
3. Adjust column widths for emphasis
4. Add feature comparison table below
5. Add callout for special offers

## 🚨 Important Notes

### S3 Configuration
- S3 is **optional** - local storage works great
- Set environment variables **before** starting server
- Use IAM user with S3 permissions only
- Consider using S3 bucket policies for security

### Custom Components
- JSX support is basic (use inline styles)
- No external imports allowed (security)
- Components run in isolated scope
- Can't access global variables
- Performance impact with many components

### Column Layouts
- Widths set at component level
- Mobile responsiveness needs custom handling
- Nested sections work but may affect performance
- Use sparingly for best results

## 📚 Next Steps

1. **Try the templates** - See what's possible
2. **Experiment with columns** - Different width combinations
3. **Create a custom component** - Start simple
4. **Import data** - Try CSV import in tables
5. **Customize everything** - Use Inspector panel extensively

## 💡 Pro Tips

- **Keyboard shortcuts**: Cmd/Ctrl+S to save, Cmd/Ctrl+K for command palette
- **Duplicate components**: Select and click "Duplicate" in Inspector
- **Reset to defaults**: Use "Reset" button in Inspector
- **Quick alignment**: Select image, use alignment buttons
- **Fast column setup**: Use presets like `1fr,1fr,1fr` for equal columns
- **Table navigation**: Use Tab to move between cells
- **Component search**: Use search in component library

## 🆘 Need Help?

Check these files for more details:
- `FEATURES_ADDED.md` - Comprehensive feature documentation
- Browser console - Detailed error messages
- Inspector panel - Context-sensitive controls
- Component examples - In template code

---

## Summary Checklist

- [ ] Installed AWS SDK (if using S3)
- [ ] Set environment variables (if using S3)
- [ ] Ran template seeding script
- [ ] Started dev server
- [ ] Tried uploading an image
- [ ] Created a multi-column layout
- [ ] Inserted and modified a table
- [ ] Applied a template
- [ ] Created a custom component

Once you've completed these, you're ready to build amazing documents with DocsMania! 🎉