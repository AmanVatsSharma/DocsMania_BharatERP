import React from "react";

export type ComponentDefinition = {
  key: string;
  name: string;
  schema?: Record<string, any>;
  defaultConfig: any;
  Preview?: React.FC<{ props?: Record<string, any> }>;
};

export const definitions: ComponentDefinition[] = [
  {
    key: "hero",
    name: "Hero",
    defaultConfig: { title: "Welcome", subtitle: "Subheading", style: { borderRadius: 12, shadow: "sm" } },
  },
  {
    key: "callout",
    name: "Callout",
    defaultConfig: { text: "This is a callout.", style: { backgroundColor: "#e0f2fe", color: "#0c4a6e", borderColor: "#0ea5e9" } },
  },
  {
    key: "feature",
    name: "Feature",
    defaultConfig: { title: "Why choose us?", description: "Key highlights:", points: "Fast,Secure,Scalable" },
  },
];

export function getDefinition(key: string | undefined | null) {
  return definitions.find((d) => d.key === key);
}
