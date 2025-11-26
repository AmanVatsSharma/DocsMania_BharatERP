"use client";

import React from "react";
import { Folder, FileText, Loader2, Search, X, ExternalLink, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

/**
 * Drive Browser - Browse and open files from AWS S3 drive
 * Features:
 * - List files/folders from S3
 * - Search files
 * - Open files in DocsMania editor
 * - Navigate folders
 */

export interface DriveFile {
  key: string;
  name: string;
  size?: number;
  lastModified?: Date | string;
  type: "file" | "folder";
  mimeType?: string;
  url?: string; // S3 presigned URL
}

export interface DriveBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenFile: (file: DriveFile) => void; // Called when user clicks "Open with DocsMania"
  driveConfig?: {
    bucket: string;
    region?: string;
    prefix?: string; // Folder prefix in S3
  };
}

export default function DriveBrowser(props: DriveBrowserProps) {
  const { open, onOpenChange, onOpenFile, driveConfig } = props;
  const [loading, setLoading] = React.useState(false);
  const [files, setFiles] = React.useState<DriveFile[]>([]);
  const [currentPath, setCurrentPath] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<DriveFile | null>(null);

  // Load files from S3
  const loadFiles = React.useCallback(async (path: string = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive/list?path=${encodeURIComponent(path)}`, {
        method: "GET",
      });

      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error?.message || "Failed to load files");
      }

      setFiles(json.data.files || []);
      setCurrentPath(path);
      console.debug("[DriveBrowser] Loaded", json.data.files?.length || 0, "items");
    } catch (error: any) {
      console.error("[DriveBrowser] Load error", error);
      toast.error(error.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    if (open) {
      loadFiles(driveConfig?.prefix || "");
    }
  }, [open, loadFiles, driveConfig?.prefix]);

  // Handle folder navigation
  const handleFolderClick = (folder: DriveFile) => {
    if (folder.type === "folder") {
      const newPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
      loadFiles(newPath);
    }
  };

  // Handle file selection
  const handleFileClick = (file: DriveFile) => {
    if (file.type === "file") {
      setSelectedFile(file);
    }
  };

  // Open file in editor
  const handleOpenInEditor = async () => {
    if (!selectedFile) return;

    try {
      // First, import the file
      const res = await fetch(`/api/drive/import?key=${encodeURIComponent(selectedFile.key)}`, {
        method: "POST",
      });

      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error?.message || "Failed to import file");
      }

      // Call the onOpenFile callback with imported content
      onOpenFile({
        ...selectedFile,
        ...json.data, // Includes content, title, etc.
      });

      toast.success(`Opening "${selectedFile.name}" in DocsMania`);
      onOpenChange(false);
    } catch (error: any) {
      console.error("[DriveBrowser] Import error", error);
      toast.error(error.message || "Failed to open file");
    }
  };

  // Filter files by search
  const filteredFiles = React.useMemo(() => {
    if (!searchQuery.trim()) return files;
    const query = searchQuery.toLowerCase();
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(query) ||
        file.key.toLowerCase().includes(query)
    );
  }, [files, searchQuery]);

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (date?: Date | string) => {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  };

  // Navigate up
  const navigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.join("/");
    loadFiles(newPath);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl h-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-zinc-600" />
              <Dialog.Title className="text-lg font-semibold text-zinc-900">
                Drive Browser
              </Dialog.Title>
              {currentPath && (
                <span className="text-sm text-zinc-500">/{currentPath}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadFiles(currentPath)}
                className="rounded p-1.5 hover:bg-zinc-100"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-zinc-500" />
              </button>
              <Dialog.Close asChild>
                <button className="rounded p-1 hover:bg-zinc-100">
                  <X className="h-5 w-5 text-zinc-500" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Search */}
          <div className="border-b border-zinc-200 px-6 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Breadcrumb */}
          {currentPath && (
            <div className="flex items-center gap-2 border-b border-zinc-200 px-6 py-2">
              <button
                onClick={navigateUp}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                ← Up
              </button>
              <span className="text-sm text-zinc-500">/</span>
              <span className="text-sm text-zinc-700">{currentPath}</span>
            </div>
          )}

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Folder className="h-12 w-12 text-zinc-300 mb-3" />
                <p className="text-sm text-zinc-500">
                  {searchQuery ? "No files found" : "No files in this folder"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.key}
                    onClick={() => {
                      if (file.type === "folder") {
                        handleFolderClick(file);
                      } else {
                        handleFileClick(file);
                      }
                    }}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                      selectedFile?.key === file.key
                        ? "border-blue-500 bg-blue-50"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    )}
                  >
                    {file.type === "folder" ? (
                      <Folder className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <FileText className="h-5 w-5 text-zinc-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-zinc-900 truncate">
                        {file.name}
                      </div>
                      {file.type === "file" && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                          <span>{formatSize(file.size)}</span>
                          {file.lastModified && (
                            <>
                              <span>•</span>
                              <span>{formatDate(file.lastModified)}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {file.type === "file" && selectedFile?.key === file.key && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInEditor();
                        }}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open with DocsMania
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
