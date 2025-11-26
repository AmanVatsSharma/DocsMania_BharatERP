"use client";

import React from "react";
import { 
  ChevronRight, Command, ImagePlus, Rocket, Search, Loader2, 
  Sparkles, Settings, Eye, Database, Code, Users, Clock,
  CheckCircle2, AlertCircle, MoreHorizontal, Share2, Download,
  MessageSquare, History, FileText, List, Upload, Folder,
  Function, FileText as FileTextIcon, Edit3
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
  onImport?: () => void;
  onOpenDrive?: () => void;
  onOpenComments?: () => void;
  onOpenVersionHistory?: () => void;
  onOpenPageSetup?: () => void;
  onOpenTOC?: () => void;
  onOpenFootnotes?: () => void;
  onOpenEquation?: () => void;
  onToggleSuggestions?: () => void;
  wordCount?: React.ReactNode;
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
    onImport,
    onOpenDrive,
    onOpenComments,
    onOpenVersionHistory,
    onOpenPageSetup,
    onOpenTOC,
    onOpenFootnotes,
    onOpenEquation,
    onToggleSuggestions,
    wordCount,
  } = props;

  const timeAgo = lastSaved ? getTimeAgo(lastSaved) : null;

  return (
    <div className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-4">
        {/* Logo/Brand Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          
          {/* Breadcrumbs */}
          <div className="hidden items-center gap-2 text-sm lg:flex">
            <span className="text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors font-medium">Docs</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            <span className="truncate max-w-[280px] font-medium text-zinc-900" title={title}>
              {title || "Untitled"}
            </span>
          </div>
        </div>

        {/* Center: Quick Actions */}
        <div className="flex flex-1 items-center justify-center gap-2">
          {/* Command Palette */}
          <button
            onClick={onOpenCommandPalette}
            className="group hidden items-center gap-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 px-3.5 py-2 text-sm text-zinc-600 transition-all hover:border-zinc-300 hover:bg-white hover:shadow-sm md:flex"
          >
            <Search className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
            <span className="text-zinc-500 font-medium">Search</span>
            <div className="ml-2 flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs text-zinc-400 shadow-sm border border-zinc-200/60">
              <Command className="h-3 w-3" />
              <span className="font-medium">K</span>
            </div>
          </button>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-1.5">
          {/* Tools Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100/80 hover:shadow-sm">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Tools</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[240px] rounded-xl border border-zinc-200/80 bg-white p-1.5 shadow-xl backdrop-blur-sm"
                sideOffset={8}
              >
                <DropdownMenu.Item
                  onClick={onOpenMediaManager}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-blue-50 hover:text-blue-900"
                >
                  <ImagePlus className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Media Library</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={onOpenTemplates}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-purple-50 hover:text-purple-900"
                >
                  <Sparkles className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Templates</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1.5 h-px bg-zinc-100" />

                <DropdownMenu.Item
                  onClick={onOpenDataSources}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <Database className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Data Sources</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={onOpenCustomComponents}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-indigo-50 hover:text-indigo-900"
                >
                  <Code className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Custom Components</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1.5 h-px bg-zinc-100" />

                <DropdownMenu.Item
                  onClick={onOpenSettings}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-100"
                >
                  <Settings className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Settings</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* More Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-all hover:bg-zinc-100/80 hover:shadow-sm">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[220px] rounded-xl border border-zinc-200/80 bg-white p-1.5 shadow-xl backdrop-blur-sm"
                sideOffset={8}
                align="end"
              >
                <DropdownMenu.Item
                  onClick={onShare}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-blue-50 hover:text-blue-900"
                >
                  <Share2 className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Share</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onExport}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <Download className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Export</span>
                  <span className="ml-auto text-xs text-zinc-400 font-medium">⌘E</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onImport}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-purple-50 hover:text-purple-900"
                >
                  <Upload className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Import Document</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenDrive}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-indigo-50 hover:text-indigo-900"
                >
                  <Folder className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Open from Drive</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1.5 h-px bg-zinc-100" />
                <DropdownMenu.Item
                  onClick={onOpenComments}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-amber-50 hover:text-amber-900"
                >
                  <MessageSquare className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Comments</span>
                  <span className="ml-auto text-xs text-zinc-400 font-medium">⌘⇧M</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenVersionHistory}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <History className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Version History</span>
                  <span className="ml-auto text-xs text-zinc-400 font-medium">⌘⌥H</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenTOC}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-teal-50 hover:text-teal-900"
                >
                  <List className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Table of Contents</span>
                  <span className="ml-auto text-xs text-zinc-400 font-medium">⌘⇧O</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenPageSetup}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-100"
                >
                  <FileText className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Page Setup</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1.5 h-px bg-zinc-100" />
                <DropdownMenu.Item
                  onClick={onOpenFootnotes}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-rose-50 hover:text-rose-900"
                >
                  <FileTextIcon className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Footnotes</span>
                  <span className="ml-auto text-xs text-zinc-400 font-medium">⌘⌥F</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenEquation}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-violet-50 hover:text-violet-900"
                >
                  <Function className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Insert Equation</span>
                  <span className="ml-auto text-xs text-zinc-400 font-medium">⌘⌥E</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onToggleSuggestions}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-cyan-50 hover:text-cyan-900"
                >
                  <Edit3 className="h-4 w-4 text-zinc-500" />
                  <span className="font-medium">Suggestions Mode</span>
                  <span className="ml-auto text-xs text-zinc-400 font-medium">⌘⌥S</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Word Count */}
          {wordCount && (
            <div className="hidden lg:flex">
              {wordCount}
            </div>
          )}

          {/* Save Status */}
          <div className="hidden items-center gap-2.5 px-3 lg:flex">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-xs font-medium text-zinc-600">Saving...</span>
              </>
            ) : (
              <>
                {timeAgo && (
                  <span className="text-xs font-medium text-zinc-500">{timeAgo}</span>
                )}
              </>
            )}
          </div>

          {/* View Button */}
          <button
            onClick={onView}
            className="flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-all hover:bg-zinc-100/80 hover:shadow-sm"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>

          {/* Publish Button */}
          <button
            onClick={onPublish}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:from-blue-700 hover:to-blue-800 active:scale-[0.98]"
          >
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Publish</span>
          </button>
        </div>
      </div>
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
