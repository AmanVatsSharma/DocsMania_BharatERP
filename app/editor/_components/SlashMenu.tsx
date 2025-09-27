"use client";

import React from "react";
import { Command } from "cmdk";

export interface SlashMenuProps {
  editor: any | null;
  components: Array<{ key: string; name: string; defaultConfig: any }>;
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default function SlashMenu(props: SlashMenuProps) {
  const { editor, components, open, setOpen } = props;

  React.useEffect(() => {
    if (!editor) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/") {
        const target = e.target as HTMLElement;
        const tag = target?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border bg-white shadow-2xl">
        <Command label="Slash Menu">
          <Command.Input autoFocus placeholder="Type to find actions and components…" className="w-full border-b px-3 py-2 outline-none" />
          <Command.List className="max-h-80 overflow-auto">
            <Command.Empty className="px-3 py-2 text-sm text-zinc-500">No results.</Command.Empty>
            <Command.Group heading="Blocks">
              {components.map((c) => (
                <Command.Item key={c.key} onSelect={() => {
                  try {
                    editor?.chain().focus().setSection({ componentKey: c.key, props: c.defaultConfig }).run();
                    setOpen(false);
                  } catch (e) {
                    console.error("[/] insert error", e);
                  }
                }}>
                  {c.name}
                </Command.Item>
              ))}
              <Command.Item onSelect={() => { editor?.chain().focus().setParagraph().run(); setOpen(false); }}>Paragraph</Command.Item>
              <Command.Item onSelect={() => { editor?.chain().focus().toggleHeading({ level: 2 }).run(); setOpen(false); }}>Heading 2</Command.Item>
              <Command.Item onSelect={() => { editor?.chain().focus().toggleBulletList().run(); setOpen(false); }}>Bullet list</Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
      <button onClick={() => setOpen(false)} className="absolute inset-0" aria-label="Close" />
    </div>
  );
}
