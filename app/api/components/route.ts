import { NextResponse } from "next/server";

// v0 in-memory seed
const seed = [
  {
    key: "hero",
    name: "Hero",
    schema: {
      title: { type: "string", label: "Title" },
      subtitle: { type: "string", label: "Subtitle" },
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
    defaultConfig: { title: "Welcome", subtitle: "Subheading", style: { borderRadius: 12, shadow: "sm" } },
  },
  {
    key: "callout",
    name: "Callout",
    schema: {
      text: { type: "string", label: "Text" },
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
    defaultConfig: { text: "This is a callout.", style: { backgroundColor: "#e0f2fe", color: "#0c4a6e", borderColor: "#0ea5e9" } },
  },
  {
    key: "feature",
    name: "Feature",
    schema: {
      title: { type: "string", label: "Title" },
      description: { type: "string", label: "Description" },
      points: { type: "string", label: "Points (comma-separated)" },
    },
    defaultConfig: { title: "Why choose us?", description: "Key highlights:", points: "Fast,Secure,Scalable" },
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

