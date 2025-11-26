"use client";

import React from "react";
import { Upload, FileText, X, Loader2, File, FileDown } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

/**
 * Import Dialog - Import external documents into editor
 * Supports: DOCX, PDF, HTML, Markdown, TXT
 */

export interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (content: any, title: string) => void; // Tiptap JSON content
}

export default function ImportDialog(props: ImportDialogProps) {
  const { open, onOpenChange, onImport } = props;
  const [importing, setImporting] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 50MB");
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", fileExt || "");

      const res = await fetch("/api/documents/import", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!json.ok) {
        throw new Error(json.error?.message || "Import failed");
      }

      // Import successful - content is in Tiptap JSON format
      const title = json.data.title || fileName.replace(/\.[^/.]+$/, "");
      onImport(json.data.content, title);
      toast.success(`Imported "${title}" successfully`);
      onOpenChange(false);
    } catch (error: any) {
      console.error("[Import] Error", error);
      toast.error(error.message || "Failed to import document");
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const supportedFormats = [
    { ext: "docx", name: "Word Document", icon: FileText },
    { ext: "pdf", name: "PDF Document", icon: FileText },
    { ext: "html", name: "HTML File", icon: FileText },
    { ext: "md", name: "Markdown", icon: FileText },
    { ext: "txt", name: "Plain Text", icon: File },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-zinc-600" />
              <Dialog.Title className="text-lg font-semibold text-zinc-900">Import Document</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded p-1 hover:bg-zinc-100" disabled={importing}>
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              className={clsx(
                "relative rounded-lg border-2 border-dashed p-12 text-center transition-all",
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-zinc-300 bg-zinc-50 hover:border-zinc-400"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".docx,.pdf,.html,.htm,.md,.txt"
                className="hidden"
                disabled={importing}
              />
              
              {importing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  <p className="text-sm font-medium text-zinc-700">Importing document...</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                  <p className="text-sm font-medium text-zinc-700 mb-2">
                    Drag and drop a document here, or
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Browse Files
                  </button>
                  <p className="mt-4 text-xs text-zinc-500">
                    Supported formats: DOCX, PDF, HTML, Markdown, TXT
                  </p>
                </>
              )}
            </div>

            {/* Supported Formats */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-zinc-900 mb-3">Supported Formats</h3>
              <div className="grid grid-cols-2 gap-3">
                {supportedFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <div
                      key={format.ext}
                      className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2"
                    >
                      <Icon className="h-4 w-4 text-zinc-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-900">{format.name}</div>
                        <div className="text-xs text-zinc-500">.{format.ext}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
