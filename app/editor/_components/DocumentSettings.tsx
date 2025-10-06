"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings, X, Eye, EyeOff, Maximize, Share2, Lock, Globe, Users } from "lucide-react";
import { clsx } from "clsx";

export interface DocumentSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  currentSettings?: {
    showSidebar?: boolean;
    fullWidth?: boolean;
    allowComments?: boolean;
    visibility?: "public" | "private" | "unlisted";
    allowSharing?: boolean;
  };
  onSave: (settings: any) => void;
}

export default function DocumentSettings(props: DocumentSettingsProps) {
  const { open, onOpenChange, currentSettings = {}, onSave } = props;
  
  const [settings, setSettings] = React.useState({
    showSidebar: currentSettings.showSidebar !== false,
    fullWidth: currentSettings.fullWidth === true,
    allowComments: currentSettings.allowComments === true,
    visibility: currentSettings.visibility || "public",
    allowSharing: currentSettings.allowSharing !== false,
  });

  function handleSave() {
    onSave(settings);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl"
          style={{ maxHeight: "90vh" }}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <Settings className="h-5 w-5 text-purple-500" />
                  Document Settings
                </Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-500">
                  Configure how this document appears on the hosted page
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-lg p-2 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Display Settings */}
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900">Display Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                      <input
                        type="checkbox"
                        checked={settings.showSidebar}
                        onChange={(e) => setSettings({ ...settings, showSidebar: e.target.checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium text-zinc-900">
                          <Eye className="h-4 w-4" />
                          Show Navigation Sidebar
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                          Display a sidebar with links to other documents in this project
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                      <input
                        type="checkbox"
                        checked={settings.fullWidth}
                        onChange={(e) => setSettings({ ...settings, fullWidth: e.target.checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium text-zinc-900">
                          <Maximize className="h-4 w-4" />
                          Full Width Layout
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                          Remove max-width constraint and use full viewport width
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                      <input
                        type="checkbox"
                        checked={settings.allowComments}
                        onChange={(e) => setSettings({ ...settings, allowComments: e.target.checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium text-zinc-900">
                          <Users className="h-4 w-4" />
                          Allow Comments
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                          Let viewers leave comments on this document (coming soon)
                        </p>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Visibility Settings */}
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900">Visibility</h3>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                      <input
                        type="radio"
                        name="visibility"
                        checked={settings.visibility === "public"}
                        onChange={() => setSettings({ ...settings, visibility: "public" })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium text-zinc-900">
                          <Globe className="h-4 w-4 text-green-600" />
                          Public
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                          Anyone with the link can view this document
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                      <input
                        type="radio"
                        name="visibility"
                        checked={settings.visibility === "unlisted"}
                        onChange={() => setSettings({ ...settings, visibility: "unlisted" })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium text-zinc-900">
                          <EyeOff className="h-4 w-4 text-yellow-600" />
                          Unlisted
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                          Only people with the link can access (not searchable)
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                      <input
                        type="radio"
                        name="visibility"
                        checked={settings.visibility === "private"}
                        onChange={() => setSettings({ ...settings, visibility: "private" })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium text-zinc-900">
                          <Lock className="h-4 w-4 text-red-600" />
                          Private
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                          Requires authentication to view (coming soon)
                        </p>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Sharing Settings */}
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900">Sharing</h3>
                  <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                    <input
                      type="checkbox"
                      checked={settings.allowSharing}
                      onChange={(e) => setSettings({ ...settings, allowSharing: e.target.checked })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium text-zinc-900">
                        <Share2 className="h-4 w-4" />
                        Allow Sharing
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">
                        Display share buttons on the published page
                      </p>
                    </div>
                  </label>
                </section>

                {/* Info Box */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <div className="text-blue-600">ℹ️</div>
                    <div className="flex-1 text-sm text-blue-900">
                      <p className="font-medium">Settings are saved to document metadata</p>
                      <p className="mt-1 text-blue-700">
                        These settings will be applied when you publish this document. You can change them anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
              <button
                onClick={() => setSettings({
                  showSidebar: true,
                  fullWidth: false,
                  allowComments: false,
                  visibility: "public",
                  allowSharing: true,
                })}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Reset to defaults
              </button>
              <div className="flex gap-2">
                <Dialog.Close className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
