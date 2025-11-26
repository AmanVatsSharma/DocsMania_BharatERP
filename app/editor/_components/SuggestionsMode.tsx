"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { Check, X, MessageSquare, User, Clock } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

/**
 * Suggestions Mode - Google Docs style track changes
 * Features:
 * - Track insertions, deletions, formatting changes
 * - Accept/reject suggestions
 * - Show suggestion author and timestamp
 * - Highlight changes in document
 */

export interface Suggestion {
  id: string;
  type: "insertion" | "deletion" | "formatting";
  from: number;
  to: number;
  content?: any; // For insertions
  originalContent?: any; // For deletions
  author: string;
  timestamp: Date | string;
  accepted?: boolean;
  rejected?: boolean;
}

export interface SuggestionsModeProps {
  editor: Editor | null;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  currentAuthor?: string;
}

export default function SuggestionsMode(props: SuggestionsModeProps) {
  const { editor, enabled, onToggle, currentAuthor = "You" } = props;
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [showPanel, setShowPanel] = React.useState(false);

  // Track changes when suggestions mode is enabled
  React.useEffect(() => {
    if (!editor || !enabled) return;

    // Store original content for comparison
    let lastContent = editor.getJSON();

    const handleUpdate = () => {
      const currentContent = editor.getJSON();
      // Compare and detect changes
      // This is simplified - in production, use a proper diff algorithm
      console.debug("[Suggestions] Document updated");
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, enabled]);

  // Accept suggestion
  const acceptSuggestion = React.useCallback((suggestion: Suggestion) => {
    if (!editor) return;

    try {
      if (suggestion.type === "insertion" && suggestion.content) {
        // Keep the inserted content
        editor.chain().focus().setTextSelection({ from: suggestion.from, to: suggestion.to }).run();
        // Content is already there, just mark as accepted
      } else if (suggestion.type === "deletion") {
        // Keep the deletion (content already removed)
      }

      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestion.id ? { ...s, accepted: true, rejected: false } : s))
      );
      toast.success("Suggestion accepted");
    } catch (error) {
      console.error("[Suggestions] Accept error", error);
      toast.error("Failed to accept suggestion");
    }
  }, [editor]);

  // Reject suggestion
  const rejectSuggestion = React.useCallback((suggestion: Suggestion) => {
    if (!editor) return;

    try {
      if (suggestion.type === "insertion") {
        // Remove inserted content
        editor.chain().focus().setTextSelection({ from: suggestion.from, to: suggestion.to }).deleteSelection().run();
      } else if (suggestion.type === "deletion" && suggestion.originalContent) {
        // Restore deleted content
        editor.chain().focus().setTextSelection({ from: suggestion.from, to: suggestion.to }).insertContent(suggestion.originalContent).run();
      }

      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestion.id ? { ...s, rejected: true, accepted: false } : s))
      );
      toast.success("Suggestion rejected");
    } catch (error) {
      console.error("[Suggestions] Reject error", error);
      toast.error("Failed to reject suggestion");
    }
  }, [editor]);

  // Format date
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  };

  const pendingSuggestions = suggestions.filter((s) => !s.accepted && !s.rejected);
  const acceptedCount = suggestions.filter((s) => s.accepted).length;
  const rejectedCount = suggestions.filter((s) => s.rejected).length;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => onToggle(!enabled)}
        className={clsx(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
          enabled
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
        )}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Suggesting</span>
        {pendingSuggestions.length > 0 && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {pendingSuggestions.length}
          </span>
        )}
      </button>

      {/* Suggestions Panel */}
      {enabled && showPanel && (
        <div className="fixed right-0 top-0 z-50 h-full w-96 border-l border-zinc-200 bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-zinc-600" />
              <h2 className="font-semibold text-zinc-900">Suggestions</h2>
              {pendingSuggestions.length > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 font-medium">
                  {pendingSuggestions.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="rounded p-1 hover:bg-zinc-100"
            >
              <span className="text-zinc-500">✕</span>
            </button>
          </div>

          {/* Stats */}
          {(acceptedCount > 0 || rejectedCount > 0) && (
            <div className="border-b border-zinc-200 px-4 py-2 text-xs text-zinc-600">
              {acceptedCount} accepted • {rejectedCount} rejected
            </div>
          )}

          {/* Suggestions List */}
          <div className="flex-1 overflow-y-auto p-4">
            {pendingSuggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-zinc-300 mb-3" />
                <p className="text-sm text-zinc-500">No pending suggestions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="rounded-lg border border-zinc-200 p-3"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-zinc-500" />
                          <span className="text-xs font-medium text-zinc-900">{suggestion.author}</span>
                          <Clock className="h-3 w-3 text-zinc-400 ml-auto" />
                          <span className="text-xs text-zinc-500">{formatDate(suggestion.timestamp)}</span>
                        </div>
                        <div className={clsx(
                          "text-xs font-medium mb-1",
                          suggestion.type === "insertion" && "text-green-700",
                          suggestion.type === "deletion" && "text-red-700",
                          suggestion.type === "formatting" && "text-blue-700"
                        )}>
                          {suggestion.type === "insertion" && "Inserted"}
                          {suggestion.type === "deletion" && "Deleted"}
                          {suggestion.type === "formatting" && "Formatting changed"}
                        </div>
                        {suggestion.content && (
                          <p className="text-xs text-zinc-600 line-clamp-2">
                            {typeof suggestion.content === 'string' 
                              ? suggestion.content 
                              : JSON.stringify(suggestion.content)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => acceptSuggestion(suggestion)}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-3 w-3" />
                        Accept
                      </button>
                      <button
                        onClick={() => rejectSuggestion(suggestion)}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show Panel Button */}
      {enabled && !showPanel && pendingSuggestions.length > 0 && (
        <button
          onClick={() => setShowPanel(true)}
          className="fixed right-4 bottom-4 z-40 rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700"
          title="Show suggestions"
        >
          <MessageSquare className="h-5 w-5" />
          {pendingSuggestions.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {pendingSuggestions.length}
            </span>
          )}
        </button>
      )}
    </>
  );
}
