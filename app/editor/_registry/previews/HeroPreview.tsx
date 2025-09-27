import React from "react";

export default function HeroPreview({ props }: { props?: Record<string, any> }) {
  const style = props?.style ?? {};
  const radius = style.borderRadius ?? 12;
  const shadow = style.shadow ?? "sm";
  const classes = shadow === "none" ? "" : shadow === "md" ? "shadow" : shadow === "lg" ? "shadow-md" : "shadow-sm";
  return (
    <section className={`border border-[var(--border)] p-6 ${classes}`} style={{ borderRadius: radius, background: style.backgroundColor ?? "#f8fafc", color: style.color ?? "#0f172a" }}>
      <h2 className="m-0 text-2xl font-bold">{props?.title ?? "Hero"}</h2>
      <p className="mt-2 opacity-80">{props?.subtitle ?? "Subtitle"}</p>
    </section>
  );
}


