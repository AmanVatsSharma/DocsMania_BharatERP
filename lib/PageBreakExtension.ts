import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Page Break Extension - Insert page breaks for printing
 * Similar to Google Docs page breaks
 */

export interface PageBreakOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * Insert a page break
       */
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create<PageBreakOptions>({
  name: "pageBreak",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",

  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]',
      },
      {
        tag: 'hr.page-break',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "page-break",
        class: "page-break my-8 flex items-center justify-center before:content-[''] before:flex-1 before:border-t before:border-zinc-300 after:content-[''] after:flex-1 after:border-t after:border-zinc-300",
      }),
      [
        "span",
        {
          class: "mx-4 text-xs font-medium text-zinc-500",
        },
        "Page Break",
      ],
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.setPageBreak(),
    };
  },
});
