import prisma from "@/lib/prisma";
import React from "react";

async function getData(slug: string) {
  const doc = await prisma.document.findUnique({
    where: { slug },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  return doc;
}

function renderNode(node: any, key: number): React.ReactNode {
  if (node.type === "section") {
    const keyName = node.attrs?.componentKey;
    const props = node.attrs?.props ?? {};
    if (keyName === "hero") {
      return (
        <section key={key} style={{ padding: 24, background: "#f5f5f5", borderRadius: 8 }}>
          <h2 style={{ margin: 0 }}>{props.title ?? "Hero"}</h2>
          <p style={{ marginTop: 8 }}>{props.subtitle ?? "Subtitle"}</p>
        </section>
      );
    }
    if (keyName === "callout") {
      return (
        <section key={key} style={{ padding: 16, borderLeft: "4px solid #0ea5e9", background: "#e0f2fe" }}>
          <p style={{ margin: 0 }}>{props.text ?? "Callout"}</p>
        </section>
      );
    }
  }

  switch (node.type) {
    case "paragraph":
      return <p key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</p>;
    case "text":
      return <>{node.text}</>;
    case "heading":
      const Tag = (`h${node.attrs?.level ?? 2}` as unknown) as keyof JSX.IntrinsicElements;
      return <Tag key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</Tag>;
    case "bulletList":
      return <ul key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</ul>;
    case "listItem":
      return <li key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</li>;
    case "image":
      return <img key={key} src={node.attrs?.src} alt={node.attrs?.alt ?? ""} />;
    default:
      return null;
  }
}

export default async function ViewerPage({ params }: { params: { slug: string } }) {
  const data = await getData(params.slug);
  if (!data) return <div style={{ padding: 24 }}>Not found</div> as any;
  const json = data.versions[0]?.content ?? { type: "doc", content: [] };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>{data.title}</h1>
      {json.content?.map((n: any, i: number) => (
        <div key={i} style={{ marginBottom: 16 }}>
          {renderNode(n, i)}
        </div>
      ))}
    </div>
  );
}
