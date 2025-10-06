"use client";

import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import {
  Settings, Layout, Palette, ChevronDown, Info, Copy, Trash2,
  Eye, EyeOff, Lock, Unlock, MoreVertical, RefreshCw, Code
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";

export interface InspectorEnhancedProps {
  width: number;
  onMouseDownResizer: (e: React.MouseEvent) => void;
  selectedNode: any;
  onUpdateProps: (props: any) => void;
  onDeleteNode?: () => void;
  onDuplicateNode?: () => void;
  onResetProps?: () => void;
  tab: "props" | "layout" | "style";
  onChangeTab: (tab: "props" | "layout" | "style") => void;
  rawPropsMode?: boolean;
  setRawPropsMode?: (v: boolean) => void;
  bottomExtra?: React.ReactNode;
  components?: Array<{ key: string; name: string; schema?: Record<string, any>; defaultConfig?: any }>;
}

export default function InspectorEnhanced(props: InspectorEnhancedProps) {
  const {
    width,
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
    bottomExtra,
    components,
  } = props;

  const nodeProps = selectedNode?.attrs?.props || {};
  const componentKey = selectedNode?.attrs?.componentKey;

  return (
    <div
      style={{ width }}
      className="relative flex flex-col border-l border-zinc-200 bg-gradient-to-b from-white to-zinc-50/30"
    >
      {selectedNode ? (
        <>
          {/* Header */}
          <div className="border-b border-zinc-200 bg-white/80 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Inspector
                </h3>
                <p className="text-xs text-zinc-500">
                  {componentKey || "Component"}
                </p>
              </div>
              
              {/* Actions Menu */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 transition-colors hover:bg-zinc-100">
                    <MoreVertical className="h-4 w-4 text-zinc-600" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-50 min-w-[180px] rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95"
                    align="end"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      onClick={onDuplicateNode}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </DropdownMenu.Item>
                    {onResetProps && (
                      <DropdownMenu.Item
                        onClick={onResetProps}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reset Props
                      </DropdownMenu.Item>
                    )}
                    {setRawPropsMode && (
                      <DropdownMenu.Item
                        onClick={() => setRawPropsMode(!rawPropsMode)}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                      >
                        <Code className="h-4 w-4" />
                        {rawPropsMode ? "Visual Mode" : "Raw JSON"}
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Separator className="my-1 h-px bg-zinc-200" />
                    <DropdownMenu.Item
                      onClick={onDeleteNode}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            {/* Tabs */}
            <Tabs.Root value={tab} onValueChange={(v) => onChangeTab(v as any)} className="mt-3">
              <Tabs.List className="flex gap-1 rounded-lg bg-zinc-100 p-1">
                <Tabs.Trigger
                  value="props"
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    tab === "props"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Props
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="layout"
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    tab === "layout"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  <Layout className="h-3.5 w-3.5" />
                  Layout
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="style"
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    tab === "style"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  <Palette className="h-3.5 w-3.5" />
                  Style
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </div>

          {/* Content */}
          <ScrollArea.Root className="flex-1 overflow-hidden">
            <ScrollArea.Viewport className="h-full w-full">
              <div className="p-4">
                {tab === "props" && (
                  rawPropsMode ? (
                    <RawPropsEditor props={nodeProps} onUpdate={onUpdateProps} />
                  ) : (
                    <PropsPanel
                      props={nodeProps}
                      onUpdate={onUpdateProps}
                      componentKey={componentKey}
                      components={components}
                    />
                  )
                )}
                {tab === "layout" && (
                  <LayoutPanel
                    props={nodeProps}
                    onUpdate={onUpdateProps}
                  />
                )}
                {tab === "style" && (
                  <StylePanel
                    props={nodeProps}
                    onUpdate={onUpdateProps}
                  />
                )}
                
                {/* Extra content like TableInspector */}
                {bottomExtra && (
                  <div className="mt-4 border-t border-zinc-200 pt-4">
                    {bottomExtra}
                  </div>
                )}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="flex w-2 touch-none select-none p-0.5"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-zinc-300" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </>
      ) : (
        <EmptyState />
      )}

      {/* Resizer */}
      <div
        onMouseDown={onMouseDownResizer}
        className="group absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-purple-400"
      >
        <div className="absolute left-0 top-1/2 h-12 w-1 -translate-y-1/2 rounded-full bg-zinc-300 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

function PropsPanel({ 
  props, 
  onUpdate, 
  componentKey, 
  components 
}: { 
  props: any; 
  onUpdate: (props: any) => void;
  componentKey?: string;
  components?: Array<{ key: string; schema?: Record<string, any> }>;
}) {
  // Get schema from component definition
  const def = components?.find((c) => c.key === componentKey);
  const schema = def?.schema || {};
  
  return (
    <div className="space-y-4">
      <InfoCard
        icon={<Info className="h-4 w-4" />}
        title="Component Properties"
        description="Customize this component's content and behavior"
      />

      {Object.keys(schema).length === 0 && Object.keys(props).length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center">
          <Settings className="mx-auto h-8 w-8 text-zinc-400" />
          <p className="mt-2 text-sm text-zinc-500">No properties available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Render fields based on schema if available */}
          {Object.keys(schema).length > 0 ? (
            Object.entries(schema).map(([key, fieldDef]: [string, any]) => (
              <SchemaBasedField
                key={key}
                name={key}
                fieldDef={fieldDef}
                value={props[key]}
                onChange={(newValue) => onUpdate({ ...props, [key]: newValue })}
              />
            ))
          ) : (
            /* Fallback to simple property list */
            Object.entries(props).map(([key, value]) => (
              <PropertyField
                key={key}
                label={formatLabel(key)}
                value={value}
                onChange={(newValue) => onUpdate({ ...props, [key]: newValue })}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function RawPropsEditor({ props, onUpdate }: { props: any; onUpdate: (props: any) => void }) {
  const [jsonText, setJsonText] = React.useState(JSON.stringify(props, null, 2));
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="space-y-3">
      <InfoCard
        icon={<Code className="h-4 w-4" />}
        title="Raw JSON Editor"
        description="Edit component props as JSON"
      />
      
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      
      <textarea
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            onUpdate(parsed);
            setError(null);
          } catch (err: any) {
            setError(err.message);
          }
        }}
        className="h-96 w-full rounded-lg border border-zinc-300 bg-zinc-900 p-4 font-mono text-sm text-white focus:border-purple-400 focus:outline-none"
        spellCheck={false}
      />
    </div>
  );
}

function SchemaBasedField({
  name,
  fieldDef,
  value,
  onChange,
}: {
  name: string;
  fieldDef: any;
  value: any;
  onChange: (value: any) => void;
}) {
  const type = fieldDef.type || "string";
  const label = fieldDef.label || formatLabel(name);
  const options = fieldDef.options || [];

  if (type === "select") {
    return (
      <SelectField
        label={label}
        value={value || fieldDef.default || ""}
        options={options.map((opt: any) => ({
          value: typeof opt === "string" ? opt : opt.value,
          label: typeof opt === "string" ? opt : opt.label
        }))}
        onChange={onChange}
      />
    );
  }

  if (type === "color") {
    return (
      <ColorField
        label={label}
        value={value || fieldDef.default || "#000000"}
        onChange={onChange}
      />
    );
  }

  if (type === "number") {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-3">
        <label className="mb-2 block text-xs font-semibold text-zinc-700">
          {label}
        </label>
        <input
          type="number"
          value={value ?? fieldDef.default ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
        />
      </div>
    );
  }

  if (type === "boolean") {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-3">
        <label className="mb-2 block text-xs font-semibold text-zinc-700">
          {label}
        </label>
        <button
          onClick={() => onChange(!value)}
          className={clsx(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            value
              ? "bg-purple-100 text-purple-700"
              : "bg-zinc-100 text-zinc-600"
          )}
        >
          <span>{value ? "Enabled" : "Disabled"}</span>
          {value ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  // Default: string
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <label className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}
      </label>
      <input
        type="text"
        value={value ?? fieldDef.default ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
      />
    </div>
  );
}

function LayoutPanel({ props, onUpdate }: { props: any; onUpdate: (props: any) => void }) {
  const layout = props.layout || {};

  return (
    <div className="space-y-4">
      <InfoCard
        icon={<Layout className="h-4 w-4" />}
        title="Layout Controls"
        description="Adjust spacing and dimensions"
      />

      <div className="space-y-3">
        <SliderField
          label="Max Width"
          value={layout.maxWidth || 1200}
          min={400}
          max={1600}
          step={50}
          unit="px"
          onChange={(value) => onUpdate({ ...props, layout: { ...layout, maxWidth: value } })}
        />

        <SliderField
          label="Padding"
          value={layout.padding || 24}
          min={0}
          max={100}
          step={4}
          unit="px"
          onChange={(value) => onUpdate({ ...props, layout: { ...layout, padding: value } })}
        />

        <SliderField
          label="Margin Y"
          value={layout.marginY || 16}
          min={0}
          max={100}
          step={4}
          unit="px"
          onChange={(value) => onUpdate({ ...props, layout: { ...layout, marginY: value } })}
        />
      </div>
    </div>
  );
}

function StylePanel({ props, onUpdate }: { props: any; onUpdate: (props: any) => void }) {
  const style = props.style || {};

  return (
    <div className="space-y-4">
      <InfoCard
        icon={<Palette className="h-4 w-4" />}
        title="Style Options"
        description="Customize colors and appearance"
      />

      <div className="space-y-3">
        <ColorField
          label="Background Color"
          value={style.backgroundColor || "#ffffff"}
          onChange={(value) => onUpdate({ ...props, style: { ...style, backgroundColor: value } })}
        />

        <ColorField
          label="Text Color"
          value={style.color || "#000000"}
          onChange={(value) => onUpdate({ ...props, style: { ...style, color: value } })}
        />

        <SliderField
          label="Border Radius"
          value={style.borderRadius || 0}
          min={0}
          max={50}
          step={1}
          unit="px"
          onChange={(value) => onUpdate({ ...props, style: { ...style, borderRadius: value } })}
        />

        <SelectField
          label="Shadow"
          value={style.shadow || "none"}
          options={[
            { value: "none", label: "None" },
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          onChange={(value) => onUpdate({ ...props, style: { ...style, shadow: value } })}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 p-6">
        <Settings className="h-10 w-10 text-purple-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-900">
        No Selection
      </h3>
      <p className="text-sm text-zinc-500">
        Select a component to view and edit its properties
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-3">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
          <p className="mt-0.5 text-xs text-zinc-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function PropertyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (value: any) => void;
}) {
  const isBoolean = typeof value === "boolean";

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <label className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}
      </label>
      {isBoolean ? (
        <button
          onClick={() => onChange(!value)}
          className={clsx(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            value
              ? "bg-purple-100 text-purple-700"
              : "bg-zinc-100 text-zinc-600"
          )}
        >
          <span>{value ? "Enabled" : "Disabled"}</span>
          {value ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
        />
      )}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-700">{label}</label>
        <span className="text-xs font-medium text-purple-600">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <label className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-300"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <label className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
