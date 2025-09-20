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

