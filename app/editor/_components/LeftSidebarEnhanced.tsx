"use client";

import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Collapsible from "@radix-ui/react-collapsible";
import { 
  Library, ListTree, Search, ChevronDown, ChevronRight, 
  Sparkles, Box, Plus, Star, Grid3x3
} from "lucide-react";
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
  isCustom?: boolean;
}

export interface LeftSidebarEnhancedProps {
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

const categoryConfig = {
  Layout: { icon: "📐", color: "bg-blue-100 text-blue-700" },
  Content: { icon: "📝", color: "bg-green-100 text-green-700" },
  Interactive: { icon: "🎯", color: "bg-purple-100 text-purple-700" },
  Media: { icon: "🎬", color: "bg-orange-100 text-orange-700" },
  Data: { icon: "📊", color: "bg-cyan-100 text-cyan-700" },
  Special: { icon: "✨", color: "bg-pink-100 text-pink-700" },
  Custom: { icon: "🎨", color: "bg-indigo-100 text-indigo-700" },
};

export default function LeftSidebarEnhanced(props: LeftSidebarEnhancedProps) {
  const {
    width,
    onMouseDownResizer,
    components,
    libraryQuery,
    onLibraryQueryChange,
    onDragStartComponent,
    onOutlineJump,
    outlineItems,
    activeTab,
    onChangeTab,
  } = props;

  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const q = libraryQuery.toLowerCase();
    if (!q) return components;
    
    return components.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.key.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.tags?.some((t) => t.toLowerCase().includes(q))
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

  const toggleCategory = (category: string) => {
    const newSet = new Set(collapsedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setCollapsedCategories(newSet);
  };

  return (
    <div
      style={{ width }}
      className="relative flex flex-col border-r border-zinc-200 bg-gradient-to-b from-white to-zinc-50/30"
    >
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <Tabs.Root value={activeTab} onValueChange={(v) => onChangeTab(v as any)}>
          <Tabs.List className="flex p-2 gap-1">
            <Tabs.Trigger
              value="library"
              className={clsx(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                activeTab === "library"
                  ? "bg-purple-100 text-purple-700 shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <Library className="h-4 w-4" />
              <span>Library</span>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="outline"
              className={clsx(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                activeTab === "outline"
                  ? "bg-purple-100 text-purple-700 shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <ListTree className="h-4 w-4" />
              <span>Outline</span>
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      {/* Content */}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full w-full">
          {activeTab === "library" ? (
            <div className="p-3">
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={libraryQuery}
                  onChange={(e) => onLibraryQueryChange(e.target.value)}
                  placeholder="Search blocks..."
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm transition-all placeholder:text-zinc-400 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Stats */}
              <div className="mb-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <Grid3x3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {filtered.length} Components
                    </div>
                    <div className="text-xs text-zinc-500">
                      {Object.keys(categorized).length} categories
                    </div>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>

              {/* Components by Category */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-zinc-100 p-4">
                    <Search className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-zinc-900">
                    No components found
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(categorized).map(([category, items]) => (
                    <Collapsible.Root
                      key={category}
                      open={!collapsedCategories.has(category)}
                      onOpenChange={() => toggleCategory(category)}
                    >
                      {/* Category Header */}
                      <Collapsible.Trigger className="group flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-zinc-100">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-data-[state=open]:rotate-90" />
                          <span className="text-2xl">
                            {categoryConfig[category as keyof typeof categoryConfig]?.icon || "🧩"}
                          </span>
                          <span className="text-sm font-semibold text-zinc-700">
                            {category}
                          </span>
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
                            {items.length}
                          </span>
                        </div>
                      </Collapsible.Trigger>

                      {/* Category Items */}
                      <Collapsible.Content className="mt-2 space-y-2">
                        {items.map((component) => (
                          <ComponentCard
                            key={component.key}
                            component={component}
                            onDragStart={(e) => onDragStartComponent(e, component)}
                          />
                        ))}
                      </Collapsible.Content>
                    </Collapsible.Root>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <OutlineView items={outlineItems} onJump={onOutlineJump} />
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="flex w-2 touch-none select-none p-0.5"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-zinc-300 transition-colors hover:bg-zinc-400" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Resizer */}
      <div
        onMouseDown={onMouseDownResizer}
        className="group absolute right-0 top-0 h-full w-1 cursor-ew-resize hover:bg-purple-400"
      >
        <div className="absolute right-0 top-1/2 h-12 w-1 -translate-y-1/2 rounded-full bg-zinc-300 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

function ComponentCard({
  component,
  onDragStart,
}: {
  component: ComponentDef;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={clsx(
        "group relative cursor-move rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:border-purple-300 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      {/* Custom Badge */}
      {component.isCustom && (
        <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
          Custom
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon/Thumbnail */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200">
          {component.thumbnailUrl ? (
            <img
              src={component.thumbnailUrl}
              alt={component.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Box className="h-6 w-6 text-zinc-400" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-zinc-900">
            {component.name}
          </h3>
          {component.description && (
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {component.description}
            </p>
          )}
          {component.tags && component.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {component.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag Indicator */}
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600/90 to-blue-600/90 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="text-xs font-medium text-white">Drag to add</div>
      </div>
    </div>
  );
}

function OutlineView({
  items,
  onJump,
}: {
  items: Array<{ index: number; preview: string; pos: number }>;
  onJump: (pos: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-zinc-100 p-4">
          <ListTree className="h-8 w-8 text-zinc-400" />
        </div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-900">
          No sections yet
        </h3>
        <p className="text-xs text-zinc-500">
          Start adding components to see the outline
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-1">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onJump(item.pos)}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-purple-50"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-100 text-xs font-medium text-zinc-600 group-hover:bg-purple-100 group-hover:text-purple-700">
            {idx + 1}
          </div>
          <span className="flex-1 truncate text-sm text-zinc-700 group-hover:text-purple-900">
            {item.preview || "Section"}
          </span>
        </button>
      ))}
    </div>
  );
}
