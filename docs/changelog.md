# Changelog – DocsMania (BharatERP)

All notable changes made during this implementation session.

Date: 2025-09-20

## Repository & Setup
- Created public GitHub repo: AmanVatsSharma/DocsMania_BharatERP.
- Initialized project; added `.gitignore` and pushed initial commit.

## Branding & Theme
- Added branded loading screen: `app/editor/[id]/loading.tsx` (DocsMania – product by BharatERP; Developer: AmanVatsSharma).
- Branded home hero: `app/page.tsx`.
- Theme tokens in `app/globals.css`: `--background`, `--foreground`, `--muted`, `--border`, `--accent`, `--accent-foreground`.
- Global layout polish: `app/layout.tsx` with soft background and selection styles.
- Accent Picker (TopBar) with localStorage persistence.

## Editor Architecture (modular)
- Extracted high-polish components under `app/editor/_components/`:
  - `TopBar`, `LeftSidebar`, `Inspector`, `Toolbar`, `DevicePreview`, `CommandPalette`, `SlashMenu`, `ContextMenu`, `HelpOverlay`, `AccentPicker`, `TemplatesPicker`.
- Split logic and hooks:
  - `app/editor/_logic/sectionTransforms.ts` (move/delete utilities).
  - `lib/hooks.ts` (`useDebouncedCallback`).
- Integrated all into `app/editor/[id]/page.tsx` with clean state and handlers.

## Sections & NodeView
- Custom React NodeView for `section`: `SectionNodeView.tsx`.
  - Hover toolbar: Duplicate, Delete, Move ↑/↓.
  - Spacing handles: Drag to adjust `props.layout.marginY` and `props.layout.padding`.
  - Drag guides: visual top/bottom insert hints during dragover.
- Utilities for section transforms: `moveSection`, `deleteSectionAt`.

## Component System & Previews
- Scalable registry:
  - Definitions: `app/editor/_registry/components.ts`.
  - Previews (modular): `previews/HeroPreview.tsx`, `previews/CalloutPreview.tsx`, `previews/FeaturePreview.tsx`.
  - Registry map: `app/editor/_registry/sections.tsx`.
- API seed (`app/api/components/route.ts`):
  - Hero: nested `style` schema (background, color, radius, shadow).
  - Callout: nested `style` (background, text color, left border color).
  - Feature: title/description/points (string or array supported).

## Inspector (Right Panel)
- Props editor supports nested `object` fields with labels.
- Style controls: background, text color, accent color, border radius, shadow.
- Layout controls: max width, padding, vertical margin.
- Table Inspector (`TableInspector.tsx`) when table is active:
  - Cell background and text alignment.
  - Add/remove rows/columns, merge/split, header row toggle.

## Tables & Rich Text Power
- Advanced table system (Phase 1):
  - `lib/TableExtended.ts` adds table-level attrs: sticky header/first column, zebra, compact, overflow X, caption, width/align, border style.
  - `lib/TableCellExtended.ts` adds `verticalAlign`, `padding`, `borderColor`, `borderWidth` in addition to background and textAlign.
  - Inspector `TableInspector.tsx` exposes table + cell panels; CSV/TSV import/export via `lib/csv.ts`.
  - Editor context menu includes table operations (row/col add/delete, merge/split).
  - Viewer parity: sticky header/first column, zebra, caption, colgroup widths.
- Rich text context menu (right-click): paragraph, headings, lists, bold/italic/strike, link, font sizes.
- Added Tiptap `TextStyle` extension for font size.

## Outline & Reordering
- Outline panel shows component name with preview text.
- Outline controls to move sections up/down via `moveSection`.

## Viewer Parity (`/p/:slug`)
- Uses the same preview registry for sections.
- Renders marks: bold, italic, strike, code, link, font-size.
- Renders nodes: paragraphs, headings (h1–h6), bullet/ordered lists, list items, blockquote, code block, image, table (with header cells and cell styles).
- Fixed dynamic heading tag issue; explicit h1–h6 mapping.

## Toolbars & Menus
- Main Toolbar: block type (P/H1–H6), bold/italic/strike/underline/code, alignment (L/C/R/Justify), lists (bullet/ordered/task), font family, font size, text color, highlight, link, table, clear formatting.
- Slash menu (`/`) to insert components and common blocks.
- Command palette (Cmd/Ctrl+K) for actions and components.
- Help overlay with keyboard/feature cheatsheet; Help button in TopBar.

## Templates
- Quick Templates Picker to apply predefined document structures (e.g., Hero + Feature list).

## Toasts & Feedback
- Installed `sonner`; added global `ToasterClient` in layout.
- Autosave/publish/upload now show success/error toasts.

## Fixes & Quality
- Next.js params unwrap: use `React.use()` to resolve `params` Promise; introduced `docId` usage.
- Avoided flush during render: dispatches queued with `queueMicrotask` in NodeView.
- `points.map` safety: normalize to array in Feature preview.
- Removed `next/dynamic` with `ssr:false` in server layout; use direct client import.
- Linter fixes: synchronous key handler signature; type-safe imports.

## Docs
- Updated `docs/editor.md` to reflect high-polish editor and flow.
- Added `docs/components.md` with scalable component authoring guide and flowchart.
 - 2025-09-22: Restored Docs Dashboard on `/docs` with create/list/edit/view.
   - Added `app/docs/_components/DocsDashboard.tsx` and wired in `app/docs/page.tsx`.
   - Console logs and toasts for create/list; docs updated in `docs/components.md` and the editor flow.

## Files (key additions)
- Components: `TopBar.tsx`, `LeftSidebar.tsx`, `Inspector.tsx`, `Toolbar.tsx`, `DevicePreview.tsx`, `CommandPalette.tsx`, `SlashMenu.tsx`, `ContextMenu.tsx`, `HelpOverlay.tsx`, `AccentPicker.tsx`, `TemplatesPicker.tsx`.
- Node/Logic: `SectionNodeView.tsx`, `_logic/sectionTransforms.ts`, `lib/hooks.ts`, `lib/TableCellExtended.ts`.
- Registry: `_registry/components.ts`, `_registry/sections.tsx`, `_registry/previews/*.tsx`.
- Viewer: `app/p/[slug]/page.tsx` (rich renderer).
- Branding: `app/editor/[id]/loading.tsx`, `app/page.tsx`.
- Theming: `app/globals.css`, `app/layout.tsx`.
- Docs: `docs/editor.md`, `docs/components.md`, `docs/changelog.md` (this file), `app/editor/docs/typography.md`.
