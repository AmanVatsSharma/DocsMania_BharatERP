"use client";

import React from "react";
import { toast } from "sonner";

export function ActionsBar() {
  const [busy, setBusy] = React.useState(false);
  const reindex = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/docs/reindex", { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json?.error?.message ?? "Reindex failed");
      toast.success("Docs re-indexed");
      // naive refresh
      window.location.reload();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("Reindex error", e);
      toast.error(e?.message ?? "Reindex failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center gap-2 p-2 border-b border-[var(--border)] bg-white">
      <button
        onClick={reindex}
        disabled={busy}
        className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] hover:bg-zinc-50"
      >
        {busy ? "Re-indexing…" : "Re-index"}
      </button>
    </div>
  );
}

