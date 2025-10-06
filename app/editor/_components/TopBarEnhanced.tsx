"use client";

import React from "react";
import { 
  ChevronRight, Command, ImagePlus, Rocket, Search, Loader2, 
  Sparkles, Settings, Eye, Database, Code, Users, Clock,
  CheckCircle2, AlertCircle, MoreHorizontal, Share2, Download
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";

export interface TopBarEnhancedProps {
  title: string;
  saving: boolean;
  lastSaved?: Date;
  collaborators?: number;
  onInsertImageClick: () => void;
  onPublish: () => void;
  onOpenCommandPalette?: () => void;
  onOpenHelp?: () => void;
  onView?: () => void;
  onOpenMediaManager?: () => void;
  onOpenTemplates?: () => void;
  onOpenSettings?: () => void;
  onOpenDataSources?: () => void;
  onOpenCustomComponents?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

/**
 * Enterprise-grade TopBar with professional design
 * - Clean navigation
 * - Grouped actions
 * - Real-time status
 * - Quick access menu
 */
export default function TopBarEnhanced(props: TopBarEnhancedProps) {
  const {
    title,
    saving,
    lastSaved,
    collaborators = 0,
    onInsertImageClick,
    onPublish,
    onOpenCommandPalette,
    onView,
    onOpenMediaManager,
    onOpenTemplates,
    onOpenSettings,
    onOpenDataSources,
    onOpenCustomComponents,
    onShare,
    onExport,
  } = props;

  const timeAgo = lastSaved ? getTimeAgo(lastSaved) : null;

  return (
    <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4">
        {/* Logo/Brand Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          
          {/* Breadcrumbs */}
          <div className="hidden items-center gap-2 text-sm lg:flex">
            <span className="text-zinc-500 hover:text-zinc-700 cursor-pointer">Workspace</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            <span className="truncate max-w-[200px] font-medium text-zinc-900" title={title}>
              {title}
            </span>
          </div>
        </div>

        {/* Center: Quick Actions */}
        <div className="flex flex-1 items-center justify-center gap-2">
          {/* Command Palette */}
          <button
            onClick={onOpenCommandPalette}
            className="group hidden items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-sm text-zinc-600 transition-all hover:border-zinc-300 hover:bg-white hover:shadow-sm md:flex"
          >
            <Search className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" />
            <span className="text-zinc-500">Quick actions...</span>
            <div className="ml-2 flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 text-xs text-zinc-400 shadow-sm ring-1 ring-zinc-200">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-2">
          {/* Tools Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Tools</span>
                <ChevronRight className="h-3.5 w-3.5 rotate-90" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[240px] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  onClick={onOpenMediaManager}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-purple-50 hover:text-purple-900"
                >
                  <ImagePlus className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">Media Library</div>
                    <div className="text-xs text-zinc-500">Upload images & files</div>
                  </div>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={onOpenTemplates}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-purple-50 hover:text-purple-900"
                >
                  <Sparkles className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">Templates</div>
                    <div className="text-xs text-zinc-500">Start from a template</div>
                  </div>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-zinc-200" />

                <DropdownMenu.Item
                  onClick={onOpenDataSources}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-blue-50 hover:text-blue-900"
                >
                  <Database className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">Data Sources</div>
                    <div className="text-xs text-zinc-500">Connect databases & APIs</div>
                  </div>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={onOpenCustomComponents}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-blue-50 hover:text-blue-900"
                >
                  <Code className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">Custom Components</div>
                    <div className="text-xs text-zinc-500">Build React components</div>
                  </div>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-zinc-200" />

                <DropdownMenu.Item
                  onClick={onOpenSettings}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-50"
                >
                  <Settings className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">Settings</div>
                    <div className="text-xs text-zinc-500">Document configuration</div>
                  </div>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* More Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[200px] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item
                  onClick={onShare}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onExport}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-50"
                >
                  <Download className="h-4 w-4" />
                  Export
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Collaborators (if any) */}
          {collaborators > 0 && (
            <div className="hidden items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 lg:flex">
              <Users className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-600">{collaborators}</span>
            </div>
          )}

          {/* Save Status */}
          <div className="hidden items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 lg:flex">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-zinc-600">Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500">Saved</span>
                  {timeAgo && (
                    <span className="text-[10px] text-zinc-400">{timeAgo}</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* View Button */}
          <button
            onClick={onView}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={onPublish}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Rocket className="h-4 w-4" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Optional: Progress bar for saving */}
      {saving && (
        <div className="h-0.5 w-full bg-zinc-100">
          <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-purple-600 to-blue-600" />
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
