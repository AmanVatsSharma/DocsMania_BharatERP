"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Code, Plus, Edit, Trash2, X, Download, Upload, Copy, CheckCircle } from "lucide-react";
import { clsx } from "clsx";
import type { CustomComponent } from "./ComponentBuilder";

export interface CustomComponentLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (component: CustomComponent) => void;
  onCreate?: () => void;
}

export default function CustomComponentLibrary(props: CustomComponentLibraryProps) {
  const { open, onOpenChange, onEdit, onCreate } = props;
  
  const [components, setComponents] = React.useState<CustomComponent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState("");

  React.useEffect(() => {
    if (open) {
      loadComponents();
    }
  }, [open]);

  async function loadComponents() {
    try {
      setLoading(true);
      const res = await fetch("/api/custom-components");
      const data = await res.json();
      if (data.ok) {
        // Parse JSON fields
        const parsed = data.data.map((c: any) => ({
          ...c,
          tags: JSON.parse(c.tags || "[]"),
          schema: JSON.parse(c.schema || "{}"),
          defaultConfig: JSON.parse(c.defaultConfig || "{}"),
        }));
        setComponents(parsed);
      }
    } catch (error) {
      console.error("Failed to load custom components", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this component?")) return;
    
    try {
      const res = await fetch(`/api/custom-components/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        await loadComponents();
      }
    } catch (error) {
      console.error("Failed to delete component", error);
    }
  }

  async function handleDuplicate(component: CustomComponent) {
    const newComponent = {
      ...component,
      id: undefined,
      key: `${component.key}-copy-${Date.now()}`,
      name: `${component.name} (Copy)`,
    };
    
    try {
      const res = await fetch("/api/custom-components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComponent),
      });
      
      if (res.ok) {
        await loadComponents();
      }
    } catch (error) {
      console.error("Failed to duplicate component", error);
    }
  }

  function handleExport(component: CustomComponent) {
    const exportData = {
      key: component.key,
      name: component.name,
      description: component.description,
      category: component.category,
      tags: component.tags,
      code: component.code,
      schema: component.schema,
      defaultConfig: component.defaultConfig,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${component.key}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        
        // Ensure unique key
        imported.key = `${imported.key}-${Date.now()}`;
        
        const res = await fetch("/api/custom-components", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imported),
        });
        
        if (res.ok) {
          await loadComponents();
        }
      } catch (error: any) {
        alert("Failed to import: " + error.message);
      }
    };
    input.click();
  }

  const filtered = components.filter((c) => {
    const query = filter.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.tags.some((t: string) => t.toLowerCase().includes(query))
    );
  });

  // Group by category
  const grouped = filtered.reduce((acc, comp) => {
    const cat = comp.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(comp);
    return acc;
  }, {} as Record<string, CustomComponent[]>);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl"
          style={{ maxHeight: "90vh" }}
        >
          <div className="flex h-full max-h-[90vh] flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <Code className="h-5 w-5 text-purple-500" />
                  Custom Component Library
                </Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-500">
                  Manage your custom React components
                </Dialog.Description>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                  title="Import component"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>
                <button
                  onClick={onCreate}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Component
                </button>
                <Dialog.Close className="rounded-lg p-2 hover:bg-zinc-100">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
            </div>

            {/* Search */}
            <div className="border-b border-zinc-200 px-6 py-3">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="🔍 Search components..."
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                    <p className="mt-4 text-sm text-zinc-500">Loading components...</p>
                  </div>
                </div>
              ) : components.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <Code className="h-16 w-16 text-zinc-300" />
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">No custom components yet</h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    Create your first React component to get started
                  </p>
                  <button
                    onClick={onCreate}
                    className="mt-6 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Component
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <p className="text-zinc-500">No components match your search</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                        <div className="h-px flex-1 bg-zinc-200" />
                        {category}
                        <div className="h-px flex-1 bg-zinc-200" />
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((component) => (
                          <ComponentCard
                            key={component.id}
                            component={component}
                            onEdit={() => {
                              onEdit?.(component);
                              onOpenChange(false);
                            }}
                            onDelete={() => handleDelete(component.id)}
                            onDuplicate={() => handleDuplicate(component)}
                            onExport={() => handleExport(component)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ComponentCard({
  component,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
}: {
  component: CustomComponent;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  function handleCopyKey() {
    navigator.clipboard.writeText(component.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:shadow-md">
      <div className="mb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-zinc-900">{component.name}</h4>
            <button
              onClick={handleCopyKey}
              className="mt-1 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
              title="Copy key"
            >
              <code className="rounded bg-zinc-100 px-1.5 py-0.5">{component.key}</code>
              {copied ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
          <div className="rounded-full bg-purple-100 p-2">
            <Code className="h-4 w-4 text-purple-600" />
          </div>
        </div>
        
        {component.description && (
          <p className="mt-2 text-xs text-zinc-600 line-clamp-2">
            {component.description}
          </p>
        )}
        
        {component.tags && component.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {component.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700"
              >
                {tag}
              </span>
            ))}
            {component.tags.length > 3 && (
              <span className="text-[10px] text-zinc-500">
                +{component.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="flex-1 rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100"
        >
          <Edit className="mx-auto h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDuplicate}
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs hover:bg-zinc-50"
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onExport}
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs hover:bg-zinc-50"
          title="Export"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg border border-red-300 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      
      <div className="absolute right-2 top-2 rounded bg-zinc-900 px-2 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
        Custom
      </div>
    </div>
  );
}
