import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import React from "react";
import { previewComponents } from "@/app/editor/_registry/sections";
import { ChevronRight, Eye, Calendar, User, Menu, X, Share2, Download } from "lucide-react";

async function getData(projectKey: string, slug: string) {
  try {
    const doc = await (prisma as any).document.findFirst({
      where: { slug, project: { key: projectKey } },
      include: { 
        versions: { orderBy: { version: "desc" }, take: 1 },
        project: true
      },
    });
    return doc;
  } catch (typedError: any) {
    logger.warn("Viewer typed fetch failed, falling back to raw", { code: typedError?.code, message: typedError?.message });
    const rows = await prisma.$queryRaw<Array<{ id: string; title: string; slug: string; content: any; projectKey: string; projectName: string }>>`
      SELECT d."id", d."title", d."slug", v."content", p."key" as "projectKey", p."name" as "projectName"
      FROM "Document" d
      JOIN "Project" p ON p."id" = d."projectId"
      LEFT JOIN LATERAL (
        SELECT "content" FROM "DocumentVersion" dv WHERE dv."documentId" = d."id" ORDER BY dv."version" DESC LIMIT 1
      ) v ON true
      WHERE p."key" = ${projectKey} AND d."slug" = ${slug}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null as any;
    return { id: row.id, title: row.title, slug: row.slug, versions: [{ content: row.content }], project: { key: row.projectKey, name: row.projectName } } as any;
  }
}

async function getProjectDocs(projectKey: string) {
  try {
    const docs = await (prisma as any).document.findMany({
      where: { project: { key: projectKey } },
      select: { id: true, title: true, slug: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
    return docs;
  } catch (e) {
    logger.warn("Failed to fetch project docs", e);
    return [];
  }
}

function renderNode(node: any, key: number): React.ReactNode {
  if (node.type === "section") {
    const keyName = node.attrs?.componentKey;
    const props = node.attrs?.props ?? {};
    const Comp = (previewComponents as any)[keyName];
    
    // Apply layout props if they exist
    const layout = props.layout || {};
    const wrapperStyle: React.CSSProperties = {
      maxWidth: layout.maxWidth ? `${layout.maxWidth}px` : undefined,
      padding: layout.padding ? `${layout.padding}px` : undefined,
      marginTop: layout.marginY ? `${layout.marginY}px` : undefined,
      marginBottom: layout.marginY ? `${layout.marginY}px` : undefined,
      marginLeft: "auto",
      marginRight: "auto",
    };
    
    if (Comp) {
      return (
        <div key={key} style={wrapperStyle}>
          <Comp props={props} />
        </div>
      );
    }
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
          if (mark.type === "code") el = <code key={`${key}-c`} className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">{el}</code>;
          if (mark.type === "link") el = <a key={`${key}-l`} href={mark.attrs?.href} target="_blank" rel="noreferrer noopener" className="text-blue-600 hover:underline">{el}</a>;
          if (mark.type === "underline") el = <u key={`${key}-u`}>{el}</u>;
          if (mark.type === "highlight") el = <mark key={`${key}-h`} style={{ backgroundColor: mark.attrs?.color ?? "#fef3c7" }}>{el}</mark>;
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
      const HeadingTag = `h${node.attrs?.level || 1}` as keyof JSX.IntrinsicElements;
      return React.createElement(
        HeadingTag,
        { 
          key, 
          style: { textAlign: node.attrs?.textAlign ?? undefined },
          className: "font-bold my-4"
        },
        node.content?.map((c: any, i: number) => renderNode(c, i))
      );
    case "taskList":
      return <ul key={key} className="space-y-2" style={{ listStyle: "none", paddingLeft: 0 }}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</ul>;
    case "taskItem": {
      const checked = !!node.attrs?.checked;
      return (
        <li key={key} className="flex items-start gap-2">
          <input type="checkbox" checked={checked} readOnly className="mt-1" />
          <div className="flex-1">{node.content?.map((c: any, i: number) => renderNode(c, i))}</div>
        </li>
      );
    }
    case "bulletList":
      return <ul key={key} className="list-disc pl-6 space-y-1">{node.content?.map((c: any, i: number) => renderNode(c, i))}</ul>;
    case "listItem":
      return <li key={key}>{node.content?.map((c: any, i: number) => renderNode(c, i))}</li>;
    case "image":
      return <img key={key} src={node.attrs?.src} alt={node.attrs?.alt ?? ""} className="max-w-full h-auto rounded-lg" />;
    case "orderedList":
      return <ol key={key} className="list-decimal pl-6 space-y-1">{node.content?.map((c: any, i: number) => renderNode(c, i))}</ol>;
    case "blockquote":
      return <blockquote key={key} className="border-l-4 border-zinc-300 pl-4 italic text-zinc-600">{node.content?.map((c: any, i: number) => renderNode(c, i))}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key} className="rounded-lg bg-zinc-900 p-4 overflow-x-auto">
          <code className="text-sm text-white">{node.content?.map((c: any, i: number) => (c.text ?? "")).join("")}</code>
        </pre>
      );
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
        <div key={key} className="overflow-x-auto" style={alignWrapperStyle}>
          <table className="border-collapse" style={style}>
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
                      const bg = cell.attrs?.backgroundColor ? { backgroundColor: cell.attrs.backgroundColor } : {};
                      const ta = cell.attrs?.textAlign ? { textAlign: cell.attrs.textAlign } : {};
                      const va = cell.attrs?.verticalAlign ? { verticalAlign: cell.attrs.verticalAlign } : {};
                      const pad = cell.attrs?.padding ? { padding: cell.attrs.padding } : { padding: 8 };
                      return (
                        <th key={ci} className="border border-zinc-200 font-semibold bg-zinc-50" style={{ ...bg, ...ta, ...va, ...pad }}>
                          {cell.content?.map((c: any, i: number) => renderNode(c, i))}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
            ) : null}
            <tbody>
              {bodyRows.map((row: any, ri: number) => (
                <tr key={ri} className={zebra && ri % 2 === 1 ? "bg-zinc-50" : ""}>
                  {row.content?.map((cell: any, ci: number) => {
                    const isHeader = cell.type === "tableHeader";
                    const Tag: any = isHeader ? "th" : "td";
                    const bg = cell.attrs?.backgroundColor ? { backgroundColor: cell.attrs.backgroundColor } : {};
                    const ta = cell.attrs?.textAlign ? { textAlign: cell.attrs.textAlign } : {};
                    const va = cell.attrs?.verticalAlign ? { verticalAlign: cell.attrs.verticalAlign } : {};
                    const pad = cell.attrs?.padding ? { padding: cell.attrs.padding } : { padding: 8 };
                    return (
                      <Tag key={ci} className="border border-zinc-200" style={{ ...bg, ...ta, ...va, ...pad }}>
                        {cell.content?.map((c: any, i: number) => renderNode(c, i))}
                      </Tag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            {attrs.caption ? <caption className="mt-2 text-sm text-zinc-500">{attrs.caption}</caption> : null}
          </table>
        </div>
      );
      return wrapper;
    }
    default:
      return null;
  }
}

export default async function ViewerPage({ params }: { params: { projectKey: string; slug: string } }) {
  const data = await getData(params.projectKey, params.slug);
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900">404</h1>
          <p className="mt-2 text-zinc-600">Document not found</p>
        </div>
      </div>
    );
  }

  const version = (data.versions[0] as any) ?? null;
  const json = (version?.content as any) ?? { type: "doc", content: [] };
  const projectDocs = await getProjectDocs(params.projectKey);
  
  // Check for display settings in document meta
  const meta = (data as any).meta || {};
  const displaySettings = meta.displaySettings || {};
  const showSidebar = displaySettings.showSidebar !== false; // Default true
  const fullWidth = displaySettings.fullWidth === true; // Default false

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Project & Doc Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <a href={`/p/${params.projectKey}`} className="font-medium text-zinc-700 hover:text-zinc-900">
                  {data.project?.name || params.projectKey}
                </a>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
                <span className="font-semibold text-zinc-900">{data.title}</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Left Sidebar - Project Navigation */}
        {showSidebar && projectDocs.length > 0 && (
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white p-4 lg:block">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-900">Pages in this project</h2>
              <p className="mt-1 text-xs text-zinc-500">{projectDocs.length} documents</p>
            </div>
            <nav className="space-y-1">
              {projectDocs.map((doc: any) => (
                <a
                  key={doc.id}
                  href={`/p/${params.projectKey}/${doc.slug}`}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    doc.slug === params.slug
                      ? "bg-zinc-900 font-semibold text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {doc.title}
                </a>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${fullWidth ? "" : "mx-auto max-w-5xl"}`}>
          <article className="px-4 py-12 sm:px-6 lg:px-8">
            {/* Document Header */}
            <header className="mb-12">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                {data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={(data as any).createdAt}>
                    {new Date((data as any).createdAt || Date.now()).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                {version && (
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium">
                      v{version.version || 1}
                    </span>
                  </div>
                )}
              </div>
            </header>

            {/* Document Content */}
            <div className="prose prose-zinc max-w-none">
              {json.content?.map((n: any, i: number) => (
                <div key={i} className="my-4">
                  {renderNode(n, i)}
                </div>
              ))}
            </div>
          </article>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} {data.project?.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <a href="#" className="hover:text-zinc-900">Privacy</a>
              <a href="#" className="hover:text-zinc-900">Terms</a>
              <a href="#" className="hover:text-zinc-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
