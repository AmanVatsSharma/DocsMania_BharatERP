/**
 * Enhanced Bubble Menu
 * Context-aware floating toolbar that appears on text selection
 * With AI actions, formatting, and color picker
 */

"use client";

import React, { useState } from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
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
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scaleVariants, transitions } from "@/lib/animations";
import * as Popover from "@radix-ui/react-popover";

export interface BubbleMenuEnhancedProps {
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

export default function BubbleMenuEnhanced({ editor, onToggleLink }: BubbleMenuEnhancedProps) {
  const [showMore, setShowMore] = useState(false);

  if (!editor) return null;

  const shouldShow = ({ editor, view, state, oldState, from, to }: any) => {
    // Don't show if no text selected
    if (from === to) return false;

    // Don't show for node selections
    const { doc, selection } = state;
    const { empty } = selection;

    // Show only for text selections
    const isTextSelection =
      !empty && state.selection.$from.parent.inlineContent;

    return isTextSelection;
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        duration: 150,
        placement: "top",
        maxWidth: "none",
        animation: "shift-away",
        onShow(instance) {
          // Reset more menu when showing
          setShowMore(false);
        },
      }}
    >
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={scaleVariants.in}
        transition={transitions.fast}
        className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
      >
        {/* Text Formatting */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
              editor.isActive("bold") && "bg-zinc-200 text-blue-600 dark:bg-zinc-700"
            )}
            title="Bold (⌘B)"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
              editor.isActive("italic") && "bg-zinc-200 text-blue-600 dark:bg-zinc-700"
            )}
            title="Italic (⌘I)"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
              editor.isActive("underline") && "bg-zinc-200 text-blue-600 dark:bg-zinc-700"
            )}
            title="Underline (⌘U)"
          >
            <Underline className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
              editor.isActive("strike") && "bg-zinc-200 text-blue-600 dark:bg-zinc-700"
            )}
            title="Strikethrough (⌘⇧X)"
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
              editor.isActive("code") && "bg-zinc-200 text-blue-600 dark:bg-zinc-700"
            )}
            title="Code (⌘E)"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

        {/* Link */}
        <button
          onClick={onToggleLink}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
            editor.isActive("link") && "bg-zinc-200 text-blue-600 dark:bg-zinc-700"
          )}
          title="Link (⌘K)"
        >
          <Link className="h-4 w-4" />
        </button>

        {/* Color Picker */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Text Color"
            >
              <Palette className="h-4 w-4" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={8}
              className="z-50 w-64 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Text Color
                </p>
                <div className="grid grid-cols-6 gap-1">
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
                      className="h-8 w-8 rounded border-2 border-transparent hover:border-zinc-400"
                      style={{
                        backgroundColor: color.value || "#000000",
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Highlight */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
                editor.isActive("highlight") && "bg-zinc-200 text-blue-600 dark:bg-zinc-700"
              )}
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={8}
              className="z-50 w-56 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Highlight Color
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {HIGHLIGHT_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        if (color.value) {
                          editor
                            .chain()
                            .focus()
                            .toggleHighlight({ color: color.value })
                            .run();
                        } else {
                          editor.chain().focus().unsetHighlight().run();
                        }
                      }}
                      className="h-8 w-full rounded border-2 border-transparent hover:border-zinc-400"
                      style={{
                        backgroundColor: color.value || "transparent",
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

        {/* AI Actions (placeholder) */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className="flex h-8 items-center gap-1 rounded px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="AI Actions"
            >
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium">AI</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={8}
              className="z-50 w-48 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-1">
                <button
                  onClick={() => {
                    // Placeholder for AI improve
                    console.log("AI Improve");
                  }}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Improve writing
                </button>
                <button
                  onClick={() => {
                    console.log("AI Expand");
                  }}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Make longer
                </button>
                <button
                  onClick={() => {
                    console.log("AI Shorten");
                  }}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Make shorter
                </button>
                <button
                  onClick={() => {
                    console.log("AI Simplify");
                  }}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Simplify
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* More Options */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
            showMore && "bg-zinc-200 dark:bg-zinc-700"
          )}
          title="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {/* More menu */}
        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={transitions.fast}
              className="ml-1 flex items-center gap-0.5 border-l border-zinc-300 pl-1 dark:border-zinc-700"
            >
              <button
                onClick={() => {
                  editor.chain().focus().toggleSubscript().run();
                  setShowMore(false);
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  editor.isActive("subscript") && "bg-zinc-200 text-blue-600 dark:bg-zinc-700"
                )}
                title="Subscript"
              >
                X₂
              </button>

              <button
                onClick={() => {
                  editor.chain().focus().toggleSuperscript().run();
                  setShowMore(false);
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  editor.isActive("superscript") && "bg-zinc-200 text-blue-600 dark:bg-zinc-700"
                )}
                title="Superscript"
              >
                X²
              </button>

              <button
                onClick={() => {
                  editor.chain().focus().clearNodes().unsetAllMarks().run();
                  setShowMore(false);
                }}
                className="flex h-8 items-center rounded px-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Clear formatting"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </BubbleMenu>
  );
}