import React from "react";
import { DocViewer } from "../_components/DocViewer";
import { Shell } from "../_components/Shell";

async function getIndex() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/docs/index`, { cache: "no-store" });
  const json = await res.json();
  if (!json.ok) return { items: [] };
  return json.data as any;
}

async function getContent(slug: string[]): Promise<string> {
  try {
    const index = await getIndex();
    const item = index.items.find((i: any) => JSON.stringify(i.slug) === JSON.stringify(slug));
    if (!item) return "# Not Found\n\nThe requested document does not exist.";
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/docs/raw?file=${encodeURIComponent(item.filePath)}`, { cache: "no-store" });
    if (!res.ok) return "# Error\n\nFailed to fetch document.";
    return await res.text();
  } catch (e) {
    return "# Error\n\nUnexpected error while loading document.";
  }
}

export default async function DocReaderPage({ params }: { params: { slug: string[] } }) {
  const content = await getContent(params.slug ?? []);
  return (
    <Shell>
      <DocViewer content={content} />
    </Shell>
  );
}


