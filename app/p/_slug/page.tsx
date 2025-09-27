import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import React from "react";
import { previewComponents } from "@/app/editor/_registry/sections";

async function getData(slug: string) {
  try {
    // Backwards-compat fallback – find by slug across projects
    const doc = await prisma.document.findFirst({
      where: { slug },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    return doc;
  } catch (typedError: any) {
    logger.warn("Viewer (_slug) typed fetch failed, falling back to raw", { code: typedError?.code, message: typedError?.message });
    const rows = await prisma.$queryRaw<Array<{ id: string; title: string; slug: string; content: any }>>`
      SELECT d."id", d."title", d."slug", v."content"
      FROM "Document" d
      LEFT JOIN LATERAL (
        SELECT "content" FROM "DocumentVersion" dv WHERE dv."documentId" = d."id" ORDER BY dv."version" DESC LIMIT 1
      ) v ON true
      WHERE d."slug" = ${slug}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null as any;
    return { id: row.id, title: row.title, slug: row.slug, versions: [{ content: row.content }] } as any;
  }
}

function renderNode(node: any, key: number): React.ReactNode {
  if (node.type === "section") {
    const keyName = node.attrs?.componentKey;
    const props = node.attrs?.props ?? {};
    const Comp = previewComponents[keyName];
    if (Comp) return <Comp key={key} props={props} />;
  }

  switch (node.type) {
    case "paragraph":
      return (
        <p
          key={key}
          style={{
            textAlign: node.attrs?.textAlign ?? undefined,
            marginLeft: typeof node.attrs?.indent === "number" && node.attrs?.indent > 0 ? `${(node.attrs.indent as number) * 24}px` : undefined,
            marginTop: node.attrs?.spacingBefore ?? undefined,
            marginBottom: node.attrs?.spacingAfter ?? undefined,
          }}
        >
          {node.content?.map((c: any, i: number) => renderNode(c, i))}
        </p>
      );
    case "text":
      if (node.marks) {
        let el: React.ReactNode = node.text;
        for (const mark of node.marks) {
          if (mark.type === "bold") el = <strong key={`${key}-b`}>{el}</strong>;
          if (mark.type === "italic") el = <em key={`${key}-i`}>{el}</em>;
          if (mark.type === "strike") el = <s key={`${key}-s`}>{el}</s>;
          if (mark.type === "code") el = <code key={`${key}-c`}>{el}</code>;
          if (mark.type === "link") el = <a key={`${key}-l`} href={mark.attrs?.href} target="_blank" rel="noreferrer noopener">{el}</a>;
          if (mark.type === "underline") el = <u key={`${key}-u`}>{el}</u>;
          if (mark.type === "highlight") el = <mark key={`${key}-h`} style={{ backgroundColor: mark.attrs?.color ?? undefined }}>{el}</mark>;
          if (mark.type === "subscript") el = <sub key={`${key}-sub`}>{el}</sub>;
          if (mark.type === "superscript") el = <sup key={`${key}-sup`}>{el}</sup>;
          if (mark.type === "textStyle") {
            const style: React.CSSProperties = {};
            if (mark.attrs?.fontSize) style.fontSize = mark.attrs.fontSize;
            if (mark.attrs?.fontFamily) style.fontFamily = mark.attrs.fontFamily;
            if (mark.attrs?.color) style.color = mark.attrs.color;
            if (mark.attrs?.lineHeight) style.lineHeight = mark.attrs.lineHeight;
            if (mark.attrs?.letterSpacing) style.letterSpacing = mark.attrs.letterSpacing;
            if (Object.keys(style).length) el = <span key={`${key}-ts`} style={style}>{el}</span>;
          }
        }
        return <>{el}</>;
      }
      return <>{node.text}</>;
    case "heading":
      switch (node.attrs?.level) {
        case 1:
          return <h1 key={key} style={{ textAlign: node.attrs?.textAlign ?? undefined }}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</h1>;
        case 2:
          return <h2 key={key} style={{ textAlign: node.attrs?.textAlign ?? undefined }}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</h2>;
        case 3:
          return <h3 key={key} style={{ textAlign: node.attrs?.textAlign ?? undefined }}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</h3>;
        case 4:
          return <h4 key={key} style={{ textAlign: node.attrs?.textAlign ?? undefined }}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</h4>;
        case 5:
          return <h5 key={key} style={{ textAlign: node.attrs?.textAlign ?? undefined }}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</h5>;
        default:
          return <h6 key={key} style={{ textAlign: node.attrs?.textAlign ?? undefined }}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</h6>;
      }
    case "taskList":
      return <ul key={key} data-tasklist="true" style={{ listStyle: "none", paddingLeft: 0 }}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</ul>;
    case "taskItem": {
      const checked = !!node.attrs?.checked;
      return (
        <li key={key} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <input type="checkbox" checked={checked} readOnly style={{ marginTop: 4 }} />
          <div style={{ flex: 1 }}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</div>
        </li>
      );
    }
    case "bulletList":
      return <ul key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</ul>;
    case "listItem":
      return <li key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</li>;
    case "image":
      return <img key={key} src={node.attrs?.src} alt={node.attrs?.alt ?? ""} />;
    case "bulletList":
      return <ul key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</ul>;
    case "orderedList":
      return <ol key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</ol>;
    case "listItem":
      return <li key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</li>;
    case "blockquote":
      return <blockquote key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</blockquote>;
    case "codeBlock":
      return <pre key={key}><code>{node.content?.map((c: any, i: number) => (c.text ?? "")).join("")}</code></pre>;
    case "table": {
      const attrs = node.attrs ?? {};
      const style: React.CSSProperties = { borderCollapse: "collapse", width: "100%" };
      if (attrs.width) style.width = attrs.width;
      const alignWrapperStyle: React.CSSProperties = { display: "block" };
      if (attrs.align === "center") alignWrapperStyle.margin = "0 auto";
      if (attrs.align === "right") alignWrapperStyle.marginLeft = "auto";

      const zebra = attrs.zebra === true;
      const compact = attrs.compact === true;
      const stickyHeader = attrs.stickyHeader === true;
      const stickyFirstCol = attrs.stickyFirstColumn === true;
      const stickyFirstN = Number(attrs.stickyFirstN ?? 0) || (stickyFirstCol ? 1 : 0);
      const borderStyle = attrs.borderStyle ?? "grid";

      // Compute column count and widths (from first row cell colwidths)
      const rowsArray = node.content ?? [];
      const maxCols = Math.max(0, ...rowsArray.map((r: any) => (r.content?.length ?? 0)));
      const colWidths: Array<number | null> = Array.from({ length: maxCols }, () => null);
      if (rowsArray.length > 0) {
        let colIndex = 0;
        for (const cell of rowsArray[0].content ?? []) {
          const cw = cell.attrs?.colwidth as number[] | undefined;
          const span = (cell.attrs?.colspan as number | undefined) ?? 1;
          if (Array.isArray(cw)) {
            cw.forEach((w, i) => {
              if (colIndex + i < maxCols) colWidths[colIndex + i] = w ?? null;
            });
          }
          colIndex += span;
        }
      }

      const headerRowIndex = rowsArray.findIndex((r: any) => (r.content ?? []).some((c: any) => c.type === "tableHeader"));
      const headRows = headerRowIndex === 0 ? [rowsArray[0]] : [];
      const bodyRows = headerRowIndex === 0 ? rowsArray.slice(1) : rowsArray;

      const wrapper = (
        <div key={key} style={{ overflowX: attrs.overflowX === false ? "visible" : "auto", ...alignWrapperStyle }}>
          <table data-border-style={borderStyle} data-zebra={String(!!zebra)} data-compact={String(!!compact)} style={style}>
            {maxCols > 0 ? (
              <colgroup>
                {colWidths.map((w, i) => (
                  <col key={i} style={w ? ({ width: `${w}px` } as React.CSSProperties) : undefined} />
                ))}
              </colgroup>
            ) : null}
            {headRows.length ? (
              <thead>
                {headRows.map((row: any, ri: number) => (
                  <tr key={`h-${ri}`}>
                    {row.content?.map((cell: any, ci: number) => {
                      const Tag: any = "th";
                      const bg = cell.attrs?.backgroundColor ? { backgroundColor: cell.attrs.backgroundColor } : {};
                      const ta = cell.attrs?.textAlign ? { textAlign: cell.attrs.textAlign } : {};
                      const va = cell.attrs?.verticalAlign ? { verticalAlign: cell.attrs.verticalAlign } : {};
                      const pad = cell.attrs?.padding ? { padding: cell.attrs.padding } : { padding: 8 };
                      const bcolor = cell.attrs?.borderColor ? { borderColor: cell.attrs.borderColor } : {};
                      const bwidth = cell.attrs?.borderWidth ? { borderWidth: cell.attrs.borderWidth } : {};
                      const stickyHeaderStyle = stickyHeader ? { position: "sticky", top: 0, background: "white", zIndex: 2 } : {};
                      return (
                        <Tag key={ci} style={{ borderStyle: borderStyle === "none" ? "none" : "solid", borderColor: "#e5e7eb", ...(borderStyle === "grid" ? { borderWidth: 1 } : {}), ...bg, ...ta, ...va, ...pad, ...bcolor, ...bwidth, ...stickyHeaderStyle }}>
                          {cell.content?.map((c: any, i: number) => renderNode(c, i))}
                        </Tag>
                      );
                    })}
                  </tr>
                ))}
              </thead>
            ) : null}
            <tbody>
              {bodyRows.map((row: any, ri: number) => (
                <tr key={ri}>
                  {row.content?.map((cell: any, ci: number) => {
                    const isHeader = cell.type === "tableHeader";
                    const Tag: any = isHeader ? "th" : "td";
                    const bg = cell.attrs?.backgroundColor ? { backgroundColor: cell.attrs.backgroundColor } : {};
                    const ta = cell.attrs?.textAlign ? { textAlign: cell.attrs.textAlign } : {};
                    const va = cell.attrs?.verticalAlign ? { verticalAlign: cell.attrs.verticalAlign } : {};
                    const pad = cell.attrs?.padding ? { padding: cell.attrs.padding } : { padding: 8 };
                    const bcolor = cell.attrs?.borderColor ? { borderColor: cell.attrs.borderColor } : {};
                    const bwidth = cell.attrs?.borderWidth ? { borderWidth: cell.attrs.borderWidth } : {};
                    let stickyFirst: React.CSSProperties = {};
                    if (stickyFirstN > 0 && ci < stickyFirstN) {
                      let leftPx = 0;
                      for (let k = 0; k < ci; k++) {
                        const w = colWidths[k];
                        if (typeof w === "number" && !Number.isNaN(w)) leftPx += w;
                      }
                      stickyFirst = { position: "sticky", left: leftPx, background: "white", zIndex: 1 } as React.CSSProperties;
                    }
                    return (
                      <Tag key={ci} style={{ borderStyle: borderStyle === "none" ? "none" : "solid", borderColor: "#e5e7eb", ...(borderStyle === "grid" ? { borderWidth: 1 } : {}), ...bg, ...ta, ...va, ...pad, ...bcolor, ...bwidth, ...stickyFirst }}>
                        {cell.content?.map((c: any, i: number) => renderNode(c, i))}
                      </Tag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            {attrs.caption ? <caption style={{ captionSide: "bottom", paddingTop: 8, color: "#6b7280" }}>{attrs.caption}</caption> : null}
          </table>
          <style>{`
            table[data-compact="true"] td, table[data-compact="true"] th { padding: 4px; }
            table[data-zebra="true"] tbody tr:nth-child(even) td, table[data-zebra="true"] tbody tr:nth-child(even) th { background: rgba(0,0,0,0.02); }
          `}</style>
        </div>
      );
      return wrapper;
    }
    default:
      return null;
  }
}

export default async function ViewerPage({ params }: { params: { slug: string } }) {
  const data = await getData(params.slug);
  if (!data) return <div style={{ padding: 24 }}>Not found</div> as any;
  const version = data.versions[0] as any;
  const json = (version?.content as any) ?? { type: "doc", content: [] };

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
