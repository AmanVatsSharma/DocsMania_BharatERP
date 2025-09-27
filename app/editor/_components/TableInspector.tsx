"use client";

import React from "react";
import type { TableAttrs } from "@/lib/tableTypes";

export interface TableInspectorProps {
  editor: any | null;
}

export default function TableInspector({ editor }: TableInspectorProps) {
  if (!editor || !editor.isActive("table")) return null;

  const attrs = (editor.getAttributes("table") ?? {}) as TableAttrs;
  const rowHeight = editor.isActive("tableRow") ? (editor.getAttributes("tableRow")?.height ?? "") : "";

  function setCellBg(color: string) {
    try {
      console.debug("[TableInspector] setCellBg", color);
      editor.chain().focus().setCellAttribute("backgroundColor", color).run();
    } catch (e) {
      console.error("[TableInspector] setCellBg error", e);
    }
  }

  function setAlign(align: "left" | "center" | "right") {
    try {
      console.debug("[TableInspector] setAlign", align);
      editor.chain().focus().setCellAttribute("textAlign", align).run();
    } catch (e) {
      console.error("[TableInspector] setAlign error", e);
    }
  }

  function setVAlign(align: "top" | "middle" | "bottom") {
    try {
      console.debug("[TableInspector] setVAlign", align);
      editor.chain().focus().setCellAttribute("verticalAlign", align).run();
    } catch (e) {
      console.error("[TableInspector] setVAlign error", e);
    }
  }

  function setCellPadding(value: string) {
    try {
      console.debug("[TableInspector] setCellPadding", value);
      editor.chain().focus().setCellAttribute("padding", value).run();
    } catch (e) {
      console.error("[TableInspector] setCellPadding error", e);
    }
  }

  function setTableAttrs(attrs: Record<string, any>) {
    try {
      console.debug("[TableInspector] setTableAttrs", attrs);
      editor.chain().focus().setTableAttributes(attrs).run();
    } catch (e) {
      console.error("[TableInspector] setTableAttrs error", e);
    }
  }

  function onSort(dir: "asc" | "desc") {
    import("@/lib/tableUtils").then((m) => {
      const ok = m.sortTableByColumn(editor, dir);
      if (!ok) alert("Sort failed");
    }).catch((e) => console.error("[Table] sort error", e));
  }

  function onFillDown() {
    import("@/lib/tableUtils").then((m) => {
      const ok = m.fillDown(editor);
      if (!ok) alert("Fill down failed");
    }).catch((e) => console.error("[Table] fillDown error", e));
  }

  function onFillRight() {
    import("@/lib/tableUtils").then((m) => {
      const ok = m.fillRight(editor);
      if (!ok) alert("Fill right failed");
    }).catch((e) => console.error("[Table] fillRight error", e));
  }

  function onFormat(kind: "number" | "currency" | "percent") {
    import("@/lib/tableUtils").then((m) => {
      const ok = m.formatColumn(editor, kind);
      if (!ok) alert("Format failed");
    }).catch((e) => console.error("[Table] format error", e));
  }

  async function onImportCSV() {
    try {
      const text = window.prompt("Paste CSV/TSV here");
      if (!text) return;
      const mod = await import("@/lib/csv");
      const rows: string[][] = mod.parseDelimited(text);
      if (!rows.length) return;
      const tableJSON = {
        type: "table",
        attrs: {},
        content: rows.map((r) => ({
          type: "tableRow",
          content: r.map((cell) => ({
            type: "tableCell",
            content: [
              { type: "paragraph", content: cell ? [{ type: "text", text: cell }] : [] },
            ],
          })),
        })),
      } as any;
      const chain = editor.chain().focus();
      if (editor.isActive("table")) chain.deleteTable();
      chain.insertContent(tableJSON).run();
      console.info("[Table] CSV imported", { rows: rows.length, cols: Math.max(...rows.map((r) => r.length)) });
    } catch (e) {
      console.error("[Table] CSV import error", e);
      alert("CSV import failed");
    }
  }

  async function onExportCSV() {
    try {
      // Read current table into a 2D array by walking the node tree from selection
      const state = editor.state;
      const { $from } = state.selection as any;
      let tableNode: any = null;
      let depth = $from.depth;
      while (depth > 0) {
        const node = $from.node(depth);
        if (node.type.name === "table") { tableNode = node; break; }
        depth--;
      }
      if (!tableNode) return;
      const rows: string[][] = [];
      tableNode.content.forEach((row: any) => {
        const out: string[] = [];
        row.content.forEach((cell: any) => {
          const text: string = cell.textContent ?? "";
          out.push(text);
        });
        rows.push(out);
      });
      const mod = await import("@/lib/csv");
      const csv = mod.serializeCSV(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "table.csv";
      a.click();
      URL.revokeObjectURL(url);
      console.info("[Table] CSV exported");
    } catch (e) {
      console.error("[Table] CSV export error", e);
      alert("CSV export failed");
    }
  }

  return (
    <div className="mt-2 rounded-md border border-[var(--border)] bg-white p-0 text-sm shadow-sm">
      <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-white/90 px-3 py-2 font-semibold backdrop-blur">Table</div>
      <div className="grid grid-cols-3 gap-2 px-3 py-2">
        <button className={"rounded border border-[var(--border)] px-2 py-1 " + (attrs.stickyHeader ? "bg-zinc-100" : "")} onClick={() => setTableAttrs({ stickyHeader: !attrs.stickyHeader })}>Sticky header</button>
        <button className={"rounded border border-[var(--border)] px-2 py-1 " + (attrs.stickyFirstColumn ? "bg-zinc-100" : "")} onClick={() => setTableAttrs({ stickyFirstColumn: !attrs.stickyFirstColumn })}>Sticky first col</button>
        <button className={"rounded border border-[var(--border)] px-2 py-1 " + (attrs.zebra ? "bg-zinc-100" : "")} onClick={() => setTableAttrs({ zebra: !attrs.zebra })}>Zebra</button>
        <button className={"rounded border border-[var(--border)] px-2 py-1 " + (attrs.compact ? "bg-zinc-100" : "")} onClick={() => setTableAttrs({ compact: !attrs.compact })}>Compact</button>
        <button className={"rounded border border-[var(--border)] px-2 py-1 " + (attrs.overflowX !== false ? "bg-zinc-100" : "")} onClick={() => setTableAttrs({ overflowX: !(attrs.overflowX !== false) })}>Overflow X</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={onImportCSV}>Import CSV/TSV</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={onExportCSV}>Export CSV</button>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-[var(--border)] px-3 py-3">
      <label className="grid gap-1">
        <span>Caption</span>
        <input className="rounded border border-[var(--border)] px-2 py-1" type="text" placeholder="Table caption" value={attrs.caption ?? ""} onChange={(e) => setTableAttrs({ caption: e.target.value })} />
      </label>

      <label className="grid gap-1">
        <span>Table width</span>
        <input className="rounded border border-[var(--border)] px-2 py-1" type="text" placeholder="e.g., 100% or 800px" value={attrs.width ?? ""} onChange={(e) => setTableAttrs({ width: e.target.value })} />
      </label>
      <label className="grid gap-1">
        <span>Align</span>
        <select className="rounded border border-[var(--border)] px-2 py-1" value={attrs.align ?? "left"} onChange={(e) => setTableAttrs({ align: e.target.value })}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label className="grid gap-1">
        <span>Freeze first N columns</span>
        <input
          className="rounded border border-[var(--border)] px-2 py-1"
          type="number"
          min={0}
          max={10}
          value={Number((attrs as any)?.stickyFirstN ?? 0)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTableAttrs({ stickyFirstN: Number(e.target.value) })}
        />
      </label>

      <label className="grid gap-1">
        <span>Border Style</span>
        <select className="rounded border border-[var(--border)] px-2 py-1" value={attrs.borderStyle ?? "grid"} onChange={(e) => setTableAttrs({ borderStyle: e.target.value })}>
          <option value="none">None</option>
          <option value="grid">Grid</option>
          <option value="row">Row only</option>
          <option value="col">Column only</option>
        </select>
      </label>
      </div>

      <div className="border-t border-[var(--border)] px-3 py-2 font-semibold">Cell</div>
      <div className="grid grid-cols-2 gap-3 px-3 py-2">
        <label className="grid gap-1">
          <span className="text-xs text-zinc-500">Cell background</span>
          <input type="color" onChange={(e) => setCellBg(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-zinc-500">Cell padding</span>
          <input className="rounded border border-[var(--border)] px-2 py-1" type="text" placeholder="e.g., 8px" onChange={(e) => setCellPadding(e.target.value)} />
        </label>
        <div className="grid gap-1">
          <span className="text-xs text-zinc-500">Text align</span>
          <div className="flex gap-1">
            <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => setAlign("left")}>Left</button>
            <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => setAlign("center")}>Center</button>
            <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => setAlign("right")}>Right</button>
          </div>
        </div>
        <div className="grid gap-1">
          <span className="text-xs text-zinc-500">Vertical align</span>
          <div className="flex gap-1">
            <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => setVAlign("top")}>Top</button>
            <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => setVAlign("middle")}>Middle</button>
            <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => setVAlign("bottom")}>Bottom</button>
          </div>
        </div>
        <label className="grid gap-1">
          <span className="text-xs text-zinc-500">Row height</span>
          <input className="rounded border border-[var(--border)] px-2 py-1" type="text" placeholder="e.g., 32px" value={rowHeight} onChange={(e) => {
            try { editor.chain().focus().updateAttributes("tableRow", { height: e.target.value }).run(); } catch (err) { console.error("set row height", err); }
          }} />
        </label>
      </div>
      <div className="border-t border-[var(--border)] px-3 py-2 font-semibold">Structure & Ops</div>
      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().addRowBefore().run()}>+ Row ↑</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().addRowAfter().run()}>+ Row ↓</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().deleteRow().run()}>- Row</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Col ←</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col →</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().deleteColumn().run()}>- Col</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().mergeCells().run()}>Merge</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().splitCell().run()}>Split</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header row</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => {
          try { editor.chain().focus().setCellAttribute("backgroundColor", null).setCellAttribute("textAlign", null).setCellAttribute("verticalAlign", null).setCellAttribute("padding", null).setCellAttribute("borderColor", null).setCellAttribute("borderWidth", null).run();
          console.info("[Table] Cleared cell formatting"); } catch (e) { console.error("[Table] clear formatting error", e); }
        }}>Clear cells</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => onSort("asc")}>Sort ↑ column</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => onSort("desc")}>Sort ↓ column</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={onFillDown}>Fill down</button>
        <button className="rounded border border-[var(--border)] px-2 py-1" onClick={onFillRight}>Fill right</button>
        <div className="col-span-3 flex items-center gap-2">
          <span>Format column:</span>
          <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => onFormat("number")}>Number</button>
          <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => onFormat("currency")}>Currency</button>
          <button className="rounded border border-[var(--border)] px-2 py-1" onClick={() => onFormat("percent")}>Percent</button>
        </div>
      </div>
    </div>
  );
}


