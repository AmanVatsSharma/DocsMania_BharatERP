"use client";

import React from "react";
import * as Popover from "@radix-ui/react-popover";

export default function AccentPicker() {
  const [value, setValue] = React.useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("dc-accent") || "";
  });

  React.useEffect(() => {
    if (!value) return;
    document.documentElement.style.setProperty("--accent", value);
    localStorage.setItem("dc-accent", value);
  }, [value]);

  return (
    <Popover.Root>
      <Popover.Trigger className="rounded-md border border-[var(--border)] px-2 py-1 text-sm">Accent</Popover.Trigger>
      <Popover.Content className="rounded-md border border-[var(--border)] bg-white p-2 shadow">
        <input type="color" value={value || "#0ea5e9"} onChange={(e) => setValue(e.target.value)} />
      </Popover.Content>
    </Popover.Root>
  );
}


