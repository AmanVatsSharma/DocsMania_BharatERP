"use client";

import React from "react";
import Fuse from "fuse.js";

type Item = {
  id: string;
  title: string;
  project: string;
  tags: string[];
  slug: string[];
};

export function Sidebar({
  items,
  projects,
  tags,
  activeSlug,
  onSelect,
}: {
  items: Item[];
  projects: string[];
  tags: string[];
  activeSlug?: string[];
  onSelect: (slug: string[]) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [project, setProject] = React.useState<string>("all");
  const [tag, setTag] = React.useState<string>("all");

  const fuse = React.useMemo(
    () =>
      new Fuse(items, {
        includeScore: true,
        threshold: 0.3,
        keys: ["title", "project", "tags"],
      }),
    [items]
  );

  const filtered = React.useMemo(() => {
    let pool = items;
    if (project !== "all") pool = pool.filter((i) => i.project === project);
    if (tag !== "all") pool = pool.filter((i) => i.tags.includes(tag));
    if (!query) return pool.slice(0, 500);
    return fuse.search(query).map((r) => r.item);
  }, [items, project, tag, query, fuse]);

  return (
    <aside className="w-80 shrink-0 border-r border-[var(--border)] bg-white">
      <div className="p-3 border-b border-[var(--border)]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs…"
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <div className="mt-2 flex gap-2">
          <select value={project} onChange={(e) => setProject(e.target.value)} className="flex-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs">
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="flex-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs">
            <option value="all">All Tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
        <ul className="p-2">
          {filtered.map((i) => {
            const isActive = activeSlug && JSON.stringify(activeSlug) === JSON.stringify(i.slug);
            return (
              <li key={i.id}>
                <button
                  onClick={() => onSelect(i.slug)}
                  className={`w-full text-left px-2 py-1.5 rounded ${isActive ? "bg-zinc-900 text-white" : "hover:bg-zinc-50"}`}
                  title={i.title}
                >
                  <div className={`text-sm font-medium truncate ${isActive ? "text-white" : ""}`}>{i.title}</div>
                  <div className={`text-xs truncate ${isActive ? "text-zinc-200" : "text-zinc-500"}`}>
                    {i.project} {i.tags.length ? `• ${i.tags.join(", ")}` : ""}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}


