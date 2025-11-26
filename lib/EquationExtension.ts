import { Node, mergeAttributes } from "@tiptap/core";
import { clsx } from "clsx";

/**
 * Equation Extension - Math equations using LaTeX syntax
 * Displays equations inline or as blocks
 */

export interface EquationOptions {
  HTMLAttributes: Record<string, any>;
  inline: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    equation: {
      /**
       * Insert an equation
       */
      setEquation: (options: { formula: string; inline?: boolean }) => ReturnType;
      /**
       * Update an equation
       */
      updateEquation: (id: string, formula: string) => ReturnType;
    };
  }
}

export const Equation = Node.create<EquationOptions>({
  name: "equation",

  addOptions() {
    return {
      HTMLAttributes: {},
      inline: false,
    };
  },

  group: "block",

  content: "text*",

  atom: true,

  addAttributes() {
    return {
      formula: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-formula"),
        renderHTML: (attributes) => {
          if (!attributes.formula) {
            return {};
          }
          return {
            "data-formula": attributes.formula,
          };
        },
      },
      inline: {
        default: false,
        parseHTML: (element) => element.hasAttribute("data-inline"),
        renderHTML: (attributes) => {
          if (!attributes.inline) {
            return {};
          }
          return {
            "data-inline": "",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="equation"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const isInline = node.attrs.inline || this.options.inline;
    const formula = node.attrs.formula || "";

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "equation",
        "data-formula": formula,
        "data-inline": isInline ? "" : undefined,
        class: clsx(
          "equation-container",
          isInline ? "inline-equation" : "block-equation",
          "rounded border border-zinc-200 bg-zinc-50 p-2 font-mono text-sm"
        ),
        contenteditable: "false",
      }),
      [
        "span",
        { class: "equation-display" },
        formula || "Enter equation (LaTeX syntax)",
      ],
    ];
  },

  addCommands() {
    return {
      setEquation:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              formula: options.formula || "",
              inline: options.inline ?? false,
            },
          });
        },
      updateEquation:
        (id, formula) =>
        ({ tr, state }) => {
          const { doc } = state;
          let found = false;

          doc.descendants((node, pos) => {
            if (found) return false;
            if (node.type.name === this.name) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                formula,
              });
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
