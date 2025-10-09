export default function EditorLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-zinc-50 to-white">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
        <div className="rounded-2xl border border-[var(--border)] bg-white px-6 py-5 shadow-sm">
          <div className="text-2xl font-extrabold tracking-tight">DocsMania</div>
          <div className="text-xs text-zinc-500">product by Novologic</div>
          <div className="mt-2 h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" aria-label="Loading" />
        </div>
        <div className="text-xs text-zinc-500">Developer: <span className="font-medium text-zinc-700">AmanVatsSharma</span></div>
      </div>
    </div>
  );
}


