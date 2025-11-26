"use client";

import React from "react";
import { FileText, X, Save } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

/**
 * Page Setup Dialog - Google Docs style page settings
 * Features:
 * - Page size (Letter, A4, Legal, etc.)
 * - Margins (top, bottom, left, right)
 * - Page orientation (portrait/landscape)
 * - Headers and footers
 * - Page breaks
 */

export interface PageSettings {
  pageSize: "letter" | "a4" | "legal" | "tabloid" | "custom";
  width?: number; // inches
  height?: number; // inches
  orientation: "portrait" | "landscape";
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  header?: {
    enabled: boolean;
    content: string;
  };
  footer?: {
    enabled: boolean;
    content: string;
  };
}

const PAGE_SIZES = {
  letter: { width: 8.5, height: 11, name: "Letter (8.5\" × 11\")" },
  a4: { width: 8.27, height: 11.69, name: "A4 (8.27\" × 11.69\")" },
  legal: { width: 8.5, height: 14, name: "Legal (8.5\" × 14\")" },
  tabloid: { width: 11, height: 17, name: "Tabloid (11\" × 17\")" },
};

export interface PageSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: PageSettings;
  onSave: (settings: PageSettings) => void;
}

export default function PageSetup(props: PageSetupProps) {
  const { open, onOpenChange, settings, onSave } = props;
  const [localSettings, setLocalSettings] = React.useState<PageSettings>(settings);

  React.useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave(localSettings);
    toast.success("Page settings saved");
    onOpenChange(false);
  };

  const updateMargins = (key: keyof PageSettings["margins"], value: number) => {
    setLocalSettings({
      ...localSettings,
      margins: {
        ...localSettings.margins,
        [key]: Math.max(0, value),
      },
    });
  };

  const updatePageSize = (size: PageSettings["pageSize"]) => {
    if (size === "custom") {
      setLocalSettings({
        ...localSettings,
        pageSize: "custom",
      });
    } else {
      const page = PAGE_SIZES[size];
      setLocalSettings({
        ...localSettings,
        pageSize: size,
        width: page.width,
        height: page.height,
      });
    }
  };

  const toggleOrientation = () => {
    const newOrientation = localSettings.orientation === "portrait" ? "landscape" : "portrait";
    setLocalSettings({
      ...localSettings,
      orientation: newOrientation,
      // Swap width/height
      width: localSettings.height,
      height: localSettings.width,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-zinc-600" />
              <Dialog.Title className="text-lg font-semibold text-zinc-900">Page Setup</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded p-1 hover:bg-zinc-100">
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">Page Size</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PAGE_SIZES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => updatePageSize(key as PageSettings["pageSize"])}
                    className={clsx(
                      "rounded-lg border px-4 py-2 text-sm text-left transition-all",
                      localSettings.pageSize === key
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    {value.name}
                  </button>
                ))}
                <button
                  onClick={() => updatePageSize("custom")}
                  className={clsx(
                    "rounded-lg border px-4 py-2 text-sm text-left transition-all",
                    localSettings.pageSize === "custom"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  Custom
                </button>
              </div>

              {localSettings.pageSize === "custom" && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Width (inches)</label>
                    <input
                      type="number"
                      value={localSettings.width || 8.5}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          width: parseFloat(e.target.value) || 8.5,
                        })
                      }
                      step="0.1"
                      min="1"
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Height (inches)</label>
                    <input
                      type="number"
                      value={localSettings.height || 11}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          height: parseFloat(e.target.value) || 11,
                        })
                      }
                      step="0.1"
                      min="1"
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">Orientation</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (localSettings.orientation !== "portrait") {
                      toggleOrientation();
                    }
                  }}
                  className={clsx(
                    "flex-1 rounded-lg border px-4 py-3 text-sm transition-all",
                    localSettings.orientation === "portrait"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  Portrait
                </button>
                <button
                  onClick={() => {
                    if (localSettings.orientation !== "landscape") {
                      toggleOrientation();
                    }
                  }}
                  className={clsx(
                    "flex-1 rounded-lg border px-4 py-3 text-sm transition-all",
                    localSettings.orientation === "landscape"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* Margins */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">Margins (inches)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Top</label>
                  <input
                    type="number"
                    value={localSettings.margins.top}
                    onChange={(e) => updateMargins("top", parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Bottom</label>
                  <input
                    type="number"
                    value={localSettings.margins.bottom}
                    onChange={(e) => updateMargins("bottom", parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Left</label>
                  <input
                    type="number"
                    value={localSettings.margins.left}
                    onChange={(e) => updateMargins("left", parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Right</label>
                  <input
                    type="number"
                    value={localSettings.margins.right}
                    onChange={(e) => updateMargins("right", parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Headers & Footers */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={localSettings.header?.enabled || false}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        header: {
                          enabled: e.target.checked,
                          content: localSettings.header?.content || "",
                        },
                      })
                    }
                    className="rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-zinc-900">Header</span>
                </label>
                {localSettings.header?.enabled && (
                  <input
                    type="text"
                    value={localSettings.header.content || ""}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        header: {
                          ...localSettings.header!,
                          content: e.target.value,
                        },
                      })
                    }
                    placeholder="Header text (e.g., Page {page})"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={localSettings.footer?.enabled || false}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        footer: {
                          enabled: e.target.checked,
                          content: localSettings.footer?.content || "",
                        },
                      })
                    }
                    className="rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-zinc-900">Footer</span>
                </label>
                {localSettings.footer?.enabled && (
                  <input
                    type="text"
                    value={localSettings.footer.content || ""}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        footer: {
                          ...localSettings.footer!,
                          content: e.target.value,
                        },
                      })
                    }
                    placeholder="Footer text (e.g., Page {page} of {total})"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-6 py-4">
            <Dialog.Close asChild>
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
