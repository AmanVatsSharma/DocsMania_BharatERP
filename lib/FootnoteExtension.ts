import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Footnote Extension - Google Docs style footnotes
 * Allows inserting footnotes that appear at the bottom of the page
 */

export interface FootnoteOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    footnote: {
      /**
       * Insert a footnote
       */
      setFootnote: (options: { id?: string; content?: string }) => ReturnType;
      /**
       * Update a footnote
       */
      updateFootnote: (id: string, content: string) => ReturnType;
      /**
       * Delete a footnote
       */
      deleteFootnote: (id: string) => ReturnType;
    };
  }
}

export const Footnote = Node.create<FootnoteOptions>({
  name: "footnote",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "inline",

  inline: true,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-footnote-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return {
            "data-footnote-id": attributes.id,
          };
        },
      },
      content: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-footnote-content"),
        renderHTML: (attributes) => {
          if (!attributes.content) {
            return {};
          }
          return {
            "data-footnote-content": attributes.content,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="footnote"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const id = node.attrs.id || `footnote-${Date.now()}`;
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "footnote",
        "data-footnote-id": id,
        class: "footnote-reference inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium cursor-pointer hover:bg-blue-200",
      }),
      id,
    ];
  },

  addCommands() {
    return {
      setFootnote:
        (options) =>
        ({ commands }) => {
          const id = options.id || `footnote-${Date.now()}`;
          return commands.insertContent({
            type: this.name,
            attrs: {
              id,
              content: options.content || "",
            },
          });
        },
      updateFootnote:
        (id, content) =>
        ({ tr, state }) => {
          const { doc } = state;
          let found = false;

          doc.descendants((node, pos) => {
            if (found) return false;
            if (node.type.name === this.name && node.attrs.id === id) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                content,
              });
              found = true;
              return false;
            }
            return true;
          });

          return found;
        },
      deleteFootnote:
        (id) =>
        ({ tr, state }) => {
          const { doc } = state;
          let found = false;

          doc.descendants((node, pos) => {
            if (found) return false;
            if (node.type.name === this.name && node.attrs.id === id) {
              tr.delete(pos, pos + node.nodeSize);
              found = true;
              return false;
            }
            return true;
          });

          return found;
        },
    };
  },
});
