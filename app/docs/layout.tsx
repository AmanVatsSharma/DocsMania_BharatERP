import React from "react";
import { Toaster } from "sonner";
import { IndexProvider } from "./_components/IndexProvider";
import { ErrorBoundary } from "./_components/ErrorBoundary";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white text-sm font-semibold">DM</span>
            <div>
              <div className="text-sm font-semibold">DocsMania</div>
              <div className="text-xs text-zinc-500">Enterprise Docs Hub</div>
            </div>
          </div>
          <div className="text-xs text-zinc-500">Docs</div>
        </div>
      </header>
      <main className="flex-1">
        <ErrorBoundary>
          <IndexProvider>{children}</IndexProvider>
        </ErrorBoundary>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}


