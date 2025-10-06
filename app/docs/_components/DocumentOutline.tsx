"use client";

import React from "react";
import { 
  FileText, FolderTree, ChevronRight, ChevronDown,
  Circle, Link2, GitBranch, Layers
} from "lucide-react";
import { useRouter } from "next/navigation";

type Doc = { 
  id: string; 
  title: string; 
  slug: string; 
  updatedAt: string; 
  createdAt: string;
  project?: { key: string; name: string; id: string } 
};

interface DocumentOutlineProps {
  projectKey: string;
  docs: Doc[];
}

export default function DocumentOutline({ projectKey, docs }: DocumentOutlineProps) {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set(['all']));

  const toggleGroup = (groupKey: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(groupKey)) {
      newSet.delete(groupKey);
    } else {
      newSet.add(groupKey);
    }
    setExpandedGroups(newSet);
  };

  // Group documents by first letter
  const groupedDocs = React.useMemo(() => {
    const filtered = projectKey 
      ? docs.filter(d => d.project?.key === projectKey)
      : docs;

    const groups: Record<string, Doc[]> = {};
    filtered.forEach(doc => {
      const firstLetter = doc.title[0]?.toUpperCase() || '#';
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(doc);
    });

    // Sort groups and docs within groups
    const sortedGroups: [string, Doc[]][] = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    sortedGroups.forEach(([, docs]) => {
      docs.sort((a, b) => a.title.localeCompare(b.title));
    });

    return sortedGroups;
  }, [docs, projectKey]);

  // Create a hierarchical tree based on slug structure
  const hierarchicalDocs = React.useMemo(() => {
    const filtered = projectKey 
      ? docs.filter(d => d.project?.key === projectKey)
      : docs;

    // Build tree structure
    type TreeNode = {
      id?: string;
      name: string;
      slug?: string;
      doc?: Doc;
      children: TreeNode[];
      level: number;
    };

    const root: TreeNode = { name: 'root', children: [], level: 0 };
    
    filtered.forEach(doc => {
      const parts = doc.slug.split('/').filter(p => p.length > 0);
      let current = root;
      
      parts.forEach((part, idx) => {
        let child = current.children.find(c => c.name === part);
        if (!child) {
          child = {
            name: part,
            children: [],
            level: current.level + 1
          };
          current.children.push(child);
        }
        
        if (idx === parts.length - 1) {
          child.doc = doc;
          child.id = doc.id;
          child.slug = doc.slug;
        }
        
        current = child;
      });
    });

    // Sort children at each level
    const sortTree = (node: TreeNode) => {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.children.forEach(sortTree);
    };
    sortTree(root);

    return root.children;
  }, [docs, projectKey]);

  const renderTreeNode = (node: any, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedGroups.has(node.name);

    return (
      <div key={node.id || node.name}>
        <div 
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors ${depth > 0 ? 'ml-' + (depth * 4) : ''}`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleGroup(node.name);
            }
            if (node.doc) {
              router.push(`/editor/${node.doc.id}`);
            }
          }}
        >
          {hasChildren ? (
            <button className="p-0.5 hover:bg-zinc-100 rounded">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-zinc-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          
          {node.doc ? (
            <FileText className="w-4 h-4 text-blue-500" />
          ) : (
            <FolderTree className="w-4 h-4 text-zinc-400" />
          )}
          
          <span className="text-sm font-medium flex-1 truncate">
            {node.doc ? node.doc.title : node.name}
          </span>
          
          {node.doc && (
            <span className="text-xs text-zinc-400">
              {new Date(node.doc.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child: any) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <FolderTree className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Document Outline</h2>
            <p className="text-sm text-zinc-500">
              {projectKey ? `Viewing ${docs.filter(d => d.project?.key === projectKey).length} documents` : `${docs.length} total documents`}
            </p>
          </div>
        </div>
      </div>

      {/* Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hierarchical Tree View */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-200 bg-zinc-50">
            <GitBranch className="w-5 h-5 text-zinc-600" />
            <h3 className="font-bold">Hierarchical View</h3>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {hierarchicalDocs.length > 0 ? (
              <div className="space-y-1">
                {hierarchicalDocs.map(node => renderTreeNode(node))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-zinc-500">
                No documents in this project
              </div>
            )}
          </div>
        </div>

        {/* Alphabetical Grouped View */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-200 bg-zinc-50">
            <Layers className="w-5 h-5 text-zinc-600" />
            <h3 className="font-bold">Alphabetical View</h3>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {groupedDocs.length > 0 ? (
              <div className="space-y-4">
                {groupedDocs.map(([letter, letterDocs]) => (
                  <div key={letter}>
                    <div 
                      className="flex items-center gap-2 mb-2 cursor-pointer"
                      onClick={() => toggleGroup(letter)}
                    >
                      {expandedGroups.has(letter) ? (
                        <ChevronDown className="w-4 h-4 text-zinc-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                      )}
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white font-bold text-sm">
                        {letter}
                      </div>
                      <span className="text-sm font-semibold text-zinc-700">
                        {letterDocs.length} document{letterDocs.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {expandedGroups.has(letter) && (
                      <div className="ml-10 space-y-1">
                        {letterDocs.map(doc => (
                          <div 
                            key={doc.id}
                            className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors"
                            onClick={() => router.push(`/editor/${doc.id}`)}
                          >
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{doc.title}</div>
                              <div className="text-xs text-zinc-500 truncate">{doc.slug}</div>
                            </div>
                            <span className="text-xs text-zinc-400 flex-shrink-0">
                              {new Date(doc.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-zinc-500">
                No documents in this project
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Circle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Total Documents</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {projectKey ? docs.filter(d => d.project?.key === projectKey).length : docs.length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Unique Paths</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {hierarchicalDocs.reduce((acc, node) => {
              const countNodes = (n: any): number => {
                return 1 + (n.children || []).reduce((sum: number, child: any) => sum + countNodes(child), 0);
              };
              return acc + countNodes(node);
            }, 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-900">Categories</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            {groupedDocs.length}
          </div>
        </div>
      </div>
    </div>
  );
}
