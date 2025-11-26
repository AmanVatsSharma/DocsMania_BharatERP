"use client";

import React from "react";
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Table as TableIcon, Undo2, Redo2, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, ListTodo, Eraser, IndentIncrease, IndentDecrease, FileText } from "lucide-react";
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
    <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200/60 bg-white/50 backdrop-blur-sm px-3 py-2">
      {addSectionControl}
      <span className="mx-1 h-5 w-px bg-zinc-200/60" />

      {/* Block type selector */}
      <select
        onChange={(e) => {
          try {
            const v = e.target.value;
            if (v === "paragraph") editor?.chain().focus().setParagraph().run();
            else if (v.startsWith("h")) editor?.chain().focus().toggleHeading({ level: Number(v.slice(1)) }).run();
            console.info("[Toolbar] block type", v);
          } catch (e) { console.error("block type change error", e); }
        }}
        defaultValue="paragraph"
        className="rounded-lg border border-zinc-200/60 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="paragraph">Normal text</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
      </select>
      <span className="mx-1 h-5 w-px bg-zinc-200/60" />

      <button onClick={() => editor?.chain().focus().toggleBold().run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive("bold") ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Bold"> <Bold className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive("italic") ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Italic"> <Italic className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleStrike().run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive("strike") ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Strikethrough"> <Strikethrough className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleUnderline().run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive("underline") ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Underline"> <UnderlineIcon className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleCode().run()} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Code"> <Code className="h-4 w-4" /></button>
      <span className="mx-1 h-5 w-px bg-zinc-200/60" />
      <button onClick={() => editor?.chain().focus().setParagraph().run()} disabled={!editor} className="rounded-lg p-2 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-100" title="Paragraph">P</button>
      <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive("heading", { level: 1 }) ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Heading 1"><Heading1 className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive("heading", { level: 2 }) ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Heading 2"><Heading2 className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive("heading", { level: 3 }) ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Heading 3"><Heading3 className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Bullet List"> <List className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Numbered List"> <ListOrdered className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleTaskList().run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive("taskList") ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Task List"><ListTodo className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Quote"> <Quote className="h-4 w-4" /></button>
      <button onClick={onToggleLink} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Link"> <LinkIcon className="h-4 w-4" /></button>
      <button onClick={onInsertTable} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Table"> <TableIcon className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().setPageBreak().run()} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Page Break"> <FileText className="h-4 w-4" /></button>

      {/* Alignment group */}
      <span className="mx-1 h-5 w-px bg-zinc-200/60" />
      <button onClick={() => editor?.chain().focus().setTextAlign("left").run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive({ textAlign: "left" }) ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Align Left"><AlignLeft className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().setTextAlign("center").run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive({ textAlign: "center" }) ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Align Center"><AlignCenter className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().setTextAlign("right").run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive({ textAlign: "right" }) ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Align Right"><AlignRight className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().setTextAlign("justify").run()} disabled={!editor} className={clsx("rounded-lg p-2 transition-all", editor?.isActive({ textAlign: "justify" }) ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-zinc-100")} title="Justify"><AlignJustify className="h-4 w-4" /></button>

      {/* Indent / Outdent */}
      <span className="mx-1 h-5 w-px bg-zinc-200/60" />
      <button
        onClick={() => {
          try {
            if (editor?.isActive("listItem")) {
              editor?.chain().focus().sinkListItem("listItem").run();
              console.info("[Toolbar] sink list item");
            } else if (editor?.chain().focus().increaseIndent) {
              (editor?.chain().focus() as any).increaseIndent().run();
              console.info("[Toolbar] increase paragraph indent");
            }
          } catch (e) { console.error("indent error", e); }
        }}
        disabled={!editor}
        className="rounded-lg p-2 transition-all hover:bg-zinc-100"
        title="Increase Indent"
      >
        <IndentIncrease className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          try {
            if (editor?.isActive("listItem")) {
              editor?.chain().focus().liftListItem("listItem").run();
              console.info("[Toolbar] lift list item");
            } else if (editor?.chain().focus().decreaseIndent) {
              (editor?.chain().focus() as any).decreaseIndent().run();
              console.info("[Toolbar] decrease paragraph indent");
            }
          } catch (e) { console.error("outdent error", e); }
        }}
        disabled={!editor}
        className="rounded-lg p-2 transition-all hover:bg-zinc-100"
        title="Decrease Indent"
      >
        <IndentDecrease className="h-4 w-4" />
      </button>

      {/* Font family */}
      <span className="mx-1 h-5 w-px bg-zinc-200/60" />
      <select
        onChange={(e) => {
          try {
            const v = e.target.value;
            if (v === "") editor?.chain().focus().unsetFontFamily().run();
            else editor?.chain().focus().setFontFamily(v).run();
            console.info("[Toolbar] font family", v);
          } catch (e) { console.error("font family change error", e); }
        }}
        defaultValue=""
        className="rounded-lg border border-zinc-200/60 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">Arial</option>
        <option value="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'">Inter</option>
        <option value="Georgia, Cambria, 'Times New Roman', Times, serif">Georgia</option>
        <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace">Monospace</option>
      </select>

      {/* Font size */}
      <select
        onChange={(e) => {
          try {
            const px = Number(e.target.value);
            if (!Number.isFinite(px)) return;
            editor?.chain().focus().setMark('textStyle', { fontSize: `${px}px` }).run();
            console.info("[Toolbar] font size", px);
          } catch (e) { console.error("font size change error", e); }
        }}
        defaultValue="16"
        className="rounded-lg border border-zinc-200/60 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-20"
      >
        {[12,14,16,18,20,24,28,32,36,48].map((px) => (
          <option key={px} value={px}>{px}</option>
        ))}
      </select>

      {/* Color pickers - premium */}
      <span className="mx-1 h-5 w-px bg-zinc-200/60" />
      <label className="flex items-center gap-1.5 rounded-lg border border-zinc-200/60 bg-white px-2 py-1.5 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm cursor-pointer" title="Text Color">
        <span className="text-xs font-medium text-zinc-500">A</span>
        <input type="color" onChange={(e) => {
          try { editor?.chain().focus().setColor(e.target.value).run(); console.info("[Toolbar] text color", e.target.value); } catch (er) { console.error("text color error", er); }
        }} className="w-6 h-6 border-0 cursor-pointer rounded" />
      </label>
      <label className="flex items-center gap-1.5 rounded-lg border border-zinc-200/60 bg-white px-2 py-1.5 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm cursor-pointer" title="Highlight">
        <span className="text-xs font-medium text-zinc-500">H</span>
        <input type="color" onChange={(e) => {
          try { editor?.chain().focus().toggleHighlight({ color: e.target.value }).run(); console.info("[Toolbar] highlight", e.target.value); } catch (er) { console.error("highlight error", er); }
        }} className="w-6 h-6 border-0 cursor-pointer rounded" />
      </label>

      {/* Clear formatting */}
      <button onClick={() => { try { editor?.chain().focus().clearNodes().unsetAllMarks().run(); console.info("[Toolbar] clear formatting"); } catch (e) { console.error("clear formatting error", e); } }} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Clear Formatting"> <Eraser className="h-4 w-4" /></button>

      <span className="mx-1 h-5 w-px bg-zinc-200/60" />
      <button onClick={() => editor?.chain().focus().undo().run()} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Undo"> <Undo2 className="h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().redo().run()} disabled={!editor} className="rounded-lg p-2 transition-all hover:bg-zinc-100" title="Redo"> <Redo2 className="h-4 w-4" /></button>
    </div>
  );
}


