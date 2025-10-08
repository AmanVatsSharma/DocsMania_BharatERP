/**
 * Enhanced Image Extension for Tiptap
 * Adds resize, alignment, and advanced image controls
 */

import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageExtended: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string | number;
        height?: string | number;
        align?: 'left' | 'center' | 'right';
      }) => ReturnType;
      updateImageAttrs: (attrs: Record<string, any>) => ReturnType;
    };
  }
}

export const ImageExtended = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes.src) return {};
          return { src: attributes.src };
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => {
          if (!attributes.alt) return {};
          return { alt: attributes.alt };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { title: attributes.title };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width') || element.style.width;
          return width || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height') || element.style.height;
          return height || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => {
          const align = element.getAttribute('data-align');
          return align || 'center';
        },
        renderHTML: (attributes) => {
          return { 'data-align': attributes.align };
        },
      },
      float: {
        default: null,
        parseHTML: (element) => element.style.float || null,
        renderHTML: (attributes) => {
          if (!attributes.float) return {};
          return { style: `float: ${attributes.float}` };
        },
      },
      objectFit: {
        default: 'cover',
        parseHTML: (element) => element.style.objectFit || 'cover',
        renderHTML: (attributes) => {
          return {};
        },
      },
      s3Key: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-s3-key'),
        renderHTML: (attributes) => {
          if (!attributes.s3Key) return {};
          return { 'data-s3-key': attributes.s3Key };
        },
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
    
    // Build inline styles
    const styles: string[] = [];
    
    if (attrs.width) {
      const width = typeof attrs.width === 'number' ? `${attrs.width}px` : attrs.width;
      styles.push(`width: ${width}`);
    }
    
    if (attrs.height) {
      const height = typeof attrs.height === 'number' ? `${attrs.height}px` : attrs.height;
      styles.push(`height: ${height}`);
    }
    
    if (attrs.objectFit) {
      styles.push(`object-fit: ${attrs.objectFit}`);
    }
    
    // Handle alignment
    const align = attrs.align || 'center';
    if (align === 'center') {
      styles.push('display: block');
      styles.push('margin-left: auto');
      styles.push('margin-right: auto');
    } else if (align === 'left') {
      styles.push('float: left');
      styles.push('margin-right: 1rem');
    } else if (align === 'right') {
      styles.push('float: right');
      styles.push('margin-left: 1rem');
    }
    
    if (styles.length > 0) {
      attrs.style = styles.join('; ');
    }
    
    return ['img', attrs];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
      updateImageAttrs: (attrs) => ({ commands }) => {
        return commands.updateAttributes(this.name, attrs);
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement('div');
      container.className = 'image-wrapper';
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.maxWidth = '100%';
      
      const img = document.createElement('img');
      img.src = node.attrs.src;
      if (node.attrs.alt) img.alt = node.attrs.alt;
      if (node.attrs.title) img.title = node.attrs.title;
      
      // Apply styles
      const styles: string[] = [];
      if (node.attrs.width) {
        const width = typeof node.attrs.width === 'number' ? `${node.attrs.width}px` : node.attrs.width;
        styles.push(`width: ${width}`);
      }
      if (node.attrs.height) {
        const height = typeof node.attrs.height === 'number' ? `${node.attrs.height}px` : node.attrs.height;
        styles.push(`height: ${height}`);
      }
      if (node.attrs.objectFit) {
        styles.push(`object-fit: ${node.attrs.objectFit}`);
      }
      
      img.style.cssText = styles.join('; ');
      img.style.cursor = 'pointer';
      img.style.maxWidth = '100%';
      
      // Handle alignment on container
      const align = node.attrs.align || 'center';
      if (align === 'center') {
        container.style.display = 'block';
        container.style.marginLeft = 'auto';
        container.style.marginRight = 'auto';
        container.style.textAlign = 'center';
      } else if (align === 'left') {
        container.style.float = 'left';
        container.style.marginRight = '1rem';
        container.style.marginBottom = '0.5rem';
      } else if (align === 'right') {
        container.style.float = 'right';
        container.style.marginLeft = '1rem';
        container.style.marginBottom = '0.5rem';
      }
      
      // Add resize handles when selected
      let isSelected = false;
      
      const updateSelection = () => {
        const pos = getPos();
        if (typeof pos !== 'number') return;
        
        const { from, to } = editor.state.selection;
        isSelected = from <= pos && to >= pos + node.nodeSize;
        
        if (isSelected && !container.querySelector('.resize-handle')) {
          addResizeHandles();
        } else if (!isSelected) {
          removeResizeHandles();
        }
      };
      
      const addResizeHandles = () => {
        const positions = ['nw', 'ne', 'sw', 'se'];
        positions.forEach((pos) => {
          const handle = document.createElement('div');
          handle.className = `resize-handle resize-handle-${pos}`;
          handle.style.position = 'absolute';
          handle.style.width = '10px';
          handle.style.height = '10px';
          handle.style.backgroundColor = '#0ea5e9';
          handle.style.border = '2px solid white';
          handle.style.borderRadius = '50%';
          handle.style.cursor = `${pos}-resize`;
          handle.style.zIndex = '10';
          
          // Position the handle
          if (pos.includes('n')) handle.style.top = '-5px';
          if (pos.includes('s')) handle.style.bottom = '-5px';
          if (pos.includes('w')) handle.style.left = '-5px';
          if (pos.includes('e')) handle.style.right = '-5px';
          
          handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startResize(e, pos);
          });
          
          container.appendChild(handle);
        });
      };
      
      const removeResizeHandles = () => {
        container.querySelectorAll('.resize-handle').forEach((el) => el.remove());
      };
      
      const startResize = (e: MouseEvent, corner: string) => {
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = img.offsetWidth;
        const startHeight = img.offsetHeight;
        const aspectRatio = startWidth / startHeight;
        
        const onMouseMove = (e: MouseEvent) => {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          
          let newWidth = startWidth;
          let newHeight = startHeight;
          
          if (corner.includes('e')) {
            newWidth = startWidth + deltaX;
          } else if (corner.includes('w')) {
            newWidth = startWidth - deltaX;
          }
          
          // Maintain aspect ratio
          newHeight = newWidth / aspectRatio;
          
          // Apply constraints
          newWidth = Math.max(50, Math.min(newWidth, 1200));
          newHeight = Math.max(50, Math.min(newHeight, 1200));
          
          img.style.width = `${newWidth}px`;
          img.style.height = `${newHeight}px`;
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          // Update node attributes
          const pos = getPos();
          if (typeof pos === 'number') {
            editor.commands.updateAttributes('image', {
              width: `${img.offsetWidth}px`,
              height: `${img.offsetHeight}px`,
            });
          }
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };
      
      // Listen for selection changes
      editor.on('selectionUpdate', updateSelection);
      editor.on('update', updateSelection);
      
      img.addEventListener('click', () => {
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.chain().focus().setNodeSelection(pos).run();
        }
      });
      
      container.appendChild(img);
      
      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) return false;
          
          img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.alt) img.alt = updatedNode.attrs.alt;
          if (updatedNode.attrs.title) img.title = updatedNode.attrs.title;
          
          return true;
        },
        destroy: () => {
          editor.off('selectionUpdate', updateSelection);
          editor.off('update', updateSelection);
        },
      };
    };
  },
});

export default ImageExtended;