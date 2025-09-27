# Components System – DocsMania

This guide explains how to add scalable components (sections) to the editor and ensure they render in both the live editor and the hosted page.

## Anatomy

- Definition (API): `app/api/components/route.ts` seeds keys, names, schemas, and defaults
- Editor Registry (previews): `app/editor/_registry/sections.tsx` maps `componentKey -> Preview`
- NodeView: `app/editor/_components/SectionNodeView.tsx` renders the Preview inside the editor
- Viewer: `app/p/[slug]/page.tsx` uses the same registry to render on the hosted page

## Add a new component

1) API seed (dev/demo):
- Add an entry to `seed` in `app/api/components/route.ts` with:
  - `key`, `name`
  - `schema` (simple JSON types: string|number|boolean|select|object with nested `fields`)
  - `defaultConfig`

2) Preview component (editor/viewer):
- Create a React file under `app/editor/_registry/previews/YourCompPreview.tsx` exporting `({ props }) => JSX`
- Read styles from `props.style` and layout from `props.layout` if relevant

3) Register preview:
- Add to `previewComponents` map in `app/editor/_registry/sections.tsx`:
```
import YourCompPreview from "@/app/editor/_registry/previews/YourCompPreview";
previewComponents.yourKey = YourCompPreview;
```

4) Verify in editor and hosted page:
- Editor: use Library to insert the component; tweak props in Inspector
- Hosted page: publish and open `/p/:slug` – visuals must match

## Flow

```
flowchart TD
  A[API seed] --> B[Editor load components]
  B --> C[Library insert {componentKey, props}]
  C --> D[NodeView renders Preview]
  D --> E[Inspector updates props]
  E --> D
  D --> F[Autosave draft]
  F --> G[Publish]
  G --> H[Viewer renders using same Preview registry]
```

## Docs Dashboard

The docs hub (`/docs`) includes a dashboard to create and manage database-backed documents.

- Create: uses `POST /api/documents` with `title`, `slug`, `meta`.
- List: uses `GET /api/documents` and shows title/slug/updatedAt.
- Edit action: navigates to `/editor/[id]`.
- View action: navigates to `/p/[slug]`.

The implementation lives in `app/docs/_components/DocsDashboard.tsx` and is rendered by `app/docs/page.tsx` inside the docs `Shell`. All actions emit toasts and verbose console logs for easier debugging.

## Schema Tips
- Prefer simple JSON-friendly schema shapes. For nested objects use `{ type:"object", fields: { ... } }`.
- Use `select` for enums; provide `options`.
- Store style tokens under `props.style` and layout under `props.layout`.

## Styling Guidelines
- Use CSS variables and Tailwind utility classes.
- Respect `--accent` and surface tokens.
- Keep previews visually robust (sane defaults, no external data dependencies).

## Testing Checklist
- Insert component from Library
- Edit props & style in Inspector; check live NodeView updates
- Publish and verify hosted page parity
- Try invalid/edge props; component should fail gracefully

## Tables – Module Notes

- Editor extension: `lib/TableExtended.ts` augments table with attrs: `stickyHeader`, `stickyFirstColumn`, `zebra`, `compact`, `overflowX`, `caption`, `align`, `width`, `borderStyle`.
- Cell extension: `lib/TableCellExtended.ts` adds `backgroundColor`, `textAlign`, `verticalAlign`, `padding`, `borderColor`, `borderWidth`.
- Inspector: `TableInspector.tsx` exposes table toggles/options, cell formatting, row/col ops, CSV import/export.
- Context menu: table actions (add/delete row/col, merge/split) appear inside editor.
- CSV utils: `lib/csv.ts` supports robust parse/serialize for CSV/TSV with quotes/newlines.
- Viewer parity: `app/p/[slug]/page.tsx` renders sticky header/first column, zebra/compact, caption, and `<colgroup>` widths.
