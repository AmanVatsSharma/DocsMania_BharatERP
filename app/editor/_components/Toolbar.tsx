"use client";

import React from "react";
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Table as TableIcon, Undo2, Redo2 } from "lucide-react";
import { clsx } from "clsx";

export interface ToolbarProps {
  editor: any | null;
  onToggleLink: () => void;
  onInsertTable: () => void;
  addSectionControl: React.ReactNode;
}

/**
 * Polished formatting toolbar with icons.
 */
export default function Toolbar(props: ToolbarProps) {
  const { editor, onToggleLink, onInsertTable, addSectionControl } = props;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-white/60 px-2 py-2 backdrop-blur">
      {addSectionControl}
      <span className="mx-1 h-5 w-px bg-zinc-200" />

      <button onClick={() => editor?.chain().focus().toggleBold().run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("bold") ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}> <Bold className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("italic") ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}> <Italic className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleStrike().run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("strike") ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}> <Strikethrough className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleCode().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <Code className="inline h-4 w-4" /></button>
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <button onClick={() => editor?.chain().focus().setParagraph().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50">P</button>
      <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("heading", { level: 1 }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><Heading1 className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("heading", { level: 2 }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><Heading2 className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("heading", { level: 3 }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><Heading3 className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <List className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <ListOrdered className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <Quote className="inline h-4 w-4" /></button>
      <button onClick={onToggleLink} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <LinkIcon className="inline h-4 w-4" /></button>
      <button onClick={onInsertTable} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <TableIcon className="inline h-4 w-4" /></button>
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <button onClick={() => editor?.chain().focus().undo().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <Undo2 className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().redo().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <Redo2 className="inline h-4 w-4" /></button>
    </div>
  );
}


