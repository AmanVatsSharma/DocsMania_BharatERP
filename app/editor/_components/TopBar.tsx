"use client";

import React from "react";
import { ChevronRight, Command, ImagePlus, Rocket, Search, Loader2 } from "lucide-react";
import AccentPicker from "@/app/editor/_components/AccentPicker";
import { clsx } from "clsx";

export interface TopBarProps {
  title: string;
  saving: boolean;
  onInsertImageClick: () => void;
  onPublish: () => void;
  onOpenCommandPalette?: () => void;
  onOpenHelp?: () => void;
  onView?: () => void;
}

/**
 * High-polish top bar for the editor.
 * - Breadcrumbs + title
 * - Global search / command palette trigger
 * - Quick actions: Insert Image, Publish
 * - Saving indicator
 */
export default function TopBar(props: TopBarProps) {
  const { title, saving, onInsertImageClick, onPublish, onOpenCommandPalette, onOpenHelp, onView } = props;

  function handleOpenPalette() {
    try {
      console.info("[TopBar] Open command palette");
      onOpenCommandPalette?.();
    } catch (e) {
      console.error("[TopBar] Open palette error", e);
    }
  }

  return (
    <div className="w-full border-b border-[var(--border)] bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-12 max-w-screen-2xl items-center gap-3 px-3">
        {/* Breadcrumbs */}
        <div className="hidden items-center gap-2 text-sm text-zinc-600 md:flex">
          <span className="font-medium text-zinc-700">Documents</span>
          <ChevronRight className="h-4 w-4 text-zinc-400" />
          <span className="truncate max-w-[28ch] font-semibold text-zinc-900" title={title}>
            {title}
          </span>
        </div>

        {/* Title (mobile) */}
        <div className="md:hidden truncate text-sm font-semibold text-zinc-900" title={title}>
          {title}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Command palette / search */}
        <button
          type="button"
          onClick={handleOpenPalette}
          className={clsx(
            "hidden md:flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-zinc-600",
            "hover:bg-zinc-50 active:scale-[0.99]"
          )}
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
          <div className="ml-2 flex items-center gap-0.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-500">
            <Command className="h-3 w-3" /> K
          </div>
        </button>

        {/* Insert image */}
        <button
          type="button"
          onClick={() => {
            try {
              console.info("[TopBar] Insert Image click");
              onInsertImageClick();
            } catch (e) {
              console.error("[TopBar] Insert Image error", e);
            }
          }}
          className={clsx(
            "ml-2 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm",
            "text-zinc-700 hover:bg-zinc-50 active:scale-[0.99]"
          )}
        >
          <ImagePlus className="h-4 w-4" />
          Image
        </button>

        {/* Publish */}
        <button
          type="button"
          onClick={() => {
            try {
              console.info("[TopBar] Publish click");
              onPublish();
            } catch (e) {
              console.error("[TopBar] Publish error", e);
            }
          }}
          className={clsx(
            "ml-2 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white",
            "hover:bg-zinc-800 active:scale-[0.99]"
          )}
        >
          <Rocket className="h-4 w-4" />
          Publish
        </button>

        {/* View */}
        <button
          type="button"
          onClick={() => {
            try {
              console.info("[TopBar] View click");
              onView?.();
            } catch (e) {
              console.error("[TopBar] View error", e);
            }
          }}
          className={clsx(
            "ml-2 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm",
            "text-zinc-700 hover:bg-zinc-50 active:scale-[0.99]"
          )}
        >
          View
        </button>

        <AccentPicker />

        <button
          type="button"
          onClick={() => onOpenHelp?.()}
          className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 active:scale-[0.99]"
        >
          Help
        </button>

        {/* Saving indicator */}
        <div className="ml-2 hidden items-center gap-1 text-xs text-zinc-500 md:flex" aria-live="polite">
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <span>Saved</span>
          )}
        </div>
      </div>
    </div>
  );
}


