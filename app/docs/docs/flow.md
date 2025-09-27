---
title: Docs Hub Flow
tags: [flow, how-to]
description: Usage flow for maintainers and contributors.
---

# Docs Hub Flow

## Adding Docs

- Place markdown under `docs/<project>/...` or `app/<project>/docs/...`.
- Add frontmatter:

```md
---
title: My Guide
tags: [guide, internal]
description: Short summary for the index
---
```

## Re-indexing

- Press Re-index in the hub header, or POST `/api/docs/reindex`.

## Linking

- Link to a doc via `/docs/<project>/<path>`.
- Headings have anchors (hover to copy link).

## Runtime Health & Data Flow

```mermaid
flowchart TD
  subgraph UI[/Docs Dashboard/]
    L[Load /docs]
    CProj[Create Project]
    CDoc[Create Document]
  end

  subgraph API[/Next.js Route Handlers/]
    PGET[GET /api/projects]
    PPOST[POST /api/projects]
    DGET[GET /api/documents]
    DPOST[POST /api/documents]
    H[GET /api/health/db]
  end

  subgraph DB[(PostgreSQL)]
    T1[[Project]]
    T2[[Document]]
  end

  L -->|fetch| PGET --> T1
  L -->|fetch (optional filter)| DGET --> T1 --> DGET --> T2
  CProj -->|submit| PPOST --> T1 --> PGET --> UI
  CDoc -->|submit| DPOST --> T2 --> DGET --> UI
  UI -->|diagnose| H --> DB
```

Notes:
- UI uses resilient loaders with clear toasts and consoles; failures don’t block creating a project.
- Health check is available at `/api/health/db` and returns `{ ok, data: { status, durationMs } }`.
- The dashboard defaults to the first project when available.

