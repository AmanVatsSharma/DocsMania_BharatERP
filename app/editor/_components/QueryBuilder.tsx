"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Play, X, Save, Code, Table, Database, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import type { DataSource, DataQuery } from "@/lib/dataSourceManager";

export interface QueryBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataSource: DataSource | null;
  initialQuery?: DataQuery;
  onSave: (query: DataQuery) => void;
}

export default function QueryBuilder(props: QueryBuilderProps) {
  const { open, onOpenChange, dataSource, initialQuery, onSave } = props;
  
  const [queryText, setQueryText] = React.useState(initialQuery?.query as string || "");
  const [params, setParams] = React.useState(initialQuery?.params || {});
  const [transform, setTransform] = React.useState(initialQuery?.transform || "");
  const [cacheEnabled, setCacheEnabled] = React.useState(initialQuery?.cache?.enabled || false);
  const [cacheTTL, setCacheTTL] = React.useState(initialQuery?.cache?.ttl || 300);
  const [executing, setExecuting] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function executeQuery() {
    if (!dataSource) return;
    
    try {
      setExecuting(true);
      setError(null);
      
      const res = await fetch("/api/data-sources/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: dataSource.id,
          query: queryText,
          params,
          transform,
        }),
      });
      
      const data = await res.json();
      if (data.ok) {
        setResults(data.data);
      } else {
        setError(data.error?.message || "Query execution failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute query");
    } finally {
      setExecuting(false);
    }
  }

  function handleSave() {
    const query: DataQuery = {
      sourceId: dataSource!.id,
      query: queryText,
      params,
      transform: transform || undefined,
      cache: cacheEnabled ? { enabled: true, ttl: cacheTTL } : undefined,
    };
    onSave(query);
    onOpenChange(false);
  }

  if (!dataSource) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl"
          style={{ maxHeight: "90vh" }}
        >
          <div className="flex h-full max-h-[90vh] flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <Code className="h-5 w-5 text-purple-500" />
                  Query Builder - {dataSource.name}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-500">
                  Write and test queries for your data source
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-lg p-2 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left: Query Editor */}
              <div className="flex w-1/2 flex-col border-r border-zinc-200">
                <div className="border-b border-zinc-200 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-700">Query</span>
                    <button
                      onClick={executeQuery}
                      disabled={executing}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {executing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      Run Query
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-4">
                  {dataSource.type === "sql" ? (
                    <SQLQueryEditor value={queryText} onChange={setQueryText} />
                  ) : dataSource.type === "rest" ? (
                    <RESTQueryEditor value={queryText} onChange={setQueryText} />
                  ) : dataSource.type === "graphql" ? (
                    <GraphQLQueryEditor value={queryText} onChange={setQueryText} />
                  ) : (
                    <div className="text-sm text-zinc-500">
                      This data source doesn't require a query. Data will be fetched directly from the URL.
                    </div>
                  )}
                  
                  {/* Parameters */}
                  <div className="mt-6">
                    <h4 className="mb-2 text-sm font-semibold text-zinc-700">Parameters (Optional)</h4>
                    <textarea
                      value={JSON.stringify(params, null, 2)}
                      onChange={(e) => {
                        try {
                          setParams(JSON.parse(e.target.value));
                        } catch {}
                      }}
                      className="w-full rounded-lg border border-zinc-300 p-3 font-mono text-sm"
                      rows={4}
                      placeholder='{"userId": 123, "limit": 10}'
                    />
                  </div>
                  
                  {/* Transform Function */}
                  <div className="mt-6">
                    <h4 className="mb-2 text-sm font-semibold text-zinc-700">Transform Function (Optional)</h4>
                    <textarea
                      value={transform}
                      onChange={(e) => setTransform(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 p-3 font-mono text-sm"
                      rows={6}
                      placeholder="// JavaScript to transform the data&#10;return data.map(row => ({&#10;  ...row,&#10;  total: row.price * row.quantity&#10;}));"
                    />
                  </div>
                  
                  {/* Cache Settings */}
                  <div className="mt-6 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cacheEnabled}
                        onChange={(e) => setCacheEnabled(e.target.checked)}
                      />
                      <span className="text-sm font-semibold text-zinc-700">Enable Caching</span>
                    </label>
                    {cacheEnabled && (
                      <div>
                        <label className="text-xs text-zinc-600">Cache TTL (seconds)</label>
                        <input
                          type="number"
                          value={cacheTTL}
                          onChange={(e) => setCacheTTL(parseInt(e.target.value))}
                          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Results */}
              <div className="flex w-1/2 flex-col">
                <div className="border-b border-zinc-200 px-4 py-2">
                  <span className="text-sm font-semibold text-zinc-700">Results</span>
                </div>
                
                <div className="flex-1 overflow-auto p-4">
                  {error ? (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                      <strong>Error:</strong> {error}
                    </div>
                  ) : results ? (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                        ✓ Query executed successfully ({Array.isArray(results) ? results.length : "1"} {Array.isArray(results) && results.length === 1 ? "row" : "rows"})
                      </div>
                      
                      <div className="overflow-auto">
                        <pre className="rounded-lg bg-zinc-900 p-4 text-xs text-white">
                          {JSON.stringify(results, null, 2)}
                        </pre>
                      </div>
                      
                      {Array.isArray(results) && results.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-zinc-200 bg-zinc-50">
                                {Object.keys(results[0]).map((key) => (
                                  <th key={key} className="px-3 py-2 text-left font-semibold">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {results.slice(0, 10).map((row, i) => (
                                <tr key={i} className="border-b border-zinc-200">
                                  {Object.values(row).map((value: any, j) => (
                                    <td key={j} className="px-3 py-2">
                                      {String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {results.length > 10 && (
                            <p className="mt-2 text-xs text-zinc-500">
                              Showing 10 of {results.length} rows
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <div className="text-center">
                        <Database className="mx-auto h-12 w-12" />
                        <p className="mt-4 text-sm">Run your query to see results</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 py-4">
              <Dialog.Close className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50">
                Cancel
              </Dialog.Close>
              <button
                onClick={handleSave}
                disabled={!queryText && dataSource.type !== "json" && dataSource.type !== "csv"}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save Query
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SQLQueryEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="mb-2 text-xs text-zinc-500">
        Write your SQL query. Use :paramName for parameters.
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 p-3 font-mono text-sm"
        rows={12}
        placeholder="SELECT * FROM users WHERE id = :userId LIMIT 10"
      />
      <div className="mt-2 text-xs text-zinc-500">
        <strong>Examples:</strong>
        <pre className="mt-1 rounded bg-zinc-100 p-2">
{`SELECT * FROM orders 
WHERE created_at > :startDate 
ORDER BY total DESC 
LIMIT :limit`}
        </pre>
      </div>
    </div>
  );
}

function RESTQueryEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="mb-2 text-xs text-zinc-500">
        Enter the API endpoint path (will be appended to base URL)
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 p-3 font-mono text-sm"
        placeholder="/api/users?limit=10"
      />
      <div className="mt-4 text-xs text-zinc-500">
        <strong>Examples:</strong>
        <ul className="mt-1 space-y-1 rounded bg-zinc-100 p-2">
          <li>• <code>/api/users</code></li>
          <li>• <code>/api/products?category=electronics</code></li>
          <li>• <code>/api/orders/{'{orderId}'}</code></li>
        </ul>
      </div>
    </div>
  );
}

function GraphQLQueryEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="mb-2 text-xs text-zinc-500">
        Write your GraphQL query or mutation
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 p-3 font-mono text-sm"
        rows={12}
        placeholder={`query GetUsers($limit: Int) {
  users(limit: $limit) {
    id
    name
    email
  }
}`}
      />
      <div className="mt-2 text-xs text-zinc-500">
        <strong>Example:</strong>
        <pre className="mt-1 rounded bg-zinc-100 p-2">
{`query GetOrders($status: String) {
  orders(status: $status) {
    id
    total
    customer {
      name
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
