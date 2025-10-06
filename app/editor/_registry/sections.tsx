import React from "react";
import * as AllPreviews from "./AllBlockPreviews";
import { createCustomPreviewComponent } from "@/lib/customComponentRenderer";

export type PreviewProps = { props?: Record<string, any> };

// Export all preview components
export const previewComponents: Record<string, React.FC<PreviewProps>> = {
  // Layout
  hero: AllPreviews.HeroPreview,
  columns: AllPreviews.ColumnsPreview,
  container: AllPreviews.ContainerPreview,
  
  // Content
  callout: AllPreviews.CalloutPreview,
  feature: AllPreviews.FeaturePreview,
  quote: AllPreviews.QuotePreview,
  stats: AllPreviews.StatsPreview,
  
  // Interactive
  accordion: AllPreviews.AccordionPreview,
  tabs: AllPreviews.TabsPreview,
  button: AllPreviews.ButtonPreview,
  
  // Media
  image: AllPreviews.ImageBlockPreview,
  gallery: AllPreviews.GalleryPreview,
  video: AllPreviews.VideoPreview,
  embed: AllPreviews.EmbedPreview,
  
  // Data
  "table-block": AllPreviews.TableBlockPreview,
  code: AllPreviews.CodePreview,
  chart: AllPreviews.ChartPreview,
  
  // Special
  timeline: AllPreviews.TimelinePreview,
  card: AllPreviews.CardPreview,
  divider: AllPreviews.DividerPreview,
  spacer: AllPreviews.SpacerPreview,
  alert: AllPreviews.AlertPreview,
  pricing: AllPreviews.PricingPreview,
};

/**
 * Load custom components from API and register them
 * Call this on app initialization to make custom components available
 */
export async function loadCustomComponents() {
  try {
    console.log("[CustomComponents] Loading from API...");
    const res = await fetch('/api/custom-components', { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.ok && Array.isArray(data.data)) {
      console.log(`[CustomComponents] Found ${data.data.length} custom components`);
      
      data.data.forEach((comp: any) => {
        try {
          console.log(`[CustomComponents] Registering: ${comp.key}`);
          
          // Parse JSON strings
          const schema = typeof comp.schema === 'string' 
            ? JSON.parse(comp.schema) 
            : comp.schema;
          const defaultConfig = typeof comp.defaultConfig === 'string'
            ? JSON.parse(comp.defaultConfig)
            : comp.defaultConfig;
          
          // Create preview component
          const preview = createCustomPreviewComponent({
            id: comp.id,
            key: comp.key,
            name: comp.name,
            code: comp.code,
            schema,
            defaultConfig
          });
          
          // Register in preview components
          previewComponents[comp.key] = preview;
          
          console.log(`[CustomComponents] ✓ Registered: ${comp.key}`);
        } catch (error) {
          console.error(`[CustomComponents] Failed to register ${comp.key}:`, error);
        }
      });
      
      return data.data.length;
    } else {
      console.warn('[CustomComponents] Invalid API response:', data);
      return 0;
    }
  } catch (error) {
    console.error('[CustomComponents] Load error:', error);
    return 0;
  }
}

// Auto-load custom components when this module is imported
if (typeof window !== 'undefined') {
  // Client-side only
  loadCustomComponents().then((count) => {
    console.log(`[CustomComponents] Loaded ${count} custom components`);
  });
}

export function getSectionDisplayName(key?: string | null): string {
  if (!key) return "Section";
  const map: Record<string, string> = {
    hero: "Hero",
    callout: "Callout",
    feature: "Feature",
    columns: "Columns",
    container: "Container",
    quote: "Quote",
    stats: "Stats",
    accordion: "Accordion",
    tabs: "Tabs",
    button: "Button",
    image: "Image",
    gallery: "Gallery",
    video: "Video",
    embed: "Embed",
    "table-block": "Table",
    code: "Code",
    chart: "Chart",
    timeline: "Timeline",
    card: "Card",
    divider: "Divider",
    spacer: "Spacer",
    alert: "Alert",
    pricing: "Pricing",
  };
  return map[key] ?? key;
}
