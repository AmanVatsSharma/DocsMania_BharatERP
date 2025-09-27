import type { Editor } from "@tiptap/react";
import type { TableAttrs } from "@/lib/tableTypes";

/**
 * Replace the table that contains the current selection with a table
 * built from the given matrix of strings. Returns true when a table
 * was replaced, false otherwise.
 */
export function replaceCurrentTableWithMatrix(editor: Editor, matrix: string[][]): boolean {
  try {
    const { state } = editor;
    const { $from } = state.selection as any;
    let depth = $from.depth;
    let tablePos = -1;
    let tableNode: any = null;
    while (depth > 0) {
      const node = $from.node(depth);
      if (node.type?.name === "table") {
        tablePos = $from.before(depth);
        tableNode = node;
        break;
      }
      depth--;
    }
    if (tablePos < 0 || !tableNode) return false;

    const rows = Math.max(0, matrix.length);
    const cols = Math.max(0, ...matrix.map((r) => r.length));
    if (rows === 0 || cols === 0) return false;

    const tableJSON = {
      type: "table",
      attrs: tableNode.attrs ?? {},
      content: Array.from({ length: rows }, (_, r) => ({
        type: "tableRow",
        content: Array.from({ length: cols }, (_, c) => ({
          type: "tableCell",
          attrs: {},
          content: [
            { type: "paragraph", content: matrix[r]?.[c] ? [{ type: "text", text: matrix[r][c] }] : [] },
          ],
        })),
      })),
    } as any;

    const schema = state.schema as any;
    const node = schema.nodeFromJSON(tableJSON);
    const tr = state.tr;
    tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, node);
    editor.view.dispatch(tr);
    console.info("[tableUtils] Replaced table with matrix", { rows, cols });
    return true;
  } catch (e) {
    console.error("[tableUtils] replaceCurrentTableWithMatrix error", e);
    return false;
  }
}

function getTableContext(editor: Editor): { tablePos: number; tableNode: any; tableAttrs: TableAttrs } | null {
  const { state } = editor;
  const { $from } = state.selection as any;
  let depth = $from.depth;
  while (depth > 0) {
    const node = $from.node(depth);
    if (node.type?.name === "table") {
      const tablePos = $from.before(depth);
      return { tablePos, tableNode: node, tableAttrs: node.attrs as TableAttrs };
    }
    depth--;
  }
  return null;
}

function getSelectedCellCoords(editor: Editor): { rowIndex: number; colIndex: number } | null {
  try {
    const { state } = editor;
    const { $from } = state.selection as any;
    // Find table depth
    let tableDepth = -1;
    for (let d = $from.depth; d >= 0; d--) {
      const n = $from.node(d);
      if (n.type?.name === "table") { tableDepth = d; break; }
    }
    if (tableDepth < 0) return null;
    const rowDepth = tableDepth + 1;
    const cellDepth = tableDepth + 2;
    const rowIndex = $from.index(rowDepth);
    const colIndex = $from.index(cellDepth);
    return { rowIndex, colIndex };
  } catch (e) {
    console.error("[tableUtils] getSelectedCellCoords error", e);
    return null;
  }
}

export function sortTableByColumn(editor: Editor, direction: "asc" | "desc"): boolean {
  try {
    const ctx = getTableContext(editor);
    if (!ctx) return false;
    const { tablePos, tableNode, tableAttrs } = ctx;
    const coords = getSelectedCellCoords(editor);
    if (!coords) return false;
    const col = coords.colIndex;
    const rowsArr: any[] = [];
    tableNode.content.forEach((row: any) => rowsArr.push(row));
    if (rowsArr.length === 0) return false;
    const headerRows: any[] = [];
    const bodyRows: any[] = [];
    rowsArr.forEach((row: any, idx: number) => {
      const hasHeader = row.content.some((c: any) => c.type?.name === "tableHeader");
      if (idx === 0 && hasHeader) headerRows.push(row); else bodyRows.push(row);
    });
    function cellText(r: any, c: number): string {
      const cell = r.content?.[c];
      return (cell?.textContent ?? "");
    }
    const cmp = (a: any, b: any) => {
      const va = cellText(a, col);
      const vb = cellText(b, col);
      const na = Number.parseFloat(va.replace(/[,\s%]/g, ""));
      const nb = Number.parseFloat(vb.replace(/[,\s%]/g, ""));
      const aIsNum = !Number.isNaN(na);
      const bIsNum = !Number.isNaN(nb);
      if (aIsNum && bIsNum) {
        return direction === "asc" ? na - nb : nb - na;
      }
      return direction === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    };
    bodyRows.sort(cmp);
    const newTable = {
      type: "table",
      attrs: tableAttrs,
      content: [...headerRows, ...bodyRows].map((row) => ({
        type: "tableRow",
        content: row.content.map((cell: any) => cell.toJSON()),
      })),
    } as any;
    const schema = editor.state.schema as any;
    const node = schema.nodeFromJSON(newTable);
    const tr = editor.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, node);
    editor.view.dispatch(tr);
    console.info("[tableUtils] Sorted table by column", { col, direction });
    return true;
  } catch (e) {
    console.error("[tableUtils] sortTableByColumn error", e);
    return false;
  }
}

export function applyColumnAttr(editor: Editor, attr: string, value: any): boolean {
  try {
    const ctx = getTableContext(editor);
    if (!ctx) return false;
    const { tablePos, tableNode, tableAttrs } = ctx;
    const coords = getSelectedCellCoords(editor);
    if (!coords) return false;
    const col = coords.colIndex;
    const newRows: any[] = [];
    tableNode.content.forEach((row: any) => {
      const content = row.content.map((cell: any, ci: number) => {
        if (ci === col) {
          const json = cell.toJSON();
          json.attrs = { ...(json.attrs ?? {}), [attr]: value };
          return json;
        }
        return cell.toJSON();
      });
      newRows.push({ type: "tableRow", content });
    });
    const newTable = { type: "table", attrs: tableAttrs, content: newRows } as any;
    const schema = editor.state.schema as any;
    const node = schema.nodeFromJSON(newTable);
    const tr = editor.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, node);
    editor.view.dispatch(tr);
    console.info("[tableUtils] Applied column attr", { attr, value, col });
    return true;
  } catch (e) {
    console.error("[tableUtils] applyColumnAttr error", e);
    return false;
  }
}

export function fillDown(editor: Editor): boolean {
  try {
    const ctx = getTableContext(editor);
    if (!ctx) return false;
    const { tablePos, tableNode, tableAttrs } = ctx;
    const coords = getSelectedCellCoords(editor);
    if (!coords) return false;
    const { rowIndex, colIndex } = coords;
    const rowsArr: any[] = [];
    tableNode.content.forEach((r: any) => rowsArr.push(r));
    const sourceCell = rowsArr[rowIndex]?.content?.[colIndex];
    const text = sourceCell?.textContent ?? "";
    const newRows = rowsArr.map((row: any, ri: number) => {
      const content = row.content.map((cell: any, ci: number) => {
        if (ci === colIndex && ri > rowIndex) {
          return { type: cell.type.name, attrs: cell.attrs ?? {}, content: [{ type: "paragraph", content: text ? [{ type: "text", text }] : [] }] };
        }
        return cell.toJSON();
      });
      return { type: "tableRow", content };
    });
    const newTable = { type: "table", attrs: tableAttrs, content: newRows } as any;
    const schema = editor.state.schema as any;
    const node = schema.nodeFromJSON(newTable);
    const tr = editor.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, node);
    editor.view.dispatch(tr);
    console.info("[tableUtils] Fill down", { fromRow: rowIndex, col: colIndex });
    return true;
  } catch (e) {
    console.error("[tableUtils] fillDown error", e);
    return false;
  }
}

export function fillRight(editor: Editor): boolean {
  try {
    const ctx = getTableContext(editor);
    if (!ctx) return false;
    const { tablePos, tableNode, tableAttrs } = ctx;
    const coords = getSelectedCellCoords(editor);
    if (!coords) return false;
    const { rowIndex, colIndex } = coords;
    const rowsArr: any[] = [];
    tableNode.content.forEach((r: any) => rowsArr.push(r));
    const sourceCell = rowsArr[rowIndex]?.content?.[colIndex];
    const text = sourceCell?.textContent ?? "";
    const newRows = rowsArr.map((row: any, ri: number) => {
      if (ri !== rowIndex) return { type: "tableRow", content: row.content.map((c: any) => c.toJSON()) };
      const content = row.content.map((cell: any, ci: number) => {
        if (ci > colIndex) {
          return { type: cell.type.name, attrs: cell.attrs ?? {}, content: [{ type: "paragraph", content: text ? [{ type: "text", text }] : [] }] };
        }
        return cell.toJSON();
      });
      return { type: "tableRow", content };
    });
    const newTable = { type: "table", attrs: tableAttrs, content: newRows } as any;
    const schema = editor.state.schema as any;
    const node = schema.nodeFromJSON(newTable);
    const tr = editor.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, node);
    editor.view.dispatch(tr);
    console.info("[tableUtils] Fill right", { row: rowIndex, fromCol: colIndex });
    return true;
  } catch (e) {
    console.error("[tableUtils] fillRight error", e);
    return false;
  }
}

export function formatColumn(editor: Editor, kind: "number" | "currency" | "percent"): boolean {
  try {
    const ctx = getTableContext(editor);
    if (!ctx) return false;
    const { tablePos, tableNode, tableAttrs } = ctx;
    const coords = getSelectedCellCoords(editor);
    if (!coords) return false;
    const col = coords.colIndex;
    const fmtNumber = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
    const fmtCurrency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
    const fmtPercent = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 2 });
    function normalizePercent(input: string): number | null {
      const raw = input.trim();
      if (!raw) return null;
      if (raw.endsWith("%")) {
        const v = Number.parseFloat(raw.slice(0, -1).replace(/[,\s]/g, ""));
        return Number.isNaN(v) ? null : v / 100;
      }
      const v = Number.parseFloat(raw.replace(/[,\s]/g, ""));
      if (Number.isNaN(v)) return null;
      return v > 1 ? v / 100 : v;
    }
    const newRows: any[] = [];
    tableNode.content.forEach((row: any) => {
      const content = row.content.map((cell: any, ci: number) => {
        if (ci !== col) return cell.toJSON();
        const text = cell.textContent ?? "";
        let out = text;
        if (kind === "number") {
          const v = Number.parseFloat(text.replace(/[,\s%]/g, ""));
          if (!Number.isNaN(v)) out = fmtNumber.format(v);
        } else if (kind === "currency") {
          const v = Number.parseFloat(text.replace(/[,\s₹]/g, ""));
          if (!Number.isNaN(v)) out = fmtCurrency.format(v);
        } else if (kind === "percent") {
          const v = normalizePercent(text);
          if (v !== null) out = fmtPercent.format(v);
        }
        return { type: cell.type.name, attrs: cell.attrs ?? {}, content: [{ type: "paragraph", content: out ? [{ type: "text", text: out }] : [] }] };
      });
      newRows.push({ type: "tableRow", content });
    });
    const newTable = { type: "table", attrs: tableAttrs, content: newRows } as any;
    const schema = editor.state.schema as any;
    const node = schema.nodeFromJSON(newTable);
    const tr = editor.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, node);
    editor.view.dispatch(tr);
    console.info("[tableUtils] Format column", { col, kind });
    return true;
  } catch (e) {
    console.error("[tableUtils] formatColumn error", e);
    return false;
  }
}


