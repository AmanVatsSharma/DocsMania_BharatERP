# Enhanced Document Editor - Enterprise-Grade Platform

> **AI-Friendly Documentation**: This document is structured for both human readers and AI systems to understand the architecture and capabilities.

## Overview

The enhanced document editor is a **Notion/Coda-like** platform for creating, editing, and publishing beautiful documents with enterprise-grade features. Built with Next.js 15, Tiptap, and modern React patterns.

## Core Features

### 1. **25+ Pre-built Component Blocks**

Components are organized into **6 categories** for easy discovery:

#### Layout Blocks
- **Hero Section**: Large header with title, subtitle, CTA button
- **Column Layout**: Responsive 2-4 column grids
- **Container**: Flexible wrapper with max-width controls

#### Content Blocks
- **Callout Box**: Highlighted info with icons (info/success/warning/error)
- **Feature List**: Showcase benefits with bullet points
- **Quote**: Testimonials and pull quotes
- **Stats Grid**: Display key metrics and KPIs

#### Interactive Blocks
- **Accordion**: Collapsible FAQ sections
- **Tabs**: Tabbed content navigation
- **Button**: CTAs with multiple variants

#### Media Blocks
- **Image Block**: Images with captions and styling
- **Gallery**: Grid of images with lightbox
- **Video Player**: Embedded YouTube/Vimeo
- **Embed**: iframe for external content

#### Data Blocks
- **Data Table**: Styled tables with sorting
- **Code Block**: Syntax-highlighted code
- **Chart**: Data visualization (bar/line/pie)

#### Special Blocks
- **Timeline**: Event history display
- **Card**: Content cards with images
- **Divider**: Visual separators
- **Spacer**: Vertical rhythm control
- **Alert Banner**: Full-width notifications
- **Pricing Card**: Pricing tier display

### 2. **Advanced Media Management**

The **MediaManager** component provides:
- ✅ Drag & drop upload
- ✅ File browser with thumbnails
- ✅ Copy URL functionality
- ✅ 10MB file size limit
- ✅ Support for images and videos
- 🔜 Image cropping (future)
- 🔜 Resizing tools (future)

### 3. **Document Templates**

Pre-built templates for quick starts:
- **SaaS Landing Page**: Hero + Features + Stats
- **Product Documentation**: Getting Started + API docs
- **Blog Article**: Formatted blog post structure
- **Team Page**: Team member showcase
- **Portfolio**: Project gallery display
- **Changelog**: Product update timeline

### 4. **Component Library with Categories**

The left sidebar features:
- 📁 Categorized blocks for easy browsing
- 🔍 Smart search across names, descriptions, tags
- 🎨 Visual thumbnails with category icons
- 🖱️ Drag & drop to canvas
- 📑 Outline view for document structure

### 5. **Enterprise Inspector Panel**

Three-tab inspector for precise control:

#### Props Tab
- Dynamic form fields based on component schema
- Support for: text, number, boolean, select, color
- Object nesting for complex configurations
- Raw JSON mode for advanced users

#### Layout Tab
- Max width control
- Padding adjustments
- Margin spacing

#### Style Tab
- Background colors
- Text colors
- Border styling
- Border radius
- Shadow presets
- Accent colors

### 6. **Modern UI/UX**

- 🎨 Glassmorphism effects
- ✨ Smooth animations and transitions
- 🌊 Gradient backgrounds
- 🎯 Hover states and micro-interactions
- 📱 Responsive design
- ⌨️ Keyboard shortcuts (Cmd+S, Cmd+Shift+P, etc.)

## Architecture

### Component Structure

```
app/editor/
├── [id]/
│   └── page.tsx              # Main editor page
├── _components/
│   ├── LeftSidebar.tsx       # Component library + Outline
│   ├── Inspector.tsx         # Props/Layout/Style panels
│   ├── TopBar.tsx            # Navigation + actions
│   ├── Toolbar.tsx           # Rich text formatting
│   ├── MediaManager.tsx      # Media upload & browser
│   ├── BlockTemplates.tsx    # Document templates
│   ├── CommandPalette.tsx    # Quick actions (Cmd+K)
│   ├── SlashMenu.tsx         # Slash commands (/)
│   └── HelpOverlay.tsx       # Keyboard shortcuts
└── _registry/
    ├── components.ts         # Component definitions
    └── sections.tsx          # Section renderers
```

### Data Flow

```
┌─────────────────────────────────────────────────┐
│  Document Storage (PostgreSQL + Prisma)        │
│  - Document metadata                            │
│  - Tiptap JSON content                          │
│  - Version history                              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Editor (Tiptap + Custom Extensions)            │
│  - Section nodes (custom block types)          │
│  - Rich text editing                            │
│  - Real-time autosave (1.5s debounce)          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Publisher                                       │
│  - Converts Tiptap JSON → HTML                  │
│  - Renders components server-side               │
│  - Hosted at /p/:projectKey/:slug               │
└─────────────────────────────────────────────────┘
```

## AI Integration Guidelines

### For Document Generation

When generating documents programmatically:

1. **Use structured JSON format**:
```json
{
  "type": "doc",
  "content": [
    {
      "type": "section",
      "attrs": {
        "componentKey": "hero",
        "props": {
          "title": "Generated Title",
          "subtitle": "Generated subtitle"
        }
      },
      "content": [{ "type": "paragraph" }]
    }
  ]
}
```

2. **Component keys reference** (25+ available):
   - Layout: `hero`, `columns`, `container`
   - Content: `callout`, `feature`, `quote`, `stats`
   - Interactive: `accordion`, `tabs`, `button`
   - Media: `image`, `gallery`, `video`, `embed`
   - Data: `table-block`, `code`, `chart`
   - Special: `timeline`, `card`, `divider`, `spacer`, `alert`, `pricing`

3. **Props schema** is defined in `/api/components/route.ts`

### For Block Rendering

Components are rendered with:
- **Server-side**: During publish, components → HTML
- **Client-side**: In editor, components → React views

### Future: Interactive Documents

The architecture supports:
- 🔜 Form inputs from signed-in viewers
- 🔜 Data collection and storage
- 🔜 Dynamic content based on user data
- 🔜 Real-time collaboration
- 🔜 Comments and annotations

## Usage Examples

### Creating a Document

1. Start with a template or blank doc
2. Use slash commands (`/`) or drag blocks from library
3. Customize in the Inspector panel
4. Save automatically (Cmd+S for manual save)
5. Publish (Cmd+Shift+P)

### Adding Media

1. Click "Media" in top bar
2. Drag & drop or select files
3. Images are uploaded to `/api/upload`
4. Insert into document with one click

### Keyboard Shortcuts

- `Cmd+K`: Open command palette
- `/`: Slash menu for blocks
- `Cmd+S`: Save document
- `Cmd+Shift+P`: Publish
- `Tab`: Navigate table cells or indent lists
- `Shift+Tab`: Previous cell or outdent

## Best Practices

### For Small, Focused Docs

Keep documents **concise and structured**:
- ✅ Use headings for hierarchy
- ✅ Break content into sections
- ✅ Use callouts for important info
- ✅ Add visuals (images, stats, charts)
- ❌ Avoid massive walls of text
- ❌ Don't nest sections too deeply

### Component Organization

- Group related content in sections
- Use containers for layout control
- Leverage templates for consistency
- Tag components for searchability

### Performance

- Images: Optimize before upload (<10MB)
- Videos: Use embeds instead of uploads
- Tables: Keep rows under 100 for best performance
- Autosave: Automatic with 1.5s debounce

## API Endpoints

### Documents
- `GET /api/documents/:id` - Fetch document
- `PATCH /api/documents/:id` - Update draft content
- `POST /api/documents/:id/publish` - Publish version

### Components
- `GET /api/components` - List all available blocks

### Media
- `POST /api/upload` - Upload media files

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Editor**: Tiptap (ProseMirror)
- **Database**: PostgreSQL + Prisma
- **UI**: Tailwind CSS 4 + Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner

## Future Enhancements

### Planned Features
1. **Collaboration**: Real-time multi-user editing
2. **Comments**: Inline discussions
3. **Version Control**: Git-like branching
4. **Form Inputs**: Collect data from viewers
5. **AI Assistant**: Auto-generate content
6. **Export**: PDF, Markdown, DOCX
7. **Analytics**: View tracking and engagement
8. **Themes**: Custom brand styling

### Integration Possibilities
- Webhooks for publish events
- REST API for external content
- GraphQL support
- Zapier/Make integrations
- Slack/Discord notifications

## Contributing

When adding new blocks:

1. Define schema in `/api/components/route.ts`
2. Add to appropriate category
3. Include description and tags
4. Create preview component (optional)
5. Test in editor and publish flow

## Support

For questions or issues:
- Check `/docs` folder for more guides
- Review code comments (AI-friendly)
- Test in development environment first

---

**Note**: This is a living document. Update as features evolve.
