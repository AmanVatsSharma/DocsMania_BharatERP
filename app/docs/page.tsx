"use client";

import React from "react";

export default function DocsPage() {
  const [docs, setDocs] = React.useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      if (json.ok) setDocs(json.data);
    } catch (e) {
      console.error("Load docs failed", e);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Create failed");
      } else {
        setTitle("");
        setSlug("");
        await load();
      }
    } catch (e: any) {
      console.error("Create doc error", e);
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>Documents</h1>
      <form onSubmit={onCreate} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ flex: 1, padding: 8 }}
        />
        <input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          style={{ width: 220, padding: 8 }}
        />
        <button disabled={loading} type="submit">
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {docs.map((d) => (
          <li key={d.id} style={{ marginBottom: 8 }}>
            <a href={`/editor/${d.id}`}>{d.title}</a> <small>({d.slug})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
