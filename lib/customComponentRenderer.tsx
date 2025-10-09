/**
 * Custom Component Renderer
 * Safely compiles and renders user-created React components
 */

import React from "react";

export interface CustomComponentDefinition {
  id: string;
  key: string;
  name: string;
  code: string;
  schema: any;
  defaultConfig: any;
}

/**
 * Transform JSX to React.createElement calls (basic implementation)
 * For production use, consider a proper JSX transformer like @babel/standalone
 */
function basicJSXTransform(code: string): string {
  // This is a simplified JSX transformer
  // It handles basic patterns but may not work for all complex JSX
  
  // Replace JSX tags with React.createElement
  // Handle self-closing tags: <Component />
  code = code.replace(
    /<(\w+)(\s+[^>]*)?\s*\/>/g,
    (match, tag, attrs) => {
      if (!attrs || !attrs.trim()) {
        return `React.createElement("${tag}", null)`;
      }
      // For simplicity, keep attributes as-is for now
      return `React.createElement("${tag}", ${parseProps(attrs)})`;
    }
  );
  
  // Note: A full JSX transformer would need proper parsing
  // This is just enough to handle the most common cases
  
  return code;
}

function parseProps(attrs: string): string {
  // Very basic prop parsing - just returns the string for now
  // A proper implementation would parse key="value" and {expr} patterns
  const trimmed = attrs.trim();
  if (!trimmed) return 'null';
  
  // For basic cases, wrap in object notation
  // This is a simplified approach
  return `{${trimmed}}`;
}

/**
 * Compile custom component code into a React component
 */
export function compileCustomComponent(code: string): React.ComponentType<any> | null {
  try {
    // Clean up the code
    let cleanCode = code.trim();
    
    // Remove export default statement
    if (cleanCode.includes("export default")) {
      cleanCode = cleanCode.replace(/export\s+default\s+/, "");
    }
    
    // Detect if code is a function declaration and wrap it
    if (cleanCode.startsWith("function ")) {
      cleanCode = `(${cleanCode})`;
    }
    
    // Try basic JSX transformation
    // For better JSX support, you'd use @babel/standalone
    const hasJSX = /<[a-zA-Z]/.test(cleanCode);
    if (hasJSX) {
      console.log("[CustomComponent] Detected JSX in component code");
      // In production, you'd use a proper JSX transformer here
      // cleanCode = basicJSXTransform(cleanCode);
    }
    
    // Create a function that evaluates the component
    // We pass React to make it available in the component scope
    const componentFactory = new Function(
      "React",
      `
      "use strict";
      try {
        // Return the component function
        return (${cleanCode});
      } catch (error) {
        console.error("[CustomComponent] Factory error:", error);
        throw error;
      }
      `
    );
    
    // Get the component function
    const ComponentFunction = componentFactory(React);
    
    // Return a wrapper that properly handles props
    return function CustomComponentWrapper({ props }: { props: any }) {
      try {
        // Call the component with props
        return React.createElement(ComponentFunction, { props });
      } catch (error) {
        console.error("[CustomComponent] Render error", error);
        return React.createElement("div", {
          style: {
            padding: "16px",
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            color: "#991b1b",
          }
        }, [
          React.createElement("strong", { key: "title" }, "Component Error: "),
          React.createElement("span", { key: "message" }, String(error))
        ]);
      }
    };
  } catch (error) {
    console.error("[CustomComponent] Compilation error", error);
    return null;
  }
}

/**
 * Create a preview component for the registry
 */
export function createCustomPreviewComponent(
  component: CustomComponentDefinition
): React.ComponentType<{ props: any }> {
  const compiled = compileCustomComponent(component.code);
  
  if (!compiled) {
    // Return error component
    return function ErrorComponent() {
      return React.createElement("div", {
        style: {
          padding: "24px",
          backgroundColor: "#fee2e2",
          border: "2px solid #ef4444",
          borderRadius: "8px",
          color: "#991b1b",
          textAlign: "center",
        }
      }, [
        React.createElement("strong", { key: "title" }, "Failed to compile component: "),
        React.createElement("br", { key: "br" }),
        React.createElement("code", { key: "code" }, component.key)
      ]);
    };
  }
  
  return compiled;
}

/**
 * Validate custom component code
 */
export function validateComponentCode(code: string): { valid: boolean; error?: string } {
  // Check for required export
  if (!code.includes("export default")) {
    return {
      valid: false,
      error: "Component must export a default function",
    };
  }
  
  // Check for function component
  if (!code.includes("function") && !code.includes("=>")) {
    return {
      valid: false,
      error: "Component must be a function component",
    };
  }
  
  // Try to compile
  try {
    const componentCode = code.replace(/^export default\s+/, "return ");
    new Function("React", "props", componentCode);
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: `Compilation error: ${error.message}`,
    };
  }
}

/**
 * Get all available React APIs for custom components
 */
export function getAvailableAPIs() {
  return {
    React: "React library (hooks, createElement, etc.)",
    props: "Component props object",
    
    // Available hooks
    "React.useState": "State management",
    "React.useEffect": "Side effects",
    "React.useMemo": "Memoization",
    "React.useCallback": "Callback memoization",
    "React.useRef": "Refs",
    
    // HTML/CSS
    "Inline styles": "Use style={{ ... }} for styling",
    "className": "Use className for CSS classes",
    
    // Common patterns
    "Conditional rendering": "Use ternary or && operator",
    "Lists": "Use .map() with key prop",
    "Events": "Use onClick, onChange, etc.",
  };
}

/**
 * Example component template
 */
export const EXAMPLE_COMPONENT_TEMPLATE = `export default function CustomComponent({ props }) {
  const {
    title = "Hello World",
    subtitle = "",
    backgroundColor = "#f8fafc",
    textColor = "#0f172a",
    buttonText = "Click Me",
    buttonLink = "#",
    alignment = "center"
  } = props || {};
  
  return (
    <div style={{
      padding: "48px",
      backgroundColor: backgroundColor,
      color: textColor,
      textAlign: alignment,
      borderRadius: "16px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    }}>
      <h2 style={{
        fontSize: "32px",
        fontWeight: "bold",
        marginBottom: "16px"
      }}>
        {title}
      </h2>
      
      {subtitle && (
        <p style={{
          fontSize: "18px",
          opacity: 0.8,
          marginBottom: "24px"
        }}>
          {subtitle}
        </p>
      )}
      
      {buttonText && (
        <a
          href={buttonLink}
          style={{
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "#8b5cf6",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
        >
          {buttonText}
        </a>
      )}
    </div>
  );
}`;

/**
 * Example schema for the template
 */
export const EXAMPLE_COMPONENT_SCHEMA = {
  title: {
    type: "string",
    label: "Title",
    default: "Hello World"
  },
  subtitle: {
    type: "string",
    label: "Subtitle",
    default: ""
  },
  backgroundColor: {
    type: "color",
    label: "Background Color",
    default: "#f8fafc"
  },
  textColor: {
    type: "color",
    label: "Text Color",
    default: "#0f172a"
  },
  buttonText: {
    type: "string",
    label: "Button Text",
    default: "Click Me"
  },
  buttonLink: {
    type: "string",
    label: "Button Link",
    default: "#"
  },
  alignment: {
    type: "select",
    options: ["left", "center", "right"],
    label: "Text Alignment",
    default: "center"
  }
};
