import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { logger } from "../logger";

export type DocsIndexItem = {
  id: string; // stable hash-ish id derived from path
  project: string; // derived from top-level folder under docs/ or app/**/docs/
  slug: string[]; // path segments without extension
  filePath: string; // absolute
  title: string; // from frontmatter or first h1 or filename
  description?: string;
  tags: string[];
  headings: Array<{ depth: number; text: string; slug: string }>;
  updatedAt: number; // mtimeMs
};

export type DocsIndex = {
  items: DocsIndexItem[];
  projects: string[];
  tags: string[];
  generatedAt: number;
};

let inMemoryIndex: DocsIndex | null = null;

function toKebab(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function deriveProject(root: string, absoluteFile: string): string {
  const rel = path.relative(root, absoluteFile);
  const parts = rel.split(path.sep);
  if (parts[0] === "docs") {
    return parts[1] ?? "root";
  }
  const docsIdx = parts.findIndex((p) => p === "docs");
  const candidate = docsIdx > 0 ? parts[docsIdx - 1] : null;
  return candidate ?? "app";
}

function extractHeadings(content: string): Array<{ depth: number; text: string; slug: string }> {
  const lines = content.split(/\r?\n/);
  const headings: Array<{ depth: number; text: string; slug: string }> = [];
  for (const line of lines) {
    const m = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (m) {
      const depth = m[1].length;
      const text = m[2].trim();
      headings.push({ depth, text, slug: toKebab(text) });
    }
  }
  return headings;
}

export async function buildDocsIndex(workspaceRoot: string): Promise<DocsIndex> {
  const startedAt = Date.now();
  logger.info("docs:indexer:start", { workspaceRoot });
  try {
    const patterns = [
      "docs/**/*.md",
      "docs/**/*.mdx",
      "app/**/docs/**/*.md",
      "app/**/docs/**/*.mdx",
    ];
    const files = await fg(patterns, { cwd: workspaceRoot, absolute: true, dot: false, followSymbolicLinks: true });

    const items: DocsIndexItem[] = [];

    for (const filePath of files) {
      try {
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) continue;
        const raw = await fs.readFile(filePath, "utf8");
        const parsed = matter(raw);
        const fm = (parsed.data ?? {}) as Record<string, unknown>;
        const headings = extractHeadings(parsed.content);
        const fileRel = path.relative(workspaceRoot, filePath);
        const withoutExt = fileRel.replace(/\.(md|mdx)$/i, "");
        const slug = withoutExt.split(path.sep).filter(Boolean).slice(withoutExt.startsWith("docs/") ? 1 : 0);
        const project = deriveProject(workspaceRoot, filePath);
        const titleFromH1 = headings.find((h) => h.depth === 1)?.text;
        const filename = path.basename(filePath).replace(/\.(md|mdx)$/i, "");
        const id = toKebab(withoutExt);

        const item: DocsIndexItem = {
          id,
          project,
          slug,
          filePath,
          title: String((fm.title as string) ?? titleFromH1 ?? filename),
          description: (fm.description as string) || undefined,
          tags: Array.isArray(fm.tags)
            ? (fm.tags as unknown[]).map(String)
            : typeof fm.tags === "string"
            ? String(fm.tags)
                .split(/[,\s]+/)
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          headings,
          updatedAt: stat.mtimeMs,
        };
        items.push(item);
      } catch (err) {
        logger.warn("docs:indexer:file_error", { filePath, err: (err as Error)?.message });
      }
    }

    const projects = Array.from(new Set(items.map((i) => i.project))).sort();
    const tags = Array.from(new Set(items.flatMap((i) => i.tags))).sort();

    const index: DocsIndex = {
      items: items.sort((a, b) => a.title.localeCompare(b.title)),
      projects,
      tags,
      generatedAt: Date.now(),
    };

    inMemoryIndex = index;
    logger.info("docs:indexer:complete", { durationMs: Date.now() - startedAt, files: items.length });
    return index;
  } catch (error) {
    logger.error("docs:indexer:fatal", { error: (error as Error)?.message });
    throw error;
  }
}

export function getDocsIndex(): DocsIndex | null {
  return inMemoryIndex;
}

export async function ensureDocsIndex(workspaceRoot: string): Promise<DocsIndex> {
  if (inMemoryIndex) return inMemoryIndex;
  return await buildDocsIndex(workspaceRoot);
}


