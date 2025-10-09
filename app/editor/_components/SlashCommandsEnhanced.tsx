/**
 * Enhanced Slash Commands with Visual Previews
 * Rich command palette with categorization and previews
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash,
  Type,
  List,
  CheckSquare,
  Image,
  Table as TableIcon,
  Code,
  Quote,
  Minus,
  FileText,
  Layout,
  Zap,
  Search,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { fadeVariants, staggerContainer, staggerItem, transitions } from "@/lib/animations";

export interface SlashCommand {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  category: "basic" | "advanced" | "media" | "blocks";
  action: (editor: Editor) => void;
}

export interface SlashCommandsEnhancedProps {
  editor: Editor | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  components?: Array<{ key: string; name: string; defaultConfig?: any }>;
}

const defaultCommands: SlashCommand[] = [
  // Basic
  {
    id: "heading1",
    title: "Heading 1",
    description: "Large section heading",
    icon: Hash,
    keywords: ["h1", "heading", "title"],
    category: "basic",
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: "heading2",
    title: "Heading 2",
    description: "Medium section heading",
    icon: Hash,
    keywords: ["h2", "heading", "subtitle"],
    category: "basic",
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "heading3",
    title: "Heading 3",
    description: "Small section heading",
    icon: Hash,
    keywords: ["h3", "heading"],
    category: "basic",
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: "paragraph",
    title: "Text",
    description: "Plain text paragraph",
    icon: Type,
    keywords: ["p", "paragraph", "text"],
    category: "basic",
    action: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: "bulletList",
    title: "Bullet List",
    description: "Unordered list",
    icon: List,
    keywords: ["ul", "list", "bullet"],
    category: "basic",
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "numberedList",
    title: "Numbered List",
    description: "Ordered list",
    icon: List,
    keywords: ["ol", "list", "numbered"],
    category: "basic",
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "todoList",
    title: "To-do List",
    description: "Checklist with tasks",
    icon: CheckSquare,
    keywords: ["todo", "task", "check", "checkbox"],
    category: "basic",
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  // Advanced
  {
    id: "quote",
    title: "Quote",
    description: "Blockquote",
    icon: Quote,
    keywords: ["quote", "blockquote", "citation"],
    category: "advanced",
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: "code",
    title: "Code Block",
    description: "Code with syntax highlighting",
    icon: Code,
    keywords: ["code", "codeblock", "syntax"],
    category: "advanced",
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: "divider",
    title: "Divider",
    description: "Horizontal line",
    icon: Minus,
    keywords: ["divider", "hr", "line", "separator"],
    category: "advanced",
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  // Media
  {
    id: "table",
    title: "Table",
    description: "Insert a table",
    icon: TableIcon,
    keywords: ["table", "grid", "spreadsheet"],
    category: "media",
    action: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
];

export default function SlashCommandsEnhanced(props: SlashCommandsEnhancedProps) {
  const { editor, open, setOpen, components = [] } = props;

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [category, setCategory] = useState<string | null>(null);

  // Combine default commands with component commands
  const componentCommands: SlashCommand[] = components.map((comp) => ({
    id: `component-${comp.key}`,
    title: comp.name,
    description: `Insert ${comp.name} component`,
    icon: Layout,
    keywords: [comp.key, comp.name.toLowerCase(), "component"],
    category: "blocks" as const,
    action: (editor) => {
      // Insert component logic here
      console.log("Insert component:", comp.key);
    },
  }));

  const allCommands = [...defaultCommands, ...componentCommands];

  // Filter commands by query and category
  const filteredCommands = allCommands.filter((cmd) => {
    const matchesQuery =
      query === "" ||
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase()) ||
      cmd.keywords.some((kw) => kw.toLowerCase().includes(query.toLowerCase()));

    const matchesCategory = category === null || cmd.category === category;

    return matchesQuery && matchesCategory;
  });

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, SlashCommand[]>);

  const categories = [
    { id: "basic", label: "Basic", icon: Type },
    { id: "advanced", label: "Advanced", icon: Zap },
    { id: "media", label: "Media", icon: Image },
    { id: "blocks", label: "Blocks", icon: Layout },
  ];

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd && editor) {
          cmd.action(editor);
          setOpen(false);
          setQuery("");
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, filteredCommands, editor, setOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open || !editor) return null;

  const executeCommand = (cmd: SlashCommand) => {
    cmd.action(editor);
    setOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitions.fast}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={transitions.smooth}
          className="absolute left-1/2 top-1/4 w-full max-w-2xl -translate-x-1/2 rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands or type to filter..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400"
                autoFocus
              />
              <kbd className="rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700">
                ESC
              </kbd>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
            <button
              onClick={() => setCategory(null)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                category === null
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              All
            </button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const hasCommands = groupedCommands[cat.id]?.length > 0;
              if (!hasCommands && query) return null;

              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    category === cat.id
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Commands List */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                No commands found
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-1"
              >
                {filteredCommands.map((cmd, index) => {
                  const Icon = cmd.icon;
                  return (
                    <motion.button
                      key={cmd.id}
                      variants={staggerItem}
                      onClick={() => executeCommand(cmd)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
                        index === selectedIndex
                          ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          index === selectedIndex
                            ? "bg-blue-200 dark:bg-blue-800"
                            : "bg-zinc-200 dark:bg-zinc-700"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{cmd.title}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {cmd.description}
                        </div>
                      </div>
                      {index === selectedIndex && (
                        <kbd className="rounded border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-600">
                          ↵
                        </kbd>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 dark:border-zinc-700">
                  ↑
                </kbd>
                <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 dark:border-zinc-700">
                  ↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 dark:border-zinc-700">
                  ↵
                </kbd>
                Select
              </span>
            </div>
            <span>{filteredCommands.length} commands</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}