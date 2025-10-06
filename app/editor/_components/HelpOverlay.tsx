"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Command, Keyboard, Zap, Table, Layout, MousePointer } from "lucide-react";
import { clsx } from "clsx";

export interface HelpOverlayProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  // Document Actions
  { keys: ["Cmd/Ctrl", "S"], description: "Save document", category: "Document" },
  { keys: ["Cmd/Ctrl", "Shift", "P"], description: "Publish document", category: "Document" },
  { keys: ["Cmd/Ctrl", "K"], description: "Open command palette", category: "Document" },
  { keys: ["/"], description: "Open slash menu", category: "Document" },
  
  // Text Formatting
  { keys: ["Cmd/Ctrl", "B"], description: "Bold text", category: "Formatting" },
  { keys: ["Cmd/Ctrl", "I"], description: "Italic text", category: "Formatting" },
  { keys: ["Cmd/Ctrl", "U"], description: "Underline text", category: "Formatting" },
  { keys: ["Cmd/Ctrl", "Shift", "S"], description: "Strikethrough", category: "Formatting" },
  { keys: ["Cmd/Ctrl", "E"], description: "Inline code", category: "Formatting" },
  
  // Lists & Structure
  { keys: ["Tab"], description: "Indent list item or navigate table cell", category: "Structure" },
  { keys: ["Shift", "Tab"], description: "Outdent list item or previous cell", category: "Structure" },
  { keys: ["Cmd/Ctrl", "Shift", "7"], description: "Ordered list", category: "Structure" },
  { keys: ["Cmd/Ctrl", "Shift", "8"], description: "Bullet list", category: "Structure" },
  
  // Tables
  { keys: ["Tab"], description: "Next cell", category: "Tables" },
  { keys: ["Shift", "Tab"], description: "Previous cell", category: "Tables" },
  { keys: ["Enter"], description: "Next cell (in table)", category: "Tables" },
];

const tips = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Quick Insert",
    description: "Type '/' anywhere to open the block menu and quickly add components"
  },
  {
    icon: <MousePointer className="h-5 w-5" />,
    title: "Drag & Drop",
    description: "Drag blocks from the library directly onto your canvas for instant placement"
  },
  {
    icon: <Layout className="h-5 w-5" />,
    title: "Templates",
    description: "Start with pre-built templates to save time and ensure consistency"
  },
  {
    icon: <Table className="h-5 w-5" />,
    title: "Paste CSV",
    description: "Copy data from Excel/Sheets and paste into tables for instant import"
  },
  {
    icon: <Keyboard className="h-5 w-5" />,
    title: "Right-Click Menu",
    description: "Right-click on text for quick formatting options and text styling"
  },
  {
    icon: <Command className="h-5 w-5" />,
    title: "Auto-Save",
    description: "Your work is automatically saved every 1.5 seconds - no need to worry"
  },
];

function KeyBadge({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-xs text-zinc-400">+</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function HelpOverlay({ open, onOpenChange }: HelpOverlayProps) {
  const [activeTab, setActiveTab] = React.useState<"shortcuts" | "tips">("shortcuts");
  
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl"
          style={{ maxHeight: "85vh" }}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <Keyboard className="h-5 w-5 text-purple-500" />
                  Editor Guide
                </Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-500">
                  Shortcuts, tips, and tricks to work faster
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-lg p-2 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-200 px-6">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("shortcuts")}
                  className={clsx(
                    "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === "shortcuts"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  Keyboard Shortcuts
                </button>
                <button
                  onClick={() => setActiveTab("tips")}
                  className={clsx(
                    "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === "tips"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  Tips & Tricks
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "shortcuts" && (
                <div className="space-y-6">
                  {categories.map((category) => (
                    <div key={category}>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <div className="h-1 w-1 rounded-full bg-purple-500" />
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {shortcuts
                          .filter(s => s.category === category)
                          .map((shortcut, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 transition-colors hover:bg-zinc-100"
                            >
                              <span className="text-sm text-zinc-700">{shortcut.description}</span>
                              <KeyBadge keys={shortcut.keys} />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "tips" && (
                <div className="grid grid-cols-2 gap-4">
                  {tips.map((tip, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-4 transition-all hover:border-purple-300 hover:shadow-md"
                    >
                      <div className="mb-3 inline-flex rounded-lg bg-purple-100 p-2 text-purple-600">
                        {tip.icon}
                      </div>
                      <h4 className="mb-1 font-semibold text-zinc-900">{tip.title}</h4>
                      <p className="text-sm text-zinc-600">{tip.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  Press <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-medium shadow-sm">?</kbd> anytime to open this guide
                </div>
                <Dialog.Close className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
                  Got it!
                </Dialog.Close>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
