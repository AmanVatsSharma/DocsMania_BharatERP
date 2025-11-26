"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { FileText, Plus, Trash2, Edit2 } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

/**
 * Footnotes Panel - Manage footnotes in document
 * Features:
 * - List all footnotes
 * - Add new footnotes
 * - Edit footnote content
 * - Delete footnotes
 * - Navigate to footnote location
 */

export interface Footnote {
  id: string;
  content: string;
  position: number;
}

export interface FootnotesPanelProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FootnotesPanel(props: FootnotesPanelProps) {
  const { editor, open, onOpenChange } = props;
  const [footnotes, setFootnotes] = React.useState<Footnote[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState("");

  // Extract footnotes from editor
  const extractFootnotes = React.useCallback(() => {
    if (!editor) return [];

    const { doc } = editor.state;
    const found: Footnote[] = [];
    let index = 1;

    doc.descendants((node, pos) => {
      if (node.type.name === "footnote") {
        found.push({
          id: node.attrs.id || `footnote-${pos}`,
          content: node.attrs.content || "",
          position: pos,
        });
        index++;
      }
      return true;
    });

    return found;
  }, [editor]);

  // Update footnotes list
  React.useEffect(() => {
    if (!editor || !open) return;

    const updateFootnotes = () => {
      const newFootnotes = extractFootnotes();
      setFootnotes(newFootnotes);
    };

    updateFootnotes();
    editor.on("update", updateFootnotes);
    editor.on("selectionUpdate", updateFootnotes);

    return () => {
      editor.off("update", updateFootnotes);
      editor.off("selectionUpdate", updateFootnotes);
    };
  }, [editor, open, extractFootnotes]);

  // Add footnote
  const addFootnote = React.useCallback(() => {
    if (!editor) return;

    const content = window.prompt("Enter footnote content:");
    if (content === null) return; // User cancelled

    const id = `footnote-${Date.now()}`;
    editor.chain().focus().setFootnote({ id, content }).run();
    toast.success("Footnote added");
  }, [editor]);

  // Edit footnote
  const startEdit = (footnote: Footnote) => {
    setEditingId(footnote.id);
    setEditContent(footnote.content);
  };

  const saveEdit = () => {
    if (!editor || !editingId) return;

    editor.chain().focus().updateFootnote(editingId, editContent).run();
    setEditingId(null);
    setEditContent("");
    toast.success("Footnote updated");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  // Delete footnote
  const deleteFootnote = React.useCallback((id: string) => {
    if (!editor) return;
    if (!confirm("Delete this footnote?")) return;

    editor.chain().focus().deleteFootnote(id).run();
    toast.success("Footnote deleted");
  }, [editor]);

  // Jump to footnote
  const jumpToFootnote = React.useCallback((footnote: Footnote) => {
    if (!editor) return;

    try {
      editor.chain().focus().setTextSelection(footnote.position).run();
      const { view } = editor;
      const coords = view.coordsAtPos(footnote.position);
      const editorElement = view.dom.closest('.ProseMirror');
      if (editorElement) {
        editorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error("[Footnotes] Jump error", error);
    }
  }, [editor]);

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-96 border-l border-zinc-200 bg-white shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-zinc-600" />
          <h2 className="font-semibold text-zinc-900">Footnotes</h2>
          {footnotes.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
              {footnotes.length}
            </span>
          )}
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="rounded p-1 hover:bg-zinc-100"
        >
          <span className="text-zinc-500">✕</span>
        </button>
      </div>

      {/* Add Button */}
      <div className="border-b border-zinc-200 px-4 py-3">
        <button
          onClick={addFootnote}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <Plus className="h-4 w-4" />
          Add Footnote
        </button>
      </div>

      {/* Footnotes List */}
      <div className="flex-1 overflow-y-auto p-4">
        {footnotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500">No footnotes yet</p>
            <p className="mt-1 text-xs text-zinc-400">Add a footnote to cite sources</p>
          </div>
        ) : (
          <div className="space-y-3">
            {footnotes.map((footnote, index) => (
              <div
                key={footnote.id}
                className="rounded-lg border border-zinc-200 p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => jumpToFootnote(footnote)}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Jump to location
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(footnote)}
                      className="rounded p-1 hover:bg-zinc-100"
                      title="Edit"
                    >
                      <Edit2 className="h-3 w-3 text-zinc-500" />
                    </button>
                    <button
                      onClick={() => deleteFootnote(footnote.id)}
                      className="rounded p-1 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </button>
                  </div>
                </div>
                {editingId === footnote.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      rows={3}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-700">{footnote.content || "(Empty)"}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
