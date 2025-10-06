"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TableExtended from "@/lib/TableExtended";
import TableRowExtended from "@/lib/TableRowExtended";
import TableHeader from "@tiptap/extension-table-header";
import TableInspector from "@/app/editor/_components/TableInspector";
import TableCellExtended from "@/lib/TableCellExtended";
import TextStyleExtended from "@/lib/TextStyleExtended";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Section from "@/lib/SectionExtension";
import ParagraphExtended from "@/lib/ParagraphExtended";
// Enhanced Enterprise Components
import TopBarEnhanced from "@/app/editor/_components/TopBarEnhanced";
import LeftSidebarEnhanced from "@/app/editor/_components/LeftSidebarEnhanced";
import InspectorEnhanced from "@/app/editor/_components/InspectorEnhanced";
import FloatingToolbar from "@/app/editor/_components/FloatingToolbar";
import { SavingIndicator, EmptyDocumentState } from "@/app/editor/_components/LoadingStates";
import "@/app/editor/_styles/enterprise-editor.css";
import Toolbar from "@/app/editor/_components/Toolbar";
import DevicePreview, { type DeviceKind } from "@/app/editor/_components/DevicePreview";
import CommandPalette from "@/app/editor/_components/CommandPalette";
import { createSectionNodeView } from "@/app/editor/_components/SectionNodeView";
import EditorLoading from "./loading";
import { useDebouncedCallback } from "@/lib/hooks";
import SlashMenu from "@/app/editor/_components/SlashMenu";
import EditorContextMenu from "@/app/editor/_components/ContextMenu";
import TemplatesPicker from "@/app/editor/_components/TemplatesPicker";
import { toast } from "sonner";
import logger from "@/lib/logger";
import HelpOverlay from "@/app/editor/_components/HelpOverlay";
import { replaceCurrentTableWithMatrix } from "@/lib/tableUtils";
import { TextSelection } from "prosemirror-state";
import MediaManager from "@/app/editor/_components/MediaManager";
import BlockTemplates from "@/app/editor/_components/BlockTemplates";
import DocumentSettings from "@/app/editor/_components/DocumentSettings";

// moved to lib/hooks.ts

function findSelectedSection(editor: any): { pos: number; node: any; depth: number } | null {
  const { state } = editor;
  const $from = state.selection.$from;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === "section") {
      const pos = $from.before(depth);
      return { pos, node, depth };
    }
  }
  return null;
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  // React 19: params may be a Promise; unwrap with React.use()
  const resolvedParams = (React as any).use ? (React as any).use(params as any) : (params as any);
  const docId: string = resolvedParams?.id;
  const [mounted, setMounted] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [isCmdkOpen, setCmdkOpen] = React.useState(false);
  const [components, setComponents] = React.useState<Array<{ key: string; name: string; defaultConfig: any; schema?: Record<string, any> }>>([]);
  const [selectedSectionProps, setSelectedSectionProps] = React.useState<any>(null);
  const [selectedSectionKey, setSelectedSectionKey] = React.useState<string | null>(null);
  const [rawPropsMode, setRawPropsMode] = React.useState(false);
  const [leftTab, setLeftTab] = React.useState<'library' | 'outline'>("library");
  const [inspectorTab, setInspectorTab] = React.useState<'props' | 'layout' | 'style'>("props");
  const [libraryQuery, setLibraryQuery] = React.useState("");
  const [leftWidth, setLeftWidth] = React.useState(240);
  const [rightWidth, setRightWidth] = React.useState(320);
  const [device, setDevice] = React.useState<DeviceKind>("desktop");
  const [slashOpen, setSlashOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [mediaManagerOpen, setMediaManagerOpen] = React.useState(false);
  const [blockTemplatesOpen, setBlockTemplatesOpen] = React.useState(false);
  const [documentSettingsOpen, setDocumentSettingsOpen] = React.useState(false);
  const [documentMeta, setDocumentMeta] = React.useState<any>({});
  const leftResizerRef = React.useRef<HTMLDivElement | null>(null);
  const rightResizerRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    fetch("/api/components").then((r) => r.json()).then((j) => {
      if (j.ok) setComponents(j.data);
    }).catch((e) => console.error("Load components error", e));
  }, []);

  function startLeftResize(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const next = Math.max(160, Math.min(480, startWidth + dx));
      setLeftWidth(next);
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function startRightResize(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;
    function onMove(ev: MouseEvent) {
      const dx = startX - ev.clientX;
      const next = Math.max(260, Math.min(520, startWidth + dx));
      setRightWidth(next);
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image,
      // Typography & formatting extensions
      Underline,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableExtended.configure({ resizable: true }),
      TableRowExtended,
      TableHeader,
      TableCellExtended,
      TextStyleExtended,
      // Override base paragraph with enterprise attrs (indent, spacing)
      ParagraphExtended,
      Section.extend({
        addNodeView() {
          const nameLookup = (key: string) => {
            const def = components.find((c) => c.key === key);
            return def?.name ?? key;
          };
          return createSectionNodeView(nameLookup);
        },
      }),
    ],
    autofocus: true,
    immediatelyRender: false,
    editorProps: {
      handleDrop(view: any, event: DragEvent) {
        try {
          const dt = event.dataTransfer;
          const raw = dt?.getData("application/x-dc-component");
          if (!raw) return false;
          const parsed = JSON.parse(raw);
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!pos) return false;
          const insertContent = {
            type: "section",
            attrs: { componentKey: parsed.key, props: parsed.props ?? {} },
            content: [{ type: "paragraph" }],
          } as any;
          const node = (view.state as any).schema.nodeFromJSON(insertContent);
          const tr = view.state.tr.insert(pos.pos, node);
          view.dispatch(tr);
          console.info("Dropped component", parsed.key);
          event.preventDefault();
          return true;
        } catch (e) {
          console.error("handleDrop error", e);
          return false;
        }
      },
      handleKeyDown: (view: any, event: KeyboardEvent) => {
        try {
          const isMod = event.metaKey || event.ctrlKey;
          const key = event.key.toLowerCase();
          if (isMod && key === "s") {
            event.preventDefault();
            const json = view.state.doc.toJSON();
            logger.info("Mod+S: saving draft");
            void fetch(`/api/documents/${docId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: json }),
            });
            return true;
          }
          if (isMod && event.shiftKey && key === "p") {
            event.preventDefault();
            logger.info("Shift+Mod+P: publish");
            void fetch(`/api/documents/${docId}/publish`, { method: "POST" });
            return true;
          }
          // Spreadsheet-like navigation
          if (editor?.isActive("table")) {
            if (key === "tab") {
              if (event.shiftKey) editor?.chain().focus().goToPreviousCell().run();
              else editor?.chain().focus().goToNextCell().run();
              event.preventDefault();
              return true;
            }
            if (key === "enter") {
              if (event.shiftKey) editor?.chain().focus().goToPreviousCell().run();
              else editor?.chain().focus().goToNextCell().run();
              event.preventDefault();
              return true;
            }
          }
          // List indent/outdent with Tab / Shift+Tab
          if (key === "tab" && editor?.isActive("listItem")) {
            if (event.shiftKey) editor?.chain().focus().liftListItem("listItem").run();
            else editor?.chain().focus().sinkListItem("listItem").run();
            event.preventDefault();
            return true;
          }
        } catch (e) {
          console.error("handleKeyDown error", e);
        }
        return false;
      },
      handlePaste: (view: any, event: ClipboardEvent, slice: any) => {
        try {
          const text = event.clipboardData?.getData("text/plain") ?? "";
          const html = event.clipboardData?.getData("text/html") ?? "";

          // 1) If pasting into a table and content looks tabular, handle CSV/TSV paste
          if (editor?.isActive("table") && text) {
            const lines = text.split(/\r?\n/);
            const looksTabular = lines.length > 1 && (text.includes("\t") || text.includes(","));
            if (looksTabular) {
              import("@/lib/csv").then((mod) => {
                try {
                  const matrix = mod.parseDelimited(text);
                  if (matrix.length) {
                    const ok = replaceCurrentTableWithMatrix(editor!, matrix);
                    if (ok) {
                      event.preventDefault();
                    }
                  }
                } catch (e) {
                  console.error("[Paste] parseDelimited error", e);
                }
              });
              return true;
            }
          }

          // 2) Rich paste sanitization (Word/HTML). Keep safe tags, strip styles/classes.
          if (html && /mso|class=\"?Mso|office\:/i.test(html)) {
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");
              const ALLOWED_TAGS = new Set([
                "P","H1","H2","H3","H4","H5","H6",
                "STRONG","EM","S","U","CODE","A",
                "UL","OL","LI","BLOCKQUOTE","BR","SPAN"
              ]);
              const WALK = (node: Node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const el = node as HTMLElement;
                  if (!ALLOWED_TAGS.has(el.tagName)) {
                    // Replace unknown tags by span to keep text
                    const span = doc.createElement("span");
                    span.innerHTML = el.innerHTML;
                    el.replaceWith(span);
                  } else {
                    // Strip style/class/on* attributes; keep href on anchors
                    for (const attr of Array.from(el.attributes)) {
                      const name = attr.name.toLowerCase();
                      if (el.tagName === "A" && name === "href") continue;
                      if (name === "href") {
                        try { new URL(attr.value); } catch { el.removeAttribute(attr.name); }
                        continue;
                      }
                      if (name.startsWith("data-")) { el.removeAttribute(attr.name); continue; }
                      el.removeAttribute(attr.name);
                    }
                  }
                }
                for (const child of Array.from(node.childNodes)) WALK(child);
              };
              doc.body.querySelectorAll("style,script,xml,meta,link,o\\:p").forEach((n) => n.remove());
              WALK(doc.body);
              const safeHtml = doc.body.innerHTML
                .replace(/<!--[\s\S]*?-->/g, "")
                .replace(/\s?style=\"[^\"]*\"/gi, "")
                .replace(/\s?class=\"[^\"]*\"/gi, "");
              editor?.chain().focus().insertContent(safeHtml).run();
              event.preventDefault();
              console.info("[Paste] sanitized Word HTML");
              return true;
            } catch (err) {
              console.error("[Paste] Word sanitize error", err);
              // fallthrough to default paste
              return false;
            }
          }

          // 3) If plain text with multiple lines and not in code, normalize newlines
          if (text && !editor?.isActive("codeBlock")) {
            // Let Tiptap handle by default; do not interfere
            return false;
          }
          return false;
        } catch (e) {
          console.error("handlePaste error", e);
          return false;
        }
      },
      handleDOMEvents: {
        mousedown: (view: any, event: MouseEvent) => {
          try {
            const target = event.target as HTMLElement | null;
            if (!target) return false;
            const trEl = target.closest("tr") as HTMLTableRowElement | null;
            if (!trEl) return false;
            const rect = trEl.getBoundingClientRect();
            const nearBottom = Math.abs(rect.bottom - event.clientY) <= 5;
            if (!nearBottom) return false;
            // Ensure selection is inside this row for attribute updates
            const pos = view.posAtCoords({ left: rect.left + 4, top: rect.top + 4 });
            if (pos) {
              const sel = TextSelection.create(view.state.doc, pos.pos);
              view.dispatch(view.state.tr.setSelection(sel));
            }
            (view.dom as HTMLElement).classList.add("row-resize-cursor");
            (view as any)._rowResize = { active: true, startY: event.clientY, startHeight: rect.height, trEl };
            event.preventDefault();
            return true;
          } catch (e) {
            console.error("row resize mousedown error", e);
            return false;
          }
        },
        mousemove: (view: any, event: MouseEvent) => {
          try {
            const state = (view as any)._rowResize;
            if (!state?.active) return false;
            const dy = event.clientY - state.startY;
            const next = Math.max(20, Math.round(state.startHeight + dy));
            // Immediate DOM feedback
            if (state.trEl) state.trEl.style.height = `${next}px`;
            // Persist to doc
            editor?.chain().focus().updateAttributes("tableRow", { height: `${next}px` }).run();
            return true;
          } catch (e) {
            console.error("row resize mousemove error", e);
            return false;
          }
        },
        mouseup: (view: any, event: MouseEvent) => {
          try {
            const state = (view as any)._rowResize;
            if (!state?.active) return false;
            (view.dom as HTMLElement).classList.remove("row-resize-cursor");
            (view as any)._rowResize = { active: false };
            return true;
          } catch (e) {
            console.error("row resize mouseup error", e);
            return false;
          }
        },
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      debouncedSave(json);
    },
    onSelectionUpdate: ({ editor }) => {
      try {
        if (editor.isActive("section")) {
          const attrs = editor.getAttributes("section");
          setSelectedSectionKey(attrs?.componentKey ?? null);
          setSelectedSectionProps(attrs?.props ?? {});
        } else {
          setSelectedSectionKey(null);
          setSelectedSectionProps(null);
        }
      } catch (e) {
        console.error("selection update error", e);
        setSelectedSectionKey(null);
        setSelectedSectionProps(null);
      }
    },
    onCreate: () => console.info("Tiptap editor created"),
  });

  const debouncedSave = useDebouncedCallback(async (content: any) => {
    if (!docId) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.error("Autosave failed", json);
        toast.error(json?.error?.message ?? "Autosave failed");
      } else {
        console.debug("Autosave ok");
      }
    } catch (e) {
      console.error("Autosave error", e);
      toast.error("Autosave error");
    } finally {
      setSaving(false);
    }
  }, 1500);

  const projectKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/documents/${docId}`);
        const json = await res.json();
        if (!json.ok) throw new Error(json?.error?.message ?? "Failed to load");
        setTitle(json.data.title);
        setSlug(json.data.slug);
        setDocumentMeta(json.data.meta || {});
        projectKeyRef.current = json?.data?.project?.key ?? null;
        const draft = json?.data?.meta?.draftContent ?? { type: "doc", content: [{ type: "paragraph" }] };
        editor?.commands.setContent(draft);
        console.info("Loaded document", json.data.id);
      } catch (e: any) {
        setError(String(e?.message ?? e));
      } finally {
        setLoading(false);
      }
    }
    if (editor && docId) load();
  }, [editor, docId]);

  function onAddSection(key: string) {
    const found = components.find((c) => c.key === key);
    const props = found?.defaultConfig ?? {};
    editor?.chain().focus().setSection({ componentKey: key, props }).run();
    console.info("Added section", key);
  }

  function onUpdateProps() {
    if (!editor) return;
    try {
      if (!editor.isActive("section")) return;
      editor.chain().focus().updateAttributes("section", { props: selectedSectionProps }).run();
      console.info("Updated section props");
    } catch (e) {
      console.error("update props error", e);
    }
  }

  function resetProps() {
    if (!editor || !selectedSectionKey) return;
    const found = components.find((c) => c.key === selectedSectionKey);
    const defaults = found?.defaultConfig ?? {};
    setSelectedSectionProps(defaults);
    try {
      editor.chain().focus().updateAttributes("section", { props: defaults }).run();
      console.info("Reset props to defaults");
    } catch (e) {
      console.error("reset props error", e);
    }
  }

  function deleteSection() {
    if (!editor) return;
    try {
      const found = findSelectedSection(editor);
      if (!found) return;
      const tr = editor.state.tr.delete(found.pos, found.pos + found.node.nodeSize);
      editor.view.dispatch(tr);
      setSelectedSectionKey(null);
      setSelectedSectionProps(null);
      console.info("Deleted section");
    } catch (e) {
      console.error("delete section error", e);
    }
  }

  function duplicateSection() {
    if (!editor) return;
    try {
      const found = findSelectedSection(editor);
      if (!found) return;
      const json = found.node.toJSON();
      const node = (editor.state as any).schema.nodeFromJSON(json);
      const tr = editor.state.tr.insert(found.pos + found.node.nodeSize, node);
      editor.view.dispatch(tr);
      console.info("Duplicated section");
    } catch (e) {
      console.error("duplicate section error", e);
    }
  }

  async function onPublish() {
    try {
      const res = await fetch(`/api/documents/${docId}/publish`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Publish failed");
      toast.success(`Published v${json?.data?.version ?? ""}`);
      const pk = projectKeyRef.current;
      if (slug && pk) router.push(`/p/${pk}/${slug}`);
    } catch (e: any) {
      alert(`Publish error: ${String(e?.message ?? e)}`);
      console.error("Publish error", e);
      toast.error(String(e?.message ?? e));
    }
  }

  async function saveDocumentSettings(settings: any) {
    try {
      const updatedMeta = { ...documentMeta, displaySettings: settings };
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta: updatedMeta }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setDocumentMeta(updatedMeta);
      toast.success("Settings saved successfully");
    } catch (e: any) {
      console.error("Save settings error", e);
      toast.error("Failed to save settings");
    }
  }

  function onInsertImageClick() {
    fileInputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image too large (max 10MB)");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? "Upload failed");
      const url: string = json.data.url;
      editor?.chain().focus().setImage({ src: url }).run();
      console.info("Inserted image", url);
      toast.success("Image uploaded");
    } catch (err: any) {
      console.error("Image upload failed", err);
      alert(`Upload failed: ${String(err?.message ?? err)}`);
      toast.error(String(err?.message ?? err));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function onToggleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      console.info("Unset link");
      return;
    }
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prev ?? "https://");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
    console.info("Set link", url);
  }

  function insertTable() {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    console.info("Inserted table 3x3");
  }

  function getOutlineItems() {
    if (!editor) return [] as Array<{ index: number; preview: string; pos: number }>;
    const sections: Array<{ index: number; preview: string; pos: number }> = [];
    let i = 0;
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type?.name === "section") {
        const key = node.attrs?.componentKey;
        const def = components.find((c) => c.key === key);
        const label = def?.name ?? key ?? "Section";
        const text = (node.textContent || "").slice(0, 32);
        const preview = text ? `${label}: ${text}` : label;
        sections.push({ index: i++, preview, pos });
      }
      return true;
    });
    return sections;
  }

  function renderPropsEditor() {
    if (!selectedSectionKey || !selectedSectionProps) return (
      <p style={{ color: "#888" }}>Select a section to edit in the editor</p>
    );
    const def = components.find((c) => c.key === selectedSectionKey);
    const schema = (def?.schema ?? {}) as Record<string, any>;

    function updateField(name: string, value: any) {
      const next = { ...(selectedSectionProps ?? {}), [name]: value };
      setSelectedSectionProps(next);
      try {
        editor?.chain().focus().updateAttributes("section", { props: next }).run();
      } catch (e) {
        console.error("update field error", e);
      }
    }

    const entries = Object.entries(schema);
    if (entries.length === 0) {
      return (
        <>
          <p style={{ color: "#888" }}>No schema; using raw JSON.</p>
          <textarea
            value={JSON.stringify(selectedSectionProps, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setSelectedSectionProps(parsed);
              } catch {}
            }}
            style={{ width: "100%", height: 200 }}
          />
          <button onClick={onUpdateProps} style={{ marginTop: 8 }}>Apply</button>
        </>
      );
    }

    return (
      <div style={{ display: "grid", gap: 8 }}>
        {entries.map(([name, cfg]) => {
          const t = cfg?.type ?? "string";
          const label = cfg?.label ?? name;
          const value = selectedSectionProps?.[name] ?? "";
          if (t === "object" && cfg?.fields) {
            const fields = Object.entries(cfg.fields);
            return (
              <fieldset key={name} style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
                <legend style={{ padding: "0 6px", color: "#666" }}>{label}</legend>
                <div style={{ display: "grid", gap: 6 }}>
                  {fields.map(([child, childCfg]: any) => {
                    const ct = childCfg?.type ?? "string";
                    const clabel = childCfg?.label ?? child;
                    const cval = (selectedSectionProps?.[name] ?? {})[child] ?? "";
                    if (ct === "number") return (
                      <label key={child} style={{ display: "grid", gap: 4 }}>
                        <span>{clabel}</span>
                        <input type="number" value={cval} onChange={(e) => updateField(name, { ...(selectedSectionProps?.[name] ?? {}), [child]: Number(e.target.value) })} />
                      </label>
                    );
                    if (ct === "select" && Array.isArray(childCfg?.options)) return (
                      <label key={child} style={{ display: "grid", gap: 4 }}>
                        <span>{clabel}</span>
                        <select value={cval} onChange={(e) => updateField(name, { ...(selectedSectionProps?.[name] ?? {}), [child]: e.target.value })}>
                          {childCfg.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </label>
                    );
                    return (
                      <label key={child} style={{ display: "grid", gap: 4 }}>
                        <span>{clabel}</span>
                        <input type="text" value={cval} onChange={(e) => updateField(name, { ...(selectedSectionProps?.[name] ?? {}), [child]: e.target.value })} />
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          }
          if (t === "boolean") {
            return (
              <label key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!value} onChange={(e) => updateField(name, e.target.checked)} /> {label}
              </label>
            );
          }
          if (t === "number") {
            return (
              <label key={name} style={{ display: "grid", gap: 4 }}>
                <span>{label}</span>
                <input type="number" value={value} onChange={(e) => updateField(name, Number(e.target.value))} />
              </label>
            );
          }
          if (t === "select" && Array.isArray(cfg?.options)) {
            return (
              <label key={name} style={{ display: "grid", gap: 4 }}>
                <span>{label}</span>
                <select value={value} onChange={(e) => updateField(name, e.target.value)}>
                  {cfg.options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            );
          }
          return (
            <label key={name} style={{ display: "grid", gap: 4 }}>
              <span>{label}</span>
              <input type="text" value={value} onChange={(e) => updateField(name, e.target.value)} />
            </label>
          );
        })}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={resetProps}>Reset</button>
          <button onClick={duplicateSection}>Duplicate</button>
          <button onClick={deleteSection} style={{ color: "#b91c1c" }}>Delete</button>
          <button onClick={() => setRawPropsMode((v) => !v)}>{rawPropsMode ? "Hide Raw" : "Raw JSON"}</button>
        </div>
        {rawPropsMode && (
          <textarea
            value={JSON.stringify(selectedSectionProps, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setSelectedSectionProps(parsed);
              } catch {}
            }}
            style={{ width: "100%", height: 160 }}
          />
        )}
      </div>
    );
  }

  function renderLayoutEditor() {
    if (!selectedSectionKey || !selectedSectionProps) return <p style={{ color: "#888" }}>Select a section</p>;
    const layout = selectedSectionProps.layout ?? {};
    function setLayoutField(name: string, value: any) {
      const next = { ...(selectedSectionProps ?? {}), layout: { ...(layout ?? {}), [name]: value } };
      setSelectedSectionProps(next);
      try { editor?.chain().focus().updateAttributes("section", { props: next }).run(); } catch {}
    }
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Max Width (px)</span>
          <input type="number" value={layout.maxWidth ?? 800} onChange={(e) => setLayoutField("maxWidth", Number(e.target.value))} />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Padding (px)</span>
          <input type="number" value={layout.padding ?? 16} onChange={(e) => setLayoutField("padding", Number(e.target.value))} />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Margin Y (px)</span>
          <input type="number" value={layout.marginY ?? 16} onChange={(e) => setLayoutField("marginY", Number(e.target.value))} />
        </label>
      </div>
    );
  }

  function renderStyleEditor() {
    if (!selectedSectionKey || !selectedSectionProps) return <p style={{ color: "#888" }}>Select a section</p>;
    const style = selectedSectionProps.style ?? {};
    function setStyleField(name: string, value: any) {
      const next = { ...(selectedSectionProps ?? {}), style: { ...(style ?? {}), [name]: value } };
      setSelectedSectionProps(next);
      try { editor?.chain().focus().updateAttributes("section", { props: next }).run(); } catch {}
    }
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Background</span>
          <input type="color" value={style.backgroundColor ?? "#ffffff"} onChange={(e) => setStyleField("backgroundColor", e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Text Color</span>
          <input type="color" value={style.color ?? "#000000"} onChange={(e) => setStyleField("color", e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Border Color</span>
          <input type="color" value={style.borderColor ?? "#dddddd"} onChange={(e) => setStyleField("borderColor", e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Border Width (px)</span>
          <input type="number" value={style.borderWidth ?? 1} onChange={(e) => setStyleField("borderWidth", Number(e.target.value))} />
        </label>
      </div>
    );
  }

  const filteredComponents = components.filter((c) => c.name.toLowerCase().includes(libraryQuery.toLowerCase()) || c.key.toLowerCase().includes(libraryQuery.toLowerCase()));

  if (!mounted) return null;
  // if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (loading) return <EditorLoading/>

  if (error) return <div style={{ padding: 24, color: "red" }}>{error}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopBarEnhanced
        title={title}
        saving={saving}
        lastSaved={new Date()}
        collaborators={0}
        onInsertImageClick={onInsertImageClick}
        onPublish={onPublish}
        onView={() => {
          try {
            const pk = projectKeyRef.current;
            if (pk && slug) {
              console.info("[Editor] View click", { pk, slug });
              router.push(`/p/${pk}/${slug}`);
            } else {
              console.warn("[Editor] View unavailable: missing projectKey or slug", { pk, slug });
            }
          } catch (e) {
            console.error("[Editor] View error", e);
          }
        }}
        onOpenCommandPalette={() => setCmdkOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenMediaManager={() => setMediaManagerOpen(true)}
        onOpenTemplates={() => setBlockTemplatesOpen(true)}
        onOpenSettings={() => setDocumentSettingsOpen(true)}
        onOpenDataSources={() => {}}
        onOpenCustomComponents={() => {}}
        onShare={() => {}}
        onExport={() => {}}
      />
      
      {/* Floating Toolbar for text formatting */}
      <FloatingToolbar
        editor={editor}
        isVisible={false}
        position={null}
      />
      
      {/* Saving Indicator */}
      <SavingIndicator saving={saving} />
      <CommandPalette
        open={isCmdkOpen}
        setOpen={setCmdkOpen}
        components={components.map((c) => ({ key: c.key, name: c.name }))}
        onInsertSection={(key) => onAddSection(key)}
        actions={[
          { id: "publish", label: "Publish", run: () => void onPublish() },
        ]}
      />
      <SlashMenu editor={editor} components={components as any} open={slashOpen} setOpen={setSlashOpen} />
      <HelpOverlay open={helpOpen} onOpenChange={setHelpOpen} />
      <MediaManager 
        open={mediaManagerOpen} 
        onOpenChange={setMediaManagerOpen}
        onInsertMedia={(url) => {
          editor?.chain().focus().setImage({ src: url }).run();
          toast.success("Image inserted");
        }}
      />
      <BlockTemplates
        open={blockTemplatesOpen}
        onOpenChange={setBlockTemplatesOpen}
        onApplyTemplate={(content) => {
          editor?.commands.setContent(content);
          toast.success("Template applied");
        }}
      />
      <DocumentSettings
        open={documentSettingsOpen}
        onOpenChange={setDocumentSettingsOpen}
        documentId={docId}
        currentSettings={documentMeta.displaySettings}
        onSave={saveDocumentSettings}
      />
      <input ref={fileInputRef} onChange={onFileChange} type="file" accept="image/*" style={{ display: "none" }} />

      {/* Toolbar */}
      <Toolbar
        editor={editor}
        onToggleLink={onToggleLink}
        onInsertTable={insertTable}
        addSectionControl={
          <select onChange={(e) => onAddSection(e.target.value)} defaultValue="" className="rounded border border-[var(--border)] bg-white px-2 py-1 text-sm">
            <option value="" disabled>
              + Add section
            </option>
            {components.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-white/60 px-2 py-2">
        <TemplatesPicker onApply={(content) => {
          try {
            editor?.commands.setContent(content);
              logger.info("[Templates] applied");
          } catch (e) {
            console.error("[Templates] apply error", e);
          }
        }} />
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <LeftSidebarEnhanced
          width={leftWidth}
          onMouseDownResizer={startLeftResize}
          components={components as any}
          libraryQuery={libraryQuery}
          onLibraryQueryChange={setLibraryQuery}
          onDragStartComponent={(e, c) => {
            try {
              e.dataTransfer.setData(
                "application/x-dc-component",
                JSON.stringify({ key: c.key, props: c.defaultConfig })
              );
              e.dataTransfer.effectAllowed = "copy";
              logger.info("[LeftSidebar] Drag start", { key: c.key });
            } catch (err) {
              console.error("[LeftSidebar] Drag error", err);
            }
          }}
          onOutlineJump={(pos) => {
            try {
              editor?.chain().focus().setTextSelection(pos + 1).run();
            } catch (e) {
              console.error("outline nav error", e);
            }
          }}
          onOutlineMove={(pos, dir) => {
            try {
              const { state } = editor!;
              const node = state.doc.nodeAt(pos);
              if (!node || node.type.name !== "section") return;
              queueMicrotask(() => {
                const found = { pos } as any;
                // dispatch through helper using actual pos
                const { moveSection } = require("@/app/editor/_logic/sectionTransforms");
                moveSection(editor!, pos, dir);
              });
            } catch (e) {
              console.error("outline move error", e);
            }
          }}
          outlineItems={getOutlineItems()}
          activeTab={leftTab}
          onChangeTab={setLeftTab}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <DevicePreview device={device} onChange={setDevice}>
            <div className="dc-surface p-6">
              <EditorContextMenu
                onSetParagraph={() => editor?.chain().focus().setParagraph().run()}
                onHeading={(l) => editor?.chain().focus().toggleHeading({ level: l }).run()}
                onBulletList={() => editor?.chain().focus().toggleBulletList().run()}
                onOrderedList={() => editor?.chain().focus().toggleOrderedList().run()}
                onIndent={() => {
                  try {
                    if (editor?.isActive("listItem")) editor?.chain().focus().sinkListItem("listItem").run();
                    else (editor?.chain().focus() as any).increaseIndent?.().run();
                  } catch (e) { console.error("context indent error", e); }
                }}
                onOutdent={() => {
                  try {
                    if (editor?.isActive("listItem")) editor?.chain().focus().liftListItem("listItem").run();
                    else (editor?.chain().focus() as any).decreaseIndent?.().run();
                  } catch (e) { console.error("context outdent error", e); }
                }}
                onBold={() => editor?.chain().focus().toggleBold().run()}
                onItalic={() => editor?.chain().focus().toggleItalic().run()}
                onStrike={() => editor?.chain().focus().toggleStrike().run()}
                onUnderline={() => editor?.chain().focus().toggleUnderline().run()}
                onAlign={(a: "left"|"center"|"right"|"justify") => editor?.chain().focus().setTextAlign(a).run()}
                onLink={onToggleLink}
                onFontSize={(px) => editor?.chain().focus().setMark('textStyle', { fontSize: `${px}px` }).run()}
                onTextColor={(hex: string) => {
                  try {
                    const color = hex?.trim();
                    if (!color) return;
                    editor?.chain().focus().setColor(color).run();
                    console.info("[ContextMenu] set text color", color);
                  } catch (e) { console.error("set text color error", e); }
                }}
                onHighlightColor={(hex: string) => {
                  try {
                    const color = hex?.trim();
                    if (!color) return;
                    editor?.chain().focus().toggleHighlight({ color }).run();
                    console.info("[ContextMenu] set highlight", color);
                  } catch (e) { console.error("set highlight error", e); }
                }}
                onClearFormatting={() => {
                  try {
                    editor?.chain().focus().clearNodes().unsetAllMarks().run();
                    console.info("[ContextMenu] cleared formatting");
                  } catch (e) { console.error("clear formatting error", e); }
                }}
                onTableCommands={editor ? {
                  addRowAbove: () => editor.chain().focus().addRowBefore().run(),
                  addRowBelow: () => editor.chain().focus().addRowAfter().run(),
                  addColLeft: () => editor.chain().focus().addColumnBefore().run(),
                  addColRight: () => editor.chain().focus().addColumnAfter().run(),
                  deleteRow: () => editor.chain().focus().deleteRow().run(),
                  deleteCol: () => editor.chain().focus().deleteColumn().run(),
                  merge: () => editor.chain().focus().mergeCells().run(),
                  split: () => editor.chain().focus().splitCell().run(),
                } : undefined}
              >
                <div style={{ overflowX: "auto" }}>
                  <EditorContent editor={editor} />
                </div>
              </EditorContextMenu>
            </div>
          </DevicePreview>
        </div>
        <InspectorEnhanced
          width={rightWidth}
          onMouseDownResizer={startRightResize}
          selectedNode={selectedSectionProps ? { attrs: { props: selectedSectionProps, componentKey: selectedSectionKey } } : null}
          onUpdateProps={(next) => {
            setSelectedSectionProps(next);
            try {
              editor?.chain().focus().updateAttributes("section", { props: next }).run();
              console.info("[Inspector] Update attributes applied");
            } catch (e) {
              console.error("[Inspector] update attributes error", e);
            }
          }}
          onDeleteNode={deleteSection}
          onDuplicateNode={duplicateSection}
          onResetProps={resetProps}
          tab={inspectorTab}
          onChangeTab={setInspectorTab as any}
          rawPropsMode={rawPropsMode}
          setRawPropsMode={setRawPropsMode}
          components={components}
          bottomExtra={<TableInspector editor={editor} />}
        />
      </div>
    </div>
  );
}
