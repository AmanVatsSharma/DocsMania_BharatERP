"use client";

import React from "react";
import { FileText, Calendar, User, Tag, ExternalLink } from "lucide-react";

type Doc = {
  id: string;
  title: string;
  slug: string;
  updatedAt: string;
  createdAt: string;
  project?: { key: string; name: string; id: string };
};

interface DocumentPreviewProps {
  doc: Doc;
  onClose: () => void;
  onEdit: () => void;
  onView: () => void;
}

export default function DocumentPreview({ 
  doc, 
  onClose, 
  onEdit, 
  onView 
}: DocumentPreviewProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{doc.title}</h2>
                <p className="text-sm opacity-90">/{doc.project?.key}/{doc.slug}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-96">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Calendar className="w-3 h-3" />
                Created
              </div>
              <div className="text-sm font-medium">
                {new Date(doc.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Calendar className="w-3 h-3" />
                Last Updated
              </div>
              <div className="text-sm font-medium">
                {new Date(doc.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-2">
            <div className="text-xs text-zinc-500">Project</div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <div>
                <div className="text-sm font-semibold">{doc.project?.name}</div>
                <div className="text-xs text-zinc-500">{doc.project?.key}</div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="space-y-2">
            <div className="text-xs text-zinc-500">Preview</div>
            <div className="h-40 bg-gradient-to-br from-zinc-100 via-zinc-50 to-white border border-zinc-200 rounded-xl flex items-center justify-center">
              <div className="text-center text-zinc-400">
                <FileText className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xs">Document preview coming soon</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">0</div>
              <div className="text-xs text-zinc-600">Views</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">0</div>
              <div className="text-xs text-zinc-600">Links</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-lg font-bold text-emerald-600">1</div>
              <div className="text-xs text-zinc-600">Version</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-zinc-200 p-4 bg-zinc-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={onView}
            className="px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Live
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Edit Document
          </button>
        </div>
      </div>
    </div>
  );
}
