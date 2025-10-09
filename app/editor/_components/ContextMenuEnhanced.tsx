/**
 * Enhanced Right-Click Context Menu
 * Context-aware menu with icons and keyboard shortcuts
 */

"use client";

import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  ChevronRight,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

export interface ContextMenuEnhancedProps {
  editor: Editor | null;
  children: React.ReactNode;
  onInsertImage?: () => void;
  onInsertLink?: () => void;
}

export default function ContextMenuEnhanced(props: ContextMenuEnhancedProps) {
  const { editor, children, onInsertImage, onInsertLink } = props;

  if (!editor) {
    return <>{children}</>;
  }

  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[220px] overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          sideOffset={5}
        >
          {/* Formatting */}
          <ContextMenu.Label className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Format
          </ContextMenu.Label>

          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
            <span className="flex-1">Bold</span>
            <span className="text-xs text-zinc-500">⌘B</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
            <span className="flex-1">Italic</span>
            <span className="text-xs text-zinc-500">⌘I</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline className="h-4 w-4" />
            <span className="flex-1">Underline</span>
            <span className="text-xs text-zinc-500">⌘U</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
            <span className="flex-1">Strikethrough</span>
            <span className="text-xs text-zinc-500">⌘⇧X</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Alignment */}
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800">
              <AlignLeft className="h-4 w-4" />
              <span className="flex-1">Align</span>
              <ChevronRight className="h-4 w-4" />
            </ContextMenu.SubTrigger>

            <ContextMenu.Portal>
              <ContextMenu.SubContent
                className="min-w-[180px] overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                sideOffset={8}
              >
                <ContextMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
                  onSelect={() => editor.chain().focus().setTextAlign("left").run()}
                >
                  <AlignLeft className="h-4 w-4" />
                  Left
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
                  onSelect={() => editor.chain().focus().setTextAlign("center").run()}
                >
                  <AlignCenter className="h-4 w-4" />
                  Center
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
                  onSelect={() => editor.chain().focus().setTextAlign("right").run()}
                >
                  <AlignRight className="h-4 w-4" />
                  Right
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
                  onSelect={() => editor.chain().focus().setTextAlign("justify").run()}
                >
                  <AlignJustify className="h-4 w-4" />
                  Justify
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          {/* Indent/Outdent */}
          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => {
              if (editor.isActive("listItem")) {
                editor.chain().focus().sinkListItem("listItem").run();
              }
            }}
            disabled={!editor.isActive("listItem")}
          >
            <Indent className="h-4 w-4" />
            <span className="flex-1">Increase Indent</span>
            <span className="text-xs text-zinc-500">Tab</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => {
              if (editor.isActive("listItem")) {
                editor.chain().focus().liftListItem("listItem").run();
              }
            }}
            disabled={!editor.isActive("listItem")}
          >
            <Outdent className="h-4 w-4" />
            <span className="flex-1">Decrease Indent</span>
            <span className="text-xs text-zinc-500">⇧Tab</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Edit Actions */}
          <ContextMenu.Label className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Edit
          </ContextMenu.Label>

          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => document.execCommand("copy")}
          >
            <Copy className="h-4 w-4" />
            <span className="flex-1">Copy</span>
            <span className="text-xs text-zinc-500">⌘C</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => document.execCommand("cut")}
          >
            <Scissors className="h-4 w-4" />
            <span className="flex-1">Cut</span>
            <span className="text-xs text-zinc-500">⌘X</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => document.execCommand("paste")}
          >
            <Clipboard className="h-4 w-4" />
            <span className="flex-1">Paste</span>
            <span className="text-xs text-zinc-500">⌘V</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Insert */}
          <ContextMenu.Label className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Insert
          </ContextMenu.Label>

          {onInsertLink && (
            <ContextMenu.Item
              className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
              onSelect={onInsertLink}
            >
              <LinkIcon className="h-4 w-4" />
              <span className="flex-1">Link</span>
              <span className="text-xs text-zinc-500">⌘K</span>
            </ContextMenu.Item>
          )}

          {onInsertImage && (
            <ContextMenu.Item
              className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
              onSelect={onInsertImage}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="flex-1">Image</span>
              <span className="text-xs text-zinc-500">⌘⌥I</span>
            </ContextMenu.Item>
          )}

          <ContextMenu.Item
            className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
            onSelect={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
          >
            <TableIcon className="h-4 w-4" />
            <span className="flex-1">Table</span>
            <span className="text-xs text-zinc-500">⌘⌥T</span>
          </ContextMenu.Item>

          {editor.state.selection.empty && (
            <>
              <ContextMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

              {/* Delete (only when something is selected) */}
              <ContextMenu.Item
                className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-950"
                onSelect={() => editor.chain().focus().deleteSelection().run()}
              >
                <Trash2 className="h-4 w-4" />
                <span className="flex-1">Delete</span>
                <span className="text-xs">⌫</span>
              </ContextMenu.Item>
            </>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}