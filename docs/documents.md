# Documents Flow – Create, Edit, Publish, View

This document explains the restored dashboard on `/docs` and how it ties into the database-backed documents flow.

## Create

- Use the form on `/docs` to enter a Title and Slug (slug auto-generates from title and is editable).
- Submits to `POST /api/documents` with payload `{ title, slug, meta }`.
- On success, it navigates directly to the editor at `/editor/:id`.

## Edit

- The editor autosaves `meta.draftContent` via `PATCH /api/documents/:id`.
- Keyboard shortcuts:
  - Save draft: Cmd/Ctrl+S
  - Publish: Cmd/Ctrl+Shift+P

## Publish

- `POST /api/documents/:id/publish` captures the current draft as a new `DocumentVersion`.
- After publishing, you can view the latest version at `/p/:slug`.

## View

- Public view page at `/p/:slug` renders published content using the same preview registry as the editor.

## Dashboard List

- `/docs` lists documents from `GET /api/documents`, showing title and slug.
- Actions:
  - Edit → `/editor/:id`
  - View → `/p/:slug`

## Debugging & Errors

- All actions show toasts (success/error) and verbose `console` logs for easier troubleshooting.
- API responses follow `{ ok, data?, error? }` structure. Conflicts (duplicate slug) return `409` with a helpful message.


