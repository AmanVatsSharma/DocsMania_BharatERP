import React from "react";
import * as AllPreviews from "./AllBlockPreviews";

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
