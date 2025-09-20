import { NextResponse } from "next/server";

// v0 in-memory seed
const seed = [
  {
    key: "hero",
    name: "Hero",
    schema: { title: { type: "string" }, subtitle: { type: "string" } },
    defaultConfig: { title: "Welcome", subtitle: "Subheading" },
  },
  {
    key: "callout",
    name: "Callout",
    schema: { text: { type: "string" } },
    defaultConfig: { text: "This is a callout." },
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

