"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { 
  Grid3x3, List, BarChart3, Network, Search, Filter, 
  Plus, RefreshCw, FolderOpen, FileText, TrendingUp,
  Clock, ChevronDown, Settings, Download, Upload,
  LayoutGrid, Eye, Edit, Trash2, Copy, Star,
  Activity, Zap, Database
} from "lucide-react";

type Project = { 
  id: string; 
  key: string; 
  name: string; 
  description?: string | null; 
  updatedAt: string; 
  createdAt: string;
  _count?: { documents: number } 
};

type Doc = { 
  id: string; 
  title: string; 
  slug: string; 
  updatedAt: string; 
  createdAt: string;
  project?: { key: string; name: string; id: string } 
};

type ViewMode = "grid" | "list" | "analytics" | "graph" | "outline";
type SortBy = "updatedAt" | "createdAt" | "title" | "project";
type FilterBy = "all" | "recent" | "starred";

export default function DocsDashboardV2() {
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
  const [projectDescription, setProjectDescription] = React.useState("");
  
  // Enhanced UI state
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortBy>("updatedAt");
  const [filterBy, setFilterBy] = React.useState<FilterBy>("all");
  const [selectedDocs, setSelectedDocs] = React.useState<Set<string>>(new Set());
  const [showCreateProject, setShowCreateProject] = React.useState(false);
  const [showCreateDoc, setShowCreateDoc] = React.useState(false);

  const GraphView = React.useMemo(() => dynamic(() => import("./GraphView"), { ssr: false }), []);
  const DocumentOutline = React.useMemo(() => dynamic(() => import("./DocumentOutline"), { ssr: false }), []);
  const AnalyticsDashboard = React.useMemo(() => dynamic(() => import("./AnalyticsDashboard"), { ssr: false }), []);

  const load = React.useCallback(async () => {
    try {
      setListBusy(true);
      console.debug("[DocsDashboardV2] Loading projects & documents", { activeProjectKey });
      const [pResSettled, dResSettled] = await Promise.allSettled([
        fetch("/api/projects", { cache: "no-store" }),
        fetch(`/api/documents${activeProjectKey ? `?projectKey=${encodeURIComponent(activeProjectKey)}` : ""}`, { cache: "no-store" }),
      ]);

      let loadedProjects: Project[] = [];
      let loadedDocs: Doc[] = [];

      if (pResSettled.status === "fulfilled") {
        const res = pResSettled.value;
        const body = await res.json();
        if (res.ok && body?.ok) {
          loadedProjects = body.data as Project[];
          setProjects(loadedProjects);
        } else {
          console.error("[DocsDashboardV2] Projects load failed", { status: res.status, body });
          toast.error(body?.error?.message ?? "Failed to list projects");
          setProjects([]);
        }
      } else {
        console.error("[DocsDashboardV2] Projects fetch error", pResSettled.reason);
        toast.error("Failed to reach /api/projects");
        setProjects([]);
      }

      if (dResSettled.status === "fulfilled") {
        const res = dResSettled.value;
        const body = await res.json();
        if (res.ok && body?.ok) {
          loadedDocs = body.data as Doc[];
          setDocs(loadedDocs);
        } else {
          console.error("[DocsDashboardV2] Documents load failed", { status: res.status, body });
          toast.error(body?.error?.message ?? "Failed to list documents");
          setDocs([]);
        }
      } else {
        console.error("[DocsDashboardV2] Documents fetch error", dResSettled.reason);
        toast.error("Failed to reach /api/documents");
        setDocs([]);
      }

      if (!activeProjectKey && loadedProjects.length > 0) {
        setActiveProjectKey(loadedProjects[0].key);
      }
      console.info("[DocsDashboardV2] Loaded", { projects: loadedProjects.length, docs: loadedDocs.length });
    } catch (e: any) {
      console.error("[DocsDashboardV2] Load error", e);
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
      const payload = { 
        key: (projectKey || toKebab(projectName)).trim(), 
        name: projectName.trim(),
        description: projectDescription.trim() || undefined
      };
      if (!payload.key || !payload.name) {
        toast.error("Project name/key required");
        return;
      }
      console.info("[DocsDashboardV2] Creating project", payload);
      const res = await fetch("/api/projects", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? "Create project failed");
      toast.success("Project created");
      setProjectName("");
      setProjectKey("");
      setProjectDescription("");
      setActiveProjectKey(json.data.key);
      setShowCreateProject(false);
      await load();
    } catch (e: any) {
      console.error("[DocsDashboardV2] Create project error", e);
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
      console.info("[DocsDashboardV2] Creating document", payload);
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
      setShowCreateDoc(false);
      await load();
      router.push(`/editor/${json.data.id}`);
    } catch (e: any) {
      console.error("[DocsDashboardV2] Create error", e);
      toast.error(e?.message ?? "Failed to create document");
    } finally {
      setBusy(false);
    }
  };

  // Filter and sort documents
  const filteredDocs = React.useMemo(() => {
    let filtered = [...docs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(query) || 
        d.slug.toLowerCase().includes(query) ||
        d.project?.name.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "updatedAt":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "project":
          return (a.project?.name || "").localeCompare(b.project?.name || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [docs, searchQuery, sortBy]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalProjects = projects.length;
    const totalDocs = docs.length;
    const activeProject = projects.find(p => p.key === activeProjectKey);
    const docsInActiveProject = activeProjectKey 
      ? docs.filter(d => d.project?.key === activeProjectKey).length 
      : 0;
    
    const recentDocs = docs.filter(d => {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return new Date(d.updatedAt).getTime() > dayAgo;
    }).length;

    return {
      totalProjects,
      totalDocs,
      docsInActiveProject,
      recentDocs,
      activeProject
    };
  }, [projects, docs, activeProjectKey]);

  const toggleSelectDoc = (docId: string) => {
    const newSet = new Set(selectedDocs);
    if (newSet.has(docId)) {
      newSet.delete(docId);
    } else {
      newSet.add(docId);
    }
    setSelectedDocs(newSet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-zinc-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-zinc-900" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  DocsMania Pro
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                <Zap className="w-3 h-3 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Enterprise</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">{stats.totalProjects}</span>
                <span className="text-xs text-blue-600">Projects</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-100">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">{stats.totalDocs}</span>
                <span className="text-xs text-purple-600">Docs</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100">
                <Activity className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-900">{stats.recentDocs}</span>
                <span className="text-xs text-orange-600">Recent</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => void load()}
                disabled={listBusy}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${listBusy ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* View Mode & Controls */}
          <div className="flex items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg border transition-all ${viewMode === "grid" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg border transition-all ${viewMode === "list" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("analytics")}
                className={`p-2 rounded-lg border transition-all ${viewMode === "analytics" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("graph")}
                className={`p-2 rounded-lg border transition-all ${viewMode === "graph" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
              >
                <Network className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("outline")}
                className={`p-2 rounded-lg border transition-all ${viewMode === "outline" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents, projects..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="updatedAt">Updated</option>
                <option value="createdAt">Created</option>
                <option value="title">Title</option>
                <option value="project">Project</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateProject(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-100 border border-zinc-200 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Project</span>
              </button>
              <button
                onClick={() => setShowCreateDoc(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Document</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Project Selector */}
        <div className="mb-6">
          <select
            value={activeProjectKey}
            onChange={(e) => setActiveProjectKey(e.target.value)}
            className="w-full md:w-auto min-w-[300px] px-4 py-3 text-sm font-medium border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white shadow-sm"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.key}>
                {p.name} ({p._count?.documents || 0} docs)
              </option>
            ))}
          </select>
        </div>

        {/* View Content */}
        {viewMode === "grid" && (
          <div className="space-y-8">
            {/* Projects Grid */}
            {!activeProjectKey && (
              <section>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setActiveProjectKey(project.key)}
                      className="group relative p-6 bg-white rounded-xl border border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-zinc-100 rounded-full">
                          <FileText className="w-3 h-3 text-zinc-600" />
                          <span className="text-xs font-semibold text-zinc-700">
                            {project._count?.documents || 0}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold mb-1 truncate group-hover:text-zinc-900">
                        {project.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mb-2 truncate">{project.key}</p>
                      {project.description && (
                        <p className="text-xs text-zinc-600 line-clamp-2">{project.description}</p>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                        <Clock className="w-3 h-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Documents Grid */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents {activeProjectKey && `in ${stats.activeProject?.name}`}
                <span className="text-sm font-normal text-zinc-500">({filteredDocs.length})</span>
              </h2>
              {filteredDocs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-zinc-300">
                  <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <p className="text-sm text-zinc-500">No documents found</p>
                  <button
                    onClick={() => setShowCreateDoc(true)}
                    className="mt-4 px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
                  >
                    Create your first document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="group relative bg-white rounded-xl border border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all overflow-hidden"
                    >
                      {/* Document Preview */}
                      <div className="h-40 bg-gradient-to-br from-zinc-100 via-zinc-50 to-white border-b border-zinc-200 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      
                      {/* Document Info */}
                      <div className="p-4">
                        <h3 className="text-sm font-bold mb-1 truncate">{doc.title}</h3>
                        <p className="text-xs text-zinc-500 mb-2 truncate">
                          {doc.project?.name} / {doc.slug}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                          <Clock className="w-3 h-3" />
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/editor/${doc.id}`)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                let pk = doc.project?.key;
                                if (!pk) {
                                  const res = await fetch(`/api/documents/${doc.id}`, { cache: "no-store" });
                                  const json = await res.json().catch(() => ({}));
                                  if (res.ok && json?.ok) pk = json?.data?.project?.key;
                                }
                                if (pk) {
                                  router.push(`/p/${pk}/${doc.slug}`);
                                } else {
                                  toast.error("Cannot determine project for this document");
                                }
                              } catch (e) {
                                console.error("[DocsDashboardV2] View click error", e);
                                toast.error("Failed to open document");
                              }
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {viewMode === "list" && (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-100 rounded-lg">
                            <FileText className="w-4 h-4 text-zinc-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-900">{doc.title}</div>
                            <div className="text-xs text-zinc-500">{doc.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-100 rounded-md text-xs font-medium text-blue-700">
                          <FolderOpen className="w-3 h-3" />
                          {doc.project?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {new Date(doc.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/editor/${doc.id}`)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                let pk = doc.project?.key;
                                if (!pk) {
                                  const res = await fetch(`/api/documents/${doc.id}`, { cache: "no-store" });
                                  const json = await res.json().catch(() => ({}));
                                  if (res.ok && json?.ok) pk = json?.data?.project?.key;
                                }
                                if (pk) {
                                  router.push(`/p/${pk}/${doc.slug}`);
                                } else {
                                  toast.error("Cannot determine project for this document");
                                }
                              } catch (e) {
                                console.error("[DocsDashboardV2] View click error", e);
                                toast.error("Failed to open document");
                              }
                            }}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === "analytics" && (
          <AnalyticsDashboard projects={projects} docs={docs} />
        )}

        {viewMode === "graph" && (
          <GraphView projectKey={activeProjectKey} />
        )}

        {viewMode === "outline" && (
          <DocumentOutline projectKey={activeProjectKey} docs={docs} />
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={onCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Marketing Site"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Project Key
                </label>
                <input
                  type="text"
                  value={projectKey}
                  onChange={(e) => setProjectKey(e.target.value)}
                  placeholder="marketing-site (auto-generated)"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <p className="text-xs text-zinc-500 mt-1">Leave empty to auto-generate from name</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Description
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Brief description of the project..."
                  rows={3}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1 px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="flex-1 px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                >
                  {creatingProject ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Document Modal */}
      {showCreateDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Document</h2>
            <form onSubmit={onCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Document"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Project *
                </label>
                <select
                  value={activeProjectKey}
                  onChange={(e) => setActiveProjectKey(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  required
                >
                  <option value="" disabled>Select a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.key}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-awesome-document (auto-generated)"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <p className="text-xs text-zinc-500 mt-1">Leave empty to auto-generate from title</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDoc(false)}
                  className="flex-1 px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                >
                  {busy ? "Creating..." : "Create & Edit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
