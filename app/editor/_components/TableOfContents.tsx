"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { List, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

/**
 * Table of Contents - Auto-generates from headings
 * Features:
 * - Auto-detects headings (h1-h6)
 * - Click to navigate
 * - Updates automatically as document changes
 * - Shows hierarchy with indentation
 */

export interface TOCItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export interface TableOfContentsProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TableOfContents(props: TableOfContentsProps) {
  const { editor, open, onOpenChange } = props;
  const [items, setItems] = React.useState<TOCItem[]>([]);

  // Extract headings from editor content
  const extractHeadings = React.useCallback(() => {
    if (!editor) return [];

    const { doc } = editor.state;
    const headings: TOCItem[] = [];
    let idCounter = 0;

    doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        const level = node.attrs.level || 1;
        const text = node.textContent || "";
        if (text.trim()) {
          headings.push({
            id: `heading-${idCounter++}`,
            level,
            text: text.trim(),
            pos,
          });
        }
      }
      return true;
    });

    return headings;
  }, [editor]);

  // Update TOC when editor content changes
  React.useEffect(() => {
    if (!editor || !open) return;

    const updateTOC = () => {
      const newItems = extractHeadings();
      setItems(newItems);
      console.debug("[TOC] Updated", newItems.length, "headings");
    };

    // Initial update
    updateTOC();

    // Listen for updates
    editor.on("update", updateTOC);
    editor.on("selectionUpdate", updateTOC);

    return () => {
      editor.off("update", updateTOC);
      editor.off("selectionUpdate", updateTOC);
    };
  }, [editor, open, extractHeadings]);

  // Navigate to heading
  const jumpToHeading = React.useCallback((item: TOCItem) => {
    if (!editor) return;
    try {
      editor.chain().focus().setTextSelection(item.pos).run();
      // Scroll into view
      const { view } = editor;
      const coords = view.coordsAtPos(item.pos);
      const editorElement = view.dom.closest('.ProseMirror');
      if (editorElement) {
        editorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      console.debug("[TOC] Jumped to", item.text, "at pos", item.pos);
    } catch (error) {
      console.error("[TOC] Jump error", error);
    }
  }, [editor]);

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-80 border-l border-zinc-200 bg-white shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-zinc-600" />
          <h2 className="font-semibold text-zinc-900">Table of Contents</h2>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="rounded p-1 hover:bg-zinc-100"
        >
          <span className="text-zinc-500">✕</span>
        </button>
      </div>

      {/* TOC List */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <List className="h-12 w-12 text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500">No headings found</p>
            <p className="mt-1 text-xs text-zinc-400">Add headings to generate TOC</p>
          </div>
        ) : (
          <nav className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => jumpToHeading(item)}
                className={clsx(
                  "w-full text-left rounded px-3 py-2 hover:bg-zinc-100 transition-all flex items-start gap-2 group",
                  item.level === 1 && "font-semibold text-zinc-900",
                  item.level === 2 && "font-medium text-zinc-800",
                  item.level >= 3 && "text-sm text-zinc-700"
                )}
                style={{
                  paddingLeft: `${12 + (item.level - 1) * 16}px`,
                }}
              >
                <ChevronRight className={clsx(
                  "h-4 w-4 text-zinc-400 mt-0.5 transition-transform group-hover:translate-x-0.5",
                  item.level === 1 && "opacity-100",
                  item.level === 2 && "opacity-75",
                  item.level >= 3 && "opacity-50"
                )} />
                <span className="flex-1 truncate">{item.text}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
