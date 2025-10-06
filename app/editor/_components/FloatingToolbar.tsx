"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon,
  Palette, Highlighter, Type, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Minus
} from "lucide-react";
import { clsx } from "clsx";
import * as Popover from "@radix-ui/react-popover";

/**
 * Floating Toolbar for Text Formatting (Notion/Google Docs style)
 * Appears when text is selected
 */

export interface FloatingToolbarProps {
  editor: Editor | null;
  isVisible: boolean;
  position: { top: number; left: number } | null;
}

export default function FloatingToolbar(props: FloatingToolbarProps) {
  const { editor, isVisible, position } = props;

  if (!editor || !isVisible || !position) return null;

  const textColors = [
    { name: "Default", hex: "#000000" },
    { name: "Gray", hex: "#64748b" },
    { name: "Red", hex: "#ef4444" },
    { name: "Orange", hex: "#f97316" },
    { name: "Yellow", hex: "#eab308" },
    { name: "Green", hex: "#22c55e" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Purple", hex: "#a855f7" },
  ];

  const highlights = [
    { name: "None", hex: "transparent" },
    { name: "Yellow", hex: "#fef3c7" },
    { name: "Green", hex: "#d1fae5" },
    { name: "Blue", hex: "#dbeafe" },
    { name: "Purple", hex: "#e9d5ff" },
    { name: "Red", hex: "#fee2e2" },
  ];

  const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px"];

  return (
    <div
      className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        top: position.top - 60,
        left: position.left,
        transform: "translateX(-50%)",
      }}
    >
      <div className="flex items-center gap-0.5 rounded-xl border border-zinc-200 bg-white px-2 py-1.5 shadow-2xl ring-1 ring-black/5">
        {/* Text Formatting */}
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={<Bold className="h-4 w-4" />}
          tooltip="Bold (⌘B)"
        />
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={<Italic className="h-4 w-4" />}
          tooltip="Italic (⌘I)"
        />
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={<Underline className="h-4 w-4" />}
          tooltip="Underline (⌘U)"
        />
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={<Strikethrough className="h-4 w-4" />}
          tooltip="Strikethrough"
        />
        <ToolbarButton
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          icon={<Code className="h-4 w-4" />}
          tooltip="Code (⌘E)"
        />

        <ToolbarDivider />

        {/* Font Size */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
              <Type className="h-4 w-4" />
              <span className="text-xs">Size</span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 w-32 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95"
              sideOffset={5}
            >
              <div className="grid gap-1">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
                    }}
                    className="rounded px-2 py-1.5 text-left text-sm hover:bg-zinc-100"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Text Color */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
              <Palette className="h-4 w-4" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 w-48 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl animate-in fade-in-0 zoom-in-95"
              sideOffset={5}
            >
              <div className="mb-2 text-xs font-semibold text-zinc-500">Text Color</div>
              <div className="grid grid-cols-4 gap-2">
                {textColors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => {
                      editor.chain().focus().setMark("textStyle", { color: color.hex }).run();
                    }}
                    className="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 hover:border-zinc-400"
                    title={color.name}
                  >
                    <div
                      className="h-5 w-5 rounded"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Highlight */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
              <Highlighter className="h-4 w-4" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 w-48 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl animate-in fade-in-0 zoom-in-95"
              sideOffset={5}
            >
              <div className="mb-2 text-xs font-semibold text-zinc-500">Highlight</div>
              <div className="grid grid-cols-3 gap-2">
                {highlights.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => {
                      if (color.hex === "transparent") {
                        editor.chain().focus().unsetHighlight().run();
                      } else {
                        editor.chain().focus().setHighlight({ color: color.hex }).run();
                      }
                    }}
                    className="group relative flex h-8 w-full items-center justify-center rounded-lg border border-zinc-200 hover:border-zinc-400"
                    title={color.name}
                  >
                    <div
                      className="h-5 w-full rounded"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <ToolbarDivider />

        {/* Link */}
        <ToolbarButton
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          icon={<LinkIcon className="h-4 w-4" />}
          tooltip="Link (⌘K)"
        />

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          icon={<AlignLeft className="h-4 w-4" />}
          tooltip="Align Left"
        />
        <ToolbarButton
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          icon={<AlignCenter className="h-4 w-4" />}
          tooltip="Align Center"
        />
        <ToolbarButton
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          icon={<AlignRight className="h-4 w-4" />}
          tooltip="Align Right"
        />

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<List className="h-4 w-4" />}
          tooltip="Bullet List"
        />
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={<ListOrdered className="h-4 w-4" />}
          tooltip="Numbered List"
        />

        <ToolbarDivider />

        {/* Quote */}
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={<Quote className="h-4 w-4" />}
          tooltip="Quote"
        />

        {/* Divider */}
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Minus className="h-4 w-4" />}
          tooltip="Divider"
        />
      </div>

      {/* Arrow */}
      <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-zinc-200 bg-white" />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  icon,
  tooltip,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center justify-center rounded-lg p-1.5 transition-all",
        active
          ? "bg-purple-100 text-purple-700"
          : "text-zinc-700 hover:bg-zinc-100"
      )}
      title={tooltip}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-zinc-200" />;
}
