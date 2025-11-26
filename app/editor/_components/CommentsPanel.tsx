"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { MessageSquare, X, Check, Reply, Trash2, MoreVertical, Send } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

/**
 * Comments Panel - Google Docs style comments system
 * Features:
 * - Inline comments on selected text
 * - Threaded replies
 * - Resolve/unresolve comments
 * - Delete comments
 * - @mentions support (future)
 */

export interface Comment {
  id: string;
  documentId: string;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  resolved: boolean;
  from: number;
  to: number;
  parentId?: string | null;
  replies?: Comment[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CommentsPanelProps {
  editor: Editor | null;
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommentsPanel(props: CommentsPanelProps) {
  const { editor, documentId, open, onOpenChange } = props;
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [newCommentText, setNewCommentText] = React.useState("");
  const [authorName, setAuthorName] = React.useState("");

  // Load author name from localStorage or prompt
  React.useEffect(() => {
    const saved = localStorage.getItem("editor_author_name");
    if (saved) {
      setAuthorName(saved);
    } else {
      const name = window.prompt("Enter your name for comments:");
      if (name) {
        setAuthorName(name);
        localStorage.setItem("editor_author_name", name);
      }
    }
  }, []);

  // Load comments
  const loadComments = React.useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/comments`);
      const json = await res.json();
      if (json.ok) {
        setComments(json.data || []);
        console.debug("[Comments] Loaded", json.data?.length || 0, "comments");
      } else {
        console.error("[Comments] Load error", json.error);
      }
    } catch (error) {
      console.error("[Comments] Load error", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  React.useEffect(() => {
    if (open && documentId) {
      loadComments();
    }
  }, [open, documentId, loadComments]);

  // Create new comment from selection
  const createComment = React.useCallback(async () => {
    if (!editor || !documentId || !newCommentText.trim()) return;

    const { from, to } = editor.state.selection;
    if (from === to) {
      toast.error("Please select text to comment on");
      return;
    }

    try {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newCommentText,
          from,
          to,
          authorName: authorName || "Anonymous",
        }),
      });

      const json = await res.json();
      if (json.ok) {
        toast.success("Comment added");
        setNewCommentText("");
        await loadComments();
        // Highlight the commented text
        editor.chain().focus().setTextSelection({ from, to }).run();
      } else {
        throw new Error(json.error?.message || "Failed to create comment");
      }
    } catch (error: any) {
      console.error("[Comments] Create error", error);
      toast.error(error.message || "Failed to create comment");
    }
  }, [editor, documentId, newCommentText, authorName, loadComments]);

  // Add reply
  const addReply = React.useCallback(async (parentId: string) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyText,
          from: 0,
          to: 0,
          parentId,
          authorName: authorName || "Anonymous",
        }),
      });

      const json = await res.json();
      if (json.ok) {
        toast.success("Reply added");
        setReplyText("");
        setReplyingTo(null);
        await loadComments();
      } else {
        throw new Error(json.error?.message || "Failed to add reply");
      }
    } catch (error: any) {
      console.error("[Comments] Reply error", error);
      toast.error(error.message || "Failed to add reply");
    }
  }, [documentId, replyText, authorName, loadComments]);

  // Resolve/unresolve comment
  const toggleResolve = React.useCallback(async (commentId: string, currentResolved: boolean) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: !currentResolved }),
      });

      const json = await res.json();
      if (json.ok) {
        await loadComments();
      } else {
        throw new Error(json.error?.message || "Failed to update comment");
      }
    } catch (error: any) {
      console.error("[Comments] Resolve error", error);
      toast.error(error.message || "Failed to update comment");
    }
  }, [documentId, loadComments]);

  // Delete comment
  const deleteComment = React.useCallback(async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`/api/documents/${documentId}/comments/${commentId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.ok) {
        toast.success("Comment deleted");
        await loadComments();
      } else {
        throw new Error(json.error?.message || "Failed to delete comment");
      }
    } catch (error: any) {
      console.error("[Comments] Delete error", error);
      toast.error(error.message || "Failed to delete comment");
    }
  }, [documentId, loadComments]);

  // Jump to comment location
  const jumpToComment = React.useCallback((comment: Comment) => {
    if (!editor) return;
    try {
      editor.chain().focus().setTextSelection({ from: comment.from, to: comment.to }).run();
      // Scroll into view
      const { view } = editor;
      const coords = view.coordsAtPos(comment.from);
      const editorElement = view.dom.closest('.ProseMirror');
      if (editorElement) {
        editorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error("[Comments] Jump error", error);
    }
  }, [editor]);

  if (!open) return null;

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment.id}
      className={clsx(
        "border-l-2 pl-3 py-2",
        comment.resolved ? "border-zinc-200 opacity-60" : "border-blue-500",
        depth > 0 && "ml-4"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-zinc-900">{comment.authorName}</span>
            <span className="text-xs text-zinc-500">{formatDate(comment.createdAt)}</span>
            {comment.resolved && (
              <span className="text-xs text-green-600 font-medium">Resolved</span>
            )}
          </div>
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">{comment.content}</p>
          {comment.from !== comment.to && (
            <button
              onClick={() => jumpToComment(comment)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Jump to location
            </button>
          )}
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="rounded p-1 hover:bg-zinc-100">
              <MoreVertical className="h-4 w-4 text-zinc-500" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="z-50 min-w-[160px] rounded-lg border border-zinc-200 bg-white p-1 shadow-xl">
              <DropdownMenu.Item
                onClick={() => toggleResolve(comment.id, comment.resolved)}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-zinc-100"
              >
                <Check className="h-4 w-4" />
                {comment.resolved ? "Unresolve" : "Resolve"}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onClick={() => deleteComment(comment.id)}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Reply button */}
      {!comment.resolved && (
        <button
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Reply className="h-3 w-3" />
          Reply
        </button>
      )}

      {/* Reply input */}
      {replyingTo === comment.id && (
        <div className="mt-2 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => addReply(comment.id)}
              disabled={!replyText.trim()}
              className={clsx(
                "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                replyText.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              )}
            >
              <Send className="h-3 w-3" />
              Reply
            </button>
            <button
              onClick={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-96 border-l border-zinc-200 bg-white shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-zinc-600" />
          <h2 className="font-semibold text-zinc-900">Comments</h2>
          {comments.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
              {comments.filter((c) => !c.resolved).length}
            </span>
          )}
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="rounded p-1 hover:bg-zinc-100"
        >
          <X className="h-5 w-5 text-zinc-500" />
        </button>
      </div>

      {/* New Comment Input */}
      <div className="border-b border-zinc-200 p-4">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment on selected text..."
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          rows={3}
        />
        <button
          onClick={createComment}
          disabled={!newCommentText.trim()}
          className={clsx(
            "mt-2 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            newCommentText.trim()
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
          )}
        >
          <Send className="h-4 w-4" />
          Add Comment
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500">No comments yet</p>
            <p className="mt-1 text-xs text-zinc-400">Select text and add a comment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
}
