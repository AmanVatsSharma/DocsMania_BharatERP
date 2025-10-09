/**
 * Component Hover Menu
 * Floating action menu that appears on hover over components
 * Provides quick actions: edit, duplicate, move, delete
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeVariants, transitions } from "@/lib/animations";

export interface ComponentHoverMenuProps {
  componentId: string;
  componentType: string;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
  className?: string;
}

export default function ComponentHoverMenu(props: ComponentHoverMenuProps) {
  const {
    componentId,
    componentType,
    onEdit,
    onDuplicate,
    onDelete,
    onMoveUp,
    onMoveDown,
    onToggleVisibility,
    isVisible = true,
    className,
  } = props;

  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Show menu on hover over parent component
  useEffect(() => {
    if (typeof document === "undefined") return;

    const componentElement = document.querySelector(
      `[data-component-id="${componentId}"]`
    );
    if (!componentElement) return;

    const handleMouseEnter = () => {
      // Calculate position
      const rect = componentElement.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        right: window.innerWidth - rect.right,
      });
      setShow(true);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse is moving to the menu itself
      if (
        menuRef.current &&
        e.relatedTarget &&
        menuRef.current.contains(e.relatedTarget as Node)
      ) {
        return;
      }
      setShow(false);
    };

    componentElement.addEventListener("mouseenter", handleMouseEnter);
    componentElement.addEventListener("mouseleave", handleMouseLeave as any);

    return () => {
      componentElement.removeEventListener("mouseenter", handleMouseEnter);
      componentElement.removeEventListener("mouseleave", handleMouseLeave as any);
    };
  }, [componentId]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeVariants.inFast}
        transition={transitions.fast}
        style={{
          position: "absolute",
          top: position.top,
          right: position.right,
        }}
        className={cn(
          "z-50 flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-1 py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900",
          className
        )}
        onMouseLeave={() => setShow(false)}
      >
        {/* Drag Handle */}
        <button
          className="flex h-7 w-7 cursor-grab items-center justify-center rounded hover:bg-zinc-100 active:cursor-grabbing dark:hover:bg-zinc-800"
          title="Drag to move"
        >
          <GripVertical className="h-4 w-4 text-zinc-400" />
        </button>

        <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-700" />

        {/* Move Up */}
        {onMoveUp && (
          <button
            onClick={onMoveUp}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        )}

        {/* Move Down */}
        {onMoveDown && (
          <button
            onClick={onMoveDown}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        )}

        {(onMoveUp || onMoveDown) && (
          <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-700" />
        )}

        {/* Settings/Edit */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Edit properties"
          >
            <Settings className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        )}

        {/* Duplicate */}
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Duplicate"
          >
            <Copy className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        )}

        {/* Toggle Visibility */}
        {onToggleVisibility && (
          <button
            onClick={onToggleVisibility}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title={isVisible ? "Hide" : "Show"}
          >
            {isVisible ? (
              <Eye className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            )}
          </button>
        )}

        <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-700" />

        {/* Delete */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-950"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </button>
        )}

        {/* Component Type Label */}
        <div className="ml-1 rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {componentType}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Wrapper component to add data-component-id to sections
 */
export function ComponentWithHoverMenu({
  children,
  componentId,
  componentType,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  children: React.ReactNode;
  componentId: string;
  componentType: string;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  return (
    <>
      <div data-component-id={componentId} className="relative">
        {children}
      </div>
      <ComponentHoverMenu
        componentId={componentId}
        componentType={componentType}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
    </>
  );
}