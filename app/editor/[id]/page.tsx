/**
 * INTEGRATED EDITOR PAGE WITH NEW UI/UX
 * All features preserved, new UI components integrated
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtended from "@/lib/ImageExtended";
import TableExtended from "@/lib/TableExtended";
import TableRowExtended from "@/lib/TableRowExtended";
import TableHeader from "@tiptap/extension-table-header";
import TableInspector from "@/app/editor/_components/TableInspector";
import ImageInspector from "@/app/editor/_components/ImageInspector";
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

// NEW: Modern UI Components
import { AnimatePresence } from "framer-motion";
import { useEditorUI } from "@/lib/store/editorUI";
import useEditorShortcuts from "@/lib/useKeyboardShortcuts";
import TopBarAutoHide from "@/app/editor/_components/TopBarAutoHide";
import LeftSidebarSliding from "@/app/editor/_components/LeftSidebarSliding";
import RightInspectorSliding from "@/app/editor/_components/RightInspectorSliding";
import BubbleMenuComplete from "@/app/editor/_components/BubbleMenuComplete";
import SlashCommandsEnhanced from "@/app/editor/_components/SlashCommandsEnhanced";
import ContextMenuEnhanced from "@/app/editor/_components/ContextMenuEnhanced";

// Existing Features - Keep All
import { SavingIndicator } from "@/app/editor/_components/LoadingStates";
import "@/app/editor/_styles/enterprise-editor.css";
import DevicePreview, { type DeviceKind } from "@/app/editor/_components/DevicePreview";
import CommandPalette from "@/app/editor/_components/CommandPalette";
import { createSectionNodeView } from "@/app/editor/_components/SectionNodeView";
import EditorLoading from "./loading";
import { useDebouncedCallback } from "@/lib/hooks";
import HelpOverlay from "@/app/editor/_components/HelpOverlay";
import { replaceCurrentTableWithMatrix } from "@/lib/tableUtils";
import { TextSelection } from "prosemirror-state";
import MediaManager from "@/app/editor/_components/MediaManager";
import BlockTemplates from "@/app/editor/_components/BlockTemplates";
import DocumentSettings from "@/app/editor/_components/DocumentSettings";
import TemplateManager from "@/app/editor/_components/TemplateManager";
import ComponentBuilder from "@/app/editor/_components/ComponentBuilder";
import CustomComponentLibrary from "@/app/editor/_components/CustomComponentLibrary";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { cn } from "@/lib/utils";

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

  // ==================== NEW: UI STATE MANAGEMENT ====================
  const {
    leftSidebarOpen,
    rightInspectorOpen,
    topBarVisible,
    viewMode,
    leftSidebarCollapsed,
    setLeftSidebarOpen,
    toggleLeftSidebar,
    toggleRightInspector,
    setTopBarVisible,
    enterFocusMode,
    enterZenMode,
    exitSpecialMode,
  } = useEditorUI();

  // ==================== EXISTING STATE (PRESERVED) ====================
  const [mounted, setMounted] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [isCmdkOpen, setCmdkOpen] = React.useState(false);
  const [components, setComponents] = React.useState<Array<{ key: string; name: string; defaultConfig: any; schema?: Record<string, any> }>>([]);
  const [selectedSectionProps, setSelectedSectionProps] = React.useState<any>(null);
  const [selectedSectionKey, setSelectedSectionKey] = React.useState<string | null>(null);
  const [rawPropsMode, setRawPropsMode] = React.useState(false);
  const [leftTab, setLeftTab] = React.useState<'library' | 'outline'>("library");
  const [inspectorTab, setInspectorTab] = React.useState<'props' | 'layout' | 'style'>("props");
  const [libraryQuery, setLibraryQuery] = React.useState("");
  const [leftWidth, setLeftWidth] = React.useState(280);
  const [rightWidth, setRightWidth] = React.useState(320);
  const [device, setDevice] = React.useState<DeviceKind>("desktop");
  const [slashOpen, setSlashOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [mediaManagerOpen, setMediaManagerOpen] = React.useState(false);
  const [blockTemplatesOpen, setBlockTemplatesOpen] = React.useState(false);
  const [documentSettingsOpen, setDocumentSettingsOpen] = React.useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = React.useState(false);
  const [componentBuilderOpen, setComponentBuilderOpen] = React.useState(false);
  const [customComponentLibraryOpen, setCustomComponentLibraryOpen] = React.useState(false);
  const [documentMeta, setDocumentMeta] = React.useState<any>({});
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const projectKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ==================== NEW: KEYBOARD SHORTCUTS ====================
  useEditorShortcuts({
    onToggleLeftSidebar: toggleLeftSidebar,
    onToggleRightInspector: toggleRightInspector,
    onCommandPalette: () => setCmdkOpen(true),
    onQuickSwitcher: () => console.log("Quick switcher - to be implemented"),
    onFocusMode: enterFocusMode,
    onZenMode: enterZenMode,
    onSave: () => {
      const json = editor?.getJSON();
      if (json) {
        void fetch(`/api/documents/${docId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: json }),
        });
        toast.success("Saved!");
      }
    },
    onPublish: () => {
      void onPublish();
    },
    onShowHelp: () => setHelpOpen(true),
  });

  // ==================== EXISTING FUNCTIONS (PRESERVED) ====================
  async function fetchComponents() {
    try {
      const res = await fetch("/api/components");
      const data = await res.json();
      if (data.ok) {
        setComponents(data.data);
        console.log(`[Editor] Loaded ${data.data.length} components`);
      }
    } catch (error) {
      console.error("Load components error", error);
    }
  }

  React.useEffect(() => {
    fetchComponents();
  }, []);

  function startLeftResize(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const next = Math.max(200, Math.min(500, startWidth + dx));
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
      ImageExtended,
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
          // Note: Cmd+S and Cmd+Shift+P now handled by useEditorShortcuts
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
                    const span = doc.createElement("span");
                    span.innerHTML = el.innerHTML;
                    el.replaceWith(span);
                  } else {
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
              return false;
            }
          }

          if (text && !editor?.isActive("codeBlock")) {
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
            if (state.trEl) state.trEl.style.height = `${next}px`;
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
        setLastSaved(new Date());
      }
    } catch (e) {
      console.error("Autosave error", e);
      toast.error("Autosave error");
    } finally {
      setSaving(false);
    }
  }, 1500);

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
    form.append("documentId", docId);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? "Upload failed");
      const url: string = json.data.url;
      const s3Key: string = json.data.key;
      editor?.chain().focus().setImage({ src: url, s3Key }).run();
      console.info("Inserted image", url, s3Key);
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

  if (!mounted) return null;
  if (loading) return <EditorLoading/>;
  if (error) return <div style={{ padding: 24, color: "red" }}>{error}</div>;

  // ==================== NEW: MODERN UI LAYOUT ====================
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* ==================== NEW: TOP BAR AUTO-HIDE WITH ALL FEATURES ==================== */}
      <TopBarAutoHide
        title={title}
        saving={saving}
        lastSaved={lastSaved}
        collaborators={0}
        onSave={() => {
          const json = editor?.getJSON();
          if (json) {
            void fetch(`/api/documents/${docId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: json }),
            });
            toast.success("Saved!");
          }
        }}
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
        onShare={() => {
          console.log("Share feature - to be implemented");
          toast.info("Share feature coming soon");
        }}
        onExport={() => {
          console.log("Export feature - to be implemented");
          toast.info("Export feature coming soon");
        }}
        onInsertImage={onInsertImageClick}
        onOpenCommandPalette={() => setCmdkOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSettings={() => setDocumentSettingsOpen(true)}
        onOpenMediaManager={() => setMediaManagerOpen(true)}
        onOpenTemplates={() => setTemplateManagerOpen(true)}
        onOpenDataSources={() => {
          console.log("Data Sources - to be implemented");
          toast.info("Data Sources feature coming soon");
        }}
        onOpenCustomComponents={() => setCustomComponentLibraryOpen(true)}
        breadcrumbs={[
          { label: "Projects", onClick: () => router.push("/") },
          { label: title },
        ]}
      />

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ==================== NEW: LEFT SIDEBAR SLIDING ==================== */}
        <AnimatePresence>
          {leftSidebarOpen && (
            <LeftSidebarSliding
              width={leftWidth}
              components={components}
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
              onMouseDownResizer={startLeftResize}
            />
          )}
        </AnimatePresence>

        {/* ==================== EDITOR CANVAS ==================== */}
        <div className="flex-1 overflow-auto">
          {/* NEW: Context Menu Enhancement - wraps everything */}
          <ContextMenuEnhanced
            editor={editor}
            onInsertImage={onInsertImageClick}
            onInsertLink={onToggleLink}
          >
            {/* Device Preview - PRESERVED */}
            <DevicePreview device={device} onChange={setDevice}>
              <div
                className={cn(
                  "mx-auto px-8 py-12 transition-all duration-300",
                  viewMode === "focus" && "max-w-3xl",
                  viewMode === "zen" && "max-w-2xl",
                  viewMode === "normal" && "max-w-4xl"
                )}
              >
                <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />

                {/* NEW: Complete Bubble Menu with ALL formatting features */}
                <BubbleMenuComplete
                  editor={editor}
                  onToggleLink={onToggleLink}
                />
              </div>
            </DevicePreview>
          </ContextMenuEnhanced>
        </div>

        {/* ==================== RIGHT INSPECTOR - ALWAYS VISIBLE ==================== */}
        <RightInspectorSliding
          width={rightWidth}
          onMouseDownResizer={startRightResize}
          selectedNode={
            selectedSectionProps
              ? {
                  attrs: {
                    props: selectedSectionProps,
                    componentKey: selectedSectionKey,
                  },
                }
              : null
          }
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
          onChangeTab={setInspectorTab}
          rawPropsMode={rawPropsMode}
          setRawPropsMode={setRawPropsMode}
          components={components}
          bottomExtra={
            <>
              <TableInspector editor={editor} />
              <ImageInspector editor={editor} />
            </>
          }
        />
      </div>

      {/* ==================== EXISTING MODALS & DIALOGS (ALL PRESERVED) ==================== */}
      <input ref={fileInputRef} onChange={onFileChange} type="file" accept="image/*" style={{ display: "none" }} />

      {/* Saving Indicator */}
      <SavingIndicator saving={saving} />

      {/* Command Palette - Keep existing for now */}
      <CommandPalette
        open={isCmdkOpen}
        setOpen={setCmdkOpen}
        components={components.map((c) => ({ key: c.key, name: c.name }))}
        onInsertSection={(key) => onAddSection(key)}
        actions={[
          { id: "publish", label: "Publish", run: () => void onPublish() },
        ]}
      />

      {/* NEW: Enhanced Slash Commands */}
      <SlashCommandsEnhanced
        editor={editor}
        open={slashOpen}
        setOpen={setSlashOpen}
        components={components}
      />

      {/* Help Overlay */}
      <HelpOverlay open={helpOpen} onOpenChange={setHelpOpen} />

      {/* Media Manager */}
      <MediaManager 
        open={mediaManagerOpen} 
        onOpenChange={setMediaManagerOpen}
        onInsertMedia={(url) => {
          editor?.chain().focus().setImage({ src: url }).run();
          toast.success("Image inserted");
        }}
      />

      {/* Block Templates */}
      <BlockTemplates
        open={blockTemplatesOpen}
        onOpenChange={setBlockTemplatesOpen}
        onApplyTemplate={(content) => {
          editor?.commands.setContent(content);
          toast.success("Template applied");
        }}
      />

      {/* Document Settings */}
      <DocumentSettings
        open={documentSettingsOpen}
        onOpenChange={setDocumentSettingsOpen}
        documentId={docId}
        currentSettings={documentMeta.displaySettings}
        onSave={saveDocumentSettings}
      />

      {/* Template Manager */}
      <TemplateManager
        open={templateManagerOpen}
        onOpenChange={setTemplateManagerOpen}
        currentDocument={editor?.getJSON()}
        onApplyTemplate={(template) => {
          if (template.content) {
            editor?.commands.setContent(template.content);
            toast.success(`Template "${template.name}" applied!`);
          }
        }}
      />

      {/* Component Builder */}
      <ComponentBuilder
        open={componentBuilderOpen}
        onOpenChange={setComponentBuilderOpen}
        onSave={async (component) => {
          await fetchComponents();
          const { loadCustomComponents } = await import("@/app/editor/_registry/sections");
          await loadCustomComponents();
          toast.success(`Component "${component.name}" saved!`);
          setComponentBuilderOpen(false);
        }}
      />

      {/* Custom Component Library */}
      <CustomComponentLibrary
        open={customComponentLibraryOpen}
        onOpenChange={setCustomComponentLibraryOpen}
        onEdit={(component) => {
          setComponentBuilderOpen(true);
          setCustomComponentLibraryOpen(false);
        }}
        onCreate={() => {
          setComponentBuilderOpen(true);
          setCustomComponentLibraryOpen(false);
        }}
      />
    </div>
  );
}