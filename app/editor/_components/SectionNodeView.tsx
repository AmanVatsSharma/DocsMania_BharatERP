"use client";

import React from "react";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { previewComponents } from "@/app/editor/_registry/sections";
import { GripVertical, Copy, Trash2, EyeOff, Lock, MoveUp, MoveDown } from "lucide-react";
import { moveSection } from "@/app/editor/_logic/sectionTransforms";

export function createSectionNodeView(componentKeyToName: (key: string) => string) {
  const SectionComponent = (props: any) => {
    const { node, updateAttributes, editor } = props;
    const keyName: string = node?.attrs?.componentKey ?? "section";
    const displayName = componentKeyToName(keyName) || keyName;
    const [dragGuide, setDragGuide] = React.useState<null | "top" | "bottom">(null);

    function onDuplicate() {
      try {
        const json = node.toJSON();
        const schema = (editor?.state as any)?.schema;
        const n = schema.nodeFromJSON(json);
        const tr = editor.state.tr.insert(props.getPos() + node.nodeSize, n);
        queueMicrotask(() => editor.view.dispatch(tr));
        console.info("[SectionNodeView] duplicate", keyName);
      } catch (e) {
        console.error("[SectionNodeView] duplicate error", e);
      }
    }

    function onDelete() {
      try {
        const from = props.getPos();
        const to = from + node.nodeSize;
        const tr = editor.state.tr.delete(from, to);
        queueMicrotask(() => editor.view.dispatch(tr));
        console.info("[SectionNodeView] delete", keyName);
      } catch (e) {
        console.error("[SectionNodeView] delete error", e);
      }
    }

    function onMove(dir: -1 | 1) {
      try {
        queueMicrotask(() => moveSection(editor, props.getPos(), dir));
        console.info("[SectionNodeView] move", dir);
      } catch (e) {
        console.error("[SectionNodeView] move error", e);
      }
    }

    const Comp = previewComponents[keyName];

    const layout = node?.attrs?.props?.layout ?? {};
    const pad = Number(layout.padding ?? 8);
    const my = Number(layout.marginY ?? 16);

    return (
      <NodeViewWrapper
        as="section"
        className="group relative rounded-lg border border-[var(--border)] bg-white transition-shadow hover:shadow-sm"
        style={{ marginTop: my, marginBottom: my, padding: pad }}
        onDragOver={(e: React.DragEvent) => {
          try {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const mid = rect.top + rect.height / 2;
            setDragGuide(e.clientY < mid ? "top" : "bottom");
          } catch {}
        }}
        onDragLeave={() => setDragGuide(null)}
        onDrop={() => setDragGuide(null)}
      >
        <div className="absolute -top-3 left-2 flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-2 py-0.5 text-xs text-zinc-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <GripVertical className="h-3.5 w-3.5" /> {displayName}
          <span className="mx-1 h-3 w-px bg-zinc-200" />
          <button onClick={() => onDuplicate()} className="rounded border border-[var(--border)] px-1 hover:bg-zinc-50" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
          <button onClick={() => onDelete()} className="rounded border border-[var(--border)] px-1 hover:bg-zinc-50" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
          <button className="rounded border border-[var(--border)] px-1 hover:bg-zinc-50" title="Hide"><EyeOff className="h-3.5 w-3.5" /></button>
          <button className="rounded border border-[var(--border)] px-1 hover:bg-zinc-50" title="Lock"><Lock className="h-3.5 w-3.5" /></button>
          <button onClick={() => onMove(-1)} className="rounded border border-[var(--border)] px-1 hover:bg-zinc-50" title="Move up"><MoveUp className="h-3.5 w-3.5" /></button>
          <button onClick={() => onMove(1)} className="rounded border border-[var(--border)] px-1 hover:bg-zinc-50" title="Move down"><MoveDown className="h-3.5 w-3.5" /></button>
        </div>
        {Comp ? (
          <div className="mb-2">
            <Comp props={node?.attrs?.props ?? {}} />
          </div>
        ) : null}
        <NodeViewContent className="prose prose-zinc max-w-none" />

        {/* Spacing handles */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            const startY = e.clientY;
            const start = Number(node?.attrs?.props?.layout?.marginY ?? 16);
            function onMove(ev: MouseEvent) {
              const delta = Math.round((ev.clientY - startY) / 2);
              const next = Math.max(0, start + delta);
              try {
                const nextProps = { ...(node?.attrs?.props ?? {}), layout: { ...(node?.attrs?.props?.layout ?? {}), marginY: next } };
                updateAttributes({ props: nextProps });
              } catch {}
            }
            function onUp() {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            }
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          title="Drag to adjust vertical margin"
          className="absolute inset-x-4 -top-2 h-1 cursor-ns-resize rounded bg-[var(--border)] opacity-0 transition-opacity group-hover:opacity-100"
        />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            const startY = e.clientY;
            const start = Number(node?.attrs?.props?.layout?.padding ?? 8);
            function onMove(ev: MouseEvent) {
              const delta = Math.round((ev.clientY - startY) / 2);
              const next = Math.max(0, start + delta);
              try {
                const nextProps = { ...(node?.attrs?.props ?? {}), layout: { ...(node?.attrs?.props?.layout ?? {}), padding: next } };
                updateAttributes({ props: nextProps });
              } catch {}
            }
            function onUp() {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            }
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          title="Drag to adjust padding"
          className="absolute inset-x-4 -bottom-2 h-1 cursor-ns-resize rounded bg-[var(--border)] opacity-0 transition-opacity group-hover:opacity-100"
        />

        {/* Drag guides */}
        {dragGuide === "top" && (
          <div className="pointer-events-none absolute inset-x-0 -top-2 h-0.5 bg-[var(--accent)]/80" />
        )}
        {dragGuide === "bottom" && (
          <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-0.5 bg-[var(--accent)]/80" />
        )}
      </NodeViewWrapper>
    );
  };

  return (props: any) => ReactNodeViewRenderer(SectionComponent)(props);
}
