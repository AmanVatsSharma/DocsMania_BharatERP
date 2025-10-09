/**
 * Top Bar with Smart Auto-Hide
 * Slides up on scroll down, shows on scroll up or hover
 * Enterprise-grade with error boundaries and accessibility
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
  Save, 
  Share2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Command,
  HelpCircle,
  Image as ImageIcon,
  Settings,
  Menu,
  Pin,
  PinOff,
  Sparkles,
  Database,
  Code,
  FileText,
  Download,
  Upload,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEditorUI } from "@/lib/store/editorUI";
import { transitions } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface TopBarAutoHideProps {
  title?: string;
  saving?: boolean;
  lastSaved?: Date;
  collaborators?: number;
  onSave?: () => void;
  onPublish?: () => void;
  onView?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onInsertImage?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  onOpenMediaManager?: () => void;
  onOpenTemplates?: () => void;
  onOpenDataSources?: () => void;
  onOpenCustomComponents?: () => void;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
}

export default function TopBarAutoHide(props: TopBarAutoHideProps) {
  const {
    title = "Untitled Document",
    saving = false,
    lastSaved,
    collaborators = 0,
    onSave,
    onPublish,
    onView,
    onShare,
    onExport,
    onInsertImage,
    onOpenCommandPalette,
    onOpenHelp,
    onOpenSettings,
    onOpenMediaManager,
    onOpenTemplates,
    onOpenDataSources,
    onOpenCustomComponents,
    breadcrumbs = [],
  } = props;

  const { 
    topBarVisible, 
    topBarPinned, 
    setTopBarVisible, 
    setTopBarPinned,
    autoHideTopBar,
    leftSidebarOpen,
    setLeftSidebarOpen,
  } = useEditorUI();

  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const hoverZoneRef = useRef<HTMLDivElement>(null);

  // Track scroll direction
  useEffect(() => {
    if (!autoHideTopBar || topBarPinned) return;

    const handleScroll = () => {
      try {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY.current && currentScrollY > 50;
        const scrollingUp = currentScrollY < lastScrollY.current;

        // Clear existing timeout
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }

        if (scrollingDown) {
          setTopBarVisible(false);
        } else if (scrollingUp || currentScrollY < 50) {
          setTopBarVisible(true);
        }

        // Set compact mode when scrolled
        setIsCompact(currentScrollY > 100);

        lastScrollY.current = currentScrollY;
      } catch (error) {
        console.error("[TopBar] Scroll handler error:", error);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [autoHideTopBar, topBarPinned, setTopBarVisible]);

  // Show on hover at top edge
  useEffect(() => {
    if (!autoHideTopBar || topBarPinned) return;

    const handleMouseMove = (e: MouseEvent) => {
      try {
        const isNearTop = e.clientY < 80;
        setIsHoveringTop(isNearTop);
        if (isNearTop) {
          setTopBarVisible(true);
        }
      } catch (error) {
        console.error("[TopBar] Mouse move error:", error);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [autoHideTopBar, topBarPinned, setTopBarVisible]);

  const handlePinToggle = () => {
    setTopBarPinned(!topBarPinned);
    if (!topBarPinned) {
      setTopBarVisible(true);
    }
  };

  // Animation variants
  const variants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: transitions.easeOut,
    },
    hidden: {
      y: -100,
      opacity: 0,
      transition: transitions.easeOut,
    },
  };

  const shouldShow = topBarVisible || topBarPinned || isHoveringTop;

  // Format time ago
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return "yesterday";
  };

  return (
    <>
      {/* Hover detection zone at top */}
      <div
        ref={hoverZoneRef}
        className="fixed left-0 right-0 top-0 z-40 h-5 pointer-events-auto"
        onMouseEnter={() => setIsHoveringTop(true)}
        onMouseLeave={() => setIsHoveringTop(false)}
      />

      {/* Top Bar */}
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            className={cn(
              "fixed left-0 right-0 top-0 z-50 border-b bg-white/80 backdrop-blur-md transition-all dark:bg-zinc-950/80 dark:border-zinc-800",
              isCompact ? "h-14" : "h-16"
            )}
          >
            <div className="flex h-full items-center justify-between px-4">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                {/* Menu button for mobile / toggle sidebar */}
                <button
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  className="flex items-center justify-center rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* Breadcrumbs / Title */}
                <div className="flex items-center gap-2">
                  {breadcrumbs.length > 0 ? (
                    <div className="flex items-center gap-1 text-sm">
                      {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && (
                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                          )}
                          <button
                            onClick={crumb.onClick}
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                          >
                            {crumb.label}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <h1 className={cn(
                      "font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-md",
                      isCompact ? "text-sm" : "text-base"
                    )}>
                      {title}
                    </h1>
                  )}
                </div>

                {/* Save indicator with time ago */}
                {!isCompact && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    {saving ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                        <span className="font-medium text-blue-600">Saving...</span>
                      </span>
                    ) : lastSaved ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-medium text-green-600">Saved {getTimeAgo(lastSaved)}</span>
                      </span>
                    ) : null}
                    {collaborators > 0 && (
                      <span className="ml-2 flex items-center gap-1 text-zinc-500">
                        👥 {collaborators}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                {/* Tools Dropdown - Modern Style */}
                {!isCompact && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800">
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">Tools</span>
                        <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="z-50 min-w-[240px] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                        <DropdownMenu.Item
                          onClick={onInsertImage}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-purple-950"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Insert Image</div>
                            <div className="text-xs text-zinc-500">Upload or link image</div>
                          </div>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          onClick={onOpenMediaManager}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-purple-950"
                        >
                          <FileText className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Media Library</div>
                            <div className="text-xs text-zinc-500">Manage media assets</div>
                          </div>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          onClick={onOpenTemplates}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-purple-950"
                        >
                          <Sparkles className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Templates</div>
                            <div className="text-xs text-zinc-500">Start from template</div>
                          </div>
                        </DropdownMenu.Item>

                        <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

                        <DropdownMenu.Item
                          onClick={onOpenDataSources}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950"
                        >
                          <Database className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Data Sources</div>
                            <div className="text-xs text-zinc-500">Connect databases</div>
                          </div>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          onClick={onOpenCustomComponents}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950"
                        >
                          <Code className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Custom Components</div>
                            <div className="text-xs text-zinc-500">Build React components</div>
                          </div>
                        </DropdownMenu.Item>

                        <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

                        <DropdownMenu.Item
                          onClick={onOpenSettings}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Settings className="h-4 w-4" />
                          <div className="font-medium">Settings</div>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}

                {!isCompact && (
                  <>
                    <button
                      onClick={onOpenCommandPalette}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      title="Command Palette (⌘K)"
                    >
                      <Command className="h-4 w-4" />
                    </button>
                  </>
                )}

                <button
                  onClick={onSave}
                  className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  title="Save (⌘S)"
                >
                  <Save className="h-4 w-4" />
                  {!isCompact && <span className="hidden sm:inline">Save</span>}
                </button>

                <button
                  onClick={onPublish}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  title="Publish (⌘⇧P)"
                >
                  <Share2 className="h-4 w-4" />
                  {!isCompact && <span className="hidden sm:inline">Publish</span>}
                </button>

                {!isCompact && (
                  <>
                    <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />

                    <button
                      onClick={onView}
                      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={onShare}
                      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      title="Share"
                    >
                      <Upload className="h-4 w-4" />
                    </button>

                    <button
                      onClick={onExport}
                      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      title="Export"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    <button
                      onClick={onOpenHelp}
                      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      title="Help (?)"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Pin/Unpin button */}
                <button
                  onClick={handlePinToggle}
                  className={cn(
                    "rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    topBarPinned ? "text-blue-600" : "text-zinc-400"
                  )}
                  title={topBarPinned ? "Unpin top bar" : "Pin top bar"}
                >
                  {topBarPinned ? (
                    <Pin className="h-4 w-4" />
                  ) : (
                    <PinOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}