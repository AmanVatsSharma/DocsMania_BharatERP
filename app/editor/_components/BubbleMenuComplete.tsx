/**
 * Complete Modern Bubble Menu
 * ALL formatting features from old Toolbar + Context Menu
 * But with modern, beautiful, clean UI
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Highlighter,
  Palette,
  MoreHorizontal,
  Sparkles,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scaleVariants, transitions } from "@/lib/animations";
import * as Popover from "@radix-ui/react-popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export interface BubbleMenuCompleteProps {
  editor: Editor | null;
  onToggleLink?: () => void;
}

const COLORS = [
  { name: "Default", value: null },
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", value: null },
  { name: "Yellow", value: "#fef3c7" },
  { name: "Green", value: "#d1fae5" },
  { name: "Blue", value: "#dbeafe" },
  { name: "Purple", value: "#e9d5ff" },
  { name: "Pink", value: "#fce7f3" },
  { name: "Red", value: "#fee2e2" },
  { name: "Orange", value: "#ffedd5" },
];

export default function BubbleMenuComplete({ editor, onToggleLink }: BubbleMenuCompleteProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { state } = editor;
      const { selection } = state;
      const { from, to, empty } = selection;

      if (empty || from === to) {
        setShow(false);
        return;
      }

      const isTextSelection = state.selection.$from.parent.inlineContent;
      if (!isTextSelection) {
        setShow(false);
        return;
      }

      // Calculate position with viewport bounds checking
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      let top = start.top - 60 + window.scrollY;
      let left = (start.left + end.left) / 2 - 300;

      // Keep in viewport
      if (left < 10) left = 10;
      if (left + 600 > window.innerWidth) left = window.innerWidth - 610;
      if (top < 10) top = end.bottom + 10 + window.scrollY;

      setPosition({ top, left });
      setShow(true);
    };

    editor.on('selectionUpdate', updateMenu);
    editor.on('transaction', updateMenu);

    return () => {
      editor.off('selectionUpdate', updateMenu);
      editor.off('transaction', updateMenu);
    };
  }, [editor]);

  if (!editor || !show) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={transitions.fast}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 50,
      }}
      className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* ========== TEXT FORMATTING ========== */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            editor.isActive("bold") 
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" 
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          title="Bold (⌘B)"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            editor.isActive("italic")
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          title="Italic (⌘I)"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            editor.isActive("underline")
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          title="Underline (⌘U)"
        >
          <Underline className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            editor.isActive("strike")
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          title="Strikethrough (⌘⇧X)"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            editor.isActive("code")
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          title="Code (⌘E)"
        >
          <Code className="h-4 w-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* ========== FONT CONTROLS ========== */}
      <div className="flex items-center gap-1">
        {/* Font Family */}
        <select
          value={editor.getAttributes('textStyle').fontFamily || ''}
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setFontFamily(e.target.value).run();
            } else {
              editor.chain().focus().unsetFontFamily().run();
            }
          }}
          className="h-8 rounded-lg border border-zinc-300 bg-white px-2 text-xs font-medium transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="">Sans</option>
          <option value="Inter, ui-sans-serif, system-ui">Inter</option>
          <option value="Georgia, Cambria, serif">Serif</option>
          <option value="ui-monospace, monospace">Mono</option>
        </select>

        {/* Font Size */}
        <select
          value={editor.getAttributes('textStyle').fontSize?.replace('px', '') || ''}
          onChange={(e) => {
            const px = e.target.value;
            if (px) {
              editor.chain().focus().setMark('textStyle', { fontSize: `${px}px` }).run();
            }
          }}
          className="h-8 w-20 rounded-lg border border-zinc-300 bg-white px-2 text-xs font-medium transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="">Size</option>
          {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((px) => (
            <option key={px} value={px}>{px}</option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* ========== ALIGNMENT ========== */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex h-8 items-center gap-1 rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Text Alignment"
          >
            {editor.isActive({ textAlign: 'center' }) ? <AlignCenter className="h-4 w-4" /> :
             editor.isActive({ textAlign: 'right' }) ? <AlignRight className="h-4 w-4" /> :
             editor.isActive({ textAlign: 'justify' }) ? <AlignJustify className="h-4 w-4" /> :
             <AlignLeft className="h-4 w-4" />}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="z-50 min-w-[160px] rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <DropdownMenu.Item
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <AlignLeft className="h-4 w-4" />
              Left
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <AlignCenter className="h-4 w-4" />
              Center
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <AlignRight className="h-4 w-4" />
              Right
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <AlignJustify className="h-4 w-4" />
              Justify
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* ========== LINK ========== */}
      <button
        onClick={onToggleLink}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          editor.isActive("link")
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )}
        title="Link (⌘K)"
      >
        <Link className="h-4 w-4" />
      </button>

      {/* ========== COLOR PICKER ========== */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            className="z-50 w-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div>
              <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Text Color
              </p>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      if (color.value) {
                        editor.chain().focus().setColor(color.value).run();
                      } else {
                        editor.chain().focus().unsetColor().run();
                      }
                    }}
                    className="group relative h-10 w-10 rounded-lg border-2 border-transparent transition-all hover:scale-110 hover:border-zinc-400"
                    style={{
                      backgroundColor: color.value || "#000000",
                    }}
                    title={color.name}
                  >
                    {!color.value && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        A
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* ========== HIGHLIGHT ========== */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              editor.isActive("highlight")
                ? "bg-yellow-100 text-yellow-700"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            className="z-50 w-64 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div>
              <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Highlight Color
              </p>
              <div className="grid grid-cols-4 gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      if (color.value) {
                        editor.chain().focus().toggleHighlight({ color: color.value }).run();
                      } else {
                        editor.chain().focus().unsetHighlight().run();
                      }
                    }}
                    className="h-10 w-full rounded-lg border-2 border-transparent transition-all hover:scale-105 hover:border-zinc-400"
                    style={{
                      backgroundColor: color.value || "transparent",
                      border: !color.value ? "2px dashed #ccc" : undefined,
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* ========== MORE OPTIONS ========== */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex h-8 items-center gap-1 rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="More Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="z-50 min-w-[200px] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Advanced
            </DropdownMenu.Label>

            <DropdownMenu.Item
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="text-xs">X₂</span>
              Subscript
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="text-xs">X²</span>
              Superscript
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Type className="h-4 w-4" />
                Line Height
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent className="z-50 min-w-[160px] rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  {[
                    { label: "Tight", value: "1.2" },
                    { label: "Normal", value: "1.5" },
                    { label: "Relaxed", value: "1.75" },
                    { label: "Loose", value: "2" },
                  ].map((item) => (
                    <DropdownMenu.Item
                      key={item.value}
                      onClick={() => editor.chain().focus().setMark('textStyle', { lineHeight: item.value }).run()}
                      className="flex cursor-pointer items-center rounded px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {item.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>

            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Type className="h-4 w-4" />
                Letter Spacing
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent className="z-50 min-w-[160px] rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  {[
                    { label: "Tight", value: "-0.5px" },
                    { label: "Normal", value: "0px" },
                    { label: "Wide", value: "0.5px" },
                    { label: "Wider", value: "1px" },
                  ].map((item) => (
                    <DropdownMenu.Item
                      key={item.value}
                      onClick={() => editor.chain().focus().setMark('textStyle', { letterSpacing: item.value }).run()}
                      className="flex cursor-pointer items-center rounded px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {item.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>

            <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

            <DropdownMenu.Item
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Eraser className="h-4 w-4" />
              Clear Formatting
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

      {/* ========== AI ACTIONS ========== */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 text-white transition-all hover:from-purple-700 hover:to-blue-700"
            title="AI Actions"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">AI</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            className="z-50 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="space-y-1">
              <button
                onClick={() => console.log("AI Improve")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-purple-950"
              >
                <Sparkles className="h-4 w-4" />
                Improve writing
              </button>
              <button
                onClick={() => console.log("AI Expand")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-purple-950"
              >
                Expand
              </button>
              <button
                onClick={() => console.log("AI Shorten")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-purple-950"
              >
                Make shorter
              </button>
              <button
                onClick={() => console.log("AI Simplify")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-purple-950"
              >
                Simplify
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* ========== UNDO/REDO ========== */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          title="Undo (⌘Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}