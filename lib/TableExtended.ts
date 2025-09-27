import { Table } from "@tiptap/extension-table";
import { mergeAttributes } from "@tiptap/core";

/**
 * TableExtended augments Tiptap's Table with table-level attributes
 * and utilities for styling/behavior in both editor and viewer.
 *
 * Attributes are rendered as data-attributes on the <table> element so
 * we can style inside the editor without interfering with default classes.
 * The viewer will also read these attrs to render parity features.
 */
export const TableExtended = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      stickyHeader: {
        default: false,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-sticky-header") === "true",
        renderHTML: (attrs) => (attrs.stickyHeader ? { "data-sticky-header": "true" } : {}),
      },
      stickyFirstColumn: {
        default: false,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-sticky-first-col") === "true",
        renderHTML: (attrs) => (attrs.stickyFirstColumn ? { "data-sticky-first-col": "true" } : {}),
      },
      stickyFirstN: {
        default: 0,
        parseHTML: (el) => {
          const raw = (el as HTMLElement).getAttribute("data-sticky-first-n");
          const n = raw ? Number(raw) : 0;
          return Number.isFinite(n) && n > 0 ? n : 0;
        },
        renderHTML: (attrs) => {
          const n = Number(attrs.stickyFirstN ?? 0);
          return n > 0 ? { "data-sticky-first-n": String(n) } : {};
        },
      },
      zebra: {
        default: false,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-zebra") === "true",
        renderHTML: (attrs) => (attrs.zebra ? { "data-zebra": "true" } : {}),
      },
      compact: {
        default: false,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-compact") === "true",
        renderHTML: (attrs) => (attrs.compact ? { "data-compact": "true" } : {}),
      },
      overflowX: {
        default: true,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-overflow-x") !== "false",
        renderHTML: (attrs) => ({ "data-overflow-x": String(!!attrs.overflowX) }),
      },
      caption: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-caption") || null,
        renderHTML: (attrs) => (attrs.caption ? { "data-caption": String(attrs.caption) } : {}),
      },
      align: {
        default: "left", // left | center | right
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-align") || "left",
        renderHTML: (attrs) => ({ "data-align": attrs.align ?? "left" }),
      },
      width: {
        default: null, // e.g., "100%" | "800px" | null
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-width") || null,
        renderHTML: (attrs) => (attrs.width ? { "data-width": String(attrs.width) } : {}),
      },
      borderStyle: {
        default: "grid", // none | grid | row | col
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-border-style") || "grid",
        renderHTML: (attrs) => ({ "data-border-style": attrs.borderStyle ?? "grid" }),
      },
    };
  },

  /**
   * Keep default table HTML, but merge data attributes to ensure
   * editor styling based on attributes works reliably.
   */
  renderHTML({ HTMLAttributes }) {
    return ["table", mergeAttributes(HTMLAttributes), ["tbody", 0]];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setTableAttribute:
        (name: string, value: unknown) =>
        ({ commands }: { commands: any }) =>
          commands.updateAttributes(this.name, { [name]: value }),
      setTableAttributes:
        (attrs: Record<string, unknown>) =>
        ({ commands }: { commands: any }) =>
          commands.updateAttributes(this.name, attrs),
    } as any;
  },
});

export default TableExtended;


