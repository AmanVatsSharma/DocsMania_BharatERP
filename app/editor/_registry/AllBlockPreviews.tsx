import React from "react";
import { PreviewProps } from "./sections";

/**
 * Comprehensive preview components for all 25+ blocks
 * These render in both editor and published pages
 */

// LAYOUT BLOCKS

export function HeroPreview({ props }: PreviewProps) {
  const { 
    title = "Hero Title", 
    subtitle = "", 
    ctaText = "Get Started", 
    ctaLink = "#", 
    alignment = "center", 
    style = {} 
  } = props || {};
  
  // Ensure all style props are applied
  const containerStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor || "#f8fafc",
    color: style.color || "#0f172a",
    borderRadius: style.borderRadius ? `${style.borderRadius}px` : "12px",
    textAlign: alignment as any,
    padding: "48px",
    boxShadow: style.shadow === "sm" ? "0 1px 2px rgba(0,0,0,0.05)" :
               style.shadow === "md" ? "0 4px 6px rgba(0,0,0,0.07)" :
               style.shadow === "lg" ? "0 10px 15px rgba(0,0,0,0.1)" : "none",
    border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor || "#e5e7eb"}` : undefined,
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "16px", fontSize: "36px", fontWeight: "bold" }}>{title}</h1>
      {subtitle && <p style={{ marginBottom: "24px", fontSize: "20px", opacity: 0.8 }}>{subtitle}</p>}
      {ctaText && (
        <a 
          href={ctaLink} 
          style={{
            display: "inline-block",
            borderRadius: "8px",
            backgroundColor: style.accentColor || "#18181b",
            padding: "12px 24px",
            fontWeight: 600,
            color: "#ffffff",
            textDecoration: "none"
          }}
        >
          {ctaText}
        </a>
      )}
    </div>
  );
}

export function ColumnsPreview({ props }: PreviewProps) {
  const { 
    columns = 2,
    gap = 24, 
    equalHeight = true,
    columnWidths = "",
    verticalAlign = "stretch",
    style = {}
  } = props || {};
  
  const numColumns = typeof columns === 'string' ? parseInt(columns) : columns;
  
  // Parse columnWidths from string (e.g., "30%,70%" or "1fr,2fr" or array)
  let widths: string[] = [];
  if (typeof columnWidths === 'string' && columnWidths.trim()) {
    widths = columnWidths.split(',').map(w => w.trim());
  } else if (Array.isArray(columnWidths)) {
    widths = columnWidths;
  }
  
  // If no widths specified, create equal distribution
  if (widths.length === 0) {
    widths = Array(numColumns).fill("1fr");
  }
  
  // Ensure we have the right number of widths
  const finalWidths = widths.slice(0, numColumns);
  while (finalWidths.length < numColumns) {
    finalWidths.push("1fr");
  }
  
  const containerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: finalWidths.join(' '),
    gap: `${gap}px`,
    alignItems: equalHeight ? "stretch" : verticalAlign,
    backgroundColor: style?.backgroundColor || "transparent",
    padding: style?.padding ? `${style.padding}px` : "0",
    borderRadius: style?.borderRadius ? `${style.borderRadius}px` : "0",
  };

  return (
    <div style={containerStyle}>
      {Array.from({ length: numColumns }).map((_, i) => (
        <div 
          key={i} 
          className="column-item"
          style={{
            minHeight: "100px",
            padding: "16px",
            border: "1px dashed #e5e7eb",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
            position: "relative"
          }}
        >
          <div className="text-xs text-zinc-400 mb-2">
            Column {i + 1} ({finalWidths[i]})
          </div>
          <div className="text-sm text-zinc-600">
            Drop components, images, or add text here
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContainerPreview({ props }: PreviewProps) {
  const { maxWidth = 1200, padding = 32, centered = true } = props || {};
  return (
    <div 
      style={{
        maxWidth: `${maxWidth}px`,
        padding: `${padding}px`,
        margin: centered ? "0 auto" : undefined,
        border: "1px dashed #e5e7eb",
        borderRadius: "8px"
      }}
    >
      <div className="text-sm text-zinc-500">Container (max-width: {maxWidth}px)</div>
    </div>
  );
}

// CONTENT BLOCKS

export function CalloutPreview({ props }: PreviewProps) {
  const { text = "This is a callout", type = "info", icon = "💡", style = {} } = props || {};
  const typeColors = {
    info: { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6" },
    success: { bg: "#dcfce7", color: "#166534", border: "#22c55e" },
    warning: { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" },
    error: { bg: "#fee2e2", color: "#991b1b", border: "#ef4444" }
  };
  const colors = typeColors[type as keyof typeof typeColors] || typeColors.info;
  
  const containerStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor || colors.bg,
    color: style.color || colors.color,
    borderLeft: `4px solid ${style.borderColor || colors.border}`,
    borderRadius: "8px",
    padding: "16px",
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {icon && <span style={{ fontSize: "20px" }}>{icon}</span>}
        <div style={{ flex: 1 }}>{text}</div>
      </div>
    </div>
  );
}

export function FeaturePreview({ props }: PreviewProps) {
  const { title = "Features", description = "", points = "", icon = "✓" } = props || {};
  const pointsList = points.split(",").filter(Boolean);
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <h3 className="mb-2 text-2xl font-bold">{title}</h3>
      {description && <p className="mb-4 text-zinc-600">{description}</p>}
      <ul className="space-y-2">
        {pointsList.map((point: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-600">{icon}</span>
            <span>{point.trim()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function QuotePreview({ props }: PreviewProps) {
  const { text = "Quote text", author = "", role = "", avatar = "" } = props || {};
  return (
    <div className="rounded-lg border-l-4 border-zinc-900 bg-zinc-50 p-6">
      <blockquote className="mb-4 text-lg italic text-zinc-700">"{text}"</blockquote>
      {author && (
        <div className="flex items-center gap-3">
          {avatar && (
            <img src={avatar} alt={author} className="h-10 w-10 rounded-full" />
          )}
          <div>
            <div className="font-semibold">{author}</div>
            {role && <div className="text-sm text-zinc-500">{role}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export function StatsPreview({ props }: PreviewProps) {
  const { stats = "" } = props || {};
  const statsList = stats.split(";").filter(Boolean).map((s: string) => {
    const [number, label, description] = s.split("|");
    return { number, label, description };
  });
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statsList.map((stat: any, i: number) => (
        <div key={i} className="rounded-lg bg-zinc-50 p-6 text-center">
          <div className="mb-2 text-4xl font-bold text-zinc-900">{stat.number}</div>
          <div className="mb-1 font-semibold text-zinc-700">{stat.label}</div>
          {stat.description && <div className="text-sm text-zinc-500">{stat.description}</div>}
        </div>
      ))}
    </div>
  );
}

// INTERACTIVE BLOCKS

export function AccordionPreview({ props }: PreviewProps) {
  const { items = "", defaultOpen = true } = props || {};
  const itemsList = items.split(";").filter(Boolean).map((item: string) => {
    const [title, content] = item.split("|");
    return { title, content };
  });
  return (
    <div className="space-y-2">
      {itemsList.map((item: any, i: number) => (
        <div key={i} className="rounded-lg border border-zinc-200">
          <button className="flex w-full items-center justify-between p-4 text-left font-semibold hover:bg-zinc-50">
            {item.title}
            <span>{i === 0 && defaultOpen ? "▼" : "▶"}</span>
          </button>
          {i === 0 && defaultOpen && (
            <div className="border-t border-zinc-200 p-4 text-zinc-600">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function TabsPreview({ props }: PreviewProps) {
  const { tabs = "" } = props || {};
  const tabsList = tabs.split(";").filter(Boolean).map((tab: string) => {
    const [label, content] = tab.split("|");
    return { label, content };
  });
  return (
    <div className="rounded-lg border border-zinc-200">
      <div className="flex border-b border-zinc-200">
        {tabsList.map((tab: any, i: number) => (
          <button 
            key={i} 
            className={`px-4 py-2 font-medium ${i === 0 ? "border-b-2 border-zinc-900 text-zinc-900" : "text-zinc-500"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabsList[0] && (
        <div className="p-4">{tabsList[0].content}</div>
      )}
    </div>
  );
}

export function ButtonPreview({ props }: PreviewProps) {
  const { text = "Button", link = "#", variant = "primary", size = "md" } = props || {};
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300",
    outline: "border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-50",
    ghost: "text-zinc-900 hover:bg-zinc-100"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  return (
    <a 
      href={link}
      className={`inline-block rounded-lg font-semibold ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]}`}
    >
      {text}
    </a>
  );
}

// MEDIA BLOCKS

export function ImageBlockPreview({ props }: PreviewProps) {
  const { src = "/placeholder.svg", alt = "Image", caption = "", width = "large", rounded = true } = props || {};
  const widths = { small: "300px", medium: "600px", large: "800px", full: "100%" };
  return (
    <figure style={{ maxWidth: widths[width as keyof typeof widths] || widths.large, margin: "0 auto" }}>
      <img 
        src={src} 
        alt={alt}
        className={rounded ? "rounded-lg" : ""}
        style={{ width: "100%", height: "auto" }}
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-zinc-500">{caption}</figcaption>
      )}
    </figure>
  );
}

export function GalleryPreview({ props }: PreviewProps) {
  const { images = "", columns = "3", gap = 16 } = props || {};
  const imageList = images.split(",").filter(Boolean);
  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {imageList.map((img: string, i: number) => (
        <img key={i} src={img.trim()} alt={`Gallery ${i + 1}`} className="h-48 w-full rounded-lg object-cover" />
      ))}
    </div>
  );
}

export function VideoPreview({ props }: PreviewProps) {
  const { url = "", autoplay = false, controls = true } = props || {};
  if (!url) return <div className="rounded-lg bg-zinc-100 p-12 text-center text-zinc-500">Video URL not set</div>;
  
  // YouTube embed
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.includes("youtu.be") 
      ? url.split("/").pop()
      : new URL(url).searchParams.get("v");
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg">
        <iframe 
          src={`https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  
  return (
    <video src={url} controls={controls} autoPlay={autoplay} className="w-full rounded-lg" />
  );
}

export function EmbedPreview({ props }: PreviewProps) {
  const { url = "", height = 400 } = props || {};
  if (!url) return <div className="rounded-lg bg-zinc-100 p-12 text-center text-zinc-500">Embed URL not set</div>;
  return (
    <iframe 
      src={url}
      style={{ width: "100%", height: `${height}px`, border: "1px solid #e5e7eb", borderRadius: "8px" }}
      title="Embedded content"
    />
  );
}

// DATA BLOCKS

export function TableBlockPreview({ props }: PreviewProps) {
  const { headers = "", rows = "", striped = true } = props || {};
  const headerList = headers.split(",").filter(Boolean);
  const rowsList = rows.split(";").filter(Boolean).map((row: string) => row.split("|"));
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            {headerList.map((header: string, i: number) => (
              <th key={i} className="px-4 py-2 text-left font-semibold">{header.trim()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowsList.map((row: string[], i: number) => (
            <tr key={i} className={`border-b border-zinc-200 ${striped && i % 2 === 1 ? "bg-zinc-50" : ""}`}>
              {row.map((cell: string, j: number) => (
                <td key={j} className="px-4 py-2">{cell.trim()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CodePreview({ props }: PreviewProps) {
  const { code = "", language = "javascript", showLineNumbers = true } = props || {};
  return (
    <div className="rounded-lg bg-zinc-900 p-4 text-sm text-white">
      <div className="mb-2 text-xs text-zinc-400">{language}</div>
      <pre className="overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ChartPreview({ props }: PreviewProps) {
  const { type = "bar", title = "" } = props || {};
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <h4 className="mb-4 font-semibold">{title || "Chart"}</h4>
      <div className="flex h-48 items-end justify-around gap-2">
        <div className="w-full bg-blue-500" style={{ height: "60%" }} />
        <div className="w-full bg-blue-500" style={{ height: "80%" }} />
        <div className="w-full bg-blue-500" style={{ height: "50%" }} />
      </div>
      <div className="mt-2 text-center text-xs text-zinc-500">{type} chart</div>
    </div>
  );
}

// SPECIAL BLOCKS

export function TimelinePreview({ props }: PreviewProps) {
  const { events = "" } = props || {};
  const eventsList = events.split(";").filter(Boolean).map((event: string) => {
    const [date, title, description] = event.split("|");
    return { date, title, description };
  });
  return (
    <div className="space-y-6">
      {eventsList.map((event: any, i: number) => (
        <div key={i} className="relative flex gap-4 pl-8">
          <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-zinc-900" />
          {i < eventsList.length - 1 && (
            <div className="absolute left-[5px] top-4 h-full w-0.5 bg-zinc-200" />
          )}
          <div>
            <div className="mb-1 text-sm font-semibold text-zinc-500">{event.date}</div>
            <div className="mb-1 font-semibold">{event.title}</div>
            <div className="text-sm text-zinc-600">{event.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardPreview({ props }: PreviewProps) {
  const { image = "", title = "Card Title", description = "", link = "#" } = props || {};
  return (
    <a href={link} className="block overflow-hidden rounded-lg border border-zinc-200 transition-shadow hover:shadow-lg">
      {image && (
        <img src={image} alt={title} className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h4 className="mb-2 font-semibold">{title}</h4>
        {description && <p className="text-sm text-zinc-600">{description}</p>}
      </div>
    </a>
  );
}

export function DividerPreview({ props }: PreviewProps) {
  const { style = "solid", spacing = 32 } = props || {};
  const styles = {
    solid: "border-t border-zinc-200",
    dashed: "border-t border-dashed border-zinc-300",
    dotted: "border-t border-dotted border-zinc-300"
  };
  return (
    <div style={{ margin: `${spacing}px 0` }} className={styles[style as keyof typeof styles]} />
  );
}

export function SpacerPreview({ props }: PreviewProps) {
  const { height = 48 } = props || {};
  return (
    <div style={{ height: `${height}px`, borderLeft: "2px dashed #e5e7eb", marginLeft: "20px" }}>
      <span className="text-xs text-zinc-400">Spacer ({height}px)</span>
    </div>
  );
}

export function AlertPreview({ props }: PreviewProps) {
  const { message = "Alert message", type = "info", dismissible = true } = props || {};
  const types = {
    info: "bg-blue-50 text-blue-900 border-blue-200",
    success: "bg-green-50 text-green-900 border-green-200",
    warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
    error: "bg-red-50 text-red-900 border-red-200"
  };
  return (
    <div className={`flex items-center justify-between rounded-lg border p-4 ${types[type as keyof typeof types]}`}>
      <div>{message}</div>
      {dismissible && (
        <button className="text-sm font-semibold opacity-60 hover:opacity-100">✕</button>
      )}
    </div>
  );
}

export function PricingPreview({ props }: PreviewProps) {
  const { name = "Plan", price = "$0", features = "", highlighted = false } = props || {};
  const featuresList = features.split(",").filter(Boolean);
  return (
    <div className={`rounded-lg border p-6 ${highlighted ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white"}`}>
      <h3 className="mb-2 text-2xl font-bold">{name}</h3>
      <div className="mb-4 text-4xl font-bold">{price}</div>
      <ul className="space-y-2">
        {featuresList.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className={highlighted ? "text-green-400" : "text-green-600"}>✓</span>
            <span>{feature.trim()}</span>
          </li>
        ))}
      </ul>
      <button className={`mt-6 w-full rounded-lg py-2 font-semibold ${highlighted ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"}`}>
        Choose Plan
      </button>
    </div>
  );
}
