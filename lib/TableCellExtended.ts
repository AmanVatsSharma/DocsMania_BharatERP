import TableCell from "@tiptap/extension-table-cell";

// Extend TableCell with additional attributes for background color and text alignment
export const TableCellExtended = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.backgroundColor || null,
        renderHTML: (attrs) => {
          return attrs.backgroundColor ? { style: `background-color:${attrs.backgroundColor}` } : {};
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.textAlign || null,
        renderHTML: (attrs) => {
          return attrs.textAlign ? { style: `text-align:${attrs.textAlign}` } : {};
        },
      },
      verticalAlign: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.verticalAlign || null,
        renderHTML: (attrs) => {
          return attrs.verticalAlign ? { style: `vertical-align:${attrs.verticalAlign}` } : {};
        },
      },
      padding: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.padding || null,
        renderHTML: (attrs) => {
          return attrs.padding ? { style: `padding:${attrs.padding}` } : {};
        },
      },
      borderColor: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.borderColor || null,
        renderHTML: (attrs) => {
          return attrs.borderColor ? { style: `border-color:${attrs.borderColor};border-style:solid` } : {};
        },
      },
      borderWidth: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.borderWidth || null,
        renderHTML: (attrs) => {
          return attrs.borderWidth ? { style: `border-width:${attrs.borderWidth};border-style:solid` } : {};
        },
      },
    };
  },
});

export default TableCellExtended;


