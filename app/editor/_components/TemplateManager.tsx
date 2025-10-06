"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { 
  FileText, X, Plus, Edit, Trash2, Save, Search, 
  Eye, Copy, Download, Upload, Sparkles, Star
} from "lucide-react";
import { clsx } from "clsx";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  content: any; // Tiptap JSON
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (template: Template) => void;
  currentDocument?: any; // Current editor content for "Save as Template"
}

export default function TemplateManager(props: TemplateManagerProps) {
  const { open, onOpenChange, onApplyTemplate, currentDocument } = props;
  
  const [tab, setTab] = React.useState<"browse" | "create">("browse");
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  
  // Create/Edit state
  const [editingTemplate, setEditingTemplate] = React.useState<Template | null>(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Custom");
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Load templates
  React.useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const res = await fetch('/api/templates?includePrivate=true');
      const data = await res.json();
      
      if (data.ok) {
        setTemplates(data.data.map((t: any) => ({
          ...t,
          tags: typeof t.tags === 'string' ? JSON.parse(t.tags) : t.tags,
          content: typeof t.content === 'string' ? JSON.parse(t.content) : t.content,
        })));
      }
    } catch (error) {
      console.error('[TemplateManager] Load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveTemplate() {
    if (!name || !description) {
      alert("Name and description are required");
      return;
    }

    if (!currentDocument && !editingTemplate) {
      alert("No content to save");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        description,
        category,
        tags,
        content: editingTemplate?.content || currentDocument,
        isPublic,
      };

      const url = editingTemplate 
        ? `/api/templates/${editingTemplate.id}`
        : '/api/templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        await loadTemplates();
        resetForm();
        setTab("browse");
      } else {
        alert(data.error?.message || "Failed to save template");
      }
    } catch (error) {
      console.error('[TemplateManager] Save error:', error);
      alert("Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.ok) {
        await loadTemplates();
      }
    } catch (error) {
      console.error('[TemplateManager] Delete error:', error);
    }
  }

  function resetForm() {
    setEditingTemplate(null);
    setName("");
    setDescription("");
    setCategory("Custom");
    setTags([]);
    setIsPublic(false);
  }

  function startEdit(template: Template) {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description);
    setCategory(template.category);
    setTags(template.tags);
    setIsPublic(template.isPublic);
    setTab("create");
  }

  function startCreateFromCurrent() {
    resetForm();
    setTab("create");
  }

  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95">
          <div className="flex h-[80vh] max-h-[800px] flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 p-2">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-semibold text-zinc-900">
                    Template Manager
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-zinc-600">
                    Create, browse, and apply document templates
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <Tabs.Root value={tab} onValueChange={(v) => setTab(v as any)} className="flex flex-1 flex-col overflow-hidden">
              <Tabs.List className="flex gap-1 border-b border-zinc-200 px-6">
                <Tabs.Trigger
                  value="browse"
                  className={clsx(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    tab === "browse"
                      ? "border-b-2 border-purple-500 text-purple-600"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  <Eye className="mr-2 inline h-4 w-4" />
                  Browse Templates
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="create"
                  className={clsx(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    tab === "create"
                      ? "border-b-2 border-purple-500 text-purple-600"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  <Plus className="mr-2 inline h-4 w-4" />
                  Create Template
                </Tabs.Trigger>
              </Tabs.List>

              {/* Browse Tab */}
              <Tabs.Content value="browse" className="flex-1 overflow-auto p-6">
                <div className="mb-6 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search templates..."
                      className="w-full rounded-lg border border-zinc-300 py-2 pl-10 pr-4 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {currentDocument && (
                    <button
                      onClick={startCreateFromCurrent}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4" />
                      Save Current as Template
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-zinc-300" />
                    <p className="mt-4 font-medium text-zinc-700">No templates found</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {searchQuery ? "Try a different search term" : "Create your first template to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white transition-all hover:border-purple-300 hover:shadow-lg"
                      >
                        {/* Thumbnail or placeholder */}
                        <div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-200">
                          {template.thumbnail ? (
                            <img src={template.thumbnail} alt={template.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <FileText className="h-12 w-12 text-zinc-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <h3 className="font-semibold text-zinc-900">{template.name}</h3>
                            {template.isPublic && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="mb-3 text-sm text-zinc-600">{template.description}</p>
                          
                          <div className="mb-3 flex flex-wrap gap-1">
                            {template.tags.map(tag => (
                              <span
                                key={tag}
                                className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                onApplyTemplate(template);
                                onOpenChange(false);
                              }}
                              className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => startEdit(template)}
                              className="rounded-lg border border-zinc-300 p-2 text-zinc-600 hover:bg-zinc-50"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteTemplate(template.id)}
                              className="rounded-lg border border-red-300 p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Tabs.Content>

              {/* Create Tab */}
              <Tabs.Content value="create" className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-2xl space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-700">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Product Launch Template"
                      className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-700">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this template is for..."
                      rows={3}
                      className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-zinc-700">
                        Category
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g., Marketing"
                        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-zinc-700">
                        Visibility
                      </label>
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={clsx(
                          "flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-medium",
                          isPublic
                            ? "bg-purple-100 text-purple-700"
                            : "bg-zinc-100 text-zinc-600"
                        )}
                      >
                        {isPublic ? "Public" : "Private"}
                        {isPublic && <Star className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-700">
                      Tags
                    </label>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
                        >
                          {tag}
                          <button
                            onClick={() => setTags(tags.filter(t => t !== tag))}
                            className="text-purple-500 hover:text-purple-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            setTags([...tags, tagInput.trim()]);
                            setTagInput("");
                          }
                        }}
                        placeholder="Add a tag and press Enter"
                        className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                      />
                      <button
                        onClick={() => {
                          if (tagInput.trim()) {
                            setTags([...tags, tagInput.trim()]);
                            setTagInput("");
                          }
                        }}
                        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="flex gap-3">
                      <Sparkles className="h-5 w-5 flex-shrink-0 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {editingTemplate ? "Update Template Content" : "Save Current Document"}
                        </p>
                        <p className="mt-1 text-sm text-blue-700">
                          {editingTemplate 
                            ? "Keep the existing content or apply a different document before saving"
                            : "Your current document will be saved as this template"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveTemplate}
                      disabled={saving || !name || !description}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {editingTemplate ? "Update Template" : "Save Template"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        resetForm();
                        setTab("browse");
                      }}
                      className="rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
