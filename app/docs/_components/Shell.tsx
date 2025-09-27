"use client";

import React from "react";
import { useDocsIndex } from "./IndexProvider";
import { Sidebar } from "./Sidebar";
import { ActionsBar } from "./ActionsBar";
import { usePathname, useRouter } from "next/navigation";

function parseActiveSlug(pathname: string): string[] {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("docs");
  if (idx === -1) return [];
  return parts.slice(idx + 1);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { index } = useDocsIndex();
  const pathname = usePathname();
  const router = useRouter();
  const activeSlug = React.useMemo(() => parseActiveSlug(pathname ?? "/docs"), [pathname]);

  React.useEffect(() => {
    // Verbose logs for debugging navigation state
    // eslint-disable-next-line no-console
    console.debug("[Docs Shell] mounted", { activeSlug });
  }, [activeSlug]);

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 56px)" }}>
      <div className="w-80 shrink-0 border-r border-[var(--border)] bg-white hidden md:block">
        {index ? (
          <>
            <ActionsBar />
            <Sidebar
              items={index.items}
              projects={index.projects}
              tags={index.tags}
              activeSlug={activeSlug}
              onSelect={(slug) => {
                // eslint-disable-next-line no-console
                console.info("[Docs Shell] navigate", { slug });
                router.push(`/docs/${slug.join("/")}`);
              }}
            />
          </>
        ) : (
          <div className="p-4 text-sm text-zinc-500">Loading index…</div>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}


