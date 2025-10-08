/**
 * Complete Integration Example
 * Shows how to integrate all new UI components into the editor
 * Copy this pattern to update your app/editor/[id]/page.tsx
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AnimatePresence } from "framer-motion";

// Import new UI components
import { useEditorUI } from "@/lib/store/editorUI";
import useEditorShortcuts from "@/lib/useKeyboardShortcuts";
import TopBarAutoHide from "@/app/editor/_components/TopBarAutoHide";
import LeftSidebarSliding from "@/app/editor/_components/LeftSidebarSliding";
import RightInspectorSliding from "@/app/editor/_components/RightInspectorSliding";
import BubbleMenuEnhanced from "@/app/editor/_components/BubbleMenuEnhanced";
import SlashCommandsEnhanced from "@/app/editor/_components/SlashCommandsEnhanced";
import ContextMenuEnhanced from "@/app/editor/_components/ContextMenuEnhanced";
import ComponentHoverMenu from "@/app/editor/_components/ComponentHoverMenu";

// Import your existing components
import ImageExtended from "@/lib/ImageExtended";
import TableExtended from "@/lib/TableExtended";
import TableInspector from "@/app/editor/_components/TableInspector";
import ImageInspector from "@/app/editor/_components/ImageInspector";
import { cn } from "@/lib/utils";

export default function EditorPageExample({ params }: { params: { id: string } }) {
  const router = useRouter();
  const docId = params.id;

  // ==================== UI STATE ====================
  const {
    leftSidebarOpen,
    rightInspectorOpen,
    topBarVisible,
    viewMode,
    leftSidebarCollapsed,
    setLeftSidebarOpen,
    toggleLeftSidebar,
    toggleRightInspector,
    enterFocusMode,
    enterZenMode,
    exitSpecialMode,
  } = useEditorUI();

  // ==================== LOCAL STATE ====================
  const [title, setTitle] = React.useState("Untitled Document");
  const [slug, setSlug] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [components, setComponents] = React.useState<any[]>([]);
  const [selectedSectionProps, setSelectedSectionProps] = React.useState<any>(null);
  const [selectedSectionKey, setSelectedSectionKey] = React.useState<string | null>(null);
  const [leftTab, setLeftTab] = React.useState<"library" | "outline">("library");
  const [inspectorTab, setInspectorTab] = React.useState<"props" | "layout" | "style">("props");
  const [rawPropsMode, setRawPropsMode] = React.useState(false);
  const [libraryQuery, setLibraryQuery] = React.useState("");
  const [slashOpen, setSlashOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  // Panel width states (for resizing)
  const [leftWidth, setLeftWidth] = React.useState(280);
  const [rightWidth, setRightWidth] = React.useState(320);

  // ==================== EDITOR SETUP ====================
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtended,
      TableExtended,
      // ... add your other extensions
    ],
    content: {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    onUpdate: ({ editor }) => {
      // Auto-save logic
      console.log("Content updated");
    },
    onSelectionUpdate: ({ editor }) => {
      // Update inspector when selection changes
      if (editor.isActive("section")) {
        const attrs = editor.getAttributes("section");
        setSelectedSectionKey(attrs?.componentKey ?? null);
        setSelectedSectionProps(attrs?.props ?? {});
      } else {
        setSelectedSectionKey(null);
        setSelectedSectionProps(null);
      }
    },
  });

  // ==================== KEYBOARD SHORTCUTS ====================
  useEditorShortcuts({
    onToggleLeftSidebar: toggleLeftSidebar,
    onToggleRightInspector: toggleRightInspector,
    onCommandPalette: () => setSlashOpen(true),
    onFocusMode: enterFocusMode,
    onZenMode: enterZenMode,
    onSave: () => {
      console.log("Save triggered");
      // Your save logic
    },
    onPublish: () => {
      console.log("Publish triggered");
      // Your publish logic
    },
    onShowHelp: () => setHelpOpen(true),
  });

  // ==================== PANEL RESIZE HANDLERS ====================
  function startLeftResize(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth + dx));
      setLeftWidth(newWidth);
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
      const newWidth = Math.max(260, Math.min(520, startWidth + dx));
      setRightWidth(newWidth);
    }
    
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // ==================== HELPER FUNCTIONS ====================
  function getOutlineItems() {
    if (!editor) return [];
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

  function deleteSection() {
    // Your delete section logic
  }

  function duplicateSection() {
    // Your duplicate section logic
  }

  function resetProps() {
    // Your reset props logic
  }

  // ==================== RENDER ====================
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* ==================== TOP BAR ==================== */}
      <TopBarAutoHide
        title={title}
        saving={saving}
        lastSaved={new Date()}
        onSave={() => console.log("Save")}
        onPublish={() => console.log("Publish")}
        onView={() => console.log("View")}
        onInsertImage={() => console.log("Insert image")}
        onOpenCommandPalette={() => setSlashOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSettings={() => console.log("Settings")}
        breadcrumbs={[
          { label: "Projects", onClick: () => router.push("/") },
          { label: title },
        ]}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ==================== LEFT SIDEBAR ==================== */}
        <AnimatePresence>
          {leftSidebarOpen && (
            <LeftSidebarSliding
              width={leftWidth}
              components={components}
              libraryQuery={libraryQuery}
              onLibraryQueryChange={setLibraryQuery}
              onDragStartComponent={(e, comp) => {
                e.dataTransfer.setData(
                  "application/x-dc-component",
                  JSON.stringify({ key: comp.key, props: comp.defaultConfig })
                );
              }}
              onOutlineJump={(pos) => {
                editor?.chain().focus().setTextSelection(pos + 1).run();
              }}
              onOutlineMove={(pos, dir) => {
                console.log("Move section", pos, dir);
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
          {/* Context Menu wraps the entire editor */}
          <ContextMenuEnhanced
            editor={editor}
            onInsertImage={() => console.log("Insert image")}
            onInsertLink={() => console.log("Insert link")}
          >
            <div
              className={cn(
                "mx-auto px-8 py-12 transition-all duration-300",
                viewMode === "focus" && "max-w-3xl",
                viewMode === "zen" && "max-w-2xl",
                viewMode === "normal" && "max-w-4xl"
              )}
            >
              {/* Editor Content */}
              <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />

              {/* Bubble Menu for text selection */}
              <BubbleMenuEnhanced
                editor={editor}
                onToggleLink={() => console.log("Toggle link")}
              />
            </div>
          </ContextMenuEnhanced>
        </div>

        {/* ==================== RIGHT INSPECTOR ==================== */}
        <AnimatePresence>
          {rightInspectorOpen && (
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
                editor?.chain().focus().updateAttributes("section", { props: next }).run();
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
          )}
        </AnimatePresence>
      </div>

      {/* ==================== MODALS / OVERLAYS ==================== */}
      {/* Slash Commands */}
      <SlashCommandsEnhanced
        editor={editor}
        open={slashOpen}
        setOpen={setSlashOpen}
        components={components}
      />

      {/* Help Modal - implement your own */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          onClick={() => setHelpOpen(false)}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>
            {/* Add your help content */}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== USAGE NOTES ====================
/**
 * 1. Replace your existing editor page with this pattern
 * 2. Add your extensions to the editor setup
 * 3. Implement your save/publish logic
 * 4. Add your component loading logic
 * 5. Customize styling as needed
 * 
 * Key Points:
 * - All panels use AnimatePresence for smooth transitions
 * - State managed through useEditorUI hook
 * - Keyboard shortcuts configured through useEditorShortcuts
 * - Context menu wraps editor content
 * - Bubble menu automatically appears on text selection
 * - Inspector auto-shows when component selected
 */