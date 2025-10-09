import { NextResponse } from "next/server";

/**
 * Enterprise-grade component registry with 25+ blocks
 * Categories: Layout, Content, Media, Data, Interactive, Special
 * AI-friendly structure with metadata for auto-generation
 */
const seed = [
  // LAYOUT BLOCKS
  {
    key: "hero",
    name: "Hero Section",
    category: "Layout",
    description: "Large header section with title and CTA",
    tags: ["header", "banner", "landing"],
    schema: {
      title: { type: "string", label: "Title" },
      subtitle: { type: "string", label: "Subtitle" },
      ctaText: { type: "string", label: "CTA Button Text" },
      ctaLink: { type: "string", label: "CTA Link" },
      alignment: { type: "select", options: ["left", "center", "right"], label: "Alignment" },
      style: {
        type: "object",
        label: "Style",
        fields: {
          backgroundColor: { type: "string", label: "Background" },
          color: { type: "string", label: "Text Color" },
          borderRadius: { type: "number", label: "Radius" },
          shadow: { type: "select", options: ["none", "sm", "md", "lg"], label: "Shadow" },
        },
      },
    },
    defaultConfig: { 
      title: "Welcome to Our Platform", 
      subtitle: "Build amazing things with enterprise-grade tools", 
      ctaText: "Get Started",
      ctaLink: "#",
      alignment: "center",
      style: { backgroundColor: "#f8fafc", color: "#0f172a", borderRadius: 12, shadow: "sm" } 
    },
  },
  {
    key: "columns",
    name: "Column Layout",
    category: "Layout",
    description: "Multi-column responsive layout with adjustable widths",
    tags: ["layout", "grid", "responsive"],
    schema: {
      columns: { type: "select", options: ["2", "3", "4"], label: "Number of Columns" },
      gap: { type: "number", label: "Gap (px)" },
      equalHeight: { type: "boolean", label: "Equal Height" },
      columnWidths: { type: "string", label: "Column Widths (e.g., 30%,70% or 1fr,2fr)" },
      verticalAlign: { type: "select", options: ["stretch", "start", "center", "end"], label: "Vertical Align" },
      style: {
        type: "object",
        label: "Style",
        fields: {
          backgroundColor: { type: "string", label: "Background" },
          padding: { type: "number", label: "Padding (px)" },
          borderRadius: { type: "number", label: "Radius (px)" },
        },
      },
    },
    defaultConfig: { 
      columns: 2, 
      gap: 24, 
      equalHeight: true, 
      columnWidths: "50%,50%",
      verticalAlign: "stretch",
      style: { backgroundColor: "transparent", padding: 0, borderRadius: 0 }
    },
  },
  {
    key: "container",
    name: "Container",
    category: "Layout",
    description: "Flexible container with padding and max-width",
    tags: ["layout", "wrapper"],
    schema: {
      maxWidth: { type: "number", label: "Max Width (px)" },
      padding: { type: "number", label: "Padding (px)" },
      centered: { type: "boolean", label: "Centered" },
    },
    defaultConfig: { maxWidth: 1200, padding: 32, centered: true },
  },
  
  // CONTENT BLOCKS
  {
    key: "callout",
    name: "Callout Box",
    category: "Content",
    description: "Highlighted information box with icon",
    tags: ["alert", "notice", "info"],
    schema: {
      text: { type: "string", label: "Text" },
      type: { type: "select", options: ["info", "success", "warning", "error"], label: "Type" },
      icon: { type: "string", label: "Icon (emoji)" },
      style: {
        type: "object",
        label: "Style",
        fields: {
          backgroundColor: { type: "string", label: "Background" },
          color: { type: "string", label: "Text Color" },
          borderColor: { type: "string", label: "Left Border" },
        },
      },
    },
    defaultConfig: { 
      text: "💡 Pro tip: Use keyboard shortcuts to work faster!", 
      type: "info",
      icon: "💡",
      style: { backgroundColor: "#e0f2fe", color: "#0c4a6e", borderColor: "#0ea5e9" } 
    },
  },
  {
    key: "feature",
    name: "Feature List",
    category: "Content",
    description: "Showcase features with bullets",
    tags: ["features", "benefits", "list"],
    schema: {
      title: { type: "string", label: "Title" },
      description: { type: "string", label: "Description" },
      points: { type: "string", label: "Points (comma-separated)" },
      icon: { type: "string", label: "Icon for each point" },
    },
    defaultConfig: { 
      title: "Why choose our platform?", 
      description: "Built for modern teams", 
      points: "⚡ Lightning fast,🔒 Enterprise security,📈 Scalable architecture,🎨 Beautiful design",
      icon: "✓"
    },
  },
  {
    key: "quote",
    name: "Blockquote",
    category: "Content",
    description: "Pull quote or testimonial",
    tags: ["quote", "testimonial"],
    schema: {
      text: { type: "string", label: "Quote Text" },
      author: { type: "string", label: "Author" },
      role: { type: "string", label: "Role/Company" },
      avatar: { type: "string", label: "Avatar URL" },
    },
    defaultConfig: { 
      text: "This platform transformed how we work. Highly recommended!",
      author: "Sarah Johnson",
      role: "CEO, TechCorp",
      avatar: ""
    },
  },
  {
    key: "stats",
    name: "Stats Grid",
    category: "Content",
    description: "Display key metrics and numbers",
    tags: ["metrics", "numbers", "kpi"],
    schema: {
      stats: { type: "string", label: "Stats (format: number|label|description, separated by semicolon)" },
    },
    defaultConfig: { 
      stats: "10M+|Active Users|Growing daily;99.9%|Uptime|Enterprise SLA;24/7|Support|Always here to help;150+|Countries|Global presence"
    },
  },
  
  // INTERACTIVE BLOCKS
  {
    key: "accordion",
    name: "Accordion",
    category: "Interactive",
    description: "Collapsible content sections",
    tags: ["collapsible", "faq", "expand"],
    schema: {
      items: { type: "string", label: "Items (format: title|content, separated by semicolon)" },
      defaultOpen: { type: "boolean", label: "First item open by default" },
      multipleOpen: { type: "boolean", label: "Allow multiple open" },
    },
    defaultConfig: { 
      items: "What is this platform?|A modern document creation and hosting platform;How do I get started?|Simply create an account and start building;Is there a free tier?|Yes, we offer a generous free tier",
      defaultOpen: true,
      multipleOpen: false
    },
  },
  {
    key: "tabs",
    name: "Tabs",
    category: "Interactive",
    description: "Tabbed content sections",
    tags: ["tabs", "navigation"],
    schema: {
      tabs: { type: "string", label: "Tabs (format: label|content, separated by semicolon)" },
    },
    defaultConfig: { 
      tabs: "Overview|Welcome to our platform overview;Features|Explore our powerful features;Pricing|View pricing plans"
    },
  },
  {
    key: "button",
    name: "Button",
    category: "Interactive",
    description: "Call-to-action button",
    tags: ["cta", "action", "link"],
    schema: {
      text: { type: "string", label: "Button Text" },
      link: { type: "string", label: "Link URL" },
      variant: { type: "select", options: ["primary", "secondary", "outline", "ghost"], label: "Variant" },
      size: { type: "select", options: ["sm", "md", "lg"], label: "Size" },
    },
    defaultConfig: { text: "Get Started", link: "#", variant: "primary", size: "md" },
  },
  
  // MEDIA BLOCKS
  {
    key: "image",
    name: "Image Block",
    category: "Media",
    description: "Image with caption and styling",
    tags: ["image", "photo", "picture"],
    schema: {
      src: { type: "string", label: "Image URL" },
      alt: { type: "string", label: "Alt Text" },
      caption: { type: "string", label: "Caption" },
      width: { type: "select", options: ["small", "medium", "large", "full"], label: "Width" },
      rounded: { type: "boolean", label: "Rounded Corners" },
    },
    defaultConfig: { src: "/placeholder.svg", alt: "Image", caption: "", width: "large", rounded: true },
  },
  {
    key: "gallery",
    name: "Image Gallery",
    category: "Media",
    description: "Grid of images with lightbox",
    tags: ["gallery", "images", "photos"],
    schema: {
      images: { type: "string", label: "Image URLs (comma-separated)" },
      columns: { type: "select", options: ["2", "3", "4"], label: "Columns" },
      gap: { type: "number", label: "Gap (px)" },
    },
    defaultConfig: { images: "/placeholder.svg,/placeholder.svg,/placeholder.svg", columns: "3", gap: 16 },
  },
  {
    key: "video",
    name: "Video Player",
    category: "Media",
    description: "Embedded video player (YouTube, Vimeo, etc.)",
    tags: ["video", "media", "embed"],
    schema: {
      url: { type: "string", label: "Video URL" },
      autoplay: { type: "boolean", label: "Autoplay" },
      controls: { type: "boolean", label: "Show Controls" },
    },
    defaultConfig: { url: "", autoplay: false, controls: true },
  },
  {
    key: "embed",
    name: "Embed",
    category: "Media",
    description: "Embed external content (iframe)",
    tags: ["iframe", "embed", "external"],
    schema: {
      url: { type: "string", label: "Embed URL" },
      height: { type: "number", label: "Height (px)" },
    },
    defaultConfig: { url: "", height: 400 },
  },
  
  // DATA BLOCKS
  {
    key: "table-block",
    name: "Data Table",
    category: "Data",
    description: "Styled data table with sorting",
    tags: ["table", "data", "spreadsheet"],
    schema: {
      headers: { type: "string", label: "Headers (comma-separated)" },
      rows: { type: "string", label: "Rows (use | for columns, ; for rows)" },
      striped: { type: "boolean", label: "Striped Rows" },
    },
    defaultConfig: { 
      headers: "Name,Email,Role",
      rows: "John Doe|john@example.com|Admin;Jane Smith|jane@example.com|User",
      striped: true
    },
  },
  {
    key: "code",
    name: "Code Block",
    category: "Data",
    description: "Syntax-highlighted code",
    tags: ["code", "syntax", "programming"],
    schema: {
      code: { type: "string", label: "Code" },
      language: { type: "select", options: ["javascript", "typescript", "python", "html", "css", "json"], label: "Language" },
      showLineNumbers: { type: "boolean", label: "Line Numbers" },
    },
    defaultConfig: { 
      code: "const greeting = 'Hello, World!';\nconsole.log(greeting);",
      language: "javascript",
      showLineNumbers: true
    },
  },
  {
    key: "chart",
    name: "Chart",
    category: "Data",
    description: "Data visualization",
    tags: ["chart", "graph", "visualization"],
    schema: {
      type: { type: "select", options: ["bar", "line", "pie", "area"], label: "Chart Type" },
      data: { type: "string", label: "Data (JSON)" },
      title: { type: "string", label: "Title" },
    },
    defaultConfig: { 
      type: "bar",
      data: '{"labels":["Jan","Feb","Mar"],"values":[10,20,15]}',
      title: "Monthly Stats"
    },
  },
  
  // SPECIAL BLOCKS
  {
    key: "timeline",
    name: "Timeline",
    category: "Special",
    description: "Vertical timeline of events",
    tags: ["timeline", "roadmap", "history"],
    schema: {
      events: { type: "string", label: "Events (format: date|title|description, separated by semicolon)" },
    },
    defaultConfig: { 
      events: "2024 Q1|Launch|Platform goes live;2024 Q2|Growth|Reached 1M users;2024 Q3|Expansion|International rollout"
    },
  },
  {
    key: "card",
    name: "Card",
    category: "Special",
    description: "Content card with image and text",
    tags: ["card", "box"],
    schema: {
      image: { type: "string", label: "Image URL" },
      title: { type: "string", label: "Title" },
      description: { type: "string", label: "Description" },
      link: { type: "string", label: "Link" },
    },
    defaultConfig: { 
      image: "/placeholder.svg",
      title: "Card Title",
      description: "Card description goes here",
      link: "#"
    },
  },
  {
    key: "divider",
    name: "Divider",
    category: "Special",
    description: "Visual separator between sections",
    tags: ["separator", "hr"],
    schema: {
      style: { type: "select", options: ["solid", "dashed", "dotted"], label: "Style" },
      spacing: { type: "number", label: "Spacing (px)" },
    },
    defaultConfig: { style: "solid", spacing: 32 },
  },
  {
    key: "spacer",
    name: "Spacer",
    category: "Special",
    description: "Empty space for vertical rhythm",
    tags: ["space", "gap"],
    schema: {
      height: { type: "number", label: "Height (px)" },
    },
    defaultConfig: { height: 48 },
  },
  {
    key: "alert",
    name: "Alert Banner",
    category: "Special",
    description: "Full-width notification banner",
    tags: ["alert", "banner", "notification"],
    schema: {
      message: { type: "string", label: "Message" },
      type: { type: "select", options: ["info", "success", "warning", "error"], label: "Type" },
      dismissible: { type: "boolean", label: "Dismissible" },
    },
    defaultConfig: { 
      message: "📢 New feature: Real-time collaboration is now available!",
      type: "info",
      dismissible: true
    },
  },
  {
    key: "pricing",
    name: "Pricing Card",
    category: "Special",
    description: "Pricing tier display",
    tags: ["pricing", "plan", "subscription"],
    schema: {
      name: { type: "string", label: "Plan Name" },
      price: { type: "string", label: "Price" },
      features: { type: "string", label: "Features (comma-separated)" },
      highlighted: { type: "boolean", label: "Highlighted" },
    },
    defaultConfig: { 
      name: "Pro",
      price: "$29/mo",
      features: "Unlimited docs,Advanced analytics,Priority support,Custom domain",
      highlighted: true
    },
  },
];

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: seed });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Failed to list components" } },
      { status: 500 }
    );
  }
}

