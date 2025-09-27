# Doc Creator – Tiptap-powered Visual Builder for Hosted Documents

Build Wix/Shopify-like visual pages with custom component sections and rich, Word-like documents (forms, tables, images, links, toolbars). Manage a reusable component library, organize documents per project, interlink them, and publish as hosted pages. Backend uses Prisma + PostgreSQL.

> Status: Planning complete (v0). This README captures the end-to-end plan, architecture, flows, setup, and roadmap.

---

## Vision & Goals

- **Visual builder UX**: Drag-and-drop sections, live preview, and precise controls powered by Tiptap.
- **Super-featured documents**: Inline rich content (forms, tables, media, links) with configurable toolbars.
- **Reusable component library**: Define and version component types with schemas and styles; compose into sections.
- **Project-centric organization**: Group docs by project, set roles/permissions, and interlink docs.
- **Publishing**: Generate hosted pages with stable slugs, SEO, and snapshots of content.
- **Scalable backend**: Prisma + Postgres, typed APIs, robust validation, and clean error handling.
- **Observability**: Structured logs, diagnostics, and traceable errors.

---

## Tech Stack (Proposed)

- **Frontend**: Next.js 14 (App Router) + React + TypeScript, TailwindCSS
- **Editor**: Tiptap (custom extensions for forms, tables, media, links, components)
- **Realtime (optional phase)**: Yjs + y-websocket for collaborative editing
- **API**: Next.js Route Handlers (REST) or tRPC (type-safe RPC)
- **Auth**: NextAuth (email/OAuth), role-based access per project
- **ORM / DB**: Prisma + PostgreSQL
- **Storage**: Local in dev, S3-compatible in prod (to be configured)
- **Validation**: Zod for inputs and config schemas
- **Logging**: Pino (JSON) + human-readable dev logger
- **Testing**: Vitest/Jest + Playwright e2e
- **CI/CD**: GitHub Actions (lint, test, build, migrations)

---

## Repository Structure (Monorepo-ready)

```
.
├── apps/
│   └── web/                      # Next.js app (dashboard, editor, public pages)
├── packages/
│   ├── editor/                   # Tiptap extensions & editor toolkit
│   ├── ui/                       # Shared UI components
│   └── types/                    # Shared TypeScript types & Zod schemas
├── services/
│   └── collab/                   # y-websocket server (optional phase)
├── prisma/
│   ├── schema.prisma             # Prisma schema
│   └── migrations/               # Generated migrations
├── infra/
│   └── k8s/                      # Optional deployment manifests
├── docs/                         # Cross-cutting docs (kept concise; module docs live with code)
└── README.md
```

Module-specific docs should live alongside code (e.g., `apps/web/docs/`, `packages/editor/docs/`). Keep them synchronized with implementation.

---

## High-Level Architecture

```mermaid
flowchart LR
  subgraph Browser
    E[Tiptap Visual Builder]\n(React/Next)
    D[Dashboard]\n(Projects/Components)
    V[Viewer]\n(Published Page)
  end

  subgraph WebApp[Next.js App]
    API[/Route Handlers or tRPC/]
    AUTH[Auth (NextAuth)]
    UP[Upload Service]
  end

  subgraph Collab[Realtime Server]
    Y[Yjs WebSocket]
  end

  subgraph DB[(PostgreSQL)]
    PRISMA[(Prisma ORM)]
  end

  subgraph Storage[(Object Storage)]
    O[(S3/MinIO)]
  end

  E <--> API
  D <--> API
  V --> API
  E <--> Y
  API <--> PRISMA
  UP --> O
```

---

## Data Model (ERD – Draft)

```mermaid
erDiagram
  User ||--o{ Project : owns
  User ||--o{ Member : has
  Project ||--o{ Member : contains
  Project ||--o{ Document : contains
  Document ||--o{ DocumentVersion : versions
  Document ||--o{ SectionInstance : has
  ComponentType ||--o{ SectionInstance : instantiates
  ComponentType ||--o{ ComponentField : defines
  Document ||--o{ DocumentLink : links
  Document ||--o{ AssetRef : uses
  MediaAsset ||--o{ AssetRef : referenced_by
  PublishedPage ||--|| DocumentVersion : snapshots

  User {
    uuid id PK
    string email
    string name
  }

  Project {
    uuid id PK
    string name
    string slug UK
    jsonb settings
  }

  Member {
    uuid id PK
    uuid userId FK
    uuid projectId FK
    string role  // owner|admin|editor|viewer
  }

  Document {
    uuid id PK
    uuid projectId FK
    string title
    string slug UK
    string status  // draft|published|archived
    jsonb meta
  }

  DocumentVersion {
    uuid id PK
    uuid documentId FK
    int version
    jsonb content  // Tiptap JSON + section layout
    jsonb diff
    uuid createdBy FK
    timestamp createdAt
  }

  ComponentType {
    uuid id PK
    string key UK
    string name
    jsonb schema  // zod/jsonschema for props
    jsonb defaultConfig
    jsonb styleOptions
  }

  SectionInstance {
    uuid id PK
    uuid documentId FK
    uuid componentTypeId FK
    int position
    jsonb config
    jsonb content  // Tiptap content (if inline editor)
  }

  ComponentField {
    uuid id PK
    uuid componentTypeId FK
    string name
    string type
    boolean required
  }

  DocumentLink {
    uuid id PK
    uuid fromDocumentId FK
    uuid toDocumentId FK
    string relation
  }

  MediaAsset {
    uuid id PK
    uuid projectId FK
    string url
    string provider  // local|s3|gcs
    jsonb meta
  }

  AssetRef {
    uuid id PK
    uuid documentId FK
    uuid mediaAssetId FK
    string usage
  }

  PublishedPage {
    uuid id PK
    uuid documentVersionId FK
    string urlPath
    jsonb staticSnapshot
    timestamp publishedAt
  }
```

---

## Key Flows

### Authoring Flow

```mermaid
flowchart TD
  A[Open Editor] --> B[Create/Load Document]
  B --> C[Add Section]
  C --> D{Section Type?}
  D -->|Content| E[Inline Tiptap]
  D -->|Layout| F[Grid/Props Panel]
  E --> G[Autosave via API]
  F --> G
  G --> H{Collaborative?}
  H -->|Yes| I[Sync via Yjs]
  H -->|No| J[Local Save]
  I --> K[Version Snapshot]
  J --> K
  K --> L[Preview/Publish]
  L --> M[Publish Snapshot]
```

### Publish Flow

```mermaid
sequenceDiagram
  participant Editor
  participant API
  participant DB
  participant CDN
  Editor->>API: POST /documents/:id/publish
  API->>DB: Create DocumentVersion + PublishedPage
  API-->>Editor: 201 + URL
  API->>CDN: Invalidate path
```

---

## Component & Document Management (Dashboards)

- **Component Library Dashboard**: CRUD for `ComponentType` (schema, defaults, styles). Versioning and deprecation. Live preview panel.
- **Documents Dashboard**: Project-wise list, statuses (draft/published), interlinking overview, quick actions (edit, publish, preview, duplicate).
- **Project Settings**: Roles/permissions, environment config, storage provider per project.

---

## API Surface (Initial)

- **Projects**: create, list, update, delete
- **Documents**: create, read, update, delete, version, publish, link
- **Components**: register types, validate config, list, deprecate; instances CRUD via documents
- **Assets**: upload, list, attach to docs
- **Auth/RBAC**: NextAuth sessions + role check middleware

Implementation options:
- REST via Next.js Route Handlers, or
- tRPC routers for end-to-end type safety

---

## Editor Features (Phase-wise)

- **Phase 1**: Rich text (bold/italic/underline), lists, tables, images, links, code, headings; basic toolbar
- **Phase 2**: Sections grid, custom components library, drag-and-drop, props panel, style presets
- **Phase 3**: Forms (fields, validation), data-driven components, doc-to-doc links, snippets
- **Phase 4**: Collaboration (Yjs), comments/annotations, presence cursors
- **Phase 5**: Accessibility checks, SEO helpers for published pages

---

## Error Handling Policy (Robust)

- **Typed errors**: DomainError, ValidationError, AuthError, NotFoundError, ConflictError
- **HTTP mapping**: 400/401/403/404/409/422/429/500 with structured payload `{ error: { code, message, details, correlationId } }`
- **Validation**: Zod on all inputs; server-side re-validation of component configs
- **Logging**: Log start/end/error with correlation IDs; include minimal PII
- **User feedback**: Friendly toasts/modals; keep technical detail in logs only

---

## Debug & Console Logging Plan

- **Dev consoles**: Use `console.debug/info/warn/error` at key interaction points in dev builds
- **Structured logs**: Pino in API and editor business logic with context
- **Feature flags**: `DEBUG_VERBOSE=true` toggles additional consoles for deep tracing

---

## Documentation Discipline

- **Module-local docs**: Keep docs in each module (`apps/web/docs`, `packages/editor/docs`, etc.)
- **Flow charts**: Include Mermaid diagrams for key flows in every module doc
- **Doc/code parity**: Update docs as part of PRs; reviewers check docs match code

---

## Non-Functional Requirements

- **Security**: Session auth, CSRF, sanitization of embeds, CSP headers
- **Performance**: Incremental publishing, snapshot caching, lazy-load heavy tools
- **Observability**: Request timing, error rate dashboards, slow-query logging
- **Accessibility**: ARIA for editor UI, keyboard-first controls, proper semantics

---

## Developer Setup

### Prerequisites

- Node.js 20+
- An external PostgreSQL database (provide DATABASE_URL)

### Environment

Create `.env` in repo root (use your external DB URL):

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/doc_creator?schema=public"
NEXTAUTH_SECRET="replace-with-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
# S3-compatible (optional for prod)
STORAGE_PROVIDER="local" # local|s3
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="doc-creator"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
```

### Database & Prisma (npm)

```
npm install

# Generate Prisma client
npm run prisma:generate

# If you have migrations in prisma/migrations, apply them
npm run prisma:migrate:deploy

# If you have no migrations yet and want to sync schema
npm run prisma:db:push

# Optional: check DB connectivity
curl -s http://localhost:3000/api/health/db | jq
```

---

## Coding Standards

- **TypeScript-first**: Exported APIs and complex functions are explicitly typed
- **Zod validation**: Validate request and component configs
- **Guard clauses**: Early returns, avoid deep nesting
- **Meaningful names**: Prefer clarity over brevity
- **Comments**: Explain “why”, not “how”; keep code self-descriptive
- **Logging**: Add structured logs at key operations (start/end/error)

---

## Roadmap & Milestones

1) **Foundation (Week 1-2)**
- Scaffold monorepo (apps/web, packages/editor, packages/ui, packages/types)
- Infra: Dockerized Postgres; Prisma schema v1 (Users, Projects, Documents, Versions, Components, Assets)
- Next.js app boot with auth shell; basic REST/tRPC skeleton; Pino logger

2) **Tiptap Core (Week 2-3)**
- Tiptap editor page with core nodes/marks and toolbar
- Persist/load Tiptap JSON via API
- Publish draft: snapshot static render to PublishedPage

3) **Components Library (Week 3-4)**
- ComponentType registry (schema, defaults, style options)
- SectionInstance CRUD and drag-and-drop layout grid
- Props panel with Zod-driven forms

4) **Projects & Interlinking (Week 4-5)**
- Project-level dashboards, roles/permissions
- Document linking + cross-doc search
- Media library and uploads

5) **Collaboration & Versioning (Week 5-6)**
- Yjs realtime editing; presence/basic comments
- Version history with diffs and rollback

6) **Polish & Launch (Week 6-7)**
- A11y/SEO checks, analytics, rate limits, CDN caching
- CI/CD, backups, migration safety
- Documentation pass per module with matching diagrams

Each milestone closes with tests, docs, and a deployable tag.

---

## Open Decisions (to confirm)

- API style: **REST vs tRPC** (default: tRPC for type safety)
- Realtime in v1: **Enable Yjs** or defer to v1.1
- Storage provider: **Local/MinIO in dev; S3 in prod**
- Auth providers: **Email magic link + GitHub OAuth**
- Component theming: Tailwind tokens + CSS variables

Please confirm these choices before implementation.

---

## License

TBD.
