"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { toHtml } from "hast-util-to-html";

export function DocViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-zinc max-w-none px-8 py-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ]}
        components={{
          code(props) {
            const { children, className } = props as any;
            const language = /language-(\w+)/.exec(className || "")?.[1];
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
      />
    </div>
  );
}

