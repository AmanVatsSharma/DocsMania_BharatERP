# Editor Module

This module is a Shopify-like visual editor built on Tiptap/ProseMirror. It lets you compose rich documents using both freeform text and reusable "sections" (components), autosaves drafts, and publishes to hosted pages with identical rendering.

## Quick Start

1. Create a document via API/UI and open `/editor/:id`.
2. Insert content:
   - Type normally; use Toolbar or Right-click menu for headings, lists, links, code, font size.
   - Drag sections from Library or press `/` to open the Slash menu.
3. Edit sections:
   - Select a section → Inspector (Props/Layout/Style). Live preview updates.
   - Use hover toolbar to Move/Duplicate/Delete. Drag handles to adjust spacing.
4. Autosave runs after idle typing; errors surface as toasts.
5. Publish (Cmd/Ctrl+Shift+P) and view at `/p/:slug`.

## Key Flows

```mermaid
flowchart TD
  A[Open /docs] --> B[Create Document]
  B --> C[Open /editor/:id]
  C --> D[Shopify-like UI: TopBar + Left Library + Inspector]
  D --> D1[Type content / Add Sections]
  D --> E[Autosave (debounced)]
  E --> F{Error?}
  F -- yes --> G[Toast + Console + Retry]
  F -- no --> H[Draft Saved]
  H --> I[Publish]
  I --> J[Create Version]
  J --> K[View at /p/:slug]
```

## Docs Dashboard Flow (Create → Edit → View)

```
flowchart LR
  A[Create form /docs] -->|POST /api/documents| B((Document))
  B -->|Open editor| C[/editor/:id/]
  C -->|Publish| D[(DocumentVersion)]
  D -->|View| E[/p/:slug/]
```

Where to look in code:
- `app/docs/_components/DocsDashboard.tsx` – create/list with Edit/View actions
- `app/docs/page.tsx` – renders the dashboard within `Shell`
- `app/api/documents/*` – create, read, update, publish
- `app/editor/[id]/page.tsx` – rich editor
- `app/p/[slug]/page.tsx` – viewer rendering published content

## Concepts

- Freeform content: paragraphs, headings (h1–h6), lists (ul/ol), blockquote, code block, images, links, font sizes.
- Sections: a Tiptap node `section` with attrs `{ componentKey, props }`, rendered via a shared React preview.
- Inspector: schema-driven Props + Layout (maxWidth, padding, marginY) + Style (colors, radius, shadow).
- Library: searchable list of components; drag to insert or use Slash menu.
- Outline: list of sections with jump and move ↑/↓ actions.

## Rendering Parity

Both the editor and the hosted page use the same preview registry, so what you see is what you publish:

- Marks: bold, italic, strike, underline, code, link, textStyle (font size/line-height/letter-spacing), color, highlight, fontFamily, subscript, superscript.
- Nodes: paragraph (textAlign), headings (textAlign), lists, listItem, taskList/taskItem, blockquote, codeBlock, image, table (header/data cells).
 - Nodes: paragraph (textAlign, indent, spacingBefore, spacingAfter), headings (textAlign), lists, listItem, taskList/taskItem, blockquote, codeBlock, image, table (header/data cells).
- Section previews: Hero, Callout, Feature (style-editable), easily extendable.

## UI Reference

- TopBar: breadcrumbs, Cmd/Ctrl+K, Accent picker, Help, Image upload, Publish.
- Toolbar: block type (P/H1–H6), bold/italic/strike/underline/code, alignment (L/C/R/Justify), lists (bullet/ordered/task), font family, font size, text color, highlight, link, table, clear formatting, undo/redo.
- Slash menu: press `/` to insert blocks/components.
- Context menu: right-click to change text settings and font sizes.
- Device preview: desktop/tablet/mobile.
- Help overlay: keyboard shortcuts and feature map.

## Section Editing

- Hover toolbar: Duplicate / Delete / Move ↑/↓.
- Spacing handles: drag to change padding and vertical margin.
- Inspector:
  - Props: values from component schema (supports nested objects with labels and selects).
  - Layout: `maxWidth`, `padding`, `marginY`.
  - Style: `backgroundColor`, `color`, `accentColor`, `borderRadius`, `shadow`.

## Tables (Advanced)

- Add a table from Toolbar. When active, Table Inspector appears in the right panel.
- Table options: sticky header, sticky first column, zebra, compact, overflow X, caption, width & align, border style.
- Cell styling: background, text & vertical alignment, padding, borders.
- Structure: add/remove rows/cols, merge/split, toggle header row.
- Data: Import CSV/TSV (paste), Export CSV. Robust parsing with quotes/newlines.
- Excel-like: Tab/Shift+Tab navigation, Enter to move, paste spreadsheet ranges to replace the current table.

## Component System

- Definitions: `app/api/components/route.ts` seeds component keys, names, schemas, and default props.
- Previews: `app/editor/_registry/previews/*` renders sections in both editor and hosted page.
- Registry: `app/editor/_registry/sections.tsx` maps `componentKey -> Preview`.
- Authoring guide: `docs/components.md` explains how to add scalable components.

## APIs

- `GET/POST /api/documents` – list/create
- `GET/PATCH /api/documents/:id` – read/update; drafts in `meta.draftContent`
- `POST /api/documents/:id/publish` – create `DocumentVersion`
- `GET /api/components` – components Library
- `POST /api/upload` – image upload

## Error Handling & Diagnostics

- Structured API responses: `{ ok, data? , error? }` with codes.
- Toaster feedback on autosave/publish/upload; robust consoles at key steps.
- Editor guards for invalid schema inputs; safe fallbacks in previews.
 - Tables: Import/export and attribute mutations wrapped in try/catch with `console.error` and user toasts.

## Files & Modules

- Core page: `app/editor/[id]/page.tsx`
- Components: `TopBar`, `LeftSidebar`, `Inspector`, `Toolbar`, `DevicePreview`, `CommandPalette`, `SlashMenu`, `ContextMenu`, `HelpOverlay`, `AccentPicker`, `TemplatesPicker`
- Node/Logic: `SectionNodeView.tsx`, `_logic/sectionTransforms.ts`, `lib/hooks.ts`, `lib/TableCellExtended.ts`
- Registry: `_registry/components.ts`, `_registry/sections.tsx`, `_registry/previews/*`
- Viewer: `app/p/[slug]/page.tsx`

## Roadmap Hints

- Collaboration (Yjs), comments, presence cursors.
- DB-backed component registry and visual thumbnails.
- Multi-environment publish workflows and diffs.
