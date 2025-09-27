import Paragraph from "@tiptap/extension-paragraph";
import { mergeAttributes } from "@tiptap/core";

/**
 * ParagraphExtended adds enterprise-grade attributes for indent and spacing.
 * - indent: number of steps (each step ~24px)
 * - spacingBefore: CSS length (e.g., "8px") applied as margin-top
 * - spacingAfter: CSS length applied as margin-bottom
 */
const ParagraphExtended = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      indent: {
        default: 0,
        parseHTML: (element) => {
          const ml = element.style.marginLeft;
          if (!ml) return 0;
          const px = parseInt(ml, 10);
          if (Number.isFinite(px) && px > 0) return Math.round(px / 24);
          return 0;
        },
        renderHTML: (attributes) => {
          const n: number = Number(attributes.indent ?? 0) || 0;
          if (n <= 0) return {};
          return { style: `margin-left: ${n * 24}px;` };
        },
      },
      spacingBefore: {
        default: null,
        parseHTML: (element) => element.style.marginTop || null,
        renderHTML: (attributes) => {
          const v = attributes.spacingBefore as string | null;
          if (!v) return {};
          return { style: `margin-top: ${v};` };
        },
      },
      spacingAfter: {
        default: null,
        parseHTML: (element) => element.style.marginBottom || null,
        renderHTML: (attributes) => {
          const v = attributes.spacingAfter as string | null;
          if (!v) return {};
          return { style: `margin-bottom: ${v};` };
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element) => element.style.textAlign || null,
        renderHTML: (attributes) => {
          const v = attributes.textAlign as string | null;
          if (!v) return {};
          return { style: `text-align: ${v};` };
        },
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "p",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addCommands() {
    return {
      ...this.parent?.(),
      increaseIndent:
        () => ({ state, chain }) => {
          const { $from } = state.selection as any;
          const node = $from.parent;
          if (!node || node.type.name !== "paragraph") return false;
          const current = Number(node.attrs.indent ?? 0) || 0;
          const next = Math.min(current + 1, 12);
          return chain().setNodeAttribute("paragraph", "indent", next).run();
        },
      decreaseIndent:
        () => ({ state, chain }) => {
          const { $from } = state.selection as any;
          const node = $from.parent;
          if (!node || node.type.name !== "paragraph") return false;
          const current = Number(node.attrs.indent ?? 0) || 0;
          const next = Math.max(current - 1, 0);
          return chain().setNodeAttribute("paragraph", "indent", next).run();
        },
      setParagraphSpacing:
        (before: string | null, after: string | null) => ({ chain }) => {
          const attrs: Record<string, any> = {};
          if (before !== undefined) attrs.spacingBefore = before;
          if (after !== undefined) attrs.spacingAfter = after;
          return chain().updateAttributes("paragraph", attrs).run();
        },
    };
  },
});

export default ParagraphExtended;


