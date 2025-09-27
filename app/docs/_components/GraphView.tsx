"use client";

import React from "react";
import cytoscape, { Core } from "cytoscape";
import { toast } from "sonner";

type GraphViewProps = {
  projectKey: string;
};

export default function GraphView({ projectKey }: GraphViewProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const cyRef = React.useRef<Core | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!projectKey) return;
    try {
      setBusy(true);
      // Load docs and links for project
      const [docsRes, linksRes] = await Promise.all([
        fetch(`/api/documents?projectKey=${encodeURIComponent(projectKey)}`),
        fetch(`/api/links?projectKey=${encodeURIComponent(projectKey)}`),
      ]);
      const docsJson = await docsRes.json();
      const linksJson = await linksRes.json();
      if (!docsJson.ok) throw new Error(docsJson?.error?.message ?? "Failed to load docs for graph");
      if (!linksJson.ok) throw new Error(linksJson?.error?.message ?? "Failed to load links for graph");

      const nodes = (docsJson.data as any[]).map((d) => ({ data: { id: d.id, label: d.title, slug: d.slug } }));
      const edges = (linksJson.data as any[]).map((l) => ({ data: { id: l.id, source: l.sourceId, target: l.targetId, type: l.type } }));

      if (!cyRef.current) {
        cyRef.current = cytoscape({
          container: containerRef.current!,
          elements: [...nodes, ...edges],
          style: [
            { selector: "node", style: { label: "data(label)", "text-wrap": "wrap", "text-max-width": "140", "font-size": "10", "background-color": "#111827", color: "#111827" } },
            { selector: "edge", style: { width: 1, "target-arrow-shape": "triangle", "curve-style": "bezier", "line-color": "#9ca3af", "target-arrow-color": "#9ca3af" } },
            { selector: ":selected", style: { "background-color": "#2563eb", "line-color": "#2563eb", "target-arrow-color": "#2563eb" } },
          ],
          layout: { name: "cose", fit: true, padding: 20 },
        });
        cyRef.current.on("tap", "node", (evt) => {
          const node = evt.target;
          // eslint-disable-next-line no-console
          console.info("[Graph] Node tap", node.id());
        });
      } else {
        const cy = cyRef.current;
        cy.elements().remove();
        cy.add([...nodes, ...edges]);
        cy.layout({ name: "cose", fit: true, padding: 20 }).run();
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("[Graph] Load error", e);
      toast.error(e?.message ?? "Failed to load graph");
    } finally {
      setBusy(false);
    }
  }, [projectKey]);

  React.useEffect(() => {
    void load();
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [load]);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white">
      <div className="flex items-center justify-between p-2 border-b border-[var(--border)]">
        <div className="text-sm font-medium">Graph – {projectKey || "Select a project"}</div>
        <button onClick={() => void load()} disabled={busy} className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)]">
          {busy ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <div ref={containerRef} style={{ height: 480 }} />
    </div>
  );
}


