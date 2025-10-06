# Testing Guide: Enhanced Document Editor

## 🧪 Test Checklist

### 1. Component Rendering Tests

#### In Editor (Live Preview)
- [ ] Open an existing document in `/editor/:id`
- [ ] Add each block type via slash menu (`/`) or drag & drop:
  - [ ] Hero Section - should show title, subtitle, CTA button
  - [ ] Columns - should show grid layout
  - [ ] Callout - should show colored box with icon
  - [ ] Feature List - should show bullet points
  - [ ] Quote - should show blockquote with author
  - [ ] Stats Grid - should show metrics in grid
  - [ ] Accordion - should show collapsible sections
  - [ ] Tabs - should show tabbed interface
  - [ ] Button - should show styled button
  - [ ] Image Block - should show placeholder or uploaded image
  - [ ] Gallery - should show image grid
  - [ ] Video - should show YouTube/Vimeo embed
  - [ ] Table Block - should show styled data table
  - [ ] Code - should show code with syntax highlighting
  - [ ] Chart - should show chart visualization
  - [ ] Timeline - should show event timeline
  - [ ] Card - should show content card
  - [ ] Divider - should show horizontal line
  - [ ] Spacer - should show vertical space
  - [ ] Alert - should show banner with color
  - [ ] Pricing - should show pricing card

#### In Published Page
- [ ] Publish the document (`Cmd+Shift+P` or Publish button)
- [ ] Navigate to the published page `/p/:projectKey/:slug`
- [ ] Verify all blocks render correctly with same styling
- [ ] Check that all text formatting is preserved
- [ ] Verify images load correctly
- [ ] Check that links work

### 2. Text Formatting Tests

#### Via Context Menu (Right-Click)
- [ ] Select text and right-click
- [ ] Verify context menu opens with all options
- [ ] Test **Bold** (`Cmd+B`)
- [ ] Test *Italic* (`Cmd+I`)
- [ ] Test <u>Underline</u> (`Cmd+U`)
- [ ] Test ~~Strikethrough~~ (`Cmd+Shift+S`)
- [ ] Test `inline code`
- [ ] Test [link](url) - should prompt for URL

#### Font Sizes
- [ ] Right-click → Font Size
- [ ] Try all sizes: 10px, 12px, 14px, 16px, 18px, 20px, 24px, 28px, 32px, 36px, 48px, 64px
- [ ] Verify text scales correctly
- [ ] Check that font size persists after save

#### Text Colors
- [ ] Right-click → Text Color
- [ ] Try each color: Black, Gray, Red, Green, Blue, Orange, Purple, Pink
- [ ] Verify color applies correctly
- [ ] Check persistence after save

#### Highlights
- [ ] Right-click → Highlight
- [ ] Try each highlight: Yellow, Orange, Green, Blue, Pink, Purple
- [ ] Verify background color applies
- [ ] Check persistence

#### Alignment
- [ ] Right-click → Align
- [ ] Test Left (`Cmd+Shift+L`)
- [ ] Test Center (`Cmd+Shift+E`)
- [ ] Test Right (`Cmd+Shift+R`)
- [ ] Test Justify (`Cmd+Shift+J`)

### 3. Block Customization Tests

#### Inspector Panel
- [ ] Click on a block (e.g., Hero)
- [ ] Right panel should show Inspector
- [ ] **Props Tab**:
  - [ ] Modify text fields (title, subtitle)
  - [ ] Change select options
  - [ ] Toggle boolean fields
  - [ ] Adjust number fields
- [ ] **Layout Tab**:
  - [ ] Change max width
  - [ ] Adjust padding
  - [ ] Modify margin
- [ ] **Style Tab**:
  - [ ] Change background color
  - [ ] Change text color
  - [ ] Adjust border radius
  - [ ] Change shadow preset
- [ ] Verify changes apply immediately in editor
- [ ] Save and reload - verify changes persist

### 4. Media Manager Tests

- [ ] Click "Media" button in top bar
- [ ] **Upload**:
  - [ ] Drag and drop an image
  - [ ] Click "Select Files" and choose image
  - [ ] Verify upload progress
  - [ ] Check thumbnail appears
- [ ] **Browse**:
  - [ ] View uploaded files in grid
  - [ ] Click to select
  - [ ] Copy URL to clipboard
  - [ ] Open in new tab
- [ ] **Insert**:
  - [ ] Select an image
  - [ ] Click "Insert Selected"
  - [ ] Verify image appears in editor

### 5. Template Tests

- [ ] Click "Templates" button in top bar
- [ ] Browse templates by category
- [ ] Select "SaaS Landing Page"
- [ ] Click "Use Template"
- [ ] Verify pre-built structure loads
- [ ] Customize the template
- [ ] Try other templates:
  - [ ] Product Documentation
  - [ ] Blog Article
  - [ ] Team Page
  - [ ] Portfolio
  - [ ] Changelog

### 6. Component Library Tests

#### Left Sidebar
- [ ] Switch to "Library" tab
- [ ] Verify blocks are categorized:
  - [ ] Layout (Hero, Columns, Container)
  - [ ] Content (Callout, Feature, Quote, Stats)
  - [ ] Interactive (Accordion, Tabs, Button)
  - [ ] Media (Image, Gallery, Video, Embed)
  - [ ] Data (Table, Code, Chart)
  - [ ] Special (Timeline, Card, Divider, etc.)
- [ ] **Search**:
  - [ ] Type "hero" - should show Hero Section
  - [ ] Type "button" - should show Button block
  - [ ] Type "pricing" - should show Pricing Card
  - [ ] Search by tag (e.g., "cta")
- [ ] **Drag & Drop**:
  - [ ] Drag a block from library
  - [ ] Drop onto canvas
  - [ ] Verify block inserts

#### Outline Tab
- [ ] Switch to "Outline" tab
- [ ] Verify all blocks are listed
- [ ] Click to jump to block
- [ ] Use ↑↓ to reorder blocks

### 7. Keyboard Shortcuts Tests

- [ ] `Cmd+K` - Command palette opens
- [ ] `/` - Slash menu opens
- [ ] `Cmd+S` - Save (check "Saved" indicator)
- [ ] `Cmd+Shift+P` - Publish
- [ ] `?` - Help overlay opens
- [ ] `Cmd+B` - Bold
- [ ] `Cmd+I` - Italic
- [ ] `Cmd+U` - Underline
- [ ] `Tab` - Indent list or next table cell
- [ ] `Shift+Tab` - Outdent or previous cell

### 8. Table Tests

- [ ] Insert table via Toolbar
- [ ] Right-click in table
- [ ] Verify table submenu appears
- [ ] **Add/Remove**:
  - [ ] Add row above
  - [ ] Add row below
  - [ ] Add column left
  - [ ] Add column right
  - [ ] Delete row
  - [ ] Delete column
- [ ] **Merge/Split**:
  - [ ] Select multiple cells
  - [ ] Merge cells
  - [ ] Split cell
- [ ] **Styling** (Inspector panel):
  - [ ] Change cell background
  - [ ] Adjust alignment
  - [ ] Modify borders

### 9. Auto-Save Tests

- [ ] Type some content
- [ ] Wait 1.5 seconds
- [ ] Check "Saving..." indicator appears
- [ ] Check "Saved" appears after
- [ ] Refresh page
- [ ] Verify content persists

### 10. Published Page Tests

- [ ] Publish document
- [ ] Open published URL
- [ ] Verify all blocks render
- [ ] Check text formatting (bold, italic, sizes, colors)
- [ ] Test all links work
- [ ] Check images load
- [ ] Verify responsive design (resize window)
- [ ] Test on mobile device (if available)

### 11. Edge Cases

- [ ] Empty document (no content)
- [ ] Very long document (50+ blocks)
- [ ] Large images (near 10MB limit)
- [ ] Special characters in text
- [ ] Emoji in content 😊
- [ ] Copy/paste from Word
- [ ] Copy/paste from Excel (into table)
- [ ] Undo/Redo (`Cmd+Z` / `Cmd+Shift+Z`)

### 12. Performance Tests

- [ ] Add 20+ blocks - editor remains responsive
- [ ] Type quickly - no lag
- [ ] Drag blocks - smooth animation
- [ ] Scroll through long document - smooth
- [ ] Open Media Manager with many files - loads fast

### 13. Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 🐛 Common Issues to Check

### Components Not Rendering
**Symptom**: Blocks show as empty or error in editor/published page
**Check**:
- [ ] Preview component exists in `AllBlockPreviews.tsx`
- [ ] Component is exported in `sections.tsx`
- [ ] componentKey matches API definition

### Text Formatting Not Working
**Symptom**: Bold, italic, or font size doesn't apply
**Check**:
- [ ] TextStyleExtended is loaded in editor
- [ ] Context menu onClick handlers fire
- [ ] Marks are registered in Tiptap config

### Media Upload Fails
**Symptom**: Upload doesn't work or errors
**Check**:
- [ ] `/api/upload` endpoint is working
- [ ] File size is under 10MB
- [ ] File type is supported (image/video)

### Auto-Save Not Working
**Symptom**: Content lost on refresh
**Check**:
- [ ] Network tab shows PATCH requests
- [ ] Database is connected
- [ ] Document ID is valid

### Inspector Not Showing
**Symptom**: Right panel empty when block selected
**Check**:
- [ ] Block is properly selected (click on it)
- [ ] componentKey exists in components array
- [ ] Schema is defined in API

## 📊 Success Criteria

✅ **All 25+ blocks render correctly** in both editor and published page
✅ **Text formatting works** - bold, italic, underline, sizes, colors, highlights
✅ **Context menu opens** on right-click with all options
✅ **Media Manager** uploads and inserts images
✅ **Templates** load and apply correctly
✅ **Inspector** customizes blocks in real-time
✅ **Auto-save** preserves content
✅ **Keyboard shortcuts** work as documented
✅ **Published page** matches editor preview
✅ **Performance** is smooth with many blocks

## 🚀 Quick Smoke Test

1. Open editor at `/editor/:id`
2. Type `/hero` and press Enter
3. Right-click and select **Bold**, change **Font Size** to 24px, change **Text Color** to Red
4. Click "Media" and upload an image
5. Click "Templates" and apply "SaaS Landing Page"
6. Customize a block in Inspector panel
7. Click "Publish"
8. View published page - verify everything renders

If all these work, the core functionality is solid! ✅

## 📝 Notes for Developers

- All preview components are in `AllBlockPreviews.tsx`
- Registry is in `sections.tsx`
- API definitions are in `app/api/components/route.ts`
- Text formatting uses `TextStyleExtended` in `lib/`
- Context menu uses shadcn components
- Published rendering is in `app/p/[projectKey]/[slug]/page.tsx`

---

**Happy Testing! 🎉**
