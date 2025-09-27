import React from "react";

export default function CalloutPreview({ props }: { props?: Record<string, any> }) {
  const style = props?.style ?? {};
  const bg = style.backgroundColor ?? "#e0f2fe";
  const color = style.color ?? "#0c4a6e";
  const border = style.borderColor ?? "#0ea5e9";
  return (
    <section className="rounded-md p-3" style={{ background: bg, borderLeft: `4px solid ${border}` }}>
      <p className="m-0" style={{ color }}>{props?.text ?? "Callout"}</p>
    </section>
  );
}


