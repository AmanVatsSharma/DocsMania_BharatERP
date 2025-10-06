# Custom React Components Guide

## 🎯 Overview

Create your own React components with custom JSX code and add them to your component library. Build anything you can imagine!

---

## ✨ Features

### What You Can Build:
- ✅ **Custom layouts** - Unique page structures
- ✅ **Interactive widgets** - Buttons, forms, calculators
- ✅ **Data visualizations** - Custom charts and graphs
- ✅ **Branded components** - Match your design system
- ✅ **Third-party integrations** - Embed external tools
- ✅ **Animated elements** - Smooth transitions and effects

### Capabilities:
- 📝 **Full JSX support** - Write React code naturally
- 🎨 **Styling freedom** - Inline styles or Tailwind
- ⚙️ **Props system** - Define customizable properties
- 👁️ **Live preview** - Test before saving
- 📦 **Import/Export** - Share components
- 🔄 **Hot reload** - See changes instantly

---

## 🚀 Quick Start (5 minutes)

### Step 1: Open Component Builder

In the editor:
1. Click **"Custom Components"** button (will be added to TopBar)
2. Click **"Create Component"**
3. Component Builder opens!

### Step 2: Write Your Component

```jsx
export default function MyComponent({ props }) {
  const { title = "Hello", color = "#000" } = props || {};
  
  return (
    <div style={{ padding: "20px", color: color }}>
      <h2>{title}</h2>
    </div>
  );
}
```

### Step 3: Define Props Schema

```json
{
  "title": {
    "type": "string",
    "label": "Title",
    "default": "Hello"
  },
  "color": {
    "type": "color",
    "label": "Text Color",
    "default": "#000000"
  }
}
```

### Step 4: Test & Save

1. Switch to **"Preview"** tab
2. Adjust test props
3. Click **"Refresh Preview"**
4. Click **"Create Component"**
5. Done! ✅

---

## 📝 Component Structure

### Basic Template:

```jsx
export default function CustomComponent({ props }) {
  // 1. Destructure props with defaults
  const {
    title = "Default Title",
    subtitle = "",
    backgroundColor = "#ffffff"
  } = props || {};
  
  // 2. Optional: Add state or logic
  // const [count, setCount] = React.useState(0);
  
  // 3. Return JSX
  return (
    <div style={{
      padding: "32px",
      backgroundColor: backgroundColor,
      borderRadius: "8px"
    }}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
```

### Key Rules:
1. ✅ **Must export default** function component
2. ✅ **Receive props** as `{ props }` parameter
3. ✅ **Destructure props** with defaults
4. ✅ **Return JSX** element
5. ✅ **Use inline styles** for reliability

---

## 🎨 Styling Your Components

### Method 1: Inline Styles (Recommended)

```jsx
<div style={{
  padding: "24px",
  backgroundColor: "#f8fafc",
  color: "#0f172a",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease"
}}>
  Content here
</div>
```

**Why inline styles?**
- ✅ Guaranteed to work in editor and published pages
- ✅ No dependency on external CSS
- ✅ Props can control styles directly
- ✅ Portable across projects

### Method 2: Tailwind Classes

```jsx
<div className="p-6 bg-zinc-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
  Content here
</div>
```

**Note**: Only works if Tailwind is available in the rendering context.

### Method 3: Dynamic Styles

```jsx
const containerStyle = {
  padding: props.spacing || "24px",
  backgroundColor: props.bgColor || "#ffffff",
  textAlign: props.alignment || "left",
  ...(props.fullWidth && { width: "100%" })
};

return <div style={containerStyle}>Content</div>;
```

---

## ⚙️ Props System

### Prop Types:

#### String:
```json
{
  "title": {
    "type": "string",
    "label": "Title",
    "default": "My Title"
  }
}
```

#### Number:
```json
{
  "fontSize": {
    "type": "number",
    "label": "Font Size (px)",
    "default": 16
  }
}
```

#### Boolean:
```json
{
  "showIcon": {
    "type": "boolean",
    "label": "Show Icon",
    "default": true
  }
}
```

#### Select (Dropdown):
```json
{
  "alignment": {
    "type": "select",
    "options": ["left", "center", "right"],
    "label": "Text Alignment",
    "default": "center"
  }
}
```

#### Color Picker:
```json
{
  "backgroundColor": {
    "type": "color",
    "label": "Background Color",
    "default": "#f8fafc"
  }
}
```

#### Image URL:
```json
{
  "imageUrl": {
    "type": "image",
    "label": "Image",
    "default": ""
  }
}
```

### Nested Objects:

```json
{
  "style": {
    "type": "object",
    "label": "Styling",
    "fields": {
      "backgroundColor": {
        "type": "color",
        "label": "Background",
        "default": "#ffffff"
      },
      "textColor": {
        "type": "color",
        "label": "Text Color",
        "default": "#000000"
      }
    }
  }
}
```

Usage in component:
```jsx
const { style = {} } = props || {};
const bgColor = style.backgroundColor || "#ffffff";
```

---

## 🧩 Example Components

### Example 1: Call-to-Action Card

```jsx
export default function CTACard({ props }) {
  const {
    heading = "Ready to get started?",
    description = "Sign up today and get 50% off",
    buttonText = "Sign Up Now",
    buttonLink = "/signup",
    backgroundColor = "#0f172a",
    textColor = "#ffffff",
    accentColor = "#8b5cf6"
  } = props || {};
  
  return (
    <div style={{
      padding: "48px",
      backgroundColor: backgroundColor,
      color: textColor,
      borderRadius: "16px",
      textAlign: "center",
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)"
    }}>
      <h2 style={{
        fontSize: "32px",
        fontWeight: "bold",
        marginBottom: "16px"
      }}>
        {heading}
      </h2>
      <p style={{
        fontSize: "18px",
        opacity: 0.9,
        marginBottom: "32px"
      }}>
        {description}
      </p>
      <a
        href={buttonLink}
        style={{
          display: "inline-block",
          padding: "16px 40px",
          backgroundColor: accentColor,
          color: "white",
          textDecoration: "none",
          borderRadius: "8px",
          fontWeight: "600",
          transition: "transform 0.2s"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {buttonText}
      </a>
    </div>
  );
}
```

**Props Schema:**
```json
{
  "heading": { "type": "string", "label": "Heading", "default": "Ready to get started?" },
  "description": { "type": "string", "label": "Description", "default": "Sign up today and get 50% off" },
  "buttonText": { "type": "string", "label": "Button Text", "default": "Sign Up Now" },
  "buttonLink": { "type": "string", "label": "Button Link", "default": "/signup" },
  "backgroundColor": { "type": "color", "label": "Background Color", "default": "#0f172a" },
  "textColor": { "type": "color", "label": "Text Color", "default": "#ffffff" },
  "accentColor": { "type": "color", "label": "Accent Color", "default": "#8b5cf6" }
}
```

---

### Example 2: Feature Grid

```jsx
export default function FeatureGrid({ props }) {
  const {
    features = [
      { icon: "⚡", title: "Fast", description: "Lightning fast performance" },
      { icon: "🔒", title: "Secure", description: "Enterprise-grade security" },
      { icon: "📱", title: "Mobile", description: "Works on all devices" }
    ],
    columns = 3,
    backgroundColor = "#f8fafc"
  } = props || {};
  
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "24px",
      padding: "48px",
      backgroundColor: backgroundColor,
      borderRadius: "16px"
    }}>
      {features.map((feature, index) => (
        <div
          key={index}
          style={{
            padding: "24px",
            backgroundColor: "white",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            transition: "transform 0.2s"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {feature.icon}
          </div>
          <h3 style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#0f172a"
          }}>
            {feature.title}
          </h3>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
```

**Props Schema:**
```json
{
  "features": {
    "type": "array",
    "label": "Features",
    "default": [
      { "icon": "⚡", "title": "Fast", "description": "Lightning fast performance" },
      { "icon": "🔒", "title": "Secure", "description": "Enterprise-grade security" },
      { "icon": "📱", "title": "Mobile", "description": "Works on all devices" }
    ]
  },
  "columns": {
    "type": "select",
    "options": [2, 3, 4],
    "label": "Columns",
    "default": 3
  },
  "backgroundColor": {
    "type": "color",
    "label": "Background Color",
    "default": "#f8fafc"
  }
}
```

---

### Example 3: Stats Counter

```jsx
export default function StatsCounter({ props }) {
  const {
    stats = [
      { number: "10K+", label: "Users" },
      { number: "99%", label: "Uptime" },
      { number: "24/7", label: "Support" }
    ],
    layout = "horizontal",
    accentColor = "#8b5cf6"
  } = props || {};
  
  const isHorizontal = layout === "horizontal";
  
  return (
    <div style={{
      display: "flex",
      flexDirection: isHorizontal ? "row" : "column",
      gap: "32px",
      justifyContent: "center",
      alignItems: "center",
      padding: "48px"
    }}>
      {stats.map((stat, index) => (
        <div
          key={index}
          style={{
            textAlign: "center",
            padding: "24px",
            flex: isHorizontal ? 1 : "none",
            minWidth: "150px"
          }}
        >
          <div style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: accentColor,
            marginBottom: "8px"
          }}>
            {stat.number}
          </div>
          <div style={{
            fontSize: "16px",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎓 Advanced Techniques

### Using React Hooks:

```jsx
export default function Counter({ props }) {
  const { initialCount = 0, step = 1 } = props || {};
  const [count, setCount] = React.useState(initialCount);
  
  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>
        {count}
      </div>
      <button
        onClick={() => setCount(count + step)}
        style={{
          padding: "12px 24px",
          backgroundColor: "#8b5cf6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Increment by {step}
      </button>
    </div>
  );
}
```

### Conditional Rendering:

```jsx
export default function ConditionalContent({ props }) {
  const { showHeader = true, showFooter = true, content = "" } = props || {};
  
  return (
    <div>
      {showHeader && (
        <header style={{ padding: "16px", backgroundColor: "#f8fafc" }}>
          <h1>Header</h1>
        </header>
      )}
      
      <main style={{ padding: "32px" }}>
        {content || "No content provided"}
      </main>
      
      {showFooter && (
        <footer style={{ padding: "16px", backgroundColor: "#f8fafc" }}>
          <p>Footer</p>
        </footer>
      )}
    </div>
  );
}
```

### Mapping Arrays:

```jsx
export default function ItemList({ props }) {
  const { items = ["Item 1", "Item 2", "Item 3"], bulletColor = "#8b5cf6" } = props || {};
  
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.map((item, index) => (
        <li
          key={index}
          style={{
            padding: "12px",
            marginBottom: "8px",
            borderLeft: `4px solid ${bulletColor}`,
            backgroundColor: "#f8fafc"
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

---

## 📦 Import/Export Components

### Export a Component:

1. Open **Custom Component Library**
2. Find your component
3. Click **Download** icon
4. `.json` file is downloaded

### Import a Component:

1. Open **Custom Component Library**
2. Click **Import** button
3. Select `.json` file
4. Component is added to library

### Share with Team:

```bash
# Share via Git
git add custom-components/*.json
git commit -m "Add custom hero component"
git push

# Or share via file sharing
# Email, Slack, Drive, etc.
```

---

## 🔒 Best Practices

### 1. Always Provide Defaults

```jsx
// ✅ Good
const { title = "Default" } = props || {};

// ❌ Bad
const { title } = props;
```

### 2. Validate Props

```jsx
const { count = 0 } = props || {};
const validCount = typeof count === 'number' ? count : 0;
```

### 3. Use Descriptive Names

```jsx
// ✅ Good
const { primaryButtonText, secondaryButtonColor } = props || {};

// ❌ Bad
const { btn1, color2 } = props || {};
```

### 4. Keep Components Simple

- One component = one purpose
- Split complex components into smaller ones
- Reuse logic where possible

### 5. Test Thoroughly

- Test all props combinations
- Check edge cases (empty strings, nulls, etc.)
- Test in both editor and published page

### 6. Document Your Components

```jsx
/**
 * Custom CTA Card Component
 * 
 * A call-to-action card with heading, description, and button.
 * 
 * Props:
 * - heading: Main heading text
 * - description: Supporting text
 * - buttonText: CTA button label
 * - buttonLink: URL for button
 * - backgroundColor: Card background color
 * 
 * @example
 * <CTACard props={{
 *   heading: "Get Started",
 *   description: "Join us today",
 *   buttonText: "Sign Up",
 *   buttonLink: "/signup"
 * }} />
 */
export default function CTACard({ props }) {
  // ...
}
```

---

## 🐛 Troubleshooting

### Component Won't Compile

**Problem**: Syntax error in code

**Solutions**:
1. Check for missing brackets `{}`
2. Ensure `export default` is present
3. Verify all JSX tags are closed
4. Check console for error details

### Component Renders Blank

**Problem**: No return statement or returns null

**Solutions**:
1. Ensure component returns JSX
2. Check conditional logic
3. Verify props are destructured correctly

### Styles Not Applying

**Problem**: CSS not working

**Solutions**:
1. Use inline styles: `style={{ ... }}`
2. Check style object syntax (camelCase)
3. Ensure values have units: `"24px"` not `24`

### Props Not Updating

**Problem**: Changes in Inspector don't reflect

**Solutions**:
1. Check prop names match schema
2. Refresh preview
3. Verify default values
4. Re-save component

---

## 📚 Resources

### React Documentation:
- Hooks: https://react.dev/reference/react
- JSX: https://react.dev/learn/writing-markup-with-jsx
- Events: https://react.dev/learn/responding-to-events

### CSS Styling:
- MDN CSS: https://developer.mozilla.org/en-US/docs/Web/CSS
- Flexbox: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- Grid: https://css-tricks.com/snippets/css/complete-guide-grid/

### Tailwind (if using):
- Docs: https://tailwindcss.com/docs

---

## ✅ Quick Checklist

Before saving your component:

- [ ] Component has `export default`
- [ ] Props are destructured with defaults
- [ ] All JSX tags are properly closed
- [ ] Inline styles use correct syntax
- [ ] Props schema matches component props
- [ ] Component name is descriptive
- [ ] Key is unique and URL-friendly
- [ ] Default config is set
- [ ] Tested in preview
- [ ] No console errors
- [ ] Works in both editor and published page

---

## 🎉 You're Ready!

You now know how to:
- ✅ Create custom React components
- ✅ Define props schemas
- ✅ Style components
- ✅ Use React hooks
- ✅ Test and preview
- ✅ Import/export components
- ✅ Troubleshoot issues

**Start building amazing custom components!** 🚀

---

*Need more examples? Check the Custom Component Library for pre-built samples!*
