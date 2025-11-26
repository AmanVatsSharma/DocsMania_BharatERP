"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { Search, X, ChevronUp, ChevronDown, Replace } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

/**
 * Find & Replace Dialog (Google Docs style)
 * Supports:
 * - Find text (Cmd+F)
 * - Replace text (Cmd+H)
 * - Find next/previous
 * - Match case option
 * - Whole words option
 */

export interface FindReplaceProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "find" | "replace"; // "find" or "replace"
}

export default function FindReplace(props: FindReplaceProps) {
  const { editor, open, onOpenChange, mode: initialMode = "find" } = props;
  const [searchQuery, setSearchQuery] = React.useState("");
  const [replaceQuery, setReplaceQuery] = React.useState("");
  const [matchCase, setMatchCase] = React.useState(false);
  const [wholeWords, setWholeWords] = React.useState(false);
  const [currentMode, setCurrentMode] = React.useState<"find" | "replace">(initialMode);
  const [matches, setMatches] = React.useState<Array<{ from: number; to: number }>>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update mode when prop changes
  React.useEffect(() => {
    if (open) {
      setCurrentMode(initialMode);
    }
  }, [initialMode, open]);

  // Focus input when opened
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Perform search using ProseMirror's document structure
  const performSearch = React.useCallback(() => {
    if (!editor || !searchQuery.trim()) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    try {
      const { state } = editor;
      const { doc } = state;
      const foundMatches: Array<{ from: number; to: number }> = [];
      
      // Create regex pattern
      let pattern = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWords) {
        pattern = `\\b${pattern}\\b`;
      }
      
      const flags = matchCase ? 'g' : 'gi';
      const regex = new RegExp(pattern, flags);
      
      // Traverse document and search in each text node
      doc.nodesBetween(0, doc.content.size, (node, pos) => {
        if (node.isText) {
          const text = node.text || '';
          let match;
          regex.lastIndex = 0; // Reset for each node
          
          while ((match = regex.exec(text)) !== null) {
            const from = pos + match.index;
            const to = from + match[0].length;
            foundMatches.push({ from, to });
            
            // Prevent infinite loop
            if (match[0].length === 0) {
              regex.lastIndex = match.index + 1;
            }
          }
        }
        return true;
      });
      
      // Remove duplicates (shouldn't happen but just in case)
      const uniqueMatches = foundMatches.filter((match, index, self) =>
        index === self.findIndex((m) => m.from === match.from && m.to === match.to)
      );
      
      setMatches(uniqueMatches);
      if (uniqueMatches.length > 0) {
        setCurrentMatchIndex(0);
        highlightMatch(uniqueMatches[0]);
      } else {
        setCurrentMatchIndex(-1);
        clearHighlights();
      }
      
      console.debug("[FindReplace] Found matches", uniqueMatches.length);
    } catch (error) {
      console.error("[FindReplace] Search error", error);
      setMatches([]);
      setCurrentMatchIndex(-1);
    }
  }, [editor, searchQuery, matchCase, wholeWords, highlightMatch, clearHighlights]);

  // Highlight a specific match
  const highlightMatch = React.useCallback((match: { from: number; to: number }) => {
    if (!editor) return;
    
    try {
      // Clear previous highlights
      clearHighlights();
      
      // Set selection to match
      editor.chain().focus().setTextSelection({ from: match.from, to: match.to }).run();
      
      // Scroll into view
      const { view } = editor;
      const coords = view.coordsAtPos(match.from);
      const editorElement = view.dom.closest('.ProseMirror');
      if (editorElement) {
        editorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error("[FindReplace] Highlight error", error);
    }
  }, [editor]);

  // Clear all highlights
  const clearHighlights = React.useCallback(() => {
    if (!editor) return;
    // Selection will be cleared when we change it
  }, [editor]);

  // Navigate to next match
  const goToNext = React.useCallback(() => {
    if (matches.length === 0) {
      performSearch();
      return;
    }
    
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    highlightMatch(matches[nextIndex]);
  }, [matches, currentMatchIndex, highlightMatch, performSearch]);

  // Navigate to previous match
  const goToPrevious = React.useCallback(() => {
    if (matches.length === 0) {
      performSearch();
      return;
    }
    
    const prevIndex = currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    highlightMatch(matches[prevIndex]);
  }, [matches, currentMatchIndex, highlightMatch, performSearch]);

  // Replace current match
  const replaceCurrent = React.useCallback(() => {
    if (!editor || currentMatchIndex < 0 || matches.length === 0) return;
    
    const match = matches[currentMatchIndex];
    try {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: match.from, to: match.to })
        .insertContent(replaceQuery)
        .run();
      
      // Re-search after replace
      setTimeout(() => {
        performSearch();
      }, 100);
    } catch (error) {
      console.error("[FindReplace] Replace error", error);
    }
  }, [editor, matches, currentMatchIndex, replaceQuery, performSearch]);

  // Replace all matches
  const replaceAll = React.useCallback(() => {
    if (!editor || matches.length === 0) return;
    
    try {
      // Replace from end to start to preserve positions
      const sortedMatches = [...matches].sort((a, b) => b.from - a.from);
      
      editor.chain().focus().run();
      
      for (const match of sortedMatches) {
        editor
          .chain()
          .setTextSelection({ from: match.from, to: match.to })
          .insertContent(replaceQuery)
          .run();
      }
      
      setMatches([]);
      setCurrentMatchIndex(-1);
      toast.success(`Replaced ${matches.length} occurrence${matches.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error("[FindReplace] Replace all error", error);
    }
  }, [editor, matches, replaceQuery]);

  // Search when query changes
  React.useEffect(() => {
    if (open && searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300); // Debounce
      return () => clearTimeout(timeoutId);
    } else {
      setMatches([]);
      setCurrentMatchIndex(-1);
      clearHighlights();
    }
  }, [searchQuery, matchCase, wholeWords, performSearch, open, clearHighlights]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (e.shiftKey) {
          goToPrevious();
        } else {
          goToNext();
        }
        return;
      }
      
      if (isMod && e.key === "g") {
        e.preventDefault();
        goToNext();
        return;
      }
      
      if (isMod && e.shiftKey && e.key === "G") {
        e.preventDefault();
        goToPrevious();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, goToNext, goToPrevious]);

  if (!open) return null;

  return (
    <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 animate-in fade-in-0 zoom-in-95">
      <div className="flex flex-col rounded-lg border border-zinc-200 bg-white shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-900">
              {currentMode === "replace" ? "Find & Replace" : "Find"}
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 hover:bg-zinc-100"
          >
            <X className="h-4 w-4 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Find Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find..."
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            {matches.length > 0 && (
              <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-600">
                <span>
                  {currentMatchIndex + 1} / {matches.length}
                </span>
                <div className="flex gap-0.5">
                  <button
                    onClick={goToPrevious}
                    className="rounded p-0.5 hover:bg-zinc-200"
                    title="Previous (Shift+Enter)"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="rounded p-0.5 hover:bg-zinc-200"
                    title="Next (Enter)"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Replace Input (if replace mode) */}
          {currentMode === "replace" && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Replace className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="Replace with..."
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      replaceCurrent();
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded border-zinc-300"
              />
              <span className="text-zinc-600">Match case</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={wholeWords}
                onChange={(e) => setWholeWords(e.target.checked)}
                className="rounded border-zinc-300"
              />
              <span className="text-zinc-600">Whole words</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 border-t border-zinc-200 pt-3">
            <div className="flex gap-2">
              {currentMode === "find" && (
                <button
                  onClick={() => setCurrentMode("replace")}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Replace
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {currentMode === "replace" && (
                <>
                  <button
                    onClick={replaceCurrent}
                    disabled={currentMatchIndex < 0}
                    className={clsx(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                      currentMatchIndex >= 0
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    )}
                  >
                    Replace
                  </button>
                  <button
                    onClick={replaceAll}
                    disabled={matches.length === 0}
                    className={clsx(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                      matches.length > 0
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    )}
                  >
                    Replace All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
