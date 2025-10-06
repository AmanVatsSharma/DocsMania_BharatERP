"use client";

import React from "react";
import { 
  Trash2, Copy, Download, Archive, Tag, 
  FolderInput, Check, X, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface BulkOperationsProps {
  selectedDocIds: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export default function BulkOperations({ 
  selectedDocIds, 
  onClearSelection, 
  onRefresh 
}: BulkOperationsProps) {
  const [busy, setBusy] = React.useState(false);

  if (selectedDocIds.length === 0) return null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedDocIds.length} document(s)?`)) {
      return;
    }

    try {
      setBusy(true);
      const results = await Promise.allSettled(
        selectedDocIds.map(id => 
          fetch(`/api/documents/${id}`, { method: "DELETE" })
        )
      );

      const successCount = results.filter(r => r.status === "fulfilled").length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Deleted ${successCount} document(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} document(s)`);
      }

      onClearSelection();
      onRefresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete documents");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    try {
      setBusy(true);
      toast.info("Exporting documents...");
      
      // Fetch all selected documents
      const docs = await Promise.all(
        selectedDocIds.map(async (id) => {
          const res = await fetch(`/api/documents/${id}`);
          const json = await res.json();
          return json.ok ? json.data : null;
        })
      );

      const validDocs = docs.filter(d => d !== null);

      // Create JSON export
      const exportData = {
        exported_at: new Date().toISOString(),
        count: validDocs.length,
        documents: validDocs
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: "application/json" 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `documents-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${validDocs.length} document(s)`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to export documents");
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setBusy(true);
      toast.info("Duplicating documents...");

      const results = await Promise.allSettled(
        selectedDocIds.map(async (id) => {
          const res = await fetch(`/api/documents/${id}`);
          const json = await res.json();
          if (!json.ok) throw new Error("Failed to fetch document");

          const doc = json.data;
          const duplicateRes = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `${doc.title} (Copy)`,
              slug: `${doc.slug}-copy-${Date.now()}`,
              projectKey: doc.project.key,
              meta: doc.meta
            })
          });

          if (!duplicateRes.ok) throw new Error("Failed to duplicate");
          return duplicateRes.json();
        })
      );

      const successCount = results.filter(r => r.status === "fulfilled").length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Duplicated ${successCount} document(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to duplicate ${failCount} document(s)`);
      }

      onClearSelection();
      onRefresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to duplicate documents");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-700 px-6 py-4 flex items-center gap-4">
        {/* Selection Count */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold">{selectedDocIds.length} selected</span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-zinc-700" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            onClick={handleExport}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Export"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-zinc-700" />

        {/* Cancel */}
        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Loading Indicator */}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        )}
      </div>
    </div>
  );
}
