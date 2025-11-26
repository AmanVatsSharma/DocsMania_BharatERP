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
    <div className="fixed right-0 top-0 z-50 h-full w-96 border-l border-zinc-200 bg-white shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-zinc-600" />
          <h2 className="font-semibold text-zinc-900">Version History</h2>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="rounded p-1 hover:bg-zinc-100"
        >
          <span className="text-zinc-500">✕</span>
        </button>
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
            Loading versions...
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500">No versions yet</p>
            <p className="mt-1 text-xs text-zinc-400">Publish to create a version</p>
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.id}
                className={clsx(
                  "rounded-lg border p-3 cursor-pointer transition-all",
                  selectedVersion?.id === version.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                )}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-zinc-900">
                        Version {version.version}
                      </span>
                      {version.version === versions[0]?.version && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 font-medium">
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{formatDate(version.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreVersion(version);
                    }}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // View version (could open in new tab or modal)
                      toast.info("View version feature coming soon");
                    }}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
                  >
                    <Eye className="h-3 w-3" />
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
