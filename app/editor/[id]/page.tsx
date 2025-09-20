"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {Table} from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Section from "@/lib/SectionExtension";
import TopBar from "@/app/editor/_components/TopBar";
import LeftSidebar from "@/app/editor/_components/LeftSidebar";
import Inspector from "@/app/editor/_components/Inspector";
import Toolbar from "@/app/editor/_components/Toolbar";
import DevicePreview, { type DeviceKind } from "@/app/editor/_components/DevicePreview";
import CommandPalette from "@/app/editor/_components/CommandPalette";

function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delayMs: number) {
  const timer = React.useRef<NodeJS.Timeout | null>(null);
  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delayMs);
    },
    [fn, delayMs]
  );
}

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

export default function EditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
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
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Section,
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
            console.info("Mod+S: saving draft");
            void fetch(`/api/documents/${params.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: json }),
            });
            return true;
          }
          if (isMod && event.shiftKey && key === "p") {
            event.preventDefault();
            console.info("Shift+Mod+P: publish");
            void fetch(`/api/documents/${params.id}/publish`, { method: "POST" });
            return true;
          }
        } catch (e) {
          console.error("handleKeyDown error", e);
        }
        return false;
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
    if (!params.id) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/documents/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.error("Autosave failed", json);
      } else {
        console.debug("Autosave ok");
      }
    } catch (e) {
      console.error("Autosave error", e);
    } finally {
      setSaving(false);
    }
  }, 1500);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/documents/${params.id}`);
        const json = await res.json();
        if (!json.ok) throw new Error(json?.error?.message ?? "Failed to load");
        setTitle(json.data.title);
        setSlug(json.data.slug);
        const draft = json?.data?.meta?.draftContent ?? { type: "doc", content: [{ type: "paragraph" }] };
        editor?.commands.setContent(draft);
        console.info("Loaded document", json.data.id);
      } catch (e: any) {
        setError(String(e?.message ?? e));
      } finally {
        setLoading(false);
      }
    }
    if (editor) load();
  }, [editor, params.id]);

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
      const res = await fetch(`/api/documents/${params.id}/publish`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Publish failed");
      if (slug) router.push(`/p/${slug}`);
    } catch (e: any) {
      alert(`Publish error: ${String(e?.message ?? e)}`);
      console.error("Publish error", e);
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
    } catch (err: any) {
      console.error("Image upload failed", err);
      alert(`Upload failed: ${String(err?.message ?? err)}`);
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
        const text = (node.textContent || "").slice(0, 32) || node.attrs?.componentKey || "Section";
        sections.push({ index: i++, preview: text, pos });
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
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div style={{ padding: 24, color: "red" }}>{error}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopBar
        title={title}
        saving={saving}
        onInsertImageClick={onInsertImageClick}
        onPublish={onPublish}
        onOpenCommandPalette={() => setCmdkOpen(true)}
      />
      <CommandPalette
        open={isCmdkOpen}
        setOpen={setCmdkOpen}
        components={components.map((c) => ({ key: c.key, name: c.name }))}
        onInsertSection={(key) => onAddSection(key)}
        actions={[
          { id: "publish", label: "Publish", run: () => void onPublish() },
        ]}
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

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <LeftSidebar
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
              console.info("[LeftSidebar] Drag start", c.key);
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
          outlineItems={getOutlineItems()}
          activeTab={leftTab}
          onChangeTab={setLeftTab}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <DevicePreview device={device} onChange={setDevice}>
            <div className="dc-surface p-6">
              <EditorContent editor={editor} />
            </div>
          </DevicePreview>
        </div>
        <Inspector
          width={rightWidth}
          onMouseDownResizer={startRightResize}
          tab={inspectorTab}
          onChangeTab={setInspectorTab as any}
          selectedSectionKey={selectedSectionKey}
          selectedSectionProps={selectedSectionProps}
          components={components}
          onUpdateAttributes={(next) => {
            setSelectedSectionProps(next);
            try {
              editor?.chain().focus().updateAttributes("section", { props: next }).run();
              console.info("[Inspector] Update attributes applied");
            } catch (e) {
              console.error("[Inspector] update attributes error", e);
            }
          }}
          onResetProps={resetProps}
          onDuplicateSection={duplicateSection}
          onDeleteSection={deleteSection}
          rawPropsMode={rawPropsMode}
          setRawPropsMode={setRawPropsMode}
        />
      </div>
    </div>
  );
}
