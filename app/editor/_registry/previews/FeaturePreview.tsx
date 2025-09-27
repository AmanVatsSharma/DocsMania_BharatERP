import React from "react";

export default function FeaturePreview({ props }: { props?: Record<string, any> }) {
  const raw = props?.points;
  const points = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",").map((s) => s.trim()).filter(Boolean) : ["Point A", "Point B"];
  return (
    <section className="grid gap-3 rounded-xl border border-[var(--border)] bg-white p-6">
      <h3 className="m-0 text-xl font-semibold">{props?.title ?? "Feature"}</h3>
      <p className="m-0 text-zinc-600">{props?.description ?? "Describe your feature here."}</p>
      <ul className="list-disc pl-5 text-zinc-700">
        {points.map((p: string, i: number) => <li key={i}>{p}</li>)}
      </ul>
    </section>
  );
}


