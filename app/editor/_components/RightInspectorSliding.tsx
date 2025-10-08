/**
 * Right Inspector with Sliding Sheet Animation
 * Auto-shows on selection, context-aware controls
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Pin, PinOff } from "lucide-react";
import { useEditorUI } from "@/lib/store/editorUI";
import { slideVariants, transitions } from "@/lib/animations";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";

export interface RightInspectorSlidingProps {
  width?: number;
  onMouseDownResizer?: (e: React.MouseEvent) => void;
  selectedNode: any;
  onUpdateProps: (props: any) => void;
  onDeleteNode: () => void;
  onDuplicateNode: () => void;
  onResetProps: () => void;
  tab: "props" | "layout" | "style";
  onChangeTab: (tab: "props" | "layout" | "style") => void;
  rawPropsMode: boolean;
  setRawPropsMode: (mode: boolean) => void;
  components: Array<{ key: string; name: string; schema?: Record<string, any> }>;
  bottomExtra?: React.ReactNode;
}

export default function RightInspectorSliding(props: RightInspectorSlidingProps) {
  const {
    width = 320,
    onMouseDownResizer,
    selectedNode,
    onUpdateProps,
    onDeleteNode,
    onDuplicateNode,
    onResetProps,
    tab,
    onChangeTab,
    rawPropsMode,
    setRawPropsMode,
    components,
    bottomExtra,
  } = props;

  const { 
    rightInspectorOpen,
    setRightInspectorOpen,
    autoShowInspector,
  } = useEditorUI();

  const [isPinned, setIsPinned] = React.useState(false);

  // Auto-show inspector when something is selected
  React.useEffect(() => {
    if (selectedNode && autoShowInspector && !isPinned) {
      setRightInspectorOpen(true);
    }
  }, [selectedNode, autoShowInspector, isPinned, setRightInspectorOpen]);

  // Don't render if not open
  if (!rightInspectorOpen) {
    return null;
  }

  const selectedSectionKey = selectedNode?.attrs?.componentKey;
  const selectedSectionProps = selectedNode?.attrs?.props || {};

  const component = components.find((c) => c.key === selectedSectionKey);
  const schema = component?.schema || {};

  function updateField(name: string, value: any) {
    const nextProps = { ...selectedSectionProps, [name]: value };
    onUpdateProps(nextProps);
  }

  function renderPropsEditor() {
    if (!selectedNode) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
            <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            No Element Selected
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Select a component to customize its properties
          </p>
        </div>
      );
    }

    const entries = Object.entries(schema);

    if (entries.length === 0) {
      return (
        <div className="space-y-3 p-4">
          <p className="text-sm text-zinc-500">No schema available. Using raw JSON editor.</p>
          <textarea
            value={JSON.stringify(selectedSectionProps, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onUpdateProps(parsed);
              } catch {}
            }}
            className="h-64 w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      );
    }

    return (
      <div className="space-y-3 p-4">
        {entries.map(([name, cfg]: [string, any]) => {
          const type = cfg?.type ?? "string";
          const label = cfg?.label ?? name;
          const value = selectedSectionProps?.[name] ?? "";

          // Object type with nested fields
          if (type === "object" && cfg?.fields) {
            const fields = Object.entries(cfg.fields);
            return (
              <fieldset
                key={name}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <legend className="px-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {label}
                </legend>
                <div className="mt-2 space-y-3">
                  {fields.map(([childName, childCfg]: [string, any]) => {
                    const childType = childCfg?.type ?? "string";
                    const childLabel = childCfg?.label ?? childName;
                    const childValue = (selectedSectionProps?.[name] ?? {})[childName] ?? "";

                    return renderField(
                      childName,
                      childLabel,
                      childType,
                      childValue,
                      childCfg,
                      (newValue) => {
                        updateField(name, {
                          ...(selectedSectionProps?.[name] ?? {}),
                          [childName]: newValue,
                        });
                      }
                    );
                  })}
                </div>
              </fieldset>
            );
          }

          return renderField(name, label, type, value, cfg, (newValue) =>
            updateField(name, newValue)
          );
        })}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <button
            onClick={onResetProps}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
          <button
            onClick={onDuplicateNode}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Duplicate
          </button>
        </div>

        <button
          onClick={onDeleteNode}
          className="w-full rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
        >
          Delete
        </button>

        <button
          onClick={() => setRawPropsMode(!rawPropsMode)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {rawPropsMode ? "Hide" : "Show"} Raw JSON
        </button>

        {rawPropsMode && (
          <textarea
            value={JSON.stringify(selectedSectionProps, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onUpdateProps(parsed);
              } catch {}
            }}
            className="h-40 w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        )}
      </div>
    );
  }

  function renderField(
    name: string,
    label: string,
    type: string,
    value: any,
    config: any,
    onChange: (value: any) => void
  ) {
    switch (type) {
      case "boolean":
        return (
          <label key={name} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
          </label>
        );

      case "number":
        return (
          <label key={name} className="grid gap-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        );

      case "select":
        return (
          <label key={name} className="grid gap-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {(config.options || []).map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        );

      case "color":
        return (
          <label key={name} className="grid gap-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700"
            />
          </label>
        );

      default:
        return (
          <label key={name} className="grid gap-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        );
    }
  }

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={transitions.smooth}
      style={{ width }}
      className="fixed right-0 top-0 z-40 flex h-full flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Inspector
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              "rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800",
              isPinned ? "text-blue-600" : "text-zinc-400"
            )}
            title={isPinned ? "Unpin inspector" : "Pin inspector"}
          >
            {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setRightInspectorOpen(false)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            title="Close inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root value={tab} onValueChange={(v) => onChangeTab(v as any)} className="flex flex-1 flex-col overflow-hidden">
        <Tabs.List className="flex border-b border-zinc-200 dark:border-zinc-800">
          <Tabs.Trigger
            value="props"
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              tab === "props"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            )}
          >
            Props
          </Tabs.Trigger>
          <Tabs.Trigger
            value="layout"
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              tab === "layout"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            )}
          >
            Layout
          </Tabs.Trigger>
          <Tabs.Trigger
            value="style"
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              tab === "style"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            )}
          >
            Style
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="props" className="flex-1 overflow-y-auto">
          {renderPropsEditor()}
        </Tabs.Content>

        <Tabs.Content value="layout" className="flex-1 overflow-y-auto p-4">
          <div className="text-sm text-zinc-500">Layout controls...</div>
        </Tabs.Content>

        <Tabs.Content value="style" className="flex-1 overflow-y-auto p-4">
          <div className="text-sm text-zinc-500">Style controls...</div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Bottom Extra (Table/Image inspectors) */}
      {bottomExtra && (
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          {bottomExtra}
        </div>
      )}

      {/* Resizer */}
      {onMouseDownResizer && (
        <div
          onMouseDown={onMouseDownResizer}
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500"
        />
      )}
    </motion.div>
  );
}