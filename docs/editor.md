# Editor Module

This module implements the visual editor (Tiptap) for creating and publishing rich documents with reusable sections.

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

## Section Node

- Tiptap node `section` with attributes `{ componentKey, props }`
- Rendered in viewer using simple React renderers for demo components

## APIs

- `GET/POST /api/documents` – list/create
- `GET/PATCH /api/documents/:id` – read/update (draft saves in `meta.draftContent`)
- `POST /api/documents/:id/publish` – create new `DocumentVersion`
- `GET /api/components` – seeded components list
- `POST /api/upload` – image upload to `public/uploads`

## Error Handling & Logging

- Structured logs via `lib/logger.ts`
- API errors shaped as `{ ok:false, error:{ code, message } }`
- Client consoles for load/autosave/publish and upload

## Demo UI (high polish)

- Top bar: breadcrumbs, command palette (Cmd+K), saving indicator
- Left sidebar: Library (thumbnails, search, drag) and Outline (jump)
- Canvas: device preview (desktop/tablet/mobile) and framed editor area
- Inspector: Props/Layout/Style with inline editing

## Future Enhancements

- Persist `ComponentType` in DB
- Advanced props UI with schemas (Zod)
- Collaboration (Yjs)

