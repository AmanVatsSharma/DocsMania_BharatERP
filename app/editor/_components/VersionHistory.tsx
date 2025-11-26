"use client";

import React from "react";
import { History, RotateCcw, Eye, Download } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

/**
 * Version History Panel - Google Docs style version history
 * Features:
 * - List all document versions
 * - View version content
 * - Restore previous versions
 * - Compare versions (future)
 */

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: any; // Tiptap JSON
  createdAt: Date | string;
}

export interface VersionHistoryProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore?: (version: DocumentVersion) => void;
}

export default function VersionHistory(props: VersionHistoryProps) {
  const { documentId, open, onOpenChange, onRestore } = props;
  const [versions, setVersions] = React.useState<DocumentVersion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState<DocumentVersion | null>(null);

  // Load versions
  const loadVersions = React.useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/versions`);
      const json = await res.json();
      if (json.ok) {
        setVersions(json.data || []);
        console.debug("[VersionHistory] Loaded", json.data?.length || 0, "versions");
      } else {
        console.error("[VersionHistory] Load error", json.error);
        toast.error("Failed to load versions");
      }
    } catch (error) {
      console.error("[VersionHistory] Load error", error);
      toast.error("Failed to load versions");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  React.useEffect(() => {
    if (open && documentId) {
      loadVersions();
    }
  }, [open, documentId, loadVersions]);

  // Restore version
  const restoreVersion = React.useCallback(async (version: DocumentVersion) => {
    if (!confirm(`Restore version ${version.version}? This will replace the current draft.`)) {
      return;
    }

    try {
      if (onRestore) {
        onRestore(version);
        toast.success(`Restored version ${version.version}`);
        onOpenChange(false);
      } else {
        // Fallback: update document draft content
        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: version.content }),
        });

        const json = await res.json();
        if (json.ok) {
          toast.success(`Restored version ${version.version}`);
          onOpenChange(false);
          // Reload page to show restored content
          window.location.reload();
        } else {
          throw new Error(json.error?.message || "Failed to restore version");
        }
      }
    } catch (error: any) {
      console.error("[VersionHistory] Restore error", error);
      toast.error(error.message || "Failed to restore version");
    }
  }, [documentId, onRestore, onOpenChange]);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  };

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-96 border-l border-zinc-200/60 bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/60 bg-gradient-to-r from-white to-zinc-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <History className="h-4 w-4 text-slate-600" />
          </div>
          <h2 className="font-semibold text-lg text-zinc-900">Version History</h2>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="rounded-lg p-1.5 hover:bg-zinc-100/80 transition-all hover:shadow-sm"
        >
          <span className="text-zinc-500 text-lg">✕</span>
        </button>
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-white to-zinc-50/30">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm font-medium text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-slate-600"></div>
              Loading versions...
            </div>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 mb-4">
              <History className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-700">No versions yet</p>
            <p className="mt-1.5 text-xs text-zinc-500">Publish to create a version</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className={clsx(
                  "rounded-xl border p-4 cursor-pointer transition-all",
                  selectedVersion?.id === version.id
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md"
                    : "border-zinc-200/60 bg-white shadow-sm hover:border-zinc-300 hover:shadow-md"
                )}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="font-semibold text-sm text-zinc-900">
                        Version {version.version}
                      </span>
                      {version.version === versions[0]?.version && (
                        <span className="rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-2.5 py-1 text-xs text-green-700 font-semibold shadow-sm">
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-zinc-500">{formatDate(version.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreVersion(version);
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all hover:shadow-sm active:scale-[0.98]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // View version (could open in new tab or modal)
                      toast.info("View version feature coming soon");
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
