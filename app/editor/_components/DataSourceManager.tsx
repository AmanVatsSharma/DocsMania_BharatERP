"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { Database, Plus, X, RefreshCw, Trash2, Check, AlertCircle, Code, Globe, FileJson } from "lucide-react";
import { clsx } from "clsx";
import type { DataSource, DataSourceConfig } from "@/lib/dataSourceManager";

export interface DataSourceManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSource?: (source: DataSource) => void;
}

export default function DataSourceManager(props: DataSourceManagerProps) {
  const { open, onOpenChange, onSelectSource } = props;
  
  const [sources, setSources] = React.useState<DataSource[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editingSource, setEditingSource] = React.useState<DataSource | null>(null);
  const [testStatus, setTestStatus] = React.useState<{ success: boolean; message: string } | null>(null);

  React.useEffect(() => {
    if (open) {
      loadDataSources();
    }
  }, [open]);

  async function loadDataSources() {
    try {
      setLoading(true);
      const res = await fetch("/api/data-sources");
      const data = await res.json();
      if (data.ok) {
        setSources(data.data);
      }
    } catch (error) {
      console.error("Failed to load data sources", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveDataSource(source: Partial<DataSource>) {
    try {
      const method = source.id ? "PUT" : "POST";
      const url = source.id ? `/api/data-sources/${source.id}` : "/api/data-sources";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source),
      });
      
      const data = await res.json();
      if (data.ok) {
        await loadDataSources();
        setEditingSource(null);
      }
    } catch (error) {
      console.error("Failed to save data source", error);
    }
  }

  async function testConnection(source: DataSource) {
    try {
      setTestStatus(null);
      const res = await fetch(`/api/data-sources/${source.id}/test`, {
        method: "POST",
      });
      
      const data = await res.json();
      setTestStatus({
        success: data.ok,
        message: data.ok ? "Connection successful!" : data.error?.message || "Connection failed",
      });
    } catch (error: any) {
      setTestStatus({
        success: false,
        message: error.message || "Connection test failed",
      });
    }
  }

  async function deleteDataSource(id: string) {
    if (!confirm("Are you sure you want to delete this data source?")) return;
    
    try {
      await fetch(`/api/data-sources/${id}`, { method: "DELETE" });
      await loadDataSources();
    } catch (error) {
      console.error("Failed to delete data source", error);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl"
          style={{ maxHeight: "90vh" }}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <Database className="h-5 w-5 text-blue-500" />
                  Data Sources
                </Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-500">
                  Connect to external databases, APIs, and data sources
                </Dialog.Description>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingSource({ 
                    id: "", 
                    name: "", 
                    type: "rest", 
                    config: {},
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  })}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Source
                </button>
                <Dialog.Close className="rounded-lg p-2 hover:bg-zinc-100">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
              ) : editingSource ? (
                <DataSourceEditor
                  source={editingSource}
                  onSave={saveDataSource}
                  onCancel={() => setEditingSource(null)}
                  onTest={testConnection}
                  testStatus={testStatus}
                />
              ) : sources.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <Database className="h-16 w-16 text-zinc-300" />
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">No data sources yet</h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    Connect to databases, APIs, and external data to power your documents
                  </p>
                  <button
                    onClick={() => setEditingSource({ 
                      id: "", 
                      name: "", 
                      type: "rest", 
                      config: {},
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    })}
                    className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Source
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {sources.map((source) => (
                    <DataSourceCard
                      key={source.id}
                      source={source}
                      onEdit={() => setEditingSource(source)}
                      onDelete={() => deleteDataSource(source.id)}
                      onSelect={() => {
                        onSelectSource?.(source);
                        onOpenChange(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DataSourceCard({ source, onEdit, onDelete, onSelect }: {
  source: DataSource;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}) {
  const icons = {
    sql: <Database className="h-5 w-5" />,
    rest: <Globe className="h-5 w-5" />,
    graphql: <Code className="h-5 w-5" />,
    json: <FileJson className="h-5 w-5" />,
    csv: <FileJson className="h-5 w-5" />,
  };

  const colors = {
    sql: "bg-blue-100 text-blue-600",
    rest: "bg-green-100 text-green-600",
    graphql: "bg-purple-100 text-purple-600",
    json: "bg-orange-100 text-orange-600",
    csv: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${colors[source.type]}`}>
            {icons[source.type]}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">{source.name}</h3>
            <p className="text-xs text-zinc-500 uppercase">{source.type}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onSelect}
          className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Use Source
        </button>
        <button
          onClick={onEdit}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DataSourceEditor({ source, onSave, onCancel, onTest, testStatus }: {
  source: DataSource;
  onSave: (source: Partial<DataSource>) => void;
  onCancel: () => void;
  onTest: (source: DataSource) => void;
  testStatus: { success: boolean; message: string } | null;
}) {
  const [formData, setFormData] = React.useState<Partial<DataSource>>(source);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="My Data Source"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="sql">SQL Database (PostgreSQL, MySQL, etc.)</option>
            <option value="rest">REST API</option>
            <option value="graphql">GraphQL</option>
            <option value="json">JSON URL</option>
            <option value="csv">CSV URL</option>
          </select>
        </div>

        {formData.type === "sql" && (
          <SQLSourceConfig config={formData.config || {}} onChange={(config) => setFormData({ ...formData, config })} />
        )}

        {formData.type === "rest" && (
          <RESTSourceConfig config={formData.config || {}} onChange={(config) => setFormData({ ...formData, config })} />
        )}

        {formData.type === "graphql" && (
          <GraphQLSourceConfig config={formData.config || {}} onChange={(config) => setFormData({ ...formData, config })} />
        )}

        {(formData.type === "json" || formData.type === "csv") && (
          <URLSourceConfig config={formData.config || {}} onChange={(config) => setFormData({ ...formData, config })} />
        )}
      </div>

      {testStatus && (
        <div className={`flex items-center gap-2 rounded-lg p-3 ${testStatus.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {testStatus.success ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm">{testStatus.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
        <button
          onClick={() => onTest(formData as DataSource)}
          className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          <RefreshCw className="h-4 w-4" />
          Test Connection
        </button>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function SQLSourceConfig({ config, onChange }: { config: DataSourceConfig; onChange: (config: DataSourceConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Host</label>
          <input
            type="text"
            value={config.host || ""}
            onChange={(e) => onChange({ ...config, host: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="localhost"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Port</label>
          <input
            type="number"
            value={config.port || ""}
            onChange={(e) => onChange({ ...config, port: parseInt(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="5432"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Database</label>
        <input
          type="text"
          value={config.database || ""}
          onChange={(e) => onChange({ ...config, database: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="mydb"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Username</label>
          <input
            type="text"
            value={config.username || ""}
            onChange={(e) => onChange({ ...config, username: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Password</label>
          <input
            type="password"
            value={config.password || ""}
            onChange={(e) => onChange({ ...config, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.ssl || false}
          onChange={(e) => onChange({ ...config, ssl: e.target.checked })}
        />
        <span className="text-sm text-zinc-700">Use SSL</span>
      </label>
    </div>
  );
}

function RESTSourceConfig({ config, onChange }: { config: DataSourceConfig; onChange: (config: DataSourceConfig) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700">Base URL</label>
        <input
          type="url"
          value={config.baseUrl || ""}
          onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="https://api.example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Authentication</label>
        <select
          value={config.auth?.type || "none"}
          onChange={(e) => onChange({ 
            ...config, 
            auth: { ...config.auth, type: e.target.value as any }
          })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="none">None</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="apiKey">API Key</option>
        </select>
      </div>
      {config.auth?.type === "bearer" && (
        <div>
          <label className="block text-sm font-medium text-zinc-700">Bearer Token</label>
          <input
            type="password"
            value={config.auth?.token || ""}
            onChange={(e) => onChange({ 
              ...config, 
              auth: { ...config.auth!, token: e.target.value }
            })}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
      )}
      {config.auth?.type === "apiKey" && (
        <>
          <div>
            <label className="block text-sm font-medium text-zinc-700">API Key Header</label>
            <input
              type="text"
              value={config.auth?.apiKeyHeader || ""}
              onChange={(e) => onChange({ 
                ...config, 
                auth: { ...config.auth!, apiKeyHeader: e.target.value }
              })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="X-API-Key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">API Key</label>
            <input
              type="password"
              value={config.auth?.apiKey || ""}
              onChange={(e) => onChange({ 
                ...config, 
                auth: { ...config.auth!, apiKey: e.target.value }
              })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
        </>
      )}
    </div>
  );
}

function GraphQLSourceConfig({ config, onChange }: { config: DataSourceConfig; onChange: (config: DataSourceConfig) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700">GraphQL Endpoint</label>
        <input
          type="url"
          value={config.endpoint || ""}
          onChange={(e) => onChange({ ...config, endpoint: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="https://api.example.com/graphql"
        />
      </div>
    </div>
  );
}

function URLSourceConfig({ config, onChange }: { config: DataSourceConfig; onChange: (config: DataSourceConfig) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700">Data URL</label>
        <input
          type="url"
          value={config.url || ""}
          onChange={(e) => onChange({ ...config, url: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="https://example.com/data.json"
        />
      </div>
    </div>
  );
}
