/**
 * ⚠️ POTENTIALLY DEPRECATED
 * Most functionality moved to BubbleMenuEnhanced.tsx and TopBarAutoHide.tsx
 * Review usage before deleting
 * 
 * New components handle:
 * - Text formatting: BubbleMenuEnhanced
 * - Insert actions: TopBarAutoHide + SlashCommandsEnhanced
 * 
 * May keep for backward compatibility
 */

"use client";

import React from "react";
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Table as TableIcon, Undo2, Redo2, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, ListTodo, Eraser, IndentIncrease, IndentDecrease } from "lucide-react";
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
        className="rounded border border-[var(--border)] bg-white px-2 py-1 text-sm"
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
      </select>
      <span className="mx-1 h-5 w-px bg-zinc-200" />

      <button onClick={() => editor?.chain().focus().toggleBold().run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("bold") ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}> <Bold className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("italic") ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}> <Italic className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleStrike().run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("strike") ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}> <Strikethrough className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleUnderline().run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("underline") ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}> <UnderlineIcon className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleCode().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <Code className="inline h-4 w-4" /></button>
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <button onClick={() => editor?.chain().focus().setParagraph().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50">P</button>
      <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("heading", { level: 1 }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><Heading1 className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("heading", { level: 2 }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><Heading2 className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("heading", { level: 3 }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><Heading3 className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <List className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <ListOrdered className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleTaskList().run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive("taskList") ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><ListTodo className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <Quote className="inline h-4 w-4" /></button>
      <button onClick={onToggleLink} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <LinkIcon className="inline h-4 w-4" /></button>
      <button onClick={onInsertTable} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <TableIcon className="inline h-4 w-4" /></button>

      {/* Alignment group */}
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <button onClick={() => editor?.chain().focus().setTextAlign("left").run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive({ textAlign: "left" }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><AlignLeft className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().setTextAlign("center").run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive({ textAlign: "center" }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><AlignCenter className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().setTextAlign("right").run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive({ textAlign: "right" }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><AlignRight className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().setTextAlign("justify").run()} disabled={!editor} className={clsx("rounded border border-[var(--border)] px-2 py-1 text-sm", editor?.isActive({ textAlign: "justify" }) ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50")}><AlignJustify className="inline h-4 w-4" /></button>

      {/* Indent / Outdent */}
      <span className="mx-1 h-5 w-px bg-zinc-200" />
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
        className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"
      >
        <IndentIncrease className="inline h-4 w-4" />
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
        className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"
      >
        <IndentDecrease className="inline h-4 w-4" />
      </button>

      {/* Font family */}
      <span className="mx-1 h-5 w-px bg-zinc-200" />
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
        className="rounded border border-[var(--border)] bg-white px-2 py-1 text-sm"
      >
        <option value="">System font</option>
        <option value="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'">Inter / Sans</option>
        <option value="Georgia, Cambria, 'Times New Roman', Times, serif">Georgia / Serif</option>
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
        className="rounded border border-[var(--border)] bg-white px-2 py-1 text-sm"
      >
        {[12,14,16,18,20,24,28,32,36,48].map((px) => (
          <option key={px} value={px}>{px}px</option>
        ))}
      </select>

      {/* Line height */}
      <select
        onChange={(e) => {
          try {
            const v = e.target.value;
            const lh = v === '' ? undefined : v;
            editor?.chain().focus().setMark('textStyle', lh ? { lineHeight: lh } : { lineHeight: undefined as any }).run();
            console.info("[Toolbar] line-height", lh);
          } catch (e) { console.error("line-height change error", e); }
        }}
        defaultValue=""
        className="rounded border border-[var(--border)] bg-white px-2 py-1 text-sm"
      >
        <option value="">LH</option>
        <option value="var(--leading-tight)">Tight</option>
        <option value="var(--leading-normal)">Normal</option>
        <option value="var(--leading-relaxed)">Relaxed</option>
        <option value="var(--leading-loose)">Loose</option>
        {[1.2,1.4,1.6,1.8,2.0].map((n) => (
          <option key={n} value={String(n)}>{n}</option>
        ))}
      </select>

      {/* Letter spacing */}
      <select
        onChange={(e) => {
          try {
            const v = e.target.value;
            const ls = v === '' ? undefined : v;
            editor?.chain().focus().setMark('textStyle', ls ? { letterSpacing: ls } : { letterSpacing: undefined as any }).run();
            console.info("[Toolbar] letter-spacing", ls);
          } catch (e) { console.error("letter-spacing change error", e); }
        }}
        defaultValue=""
        className="rounded border border-[var(--border)] bg-white px-2 py-1 text-sm"
      >
        <option value="">LS</option>
        <option value="var(--tracking-tight)">Tight</option>
        <option value="var(--tracking-normal)">Normal</option>
        <option value="var(--tracking-wide)">Wide</option>
        <option value="var(--tracking-wider)">Wider</option>
        <option value="var(--tracking-widest)">Widest</option>
        {[-1, -0.5, 0, 0.5, 1, 2].map((px) => (
          <option key={px} value={`${px}px`}>{px}px</option>
        ))}
      </select>

      {/* Color pickers */}
      <label className="ml-1 flex items-center gap-1 text-xs text-zinc-600">
        <span>Text</span>
        <input type="color" onChange={(e) => {
          try { editor?.chain().focus().setColor(e.target.value).run(); console.info("[Toolbar] text color", e.target.value); } catch (er) { console.error("text color error", er); }
        }} />
      </label>
      <label className="ml-1 flex items-center gap-1 text-xs text-zinc-600">
        <span>Highlight</span>
        <input type="color" onChange={(e) => {
          try { editor?.chain().focus().toggleHighlight({ color: e.target.value }).run(); console.info("[Toolbar] highlight", e.target.value); } catch (er) { console.error("highlight error", er); }
        }} />
      </label>

      {/* Clear formatting */}
      <button onClick={() => { try { editor?.chain().focus().clearNodes().unsetAllMarks().run(); console.info("[Toolbar] clear formatting"); } catch (e) { console.error("clear formatting error", e); } }} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <Eraser className="inline h-4 w-4" /></button>

      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <button onClick={() => editor?.chain().focus().undo().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <Undo2 className="inline h-4 w-4" /></button>
      <button onClick={() => editor?.chain().focus().redo().run()} disabled={!editor} className="rounded border border-[var(--border)] px-2 py-1 text-sm hover:bg-zinc-50"> <Redo2 className="inline h-4 w-4" /></button>
    </div>
  );
}


