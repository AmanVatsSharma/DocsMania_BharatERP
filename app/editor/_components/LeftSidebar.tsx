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
    return components.filter((c) => c.name.toLowerCase().includes(q) || c.key.toLowerCase().includes(q));
  }, [components, libraryQuery]);

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
              placeholder="Search components…"
              value={libraryQuery}
              onChange={(e) => onLibraryQueryChange(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
            <ScrollArea.Root className="mt-3 h-[calc(100vh-180px)] overflow-hidden">
              <ScrollArea.Viewport className="h-full w-full">
                <div className="grid grid-cols-1 gap-2">
                  {filtered.map((c) => (
                    <button
                      key={c.key}
                      draggable
                      onDragStart={(e) => onDragStartComponent(e, c)}
                      className="group flex items-center gap-3 rounded-md border border-[var(--border)] p-2 text-left text-sm hover:bg-zinc-50 active:scale-[0.99]"
                    >
                      <div className="h-8 w-12 shrink-0 overflow-hidden rounded bg-zinc-100" aria-hidden>
                        {c.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-zinc-900">{c.name}</div>
                        <div className="truncate text-xs text-zinc-500">{c.key}</div>
                      </div>
                    </button>
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


