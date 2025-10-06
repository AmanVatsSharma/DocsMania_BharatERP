"use client";

import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Library, ListTree } from "lucide-react";
import { clsx } from "clsx";

export interface ComponentDef {
  key: string;
  name: string;
  defaultConfig: any;
  schema?: Record<string, any>;
  category?: string;
  thumbnailUrl?: string;
  description?: string;
  tags?: string[];
}

export interface LeftSidebarProps {
  width: number;
  onMouseDownResizer: (e: React.MouseEvent) => void;
  components: ComponentDef[];
  libraryQuery: string;
  onLibraryQueryChange: (v: string) => void;
  onDragStartComponent: (e: React.DragEvent, c: ComponentDef) => void;
  onOutlineJump: (pos: number) => void;
  onOutlineMove?: (pos: number, dir: -1 | 1) => void;
  outlineItems: Array<{ index: number; preview: string; pos: number }>;
  activeTab: "library" | "outline";
  onChangeTab: (tab: "library" | "outline") => void;
}

/**
 * Get icon emoji for category
 */
function getCategoryIcon(category?: string): string {
  const icons: Record<string, string> = {
    Layout: "📐",
    Content: "📝",
    Interactive: "🎯",
    Media: "🎬",
    Data: "📊",
    Special: "✨",
  };
  return icons[category || ""] || "🧩";
}

/**
 * High-polish left sidebar with Library and Outline tabs.
 * - Library: grid of component cards, draggable to canvas
 * - Outline: navigable section list
 */
export default function LeftSidebar(props: LeftSidebarProps) {
  const {
    width,
    onMouseDownResizer,
    components,
    libraryQuery,
    onLibraryQueryChange,
    onDragStartComponent,
    onOutlineJump,
    onOutlineMove,
    outlineItems,
    activeTab,
    onChangeTab,
  } = props;

  const filtered = React.useMemo(() => {
    const q = libraryQuery.toLowerCase();
    return components.filter((c) => 
      c.name.toLowerCase().includes(q) || 
      c.key.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [components, libraryQuery]);

  // Group by category
  const categorized = React.useMemo(() => {
    const groups: Record<string, ComponentDef[]> = {};
    filtered.forEach((c) => {
      const cat = c.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });
    return groups;
  }, [filtered]);

  return (
    <div style={{ width }} className="relative bg-white dc-panel">
      <Tabs.Root value={activeTab} onValueChange={(v) => onChangeTab(v as any)}>
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
          <button
            type="button"
            onClick={() => onChangeTab("library")}
            className={clsx(
              "inline-flex items-center gap-1 rounded px-2 py-1 text-sm",
              activeTab === "library" ? "bg-zinc-100 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <Library className="h-4 w-4" /> Library
          </button>
          <button
            type="button"
            onClick={() => onChangeTab("outline")}
            className={clsx(
              "inline-flex items-center gap-1 rounded px-2 py-1 text-sm",
              activeTab === "outline" ? "bg-zinc-100 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <ListTree className="h-4 w-4" /> Outline
          </button>
        </div>

        {activeTab === "library" && (
          <div className="p-3">
            <input
              placeholder="🔍 Search blocks & templates…"
              value={libraryQuery}
              onChange={(e) => onLibraryQueryChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-shadow focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
            />
            <ScrollArea.Root className="mt-3 h-[calc(100vh-180px)] overflow-hidden">
              <ScrollArea.Viewport className="h-full w-full">
                <div className="space-y-4">
                  {Object.entries(categorized).map(([category, items]) => (
                    <div key={category}>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-px flex-1 bg-zinc-200" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{category}</span>
                        <div className="h-px flex-1 bg-zinc-200" />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {items.map((c) => (
                          <button
                            key={c.key}
                            draggable
                            onDragStart={(e) => onDragStartComponent(e, c)}
                            className="group relative flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left text-sm shadow-sm transition-all hover:border-zinc-300 hover:shadow-md active:scale-[0.98]"
                            title={c.description}
                          >
                            <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-zinc-100 to-zinc-200" aria-hidden>
                              {c.thumbnailUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xl">
                                  {getCategoryIcon(c.category)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-semibold text-zinc-900">{c.name}</div>
                              {c.description && (
                                <div className="truncate text-xs text-zinc-500">{c.description}</div>
                              )}
                              {c.tags && c.tags.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {c.tags.slice(0, 2).map((tag) => (
                                    <span key={tag} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <div className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-white">Drag</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" className="flex w-2 touch-none select-none p-0.5">
                <ScrollArea.Thumb className="relative flex-1 rounded-full bg-zinc-300" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>
        )}

        {activeTab === "outline" && (
          <ScrollArea.Root className="h-[calc(100vh-100px)] overflow-hidden">
            <ScrollArea.Viewport className="h-full w-full">
              <ul className="space-y-1 p-3">
                {outlineItems.map((s) => (
                  <li key={s.pos} className="flex items-center gap-1">
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            console.info("[LeftSidebar] Jump to", s.pos);
                            onOutlineJump(s.pos);
                          } catch (e) {
                            console.error("[LeftSidebar] Outline nav error", e);
                          }
                        }}
                        className="w-full truncate rounded-md border px-2 py-1.5 text-left text-sm hover:bg-zinc-50"
                      >
                        {s.index + 1}. {s.preview}
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button title="Move up" className="rounded border border-[var(--border)] px-2 py-1 text-xs" onClick={() => onOutlineMove?.(s.pos, -1)}>↑</button>
                      <button title="Move down" className="rounded border border-[var(--border)] px-2 py-1 text-xs" onClick={() => onOutlineMove?.(s.pos, 1)}>↓</button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="flex w-2 touch-none select-none p-0.5">
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-zinc-300" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        )}
      </Tabs.Root>

      {/* Resizer */}
      <div
        onMouseDown={onMouseDownResizer}
        style={{ right: -3 }}
        className="absolute top-0 h-full w-1.5 cursor-col-resize"
      />
    </div>
  );
}


