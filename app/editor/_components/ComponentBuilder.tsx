"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { 
  Code, X, Play, Save, Download, Upload, Eye, Settings, 
  Plus, Trash2, AlertCircle, CheckCircle, Copy 
} from "lucide-react";
import { clsx } from "clsx";

/**
 * Custom Component Builder
 * Create React/JSX components with live preview
 */

export interface CustomComponent {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  code: string; // React JSX code
  schema: any; // Props schema
  defaultConfig: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingComponent?: CustomComponent | null;
  onSave?: (component: CustomComponent) => void;
}

export default function ComponentBuilder(props: ComponentBuilderProps) {
  const { open, onOpenChange, editingComponent, onSave } = props;
  
  const [tab, setTab] = React.useState<"code" | "props" | "preview">("code");
  const [name, setName] = React.useState(editingComponent?.name || "");
  const [key, setKey] = React.useState(editingComponent?.key || "");
  const [description, setDescription] = React.useState(editingComponent?.description || "");
  const [category, setCategory] = React.useState(editingComponent?.category || "Custom");
  const [tags, setTags] = React.useState<string[]>(editingComponent?.tags || []);
  const [code, setCode] = React.useState(
    editingComponent?.code || 
    `// Create your React component
export default function CustomComponent({ props }) {
  const { title = "Hello World", subtitle = "" } = props || {};
  
  return (
    <div style={{
      padding: "32px",
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      textAlign: "center"
    }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: "#64748b" }}>{subtitle}</p>
      )}
    </div>
  );
}`
  );
  const [schema, setSchema] = React.useState(
    editingComponent?.schema || {
      title: { type: "string", label: "Title", default: "Hello World" },
      subtitle: { type: "string", label: "Subtitle", default: "" }
    }
  );
  const [testProps, setTestProps] = React.useState<any>({
    title: "Hello World",
    subtitle: "This is a custom component"
  });
  
  const [previewComponent, setPreviewComponent] = React.useState<any>(null);
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Generate key from name
  React.useEffect(() => {
    if (!editingComponent && name) {
      const generatedKey = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setKey(generatedKey);
    }
  }, [name, editingComponent]);

  // Update preview when code changes
  React.useEffect(() => {
    if (tab === "preview") {
      compileAndPreview();
    }
  }, [code, testProps, tab]);

  function compileAndPreview() {
    try {
      setPreviewError(null);
      
      // Create a safe function from the code
      // This wraps the component code in a way that we can execute it
      const componentCode = code.replace(/^export default/, "return");
      const compiledFunction = new Function(
        "React",
        "props",
        componentCode
      );
      
      // Create the component
      const Component = compiledFunction(React, testProps);
      setPreviewComponent(() => Component);
    } catch (error: any) {
      console.error("[ComponentBuilder] Compilation error", error);
      setPreviewError(error.message || "Failed to compile component");
      setPreviewComponent(null);
    }
  }

  async function handleSave() {
    if (!name || !key || !code) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      
      const component: CustomComponent = {
        id: editingComponent?.id || crypto.randomUUID(),
        key,
        name,
        description,
        category,
        tags,
        code,
        schema,
        defaultConfig: generateDefaultConfig(),
        createdAt: editingComponent?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Save to backend
      const method = editingComponent ? "PUT" : "POST";
      const url = editingComponent 
        ? `/api/custom-components/${editingComponent.id}`
        : "/api/custom-components";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(component),
      });

      const data = await res.json();
      if (data.ok) {
        onSave?.(component);
        onOpenChange(false);
      } else {
        alert(data.error?.message || "Failed to save component");
      }
    } catch (error: any) {
      console.error("[ComponentBuilder] Save error", error);
      alert(error.message || "Failed to save component");
    } finally {
      setSaving(false);
    }
  }

  function generateDefaultConfig() {
    const config: any = {};
    Object.entries(schema).forEach(([key, field]: [string, any]) => {
      config[key] = field.default || "";
    });
    return config;
  }

  function handleExport() {
    const exportData = {
      name,
      key,
      description,
      category,
      tags,
      code,
      schema,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${key}-component.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        
        setName(imported.name || "");
        setKey(imported.key || "");
        setDescription(imported.description || "");
        setCategory(imported.category || "Custom");
        setTags(imported.tags || []);
        setCode(imported.code || "");
        setSchema(imported.schema || {});
      } catch (error: any) {
        alert("Failed to import: " + error.message);
      }
    };
    input.click();
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-7xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl"
          style={{ maxHeight: "95vh", height: "95vh" }}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <Code className="h-5 w-5 text-purple-500" />
                  {editingComponent ? "Edit" : "Create"} Custom Component
                </Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-500">
                  Build React components with JSX and add them to your library
                </Dialog.Description>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                  title="Import component"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                  title="Export component"
                >
                  <Download className="h-4 w-4" />
                </button>
                <Dialog.Close className="rounded-lg p-2 hover:bg-zinc-100">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
            </div>

            {/* Component Info */}
            <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Custom Component"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700">
                    Key * (auto-generated)
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="my-custom-component"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Custom"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags.join(", ")}
                    onChange={(e) => setTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                    placeholder="custom, react, jsx"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-zinc-700">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this component does..."
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs.Root value={tab} onValueChange={(v) => setTab(v as any)} className="flex flex-1 flex-col overflow-hidden">
              <div className="border-b border-zinc-200 bg-white px-6">
                <Tabs.List className="flex gap-1">
                  <Tabs.Trigger
                    value="code"
                    className={clsx(
                      "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                      tab === "code"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-zinc-600 hover:text-zinc-900"
                    )}
                  >
                    <Code className="h-4 w-4" />
                    Code Editor
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="props"
                    className={clsx(
                      "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                      tab === "props"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-zinc-600 hover:text-zinc-900"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    Props Schema
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="preview"
                    className={clsx(
                      "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                      tab === "preview"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-zinc-600 hover:text-zinc-900"
                    )}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Tabs.Trigger>
                </Tabs.List>
              </div>

              {/* Code Editor Tab */}
              <Tabs.Content value="code" className="flex-1 overflow-auto p-6">
                <CodeEditor value={code} onChange={setCode} />
              </Tabs.Content>

              {/* Props Schema Tab */}
              <Tabs.Content value="props" className="flex-1 overflow-auto p-6">
                <PropsSchemaEditor value={schema} onChange={setSchema} />
              </Tabs.Content>

              {/* Preview Tab */}
              <Tabs.Content value="preview" className="flex-1 overflow-auto p-6">
                <ComponentPreview
                  component={previewComponent}
                  error={previewError}
                  testProps={testProps}
                  onTestPropsChange={setTestProps}
                  onRefresh={compileAndPreview}
                />
              </Tabs.Content>
            </Tabs.Root>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
              <div className="text-sm text-zinc-500">
                {editingComponent ? "Update" : "Create"} your custom component to use in documents
              </div>
              <div className="flex gap-2">
                <Dialog.Close className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={handleSave}
                  disabled={saving || !name || !key || !code}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : editingComponent ? "Update" : "Create"} Component
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div>
          <strong>Write React JSX code:</strong>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Component receives <code>props</code> object</li>
            <li>• Use inline styles or Tailwind classes</li>
            <li>• Export default function component</li>
            <li>• Access props like: <code>const {"{ title }"} = props</code></li>
          </ul>
        </div>
      </div>
      
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-semibold text-zinc-900">
            React Component Code
          </label>
          <div className="text-xs text-zinc-500">
            {value.split("\n").length} lines
          </div>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[500px] w-full rounded-lg border border-zinc-300 bg-zinc-900 p-4 font-mono text-sm text-white focus:border-purple-500 focus:outline-none"
          spellCheck={false}
          placeholder="export default function CustomComponent({ props }) { ... }"
        />
      </div>

      <div className="rounded-lg bg-zinc-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-zinc-900">Example Template:</h4>
        <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-white">
{`export default function CustomComponent({ props }) {
  const {
    title = "Default Title",
    description = "",
    buttonText = "Click Me",
    buttonLink = "#"
  } = props || {};
  
  return (
    <div style={{
      padding: "48px",
      backgroundColor: "#f8fafc",
      borderRadius: "16px",
      textAlign: "center"
    }}>
      <h2 style={{
        fontSize: "32px",
        fontWeight: "bold",
        marginBottom: "16px",
        color: "#0f172a"
      }}>
        {title}
      </h2>
      {description && (
        <p style={{
          fontSize: "18px",
          color: "#64748b",
          marginBottom: "24px"
        }}>
          {description}
        </p>
      )}
      <a
        href={buttonLink}
        style={{
          display: "inline-block",
          padding: "12px 32px",
          backgroundColor: "#8b5cf6",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600"
        }}
      >
        {buttonText}
      </a>
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
}

function PropsSchemaEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [schemaJSON, setSchemaJSON] = React.useState(JSON.stringify(value, null, 2));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSchemaJSON(JSON.stringify(value, null, 2));
  }, [value]);

  function handleChange(newJSON: string) {
    setSchemaJSON(newJSON);
    try {
      const parsed = JSON.parse(newJSON);
      onChange(parsed);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-800">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div>
          <strong>Define props schema:</strong>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Define all props your component accepts</li>
            <li>• Set types: string, number, boolean, select, color, image</li>
            <li>• Add labels and default values</li>
            <li>• Used to generate Inspector UI</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <strong>JSON Error:</strong> {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-900">
          Props Schema (JSON)
        </label>
        <textarea
          value={schemaJSON}
          onChange={(e) => handleChange(e.target.value)}
          className="h-[400px] w-full rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm focus:border-purple-500 focus:outline-none"
          spellCheck={false}
        />
      </div>

      <div className="rounded-lg bg-zinc-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-zinc-900">Schema Example:</h4>
        <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-white">
{`{
  "title": {
    "type": "string",
    "label": "Title",
    "default": "Hello World"
  },
  "description": {
    "type": "string",
    "label": "Description",
    "default": ""
  },
  "buttonText": {
    "type": "string",
    "label": "Button Text",
    "default": "Click Me"
  },
  "buttonLink": {
    "type": "string",
    "label": "Button Link",
    "default": "#"
  },
  "alignment": {
    "type": "select",
    "options": ["left", "center", "right"],
    "label": "Alignment",
    "default": "center"
  },
  "backgroundColor": {
    "type": "color",
    "label": "Background Color",
    "default": "#f8fafc"
  }
}`}
        </pre>
      </div>
    </div>
  );
}

function ComponentPreview({
  component,
  error,
  testProps,
  onTestPropsChange,
  onRefresh
}: {
  component: any;
  error: string | null;
  testProps: any;
  onTestPropsChange: (props: any) => void;
  onRefresh: () => void;
}) {
  const [propsJSON, setPropsJSON] = React.useState(JSON.stringify(testProps, null, 2));

  function handlePropsChange(newJSON: string) {
    setPropsJSON(newJSON);
    try {
      const parsed = JSON.parse(newJSON);
      onTestPropsChange(parsed);
    } catch {}
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Test Props */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Test Props</h3>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            <Play className="h-4 w-4" />
            Refresh Preview
          </button>
        </div>
        <textarea
          value={propsJSON}
          onChange={(e) => handlePropsChange(e.target.value)}
          className="h-[500px] w-full rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm focus:border-purple-500 focus:outline-none"
          spellCheck={false}
          placeholder='{ "title": "Test", "subtitle": "Hello" }'
        />
      </div>

      {/* Preview */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Live Preview</h3>
        <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-white p-6">
          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <strong>Compilation Error:</strong>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          ) : component ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              {React.createElement(component, { props: testProps })}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-zinc-400">
              <div className="text-center">
                <Eye className="mx-auto h-12 w-12" />
                <p className="mt-4 text-sm">Click "Refresh Preview" to see your component</p>
              </div>
            </div>
          )}
        </div>
        
        {component && !error && (
          <div className="mt-3 rounded-lg bg-green-50 p-3">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span><strong>Success!</strong> Component compiled and rendered correctly</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
