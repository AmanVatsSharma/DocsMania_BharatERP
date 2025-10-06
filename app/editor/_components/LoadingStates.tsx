"use client";

import React from "react";
import { Loader2, FileText, Sparkles, CheckCircle2 } from "lucide-react";

/**
 * Professional Loading States for Enterprise Editor
 */

export function EditorLoadingSkeleton() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-zinc-50 to-white">
      {/* TopBar Skeleton */}
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-gradient-to-br from-purple-200 to-blue-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
          <div className="flex-1" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-8 w-28 animate-pulse rounded-lg bg-gradient-to-r from-purple-200 to-blue-200" />
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Sidebar Skeleton */}
        <div className="w-64 border-r border-zinc-200 bg-white p-4">
          <div className="mb-4 h-10 animate-pulse rounded-lg bg-zinc-200" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        </div>

        {/* Center Content Skeleton */}
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-12 w-3/4 animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-zinc-100" />
            <div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-100" />
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="w-80 border-l border-zinc-200 bg-white p-4">
          <div className="mb-4 h-10 animate-pulse rounded-lg bg-zinc-200" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="relative mx-auto mb-6 h-24 w-24">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white shadow-lg">
            <FileText className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        {/* Loading Text */}
        <h3 className="mb-2 text-lg font-semibold text-zinc-900">
          Loading your document...
        </h3>
        <p className="text-sm text-zinc-500">
          Preparing the editor
        </p>

        {/* Progress Steps */}
        <div className="mt-8 space-y-2">
          <LoadingStep label="Loading content" completed />
          <LoadingStep label="Initializing editor" active />
          <LoadingStep label="Setting up components" />
        </div>
      </div>
    </div>
  );
}

function LoadingStep({ label, active, completed }: { 
  label: string; 
  active?: boolean; 
  completed?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {completed ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : active ? (
        <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-zinc-300" />
      )}
      <span className={`text-sm ${
        completed ? "text-green-600" : active ? "text-purple-600 font-medium" : "text-zinc-400"
      }`}>
        {label}
      </span>
    </div>
  );
}

export function SavingIndicator({ saving }: { saving: boolean }) {
  if (!saving) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-white px-4 py-2.5 shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <div>
          <div className="text-sm font-medium text-zinc-900">Saving changes...</div>
          <div className="text-xs text-zinc-500">Your work is being saved</div>
        </div>
      </div>
    </div>
  );
}

export function SavedSuccessToast() {
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white px-4 py-2.5 shadow-lg">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <div>
          <div className="text-sm font-medium text-zinc-900">Saved successfully</div>
          <div className="text-xs text-zinc-500">All changes are synced</div>
        </div>
      </div>
    </div>
  );
}

export function EmptyDocumentState({ onAddContent }: { onAddContent?: () => void }) {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center p-8">
      <div className="text-center">
        {/* Illustration */}
        <div className="relative mx-auto mb-6 h-32 w-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 opacity-50 blur-2xl" />
          <div className="relative flex h-full items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-blue-50">
            <Sparkles className="h-16 w-16 text-purple-600" />
          </div>
        </div>

        {/* Content */}
        <h3 className="mb-2 text-xl font-semibold text-zinc-900">
          Start creating your document
        </h3>
        <p className="mb-6 text-sm text-zinc-500">
          Add components from the library or type "/" to see quick actions
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onAddContent}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            Add Content
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
            <FileText className="h-4 w-4" />
            Use Template
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 rounded-lg bg-zinc-50 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Quick Tips
          </div>
          <div className="space-y-1 text-sm text-zinc-600">
            <div>• Press <kbd className="rounded bg-white px-1.5 py-0.5 text-xs shadow-sm">⌘K</kbd> to open quick actions</div>
            <div>• Type <kbd className="rounded bg-white px-1.5 py-0.5 text-xs shadow-sm">/</kbd> to insert components</div>
            <div>• Drag components from the sidebar</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ 
  title = "Something went wrong",
  message = "We couldn't load your document",
  onRetry
}: { 
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-white to-zinc-50">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <div className="text-4xl">⚠️</div>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-zinc-900">{title}</h3>
        <p className="mb-6 text-sm text-zinc-500">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export function PublishingOverlay() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-zinc-900">
            Publishing your document
          </h3>
          <p className="text-sm text-zinc-500">
            Making it available to the world...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-center text-sm text-zinc-600">
          {progress}% complete
        </div>
      </div>
    </div>
  );
}
