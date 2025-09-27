"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";

export interface HelpOverlayProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function HelpOverlay({ open, onOpenChange }: HelpOverlayProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Keyboard & Editing Help</Dialog.Title>
          <div className="mt-3 grid gap-2 text-sm text-zinc-700">
            <div className="font-medium">Global</div>
            <ul className="list-disc pl-5">
              <li>Cmd/Ctrl + K: Open command palette</li>
              <li>/: Slash menu to insert blocks/components</li>
              <li>Right-click: Text formatting & font sizes</li>
            </ul>
            <div className="font-medium">Document</div>
            <ul className="list-disc pl-5">
              <li>Cmd/Ctrl + S: Save draft</li>
              <li>Cmd/Ctrl + Shift + P: Publish</li>
            </ul>
            <div className="font-medium">Sections</div>
            <ul className="list-disc pl-5">
              <li>Hover toolbar: Duplicate / Delete / Move</li>
              <li>Outline panel: Jump and move ↑/↓</li>
              <li>Drag handles: Adjust padding and vertical spacing</li>
            </ul>
            <div className="font-medium">Tables</div>
            <ul className="list-disc pl-5">
              <li>Right panel → Table: style cell background / alignment</li>
              <li>Add/remove rows & columns, merge/split cells</li>
            </ul>
          </div>
          <div className="mt-4 flex justify-end">
            <Dialog.Close className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm">Close</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


