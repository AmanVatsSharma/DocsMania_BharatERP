"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export function DocViewer({ content }: { content: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 px-8 py-6">
      <div className="prose prose-zinc max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]]}
          components={{
            code(props) {
              const { children, className } = props as any;
              return (
                <pre className="rounded-lg border border-[var(--border)] bg-zinc-50 p-3 overflow-auto">
                  <code className={className}>{children}</code>
                </pre>
              );
            },
            table(props) {
              return (
                <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                  <table className="min-w-full" {...props} />
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      <nav className="hidden lg:block sticky top-20 h-[calc(100vh-120px)] overflow-auto pr-4 border-l border-[var(--border)] pl-4 text-sm">
        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">On this page</div>
        {/* Anchors will be present due to rehype-slug; we assume headings rendered */}
        {/* Simple client-side TOC by querying headings would need content parsing; for now left minimal */}
        <div className="text-zinc-400">Headings will have anchor links ▸</div>
      </nav>
    </div>
  );
}


