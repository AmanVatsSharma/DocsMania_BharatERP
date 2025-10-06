"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Upload, Image as ImageIcon, X, Trash2, Eye, Copy, Check } from "lucide-react";
import { clsx } from "clsx";

export interface MediaManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertMedia: (url: string) => void;
}

interface MediaItem {
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Enterprise-grade media manager
 * - Upload images with drag & drop
 * - Browse uploaded media
 * - Insert media into document
 * - Preview and manage files
 */
export default function MediaManager(props: MediaManagerProps) {
  const { open, onOpenChange, onInsertMedia } = props;
  const [uploading, setUploading] = React.useState(false);
  const [mediaItems, setMediaItems] = React.useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load media items (mock for now - would connect to API)
  React.useEffect(() => {
    if (open) {
      // TODO: Fetch from API
      setMediaItems([]);
    }
  }, [open]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    
    try {
      setUploading(true);
      const file = files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large (max 10MB)");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message ?? "Upload failed");
      }

      const newItem: MediaItem = {
        url: json.data.url,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      };

      setMediaItems((prev) => [newItem, ...prev]);
      setSelectedItem(newItem.url);
    } catch (err: any) {
      console.error("Upload error", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl"
          style={{ maxHeight: "90vh" }}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <Dialog.Title className="text-lg font-semibold text-zinc-900">
                  Media Library
                </Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-500">
                  Upload and manage your images and media files
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-lg p-2 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Upload Area */}
            <div className="border-b border-zinc-200 p-6">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={clsx(
                  "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleUpload(e.target.files)}
                  className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 text-zinc-400" />
                <p className="mt-2 text-sm font-medium text-zinc-700">
                  Drop files here or click to upload
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  PNG, JPG, GIF, MP4 up to 10MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Select Files"}
                </button>
              </div>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {mediaItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-zinc-500">
                  <ImageIcon className="h-16 w-16 text-zinc-300" />
                  <p className="mt-4 text-sm">No media files yet</p>
                  <p className="text-xs">Upload your first file to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {mediaItems.map((item) => (
                    <div
                      key={item.url}
                      className={clsx(
                        "group relative overflow-hidden rounded-lg border-2 transition-all",
                        selectedItem === item.url
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <button
                        onClick={() => setSelectedItem(item.url)}
                        className="w-full"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-32 w-full object-cover"
                        />
                      </button>
                      <div className="bg-white p-2">
                        <p className="truncate text-xs font-medium text-zinc-700">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatFileSize(item.size)}
                        </p>
                      </div>
                      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(item.url);
                          }}
                          className="rounded bg-white p-1.5 shadow-sm hover:bg-zinc-100"
                          title="Copy URL"
                        >
                          {copiedUrl === item.url ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.url, "_blank");
                          }}
                          className="rounded bg-white p-1.5 shadow-sm hover:bg-zinc-100"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
              <div className="text-sm text-zinc-500">
                {selectedItem ? "1 file selected" : `${mediaItems.length} files`}
              </div>
              <div className="flex gap-2">
                <Dialog.Close className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={() => {
                    if (selectedItem) {
                      onInsertMedia(selectedItem);
                      onOpenChange(false);
                    }
                  }}
                  disabled={!selectedItem}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  Insert Selected
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
