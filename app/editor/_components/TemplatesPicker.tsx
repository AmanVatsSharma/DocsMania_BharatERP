"use client";

import React from "react";
import * as Popover from "@radix-ui/react-popover";

export interface TemplatesPickerProps {
  onApply: (content: any) => void;
}

const templates: Array<{ name: string; content: any }> = [
  {
    name: "Hero + Feature list",
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Welcome" }] },
        { type: "section", attrs: { componentKey: "hero", props: { title: "Welcome", subtitle: "Start here", style: { borderRadius: 12, shadow: "sm" } } }, content: [{ type: "paragraph" }] },
        { type: "section", attrs: { componentKey: "feature", props: { title: "Highlights", description: "Why us", points: "Fast,Secure,Scalable" } }, content: [{ type: "paragraph" }] },
      ],
    },
  },
];

export default function TemplatesPicker({ onApply }: TemplatesPickerProps) {
  return (
    <Popover.Root>
      <Popover.Trigger className="rounded-md border border-[var(--border)] px-2 py-1 text-sm">Templates</Popover.Trigger>
      <Popover.Content className="min-w-[220px] rounded-md border border-[var(--border)] bg-white p-2 shadow">
        <div className="grid gap-1 text-sm">
          {templates.map((t) => (
            <button key={t.name} className="rounded border border-[var(--border)] px-2 py-1 text-left hover:bg-zinc-50" onClick={() => onApply(t.content)}>
              {t.name}
            </button>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}


