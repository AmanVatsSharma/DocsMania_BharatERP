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
    <div className="sticky top-0 z-50 border-b border-zinc-100 bg-white">
      <div className="mx-auto flex h-12 max-w-screen-2xl items-center gap-1 px-3">
        {/* Logo/Brand Section */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded text-blue-600">
            <Sparkles className="h-4 w-4" />
          </div>
          
          {/* Breadcrumbs */}
          <div className="hidden items-center gap-1.5 text-sm lg:flex">
            <span className="text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">Docs</span>
            <ChevronRight className="h-3 w-3 text-zinc-300" />
            <span className="truncate max-w-[240px] font-normal text-zinc-900" title={title}>
              {title || "Untitled"}
            </span>
          </div>
        </div>

        {/* Center: Quick Actions */}
        <div className="flex flex-1 items-center justify-center gap-1">
          {/* Command Palette */}
          <button
            onClick={onOpenCommandPalette}
            className="group hidden items-center gap-2 rounded px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 md:flex"
          >
            <Search className="h-4 w-4 text-zinc-500" />
            <span className="text-zinc-500">Search</span>
            <div className="ml-1.5 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs text-zinc-400 bg-zinc-50">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-0.5">
          {/* Tools Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Tools</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[220px] rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  onClick={onOpenMediaManager}
                  className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <ImagePlus className="h-4 w-4 text-zinc-500" />
                  <span>Media Library</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={onOpenTemplates}
                  className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Sparkles className="h-4 w-4 text-zinc-500" />
                  <span>Templates</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />

                <DropdownMenu.Item
                  onClick={onOpenDataSources}
                  className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Database className="h-4 w-4 text-zinc-500" />
                  <span>Data Sources</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={onOpenCustomComponents}
                  className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Code className="h-4 w-4 text-zinc-500" />
                  <span>Custom Components</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />

                <DropdownMenu.Item
                  onClick={onOpenSettings}
                  className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Settings className="h-4 w-4 text-zinc-500" />
                  <span>Settings</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* More Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center justify-center rounded p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[200px] rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item
                  onClick={onShare}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Share2 className="h-4 w-4 text-zinc-500" />
                  <span>Share</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onExport}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Download className="h-4 w-4 text-zinc-500" />
                  <span>Export</span>
                  <span className="ml-auto text-xs text-zinc-400">⌘E</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onImport}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Upload className="h-4 w-4 text-zinc-500" />
                  <span>Import Document</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenDrive}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Folder className="h-4 w-4 text-zinc-500" />
                  <span>Open from Drive</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />
                <DropdownMenu.Item
                  onClick={onOpenComments}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <MessageSquare className="h-4 w-4 text-zinc-500" />
                  <span>Comments</span>
                  <span className="ml-auto text-xs text-zinc-400">⌘⇧M</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenVersionHistory}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <History className="h-4 w-4 text-zinc-500" />
                  <span>Version History</span>
                  <span className="ml-auto text-xs text-zinc-400">⌘⌥H</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenTOC}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <List className="h-4 w-4 text-zinc-500" />
                  <span>Table of Contents</span>
                  <span className="ml-auto text-xs text-zinc-400">⌘⇧O</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenPageSetup}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <FileText className="h-4 w-4 text-zinc-500" />
                  <span>Page Setup</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />
                <DropdownMenu.Item
                  onClick={onOpenFootnotes}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <FileTextIcon className="h-4 w-4 text-zinc-500" />
                  <span>Footnotes</span>
                  <span className="ml-auto text-xs text-zinc-400">⌘⌥F</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onOpenEquation}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Function className="h-4 w-4 text-zinc-500" />
                  <span>Insert Equation</span>
                  <span className="ml-auto text-xs text-zinc-400">⌘⌥E</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={onToggleSuggestions}
                  className="flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100"
                >
                  <Edit3 className="h-4 w-4 text-zinc-500" />
                  <span>Suggestions Mode</span>
                  <span className="ml-auto text-xs text-zinc-400">⌘⌥S</span>
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
          <div className="hidden items-center gap-2 px-2 lg:flex">
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                <span className="text-xs text-zinc-500">Saving...</span>
              </>
            ) : (
              <>
                {timeAgo && (
                  <span className="text-xs text-zinc-400">{timeAgo}</span>
                )}
              </>
            )}
          </div>

          {/* View Button */}
          <button
            onClick={onView}
            className="flex items-center justify-center rounded p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>

          {/* Publish Button */}
          <button
            onClick={onPublish}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
