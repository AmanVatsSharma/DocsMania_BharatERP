/**
 * Left Sidebar with Sliding Sheet Animation
 * Collapsible, resizable, with hover-to-expand
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  FileText,
  Search,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useEditorUI } from "@/lib/store/editorUI";
import { slideVariants, transitions } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import * as Tabs from "@radix-ui/react-tabs";

export interface LeftSidebarSlidingProps {
  components: Array<{ key: string; name: string; category?: string; defaultConfig?: any }>;
  libraryQuery: string;
  onLibraryQueryChange: (query: string) => void;
  onDragStartComponent: (e: React.DragEvent, component: any) => void;
  onOutlineJump: (pos: number) => void;
  onOutlineMove: (pos: number, direction: "up" | "down") => void;
  outlineItems: Array<{ index: number; preview: string; pos: number }>;
  activeTab: "library" | "outline";
  onChangeTab: (tab: "library" | "outline") => void;
  width?: number;
  onMouseDownResizer?: (e: React.MouseEvent) => void;
}

export default function LeftSidebarSliding(props: LeftSidebarSlidingProps) {
  const {
    components,
    libraryQuery,
    onLibraryQueryChange,
    onDragStartComponent,
    onOutlineJump,
    onOutlineMove,
    outlineItems,
    activeTab,
    onChangeTab,
    width = 280,
    onMouseDownResizer,
  } = props;

  const { 
    leftSidebarOpen, 
    leftSidebarCollapsed,
    setLeftSidebarOpen,
    setLeftSidebarCollapsed,
  } = useEditorUI();

  const [isHovering, setIsHovering] = useState(false);

  // Filter components by search
  const filteredComponents = React.useMemo(() => {
    if (!libraryQuery) return components;
    const query = libraryQuery.toLowerCase();
    return components.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.key.toLowerCase().includes(query) ||
        c.category?.toLowerCase().includes(query)
    );
  }, [components, libraryQuery]);

  // Group components by category
  const groupedComponents = React.useMemo(() => {
    const groups: Record<string, typeof components> = {};
    filteredComponents.forEach((comp) => {
      const category = comp.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(comp);
    });
    return groups;
  }, [filteredComponents]);

  // Collapsed state: show only icons
  if (leftSidebarCollapsed) {
    return (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 60, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={transitions.smooth}
        className="relative flex h-full flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Collapsed Icons */}
        <div className="flex flex-col gap-2 p-2">
          <button
            onClick={() => {
              setLeftSidebarCollapsed(false);
              onChangeTab("library");
            }}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
              activeTab === "library"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
            title="Component Library"
          >
            <Library className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              setLeftSidebarCollapsed(false);
              onChangeTab("outline");
            }}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
              activeTab === "outline"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
            title="Document Outline"
          >
            <FileText className="h-5 w-5" />
          </button>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setLeftSidebarCollapsed(false)}
          className="mt-auto p-2"
        >
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        </button>

        {/* Hover preview */}
        <AnimatePresence>
          {isHovering && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={transitions.fast}
              className="absolute left-full top-0 z-50 ml-2 w-64 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {activeTab === "library" ? "Component Library" : "Document Outline"}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Click to expand sidebar
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Expanded state: full sidebar
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={transitions.smooth}
      style={{ width }}
      className="relative flex h-full flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {activeTab === "library" ? "Components" : "Outline"}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLeftSidebarCollapsed(true)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLeftSidebarOpen(false)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(v) => onChangeTab(v as any)} className="flex flex-1 flex-col overflow-hidden">
        <Tabs.List className="flex border-b border-zinc-200 dark:border-zinc-800">
          <Tabs.Trigger
            value="library"
            className={cn(
              "flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "library"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            )}
          >
            <Library className="h-4 w-4" />
            Library
          </Tabs.Trigger>
          <Tabs.Trigger
            value="outline"
            className={cn(
              "flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "outline"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            )}
          >
            <FileText className="h-4 w-4" />
            Outline
          </Tabs.Trigger>
        </Tabs.List>

        {/* Library Tab */}
        <Tabs.Content value="library" className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            {/* Search */}
            <div className="border-b border-zinc-200 p-3 dark:border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={libraryQuery}
                  onChange={(e) => onLibraryQueryChange(e.target.value)}
                  placeholder="Search components..."
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>

            {/* Components List */}
            <div className="flex-1 overflow-y-auto p-3">
              {Object.entries(groupedComponents).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {items.map((component) => (
                      <div
                        key={component.key}
                        draggable
                        onDragStart={(e) => onDragStartComponent(e, component)}
                        className="group cursor-move rounded-lg border border-zinc-200 bg-white p-3 text-sm transition-all hover:border-blue-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
                      >
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {component.name}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {component.key}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredComponents.length === 0 && (
                <div className="py-8 text-center text-sm text-zinc-500">
                  No components found
                </div>
              )}
            </div>
          </div>
        </Tabs.Content>

        {/* Outline Tab */}
        <Tabs.Content value="outline" className="flex-1 overflow-y-auto p-3">
          {outlineItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No sections yet
            </div>
          ) : (
            <div className="space-y-1">
              {outlineItems.map((item) => (
                <div
                  key={item.index}
                  className="group flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <button
                    onClick={() => onOutlineJump(item.pos)}
                    className="flex-1 truncate text-left text-zinc-700 dark:text-zinc-300"
                  >
                    {item.preview}
                  </button>
                  <div className="flex opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => onOutlineMove(item.pos, "up")}
                      className="rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      title="Move up"
                    >
                      <ChevronLeft className="h-3 w-3 rotate-90" />
                    </button>
                    <button
                      onClick={() => onOutlineMove(item.pos, "down")}
                      className="rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      title="Move down"
                    >
                      <ChevronRight className="h-3 w-3 rotate-90" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>

      {/* Resizer */}
      {onMouseDownResizer && (
        <div
          onMouseDown={onMouseDownResizer}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500"
        />
      )}
    </motion.div>
  );
}