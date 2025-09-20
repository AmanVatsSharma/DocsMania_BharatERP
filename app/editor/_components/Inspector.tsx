"use client";

import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { clsx } from "clsx";

export interface InspectorProps {
  width: number;
  onMouseDownResizer: (e: React.MouseEvent) => void;
  tab: "props" | "layout" | "style";
  onChangeTab: (t: "props" | "layout" | "style") => void;
  selectedSectionKey: string | null;
  selectedSectionProps: any;
  components: Array<{ key: string; name: string; defaultConfig: any; schema?: Record<string, any> }>;
  onUpdateAttributes: (next: any) => void;
  onResetProps: () => void;
  onDuplicateSection: () => void;
  onDeleteSection: () => void;
  rawPropsMode: boolean;
  setRawPropsMode: (v: boolean) => void;
}

/**
 * Polished inspector with Props/Layout/Style tabs.
 * Renders simple input widgets from ad-hoc schemas for demo purposes.
 */
export default function Inspector(props: InspectorProps) {
  const {
    width,
    onMouseDownResizer,
    tab,
    onChangeTab,
    selectedSectionKey,
    selectedSectionProps,
    components,
    onUpdateAttributes,
    onResetProps,
    onDuplicateSection,
    onDeleteSection,
    rawPropsMode,
    setRawPropsMode,
  } = props;

  function renderPropsEditor() {
    if (!selectedSectionKey || !selectedSectionProps) {
      return <p className="px-3 py-2 text-sm text-zinc-500">Select a section to edit</p>;
    }
    const def = components.find((c) => c.key === selectedSectionKey);
    const schema = (def?.schema ?? {}) as Record<string, any>;

    function updateField(name: string, value: any) {
      const next = { ...(selectedSectionProps ?? {}), [name]: value };
      console.info("[Inspector] Update field", { name, value });
      onUpdateAttributes(next);
    }

    const entries = Object.entries(schema);
    if (entries.length === 0) {
      return (
        <div className="space-y-2 p-3">
          <p className="text-sm text-zinc-500">No schema; using raw JSON.</p>
          <textarea
            value={JSON.stringify(selectedSectionProps, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onUpdateAttributes(parsed);
              } catch {}
            }}
            className="h-52 w-full rounded-md border p-2 font-mono text-xs"
          />
          <div className="flex gap-2">
            <button onClick={onResetProps} className="rounded border px-2 py-1 text-sm hover:bg-zinc-50">Reset</button>
            <button onClick={onDuplicateSection} className="rounded border px-2 py-1 text-sm hover:bg-zinc-50">Duplicate</button>
            <button onClick={onDeleteSection} className="rounded border px-2 py-1 text-sm text-red-600 hover:bg-red-50">Delete</button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2 p-3">
        {entries.map(([name, cfg]) => {
          const t = cfg?.type ?? "string";
          const label = cfg?.label ?? name;
          const value = selectedSectionProps?.[name] ?? "";
          if (t === "boolean") {
            return (
              <label key={name} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!value} onChange={(e) => updateField(name, e.target.checked)} /> {label}
              </label>
            );
          }
          if (t === "number") {
            return (
              <label key={name} className="grid gap-1 text-sm">
                <span>{label}</span>
                <input type="number" value={value} onChange={(e) => updateField(name, Number(e.target.value))} className="rounded border px-2 py-1" />
              </label>
            );
          }
          if (t === "select" && Array.isArray(cfg?.options)) {
            return (
              <label key={name} className="grid gap-1 text-sm">
                <span>{label}</span>
                <select value={value} onChange={(e) => updateField(name, e.target.value)} className="rounded border px-2 py-1">
                  {cfg.options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            );
          }
          return (
            <label key={name} className="grid gap-1 text-sm">
              <span>{label}</span>
              <input type="text" value={value} onChange={(e) => updateField(name, e.target.value)} className="rounded border px-2 py-1" />
            </label>
          );
        })}
        <div className="flex gap-2 pt-1">
          <button onClick={onResetProps} className="rounded border px-2 py-1 text-sm hover:bg-zinc-50">Reset</button>
          <button onClick={onDuplicateSection} className="rounded border px-2 py-1 text-sm hover:bg-zinc-50">Duplicate</button>
          <button onClick={onDeleteSection} className="rounded border px-2 py-1 text-sm text-red-600 hover:bg-red-50">Delete</button>
          <button onClick={() => setRawPropsMode(!rawPropsMode)} className="rounded border px-2 py-1 text-sm hover:bg-zinc-50">
            {rawPropsMode ? "Hide Raw" : "Raw JSON"}
          </button>
        </div>
        {rawPropsMode && (
          <textarea
            value={JSON.stringify(selectedSectionProps, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onUpdateAttributes(parsed);
              } catch {}
            }}
            className="h-40 w-full rounded-md border p-2 font-mono text-xs"
          />
        )}
      </div>
    );
  }

  function renderLayoutEditor() {
    if (!selectedSectionKey || !selectedSectionProps) return <p className="px-3 py-2 text-sm text-zinc-500">Select a section</p>;
    const layout = selectedSectionProps.layout ?? {};
    function setLayoutField(name: string, value: any) {
      const next = { ...(selectedSectionProps ?? {}), layout: { ...(layout ?? {}), [name]: value } };
      onUpdateAttributes(next);
    }
    return (
      <div className="space-y-2 p-3 text-sm">
        <label className="grid gap-1">
          <span>Max Width (px)</span>
          <input type="number" value={layout.maxWidth ?? 800} onChange={(e) => setLayoutField("maxWidth", Number(e.target.value))} className="rounded border px-2 py-1" />
        </label>
        <label className="grid gap-1">
          <span>Padding (px)</span>
          <input type="number" value={layout.padding ?? 16} onChange={(e) => setLayoutField("padding", Number(e.target.value))} className="rounded border px-2 py-1" />
        </label>
        <label className="grid gap-1">
          <span>Margin Y (px)</span>
          <input type="number" value={layout.marginY ?? 16} onChange={(e) => setLayoutField("marginY", Number(e.target.value))} className="rounded border px-2 py-1" />
        </label>
      </div>
    );
  }

  function renderStyleEditor() {
    if (!selectedSectionKey || !selectedSectionProps) return <p className="px-3 py-2 text-sm text-zinc-500">Select a section</p>;
    const style = selectedSectionProps.style ?? {};
    function setStyleField(name: string, value: any) {
      const next = { ...(selectedSectionProps ?? {}), style: { ...(style ?? {}), [name]: value } };
      onUpdateAttributes(next);
    }
    return (
      <div className="space-y-2 p-3 text-sm">
        <label className="grid gap-1">
          <span>Background</span>
          <input type="color" value={style.backgroundColor ?? "#ffffff"} onChange={(e) => setStyleField("backgroundColor", e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>Text Color</span>
          <input type="color" value={style.color ?? "#000000"} onChange={(e) => setStyleField("color", e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>Border Color</span>
          <input type="color" value={style.borderColor ?? "#dddddd"} onChange={(e) => setStyleField("borderColor", e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>Border Width (px)</span>
          <input type="number" value={style.borderWidth ?? 1} onChange={(e) => setStyleField("borderWidth", Number(e.target.value))} className="rounded border px-2 py-1" />
        </label>
      </div>
    );
  }

  return (
    <div style={{ width }} className="relative bg-white dc-panel-right">
      <Tabs.Root value={tab} onValueChange={(v) => onChangeTab(v as any)}>
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2 text-sm">
          <button onClick={() => onChangeTab("props")} className={clsx("rounded px-2 py-1", tab === "props" ? "bg-zinc-100 font-semibold" : "text-zinc-600 hover:bg-zinc-50")}>Props</button>
          <button onClick={() => onChangeTab("layout")} className={clsx("rounded px-2 py-1", tab === "layout" ? "bg-zinc-100 font-semibold" : "text-zinc-600 hover:bg-zinc-50")}>Layout</button>
          <button onClick={() => onChangeTab("style")} className={clsx("rounded px-2 py-1", tab === "style" ? "bg-zinc-100 font-semibold" : "text-zinc-600 hover:bg-zinc-50")}>Style</button>
        </div>

        {tab === "props" && renderPropsEditor()}
        {tab === "layout" && renderLayoutEditor()}
        {tab === "style" && renderStyleEditor()}
      </Tabs.Root>

      {/* Resizer */}
      <div onMouseDown={onMouseDownResizer} style={{ left: -3 }} className="absolute top-0 h-full w-1.5 cursor-col-resize" />
    </div>
  );
}


