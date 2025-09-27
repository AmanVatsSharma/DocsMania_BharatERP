import React from "react";
import HeroPreview from "@/app/editor/_registry/previews/HeroPreview";
import CalloutPreview from "@/app/editor/_registry/previews/CalloutPreview";
import FeaturePreview from "@/app/editor/_registry/previews/FeaturePreview";

export type PreviewProps = { props?: Record<string, any> };

export const previewComponents: Record<string, React.FC<PreviewProps>> = {
  hero: HeroPreview,
  callout: CalloutPreview,
  feature: FeaturePreview,
};

export function getSectionDisplayName(key?: string | null): string {
  if (!key) return "Section";
  const map: Record<string, string> = {
    hero: "Hero",
    callout: "Callout",
    feature: "Feature",
  };
  return map[key] ?? key;
}

