import { TextStyle } from "@tiptap/extension-text-style";

/**
 * Extended TextStyle that supports fontSize, fontFamily, and custom styling
 * This enables rich text formatting in the editor
 */
const TextStyleExtended = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
      fontFamily: {
        default: null,
        parseHTML: (element) => element.style.fontFamily || null,
        renderHTML: (attributes) => {
          if (!attributes.fontFamily) {
            return {};
          }
          return {
            style: `font-family: ${attributes.fontFamily}`,
          };
        },
      },
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
      lineHeight: {
        default: null,
        parseHTML: (element) => element.style.lineHeight || null,
        renderHTML: (attributes) => {
          if (!attributes.lineHeight) {
            return {};
          }
          return {
            style: `line-height: ${attributes.lineHeight}`,
          };
        },
      },
      letterSpacing: {
        default: null,
        parseHTML: (element) => element.style.letterSpacing || null,
        renderHTML: (attributes) => {
          if (!attributes.letterSpacing) {
            return {};
          }
          return {
            style: `letter-spacing: ${attributes.letterSpacing}`,
          };
        },
      },
    };
  },
});

export default TextStyleExtended;
