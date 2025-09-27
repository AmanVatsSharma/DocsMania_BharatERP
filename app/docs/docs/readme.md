---
title: Docs Hub README
tags: [readme]
description: Maintainer guide for the Docs hub module.
---

# Docs Hub README

## Overview

The Docs Hub provides a searchable, filterable interface over markdown documentation stored in `docs/**` and `app/**/docs/**`.

## Structure

- UI: `app/docs/*`
- Indexer: `lib/docs/indexer.ts`
- APIs: `/api/docs/index`, `/api/docs/reindex`, `/api/docs/raw`

## Theming

UI uses Tailwind v4 and global CSS tokens from `app/globals.css` so it aligns with the rest of the app.

## Notes

- Re-index after adding or moving docs files.
- Frontmatter is optional; title falls back to H1 or filename.


