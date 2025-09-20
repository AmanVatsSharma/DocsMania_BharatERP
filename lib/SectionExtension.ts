import { Node, mergeAttributes } from "@tiptap/core";

export interface SectionAttrs {
  componentKey: string;
  props: Record<string, unknown> | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    section: {
      setSection: (attrs: SectionAttrs) => ReturnType;
    };
  }
}

export const Section = Node.create({
  name: "section",
  group: "block",
  content: "block*",
  draggable: true,
  atom: false,

  addAttributes() {
    return {
      componentKey: {
        default: "callout",
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-component-key"),
        renderHTML: (attrs) => ({ "data-component-key": attrs.componentKey }),
      },
      props: {
        default: null,
        parseHTML: (el) => {
          const raw = (el as HTMLElement).getAttribute("data-props");
          try {
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        },
        renderHTML: (attrs) => ({ "data-props": attrs.props ? JSON.stringify(attrs.props) : undefined }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "section[data-component-key]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["section", mergeAttributes(HTMLAttributes, { class: "dc-section" }), 0];
  },

  addCommands() {
    return {
      setSection:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs, content: [{ type: "paragraph" }] });
        },
    };
  },
});

export default Section;

