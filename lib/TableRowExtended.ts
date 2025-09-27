import TableRow from "@tiptap/extension-table-row";

/**
 * Extends TableRow to support a "height" attribute rendered as inline style.
 * This enables row height control from Inspector and drag-to-resize UX.
 */
export const TableRowExtended = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.height || null,
        renderHTML: (attrs) => (attrs.height ? { style: `height:${attrs.height}` } : {}),
      },
    };
  },
});

export default TableRowExtended;


