import React from "react";
import { Sidebar } from "./_components/Sidebar";
import { DocViewer } from "./_components/DocViewer";

async function getIndex() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/docs/index`, { cache: "no-store" });
    const json = await res.json();
    if (!json.ok) throw new Error(json?.error?.message ?? "Failed to load index");
    return json.data as {
      items: Array<{ id: string; title: string; project: string; tags: string[]; slug: string[] }>;
      projects: string[];
      tags: string[];
    };
  } catch (err) {
    return { items: [], projects: [], tags: [] };
  }
}

async function getDoc(slug: string[]) {
  if (!slug.length) return "# Welcome to DocsMania\n\nUse the sidebar to open a document.";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/docs/index`, { cache: "no-store" });
    const json = await res.json();
    if (!json.ok) return "# Error\n\nUnable to read docs index.";
    const item = (json.data.items as any[]).find((i) => JSON.stringify(i.slug) === JSON.stringify(slug));
    if (!item) return "# Not found\n\nThe requested document does not exist.";
    const file = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/docs/raw?file=${encodeURIComponent(item.filePath)}`);
    const text = await file.text();
    return text;
  } catch {
    return "# Error\n\nFailed to load document.";
  }
}

export default async function DocsPage() {
  const index = await getIndex();
  const initialContent = "# Docs Hub\n\nSelect a document from the left.";
  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 56px)" }}>
      <Sidebar
        items={index.items}
        projects={index.projects}
        tags={index.tags}
        onSelect={(slug) => {
          window.location.href = `/docs/${slug.join("/")}`;
        }}
      />
      <div className="flex-1">
        <DocViewer content={initialContent} />
      </div>
    </div>
  );
}
