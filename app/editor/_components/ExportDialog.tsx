"use client";

import React from "react";
import { Download, FileText, FileDown, X } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { Editor } from "@tiptap/react";

/**
 * Export Dialog - Export document to various formats
 * Features:
 * - PDF export
 * - DOCX export
 * - HTML export
 * - Markdown export
 */

export interface ExportDialogProps {
  editor: Editor | null;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportDialog(props: ExportDialogProps) {
  const { editor, documentTitle, open, onOpenChange } = props;
  const [exporting, setExporting] = React.useState<string | null>(null);

  // Export to PDF
  const exportPDF = React.useCallback(async () => {
    if (!editor) return;
    setExporting("pdf");

    try {
      // Get HTML content
      const html = editor.getHTML();
      const title = documentTitle || "Document";

      // Create a new window with the content
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              @media print {
                @page {
                  margin: 1in;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  line-height: 1.6;
                  color: #000;
                  max-width: 8.5in;
                  margin: 0 auto;
                  padding: 0;
                }
                h1, h2, h3, h4, h5, h6 {
                  margin-top: 1em;
                  margin-bottom: 0.5em;
                  font-weight: 600;
                }
                p {
                  margin: 0.5em 0;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 1em 0;
                }
                table td, table th {
                  border: 1px solid #ddd;
                  padding: 8px;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                line-height: 1.6;
                color: #000;
                max-width: 8.5in;
                margin: 0 auto;
                padding: 2em;
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            ${html}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        toast.success("PDF export ready. Use browser print dialog to save as PDF.");
      }, 500);
    } catch (error: any) {
      console.error("[Export] PDF error", error);
      toast.error(error.message || "Failed to export PDF");
    } finally {
      setExporting(null);
    }
  }, [editor, documentTitle]);

  // Export to HTML
  const exportHTML = React.useCallback(async () => {
    if (!editor) return;
    setExporting("html");

    try {
      const html = editor.getHTML();
      const title = documentTitle || "Document";
      const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 2em;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${html}
</body>
</html>`;

      const blob = new Blob([fullHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("HTML exported");
    } catch (error: any) {
      console.error("[Export] HTML error", error);
      toast.error(error.message || "Failed to export HTML");
    } finally {
      setExporting(null);
    }
  }, [editor, documentTitle]);

  // Export to Markdown
  const exportMarkdown = React.useCallback(async () => {
    if (!editor) return;
    setExporting("markdown");

    try {
      // Simple markdown conversion (basic)
      const html = editor.getHTML();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      let markdown = `# ${documentTitle || "Document"}\n\n`;

      const convertNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || "";
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return "";

        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const children = Array.from(node.childNodes)
          .map(convertNode)
          .join("");

        switch (tag) {
          case "h1":
            return `# ${children}\n\n`;
          case "h2":
            return `## ${children}\n\n`;
          case "h3":
            return `### ${children}\n\n`;
          case "h4":
            return `#### ${children}\n\n`;
          case "h5":
            return `##### ${children}\n\n`;
          case "h6":
            return `###### ${children}\n\n`;
          case "p":
            return `${children}\n\n`;
          case "strong":
          case "b":
            return `**${children}**`;
          case "em":
          case "i":
            return `*${children}*`;
          case "code":
            return `\`${children}\``;
          case "ul":
            return `${children}\n`;
          case "ol":
            return `${children}\n`;
          case "li":
            return `- ${children}\n`;
          case "blockquote":
            return `> ${children}\n\n`;
          case "a":
            const href = el.getAttribute("href") || "";
            return `[${children}](${href})`;
          default:
            return children;
        }
      };

      markdown += Array.from(tempDiv.childNodes)
        .map(convertNode)
        .join("");

      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle.replace(/[^a-z0-9]/gi, "_")}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Markdown exported");
    } catch (error: any) {
      console.error("[Export] Markdown error", error);
      toast.error(error.message || "Failed to export Markdown");
    } finally {
      setExporting(null);
    }
  }, [editor, documentTitle]);

  // Export to DOCX (simplified - would need a library for full support)
  const exportDOCX = React.useCallback(async () => {
    if (!editor) return;
    setExporting("docx");

    try {
      toast.info("DOCX export requires a server-side library. Exporting as HTML instead.");
      // For now, fall back to HTML
      await exportHTML();
    } catch (error: any) {
      console.error("[Export] DOCX error", error);
      toast.error(error.message || "Failed to export DOCX");
    } finally {
      setExporting(null);
    }
  }, [editor, exportHTML]);

  const exportOptions = [
    {
      id: "pdf",
      name: "PDF",
      description: "Export as PDF document",
      icon: FileText,
      action: exportPDF,
    },
    {
      id: "html",
      name: "HTML",
      description: "Export as HTML file",
      icon: FileDown,
      action: exportHTML,
    },
    {
      id: "markdown",
      name: "Markdown",
      description: "Export as Markdown file",
      icon: FileDown,
      action: exportMarkdown,
    },
    {
      id: "docx",
      name: "DOCX",
      description: "Export as Word document (coming soon)",
      icon: FileDown,
      action: exportDOCX,
      disabled: true,
    },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-zinc-600" />
              <Dialog.Title className="text-lg font-semibold text-zinc-900">Export Document</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded p-1 hover:bg-zinc-100">
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-2">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                const isExporting = exporting === option.id;
                const isDisabled = option.disabled || isExporting;

                return (
                  <button
                    key={option.id}
                    onClick={option.action}
                    disabled={isDisabled}
                    className={clsx(
                      "w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-all",
                      isDisabled
                        ? "border-zinc-200 bg-zinc-50 cursor-not-allowed opacity-50"
                        : "border-zinc-200 hover:border-blue-500 hover:bg-blue-50"
                    )}
                  >
                    <Icon className="h-5 w-5 text-zinc-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-900">{option.name}</div>
                      <div className="text-sm text-zinc-500 mt-0.5">{option.description}</div>
                    </div>
                    {isExporting && (
                      <div className="flex-shrink-0">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
