"use client";

import React from "react";
import cytoscape, { Core, LayoutOptions } from "cytoscape";
import { toast } from "sonner";
import { Network, RefreshCw, Maximize2, Download, Layout, ZoomIn, ZoomOut } from "lucide-react";

type GraphViewProps = {
  projectKey: string;
};

type LayoutType = "cose" | "circle" | "grid" | "breadthfirst" | "concentric";

export default function GraphView({ projectKey }: GraphViewProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const cyRef = React.useRef<Core | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [layout, setLayout] = React.useState<LayoutType>("cose");
  const [nodeCount, setNodeCount] = React.useState(0);
  const [edgeCount, setEdgeCount] = React.useState(0);

  const load = React.useCallback(async () => {
    if (!projectKey) {
      toast.info("Please select a project to view the graph");
      return;
    }
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

      const nodes = (docsJson.data as any[]).map((d) => ({ 
        data: { 
          id: d.id, 
          label: d.title, 
          slug: d.slug,
          size: 30 + Math.random() * 20
        } 
      }));
      const edges = (linksJson.data as any[]).map((l) => ({ 
        data: { 
          id: l.id, 
          source: l.sourceId, 
          target: l.targetId, 
          type: l.type,
          label: l.type
        } 
      }));

      setNodeCount(nodes.length);
      setEdgeCount(edges.length);

      const layoutConfig: LayoutOptions = {
        name: layout,
        fit: true,
        padding: 40,
        animate: true,
        animationDuration: 500,
      };

      if (!cyRef.current && containerRef.current) {
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements: [...nodes, ...edges],
          style: [
            { 
              selector: "node", 
              style: { 
                label: "data(label)", 
                "text-wrap": "wrap", 
                "text-max-width": "120px",
                "font-size": "11px",
                "font-weight": "600",
                "text-valign": "bottom",
                "text-margin-y": 5,
                "background-color": "#3b82f6",
                "background-gradient-stop-colors": "#3b82f6 #8b5cf6",
                "background-gradient-direction": "to-bottom",
                color: "#18181b",
                "border-width": 2,
                "border-color": "#1e40af",
                width: "data(size)",
                height: "data(size)",
                "text-outline-width": 2,
                "text-outline-color": "#ffffff"
              } 
            },
            { 
              selector: "edge", 
              style: { 
                width: 2,
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
                "line-color": "#94a3b8",
                "target-arrow-color": "#94a3b8",
                label: "data(label)",
                "font-size": "9px",
                "text-rotation": "autorotate",
                "text-background-opacity": 1,
                "text-background-color": "#ffffff",
                "text-background-padding": "3px",
                "text-border-opacity": 1,
                "text-border-width": 1,
                "text-border-color": "#e2e8f0",
                color: "#64748b"
              } 
            },
            { 
              selector: ":selected", 
              style: { 
                "background-color": "#f59e0b",
                "line-color": "#f59e0b",
                "target-arrow-color": "#f59e0b",
                "border-color": "#d97706",
                "border-width": 3
              } 
            },
            {
              selector: "node:active",
              style: {
                "overlay-color": "#3b82f6",
                "overlay-padding": 8,
                "overlay-opacity": 0.2
              }
            }
          ],
          layout: layoutConfig,
          wheelSensitivity: 0.2,
          minZoom: 0.3,
          maxZoom: 3
        });
        
        cyRef.current.on("tap", "node", (evt) => {
          const node = evt.target;
          console.info("[Graph] Node tap", node.data());
          toast.info(`Selected: ${node.data("label")}`);
        });

        cyRef.current.on("mouseover", "node", (evt) => {
          const node = evt.target;
          node.style("background-color", "#8b5cf6");
        });

        cyRef.current.on("mouseout", "node", (evt) => {
          const node = evt.target;
          if (!node.selected()) {
            node.style("background-color", "#3b82f6");
          }
        });
      } else if (cyRef.current) {
        const cy = cyRef.current;
        cy.elements().remove();
        cy.add([...nodes, ...edges]);
        cy.layout(layoutConfig).run();
      }
    } catch (e: any) {
      console.error("[Graph] Load error", e);
      toast.error(e?.message ?? "Failed to load graph");
    } finally {
      setBusy(false);
    }
  }, [projectKey, layout]);

  React.useEffect(() => {
    void load();
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [load]);

  const changeLayout = (newLayout: LayoutType) => {
    setLayout(newLayout);
    if (cyRef.current) {
      cyRef.current.layout({ 
        name: newLayout, 
        fit: true, 
        padding: 40,
        animate: true,
        animationDuration: 500
      } as LayoutOptions).run();
    }
  };

  const zoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }
  };

  const zoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const fitView = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 40);
    }
  };

  const exportImage = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({ full: true, scale: 2 });
      const link = document.createElement('a');
      link.download = `graph-${projectKey}-${Date.now()}.png`;
      link.href = png;
      link.click();
      toast.success("Graph exported successfully");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Knowledge Graph</div>
            <div className="text-xs text-zinc-500">
              {projectKey ? `${nodeCount} nodes, ${edgeCount} connections` : "Select a project"}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Layout Options */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-zinc-200">
            <Layout className="w-4 h-4 text-zinc-400" />
            <select
              value={layout}
              onChange={(e) => changeLayout(e.target.value as LayoutType)}
              className="text-xs bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="cose">Force</option>
              <option value="circle">Circle</option>
              <option value="grid">Grid</option>
              <option value="breadthfirst">Tree</option>
              <option value="concentric">Concentric</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button 
              onClick={zoomIn}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-zinc-600" />
            </button>
            <button 
              onClick={zoomOut}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-zinc-600" />
            </button>
            <button 
              onClick={fitView}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              title="Fit View"
            >
              <Maximize2 className="w-4 h-4 text-zinc-600" />
            </button>
          </div>

          {/* Export */}
          <button 
            onClick={exportImage}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            title="Export as PNG"
          >
            <Download className="w-4 h-4 text-zinc-600" />
          </button>

          {/* Refresh */}
          <button 
            onClick={() => void load()} 
            disabled={busy} 
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
            {busy ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="bg-gradient-to-br from-slate-50 to-zinc-50"
        style={{ height: 600 }} 
      />

      {nodeCount === 0 && !busy && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Network className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-sm text-zinc-500">No documents or connections found</p>
            <p className="text-xs text-zinc-400 mt-1">Create documents and add links to see the graph</p>
          </div>
        </div>
      )}
    </div>
  );
}


