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
    <div className="fixed right-0 top-0 z-50 h-full w-96 border-l border-zinc-200/60 bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/60 bg-gradient-to-r from-white to-zinc-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <h2 className="font-semibold text-lg text-zinc-900">Footnotes</h2>
          {footnotes.length > 0 && (
            <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
              {footnotes.length}
            </span>
          )}
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="rounded-lg p-1.5 hover:bg-zinc-100/80 transition-all hover:shadow-sm"
        >
          <span className="text-zinc-500 text-lg">✕</span>
        </button>
      </div>

      {/* Add Button */}
      <div className="border-b border-zinc-200/60 bg-white px-5 py-4">
        <button
          onClick={addFootnote}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200/60 bg-gradient-to-r from-purple-50 to-purple-100/50 px-4 py-2.5 text-sm font-semibold text-purple-700 transition-all hover:from-purple-100 hover:to-purple-200 hover:shadow-sm active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Footnote
        </button>
      </div>

      {/* Footnotes List */}
      <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-white to-zinc-50/30">
        {footnotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 mb-4">
              <FileText className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-700">No footnotes yet</p>
            <p className="mt-1.5 text-xs text-zinc-500">Add a footnote to cite sources</p>
          </div>
        ) : (
          <div className="space-y-3">
            {footnotes.map((footnote, index) => (
              <div
                key={footnote.id}
                className="rounded-xl border border-zinc-200/60 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => jumpToFootnote(footnote)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Jump to location →
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(footnote)}
                      className="rounded-lg p-1.5 hover:bg-zinc-100/80 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-zinc-500" />
                    </button>
                    <button
                      onClick={() => deleteFootnote(footnote.id)}
                      className="rounded-lg p-1.5 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
                {editingId === footnote.id ? (
                  <div className="space-y-3 rounded-lg bg-zinc-50/50 p-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      rows={3}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-700 leading-relaxed">{footnote.content || <span className="text-zinc-400 italic">(Empty)</span>}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
