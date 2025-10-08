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
} from "lucide-react";
import { useEditorUI } from "@/lib/store/editorUI";
import { transitions } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface TopBarAutoHideProps {
  title?: string;
  saving?: boolean;
  lastSaved?: Date;
  onSave?: () => void;
  onPublish?: () => void;
  onView?: () => void;
  onShare?: () => void;
  onInsertImage?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
}

export default function TopBarAutoHide(props: TopBarAutoHideProps) {
  const {
    title = "Untitled Document",
    saving = false,
    lastSaved,
    onSave,
    onPublish,
    onView,
    onShare,
    onInsertImage,
    onOpenCommandPalette,
    onOpenHelp,
    onOpenSettings,
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

                {/* Save indicator */}
                {!isCompact && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    {saving ? (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                        Saving...
                      </span>
                    ) : lastSaved ? (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Saved
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                {/* Compact mode: show fewer buttons */}
                {!isCompact && (
                  <>
                    <button
                      onClick={onInsertImage}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      title="Insert Image"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Image</span>
                    </button>

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
                      onClick={onOpenHelp}
                      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      title="Help (?)"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>

                    <button
                      onClick={onOpenSettings}
                      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      title="Settings"
                    >
                      <Settings className="h-4 w-4" />
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