"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";

type Project = { id: string; key: string; name: string; description?: string | null; updatedAt: string; _count?: { documents: number } };
type Doc = { id: string; title: string; slug: string; updatedAt: string; project?: { key: string; name: string } };

export default function DocsDashboard() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [listBusy, setListBusy] = React.useState(false);
  const [docs, setDocs] = React.useState<Doc[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [activeProjectKey, setActiveProjectKey] = React.useState<string>("");
  const [creatingProject, setCreatingProject] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [projectKey, setProjectKey] = React.useState("");
  const [tab, setTab] = React.useState<"projects" | "graph" | "markdown">("projects");

  const GraphView = React.useMemo(() => dynamic(() => import("./GraphView"), { ssr: false }), []);

  const load = React.useCallback(async () => {
    try {
      setListBusy(true);
      // eslint-disable-next-line no-console
      console.debug("[DocsDashboard] Loading projects & documents", { activeProjectKey });
      const [pResSettled, dResSettled] = await Promise.allSettled([
        fetch("/api/projects", { cache: "no-store" }),
        fetch(`/api/documents${activeProjectKey ? `?projectKey=${encodeURIComponent(activeProjectKey)}` : ""}`, { cache: "no-store" }),
      ]);

      let loadedProjects: Project[] = [];
      let loadedDocs: Doc[] = [];

      // Handle projects response
      if (pResSettled.status === "fulfilled") {
        const res = pResSettled.value;
        const body = await res.json();
        if (res.ok && body?.ok) {
          loadedProjects = body.data as Project[];
          setProjects(loadedProjects);
        } else {
          // eslint-disable-next-line no-console
          console.error("[DocsDashboard] Projects load failed", { status: res.status, body });
          toast.error(body?.error?.message ?? "Failed to list projects");
          setProjects([]);
        }
      } else {
        // eslint-disable-next-line no-console
        console.error("[DocsDashboard] Projects fetch error", pResSettled.reason);
        toast.error("Failed to reach /api/projects");
        setProjects([]);
      }

      // Handle documents response
      if (dResSettled.status === "fulfilled") {
        const res = dResSettled.value;
        const body = await res.json();
        if (res.ok && body?.ok) {
          loadedDocs = body.data as Doc[];
          setDocs(loadedDocs);
        } else {
          // eslint-disable-next-line no-console
          console.error("[DocsDashboard] Documents load failed", { status: res.status, body });
          toast.error(body?.error?.message ?? "Failed to list documents");
          setDocs([]);
        }
      } else {
        // eslint-disable-next-line no-console
        console.error("[DocsDashboard] Documents fetch error", dResSettled.reason);
        toast.error("Failed to reach /api/documents");
        setDocs([]);
      }

      if (!activeProjectKey && loadedProjects.length > 0) {
        setActiveProjectKey(loadedProjects[0].key);
      }
      // eslint-disable-next-line no-console
      console.info("[DocsDashboard] Loaded", { projects: loadedProjects.length, docs: loadedDocs.length });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("[DocsDashboard] Load error", e);
      toast.error(e?.message ?? "Failed to load documents");
    } finally {
      setListBusy(false);
    }
  }, [activeProjectKey]);

  React.useEffect(() => {
    void load();
  }, [load]);

  function toKebab(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  const onCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingProject) return;
    try {
      setCreatingProject(true);
      const payload = { key: (projectKey || toKebab(projectName)).trim(), name: projectName.trim() };
      if (!payload.key || !payload.name) {
        toast.error("Project name/key required");
        return;
      }
      // eslint-disable-next-line no-console
      console.info("[DocsDashboard] Creating project", payload);
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? "Create project failed");
      toast.success("Project created");
      setProjectName("");
      setProjectKey("");
      setActiveProjectKey(json.data.key);
      await load();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("[DocsDashboard] Create project error", e);
      toast.error(e?.message ?? "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    try {
      setBusy(true);
      const payload = {
        title: title.trim(),
        slug: (slug || toKebab(title)).trim(),
        projectKey: activeProjectKey,
        meta: {},
      };
      if (!payload.title || !payload.slug) {
        toast.error("Title and slug are required");
        return;
      }
      if (!payload.projectKey) {
        toast.error("Select or create a project first");
        return;
      }
      // eslint-disable-next-line no-console
      console.info("[DocsDashboard] Creating document", payload);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? "Create failed");
      toast.success("Document created");
      setTitle("");
      setSlug("");
      await load();
      // navigate to editor
      router.push(`/editor/${json.data.id}`);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("[DocsDashboard] Create error", e);
      toast.error(e?.message ?? "Failed to create document");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <button onClick={() => setTab("projects")} className={`px-3 py-1.5 text-sm rounded-md border ${tab === "projects" ? "bg-zinc-900 text-white" : "border-[var(--border)]"}`}>Projects</button>
        <button onClick={() => setTab("graph")} className={`px-3 py-1.5 text-sm rounded-md border ${tab === "graph" ? "bg-zinc-900 text-white" : "border-[var(--border)]"}`}>Graph</button>
        <button onClick={() => setTab("markdown")} className={`px-3 py-1.5 text-sm rounded-md border ${tab === "markdown" ? "bg-zinc-900 text-white" : "border-[var(--border)]"}`}>Markdown</button>
      </div>

      {tab === "graph" ? (
        <GraphView projectKey={activeProjectKey} />
      ) : null}

      {tab === "projects" ? (
        <>
      <section className="rounded-lg border border-[var(--border)] bg-white p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-base font-semibold">Projects</h2>
            <p className="text-xs text-zinc-500 mt-1">Select a project to manage its documents.</p>
          </div>
          <div className="flex items-end gap-2">
            <label className="grid gap-1">
              <span className="text-xs text-zinc-600">Project</span>
              <select
                value={activeProjectKey}
                onChange={(e) => setActiveProjectKey(e.target.value)}
                className="h-10 min-w-48 rounded-md border border-[var(--border)] px-2 text-sm"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.key}>{p.name} ({p.key})</option>
                ))}
              </select>
            </label>
            <button
              onClick={() => void load()}
              disabled={listBusy}
              className="h-10 px-3 text-xs rounded-md border border-[var(--border)]"
            >
              {listBusy ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
        <form onSubmit={onCreateProject} className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-3 items-end">
          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Project Name</span>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Marketing Site"
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Project Key</span>
            <input
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
              placeholder="marketing-site"
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={creatingProject}
            className="h-10 px-4 rounded-md border border-[var(--border)] bg-white text-sm disabled:opacity-50"
          >
            {creatingProject ? "Creating…" : "Create Project"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-white p-4">
        <h2 className="text-base font-semibold">Create Document</h2>
        <p className="text-xs text-zinc-500 mt-1">Enter a title; slug auto-generates (editable). Document will belong to the selected project.</p>
        <form onSubmit={onCreate} className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_220px_220px_auto] gap-3 items-end">
          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome doc"
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Project</span>
            <select
              value={activeProjectKey}
              onChange={(e) => setActiveProjectKey(e.target.value)}
              className="h-10 rounded-md border border-[var(--border)] px-2 text-sm"
            >
              <option value="" disabled>Select project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.key}>{p.name} ({p.key})</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-awesome-doc"
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="h-10 px-4 rounded-md border border-[var(--border)] bg-zinc-900 text-white text-sm disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create & Edit"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-white">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold">Documents {activeProjectKey ? `in ${activeProjectKey}` : "(all)"}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              disabled={listBusy}
              className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)]"
            >
              {listBusy ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
        <div className="divide-y">
          {docs.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500">No documents yet.</div>
          ) : (
            docs.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{d.title}</div>
                  <div className="text-xs text-zinc-500 truncate">/{d.project?.key ?? "?"}/{d.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // eslint-disable-next-line no-console
                      console.info("[DocsDashboard] Edit click", d);
                      router.push(`/editor/${d.id}`);
                    }}
                    className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] hover:bg-zinc-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // eslint-disable-next-line no-console
                        console.info("[DocsDashboard] View click", d);
                        let pk = d.project?.key;
                        if (!pk) {
                          // Fallback: fetch single document to obtain project key
                          const res = await fetch(`/api/documents/${d.id}`, { cache: "no-store" });
                          const json = await res.json().catch(() => ({}));
                          if (res.ok && json?.ok) pk = json?.data?.project?.key;
                        }
                        if (pk) {
                          router.push(`/p/${pk}/${d.slug}`);
                        } else {
                          // eslint-disable-next-line no-console
                          console.warn("[DocsDashboard] Missing project key for view", d);
                          toast.error("Cannot determine project for this document");
                        }
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error("[DocsDashboard] View click error", e);
                        toast.error("Failed to open document");
                      }
                    }}
                    className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] hover:bg-zinc-50"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      </>
      ) : null}

      {tab === "markdown" ? (
        <div className="rounded-lg border border-[var(--border)] bg-white p-4 text-sm text-zinc-600">
          Use the left sidebar in Shell to open static Markdown docs; this tab is a placeholder for future integration.
        </div>
      ) : null}
    </div>
  );
}


