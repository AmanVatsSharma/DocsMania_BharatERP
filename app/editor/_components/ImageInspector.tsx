"use client";

import React from "react";

export interface ImageInspectorProps {
  editor: any | null;
}

/**
 * Image Inspector - provides controls for selected images
 */
export default function ImageInspector({ editor }: ImageInspectorProps) {
  if (!editor || !editor.isActive("image")) return null;

  const attrs = editor.getAttributes("image") || {};
  const [width, setWidth] = React.useState(attrs.width || "");
  const [height, setHeight] = React.useState(attrs.height || "");
  const [alt, setAlt] = React.useState(attrs.alt || "");
  const [title, setTitle] = React.useState(attrs.title || "");

  React.useEffect(() => {
    setWidth(attrs.width || "");
    setHeight(attrs.height || "");
    setAlt(attrs.alt || "");
    setTitle(attrs.title || "");
  }, [attrs.width, attrs.height, attrs.alt, attrs.title]);

  function updateAttrs(updates: Record<string, any>) {
    try {
      editor.chain().focus().updateAttributes("image", updates).run();
    } catch (e) {
      console.error("[ImageInspector] Update error", e);
    }
  }

  function setAlign(align: "left" | "center" | "right") {
    updateAttrs({ align });
  }

  function setObjectFit(fit: string) {
    updateAttrs({ objectFit: fit });
  }

  function applySize() {
    const updates: Record<string, any> = {};
    if (width) updates.width = width;
    if (height) updates.height = height;
    updateAttrs(updates);
  }

  function resetSize() {
    updateAttrs({ width: null, height: null });
    setWidth("");
    setHeight("");
  }

  return (
    <div className="mt-2 rounded-md border border-[var(--border)] bg-white p-0 text-sm shadow-sm">
      <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-white/90 px-3 py-2 font-semibold backdrop-blur">
        Image
      </div>

      {/* Size Controls */}
      <div className="border-b border-[var(--border)] px-3 py-3">
        <div className="mb-2 text-xs font-semibold text-zinc-700">Size</div>
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1">
            <span className="text-xs text-zinc-500">Width</span>
            <input
              type="text"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 400px or 50%"
              className="rounded border border-[var(--border)] px-2 py-1 text-sm"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-zinc-500">Height</span>
            <input
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 300px or auto"
              className="rounded border border-[var(--border)] px-2 py-1 text-sm"
            />
          </label>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={applySize}
            className="flex-1 rounded border border-[var(--border)] px-2 py-1 text-xs hover:bg-zinc-50"
          >
            Apply
          </button>
          <button
            onClick={resetSize}
            className="flex-1 rounded border border-[var(--border)] px-2 py-1 text-xs hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div className="border-b border-[var(--border)] px-3 py-3">
        <div className="mb-2 text-xs font-semibold text-zinc-700">Alignment</div>
        <div className="flex gap-2">
          <button
            onClick={() => setAlign("left")}
            className={`flex-1 rounded border px-2 py-1 text-xs ${
              attrs.align === "left" ? "border-blue-500 bg-blue-50" : "border-[var(--border)] hover:bg-zinc-50"
            }`}
          >
            Left
          </button>
          <button
            onClick={() => setAlign("center")}
            className={`flex-1 rounded border px-2 py-1 text-xs ${
              attrs.align === "center" ? "border-blue-500 bg-blue-50" : "border-[var(--border)] hover:bg-zinc-50"
            }`}
          >
            Center
          </button>
          <button
            onClick={() => setAlign("right")}
            className={`flex-1 rounded border px-2 py-1 text-xs ${
              attrs.align === "right" ? "border-blue-500 bg-blue-50" : "border-[var(--border)] hover:bg-zinc-50"
            }`}
          >
            Right
          </button>
        </div>
      </div>

      {/* Object Fit */}
      <div className="border-b border-[var(--border)] px-3 py-3">
        <div className="mb-2 text-xs font-semibold text-zinc-700">Object Fit</div>
        <select
          value={attrs.objectFit || "cover"}
          onChange={(e) => setObjectFit(e.target.value)}
          className="w-full rounded border border-[var(--border)] px-2 py-1 text-sm"
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
          <option value="none">None</option>
          <option value="scale-down">Scale Down</option>
        </select>
      </div>

      {/* Alt & Title */}
      <div className="px-3 py-3">
        <div className="mb-2 text-xs font-semibold text-zinc-700">Accessibility</div>
        <label className="mb-2 grid gap-1">
          <span className="text-xs text-zinc-500">Alt Text</span>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onBlur={() => updateAttrs({ alt })}
            placeholder="Describe the image"
            className="rounded border border-[var(--border)] px-2 py-1 text-sm"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-zinc-500">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => updateAttrs({ title })}
            placeholder="Image title"
            className="rounded border border-[var(--border)] px-2 py-1 text-sm"
          />
        </label>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-[var(--border)] px-3 py-2">
        <button
          onClick={() => {
            if (confirm("Delete this image?")) {
              editor.chain().focus().deleteSelection().run();
            }
          }}
          className="w-full rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Delete Image
        </button>
      </div>
    </div>
  );
}