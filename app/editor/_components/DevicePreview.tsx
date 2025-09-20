"use client";

import React from "react";
import { MonitorSmartphone, Smartphone, Tablet } from "lucide-react";
import { clsx } from "clsx";

export type DeviceKind = "desktop" | "tablet" | "mobile";

export interface DevicePreviewProps {
  device: DeviceKind;
  onChange: (d: DeviceKind) => void;
  children: React.ReactNode;
}

/**
 * DevicePreview provides quick viewport emulation for desktop/tablet/mobile.
 */
export default function DevicePreview(props: DevicePreviewProps) {
  const { device, onChange, children } = props;

  const containerClass = React.useMemo(() => {
    switch (device) {
      case "mobile":
        return "mx-auto w-[390px]";
      case "tablet":
        return "mx-auto w-[834px]"; // iPad Air width
      default:
        return "mx-auto w-full max-w-5xl";
    }
  }, [device]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b px-3 py-2">
        <button onClick={() => onChange("desktop")} className={clsx("rounded px-2 py-1 text-sm", device === "desktop" ? "bg-zinc-100 font-semibold" : "text-zinc-600 hover:bg-zinc-50")}> <MonitorSmartphone className="mr-1 inline h-4 w-4" /> Desktop</button>
        <button onClick={() => onChange("tablet")} className={clsx("rounded px-2 py-1 text-sm", device === "tablet" ? "bg-zinc-100 font-semibold" : "text-zinc-600 hover:bg-zinc-50")}> <Tablet className="mr-1 inline h-4 w-4" /> Tablet</button>
        <button onClick={() => onChange("mobile")} className={clsx("rounded px-2 py-1 text-sm", device === "mobile" ? "bg-zinc-100 font-semibold" : "text-zinc-600 hover:bg-zinc-50")}> <Smartphone className="mr-1 inline h-4 w-4" /> Mobile</button>
      </div>
      <div className={clsx("flex-1 overflow-auto px-6 py-6", containerClass)}>
        {children}
      </div>
    </div>
  );
}


