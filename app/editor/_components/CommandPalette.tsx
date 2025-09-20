"use client";

import React from "react";
import { Command } from "cmdk";

export interface CommandPaletteProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onInsertSection: (key: string) => void;
  components: Array<{ key: string; name: string }>;
  actions?: Array<{ id: string; label: string; run: () => void }>;
}

export default function CommandPalette(props: CommandPaletteProps) {
  const { open, setOpen, onInsertSection, components, actions = [] } = props;

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border bg-white shadow-2xl">
        <Command label="Global Search and Actions">
          <Command.Input autoFocus placeholder="Search actions or components…" className="w-full border-b px-3 py-2 outline-none" />
          <Command.List className="max-h-80 overflow-auto">
            <Command.Empty className="px-3 py-2 text-sm text-zinc-500">No results.</Command.Empty>

            {actions.length > 0 && (
              <Command.Group heading="Actions">
                {actions.map((a) => (
                  <Command.Item key={a.id} onSelect={() => { try { a.run(); } finally { setOpen(false); } }}>
                    {a.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Components">
              {components.map((c) => (
                <Command.Item key={c.key} onSelect={() => { onInsertSection(c.key); setOpen(false); }}>
                  {c.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
      <button onClick={() => setOpen(false)} className="absolute inset-0" aria-label="Close" />
    </div>
  );
}


