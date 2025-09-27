export default function HubPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Docs Hub</h1>
      <p className="text-zinc-600 mt-2">
        Explore project documentation, architecture notes, and how-tos. Use the sidebar to filter and open docs.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-[var(--border)] bg-white">
          <div className="text-sm font-medium">Quick Start</div>
          <p className="text-xs text-zinc-500 mt-1">Read the editor and components guide.</p>
          <a className="text-xs text-zinc-900 underline mt-2 inline-block" href="/docs/docs/editor">Open Editor Docs</a>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-white">
          <div className="text-sm font-medium">Components</div>
          <p className="text-xs text-zinc-500 mt-1">Author and preview custom sections.</p>
          <a className="text-xs text-zinc-900 underline mt-2 inline-block" href="/docs/docs/components">Open Components Docs</a>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-white">
          <div className="text-sm font-medium">Changelog</div>
          <p className="text-xs text-zinc-500 mt-1">Latest implementation updates and fixes.</p>
          <a className="text-xs text-zinc-900 underline mt-2 inline-block" href="/docs/docs/changelog">Open Changelog</a>
        </div>
      </div>
    </div>
  );
}


