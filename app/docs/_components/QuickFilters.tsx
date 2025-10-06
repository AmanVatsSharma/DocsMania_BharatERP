"use client";

import React from "react";
import { 
  Clock, Star, Calendar, FileText, 
  Filter, X, Tag, User
} from "lucide-react";

type FilterType = "recent" | "starred" | "today" | "week" | "month" | "all";

interface QuickFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  documentCount: number;
}

export default function QuickFilters({ 
  activeFilter, 
  onFilterChange,
  documentCount 
}: QuickFiltersProps) {
  const filters: { 
    type: FilterType; 
    label: string; 
    icon: React.ElementType;
    color: string;
  }[] = [
    { type: "all", label: "All", icon: FileText, color: "zinc" },
    { type: "recent", label: "Recent", icon: Clock, color: "blue" },
    { type: "starred", label: "Starred", icon: Star, color: "yellow" },
    { type: "today", label: "Today", icon: Calendar, color: "emerald" },
    { type: "week", label: "This Week", icon: Calendar, color: "purple" },
    { type: "month", label: "This Month", icon: Calendar, color: "orange" },
  ];

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-900">Quick Filters</h3>
        </div>
        <span className="text-xs text-zinc-500">{documentCount} documents</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.type;
          
          return (
            <button
              key={filter.type}
              onClick={() => onFilterChange(filter.type)}
              className={`
                flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all
                ${isActive 
                  ? `bg-${filter.color}-500 text-white border-${filter.color}-600 shadow-md` 
                  : `border-zinc-200 hover:border-${filter.color}-300 hover:bg-${filter.color}-50`
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{filter.label}</span>
            </button>
          );
        })}
      </div>

      {activeFilter !== "all" && (
        <button
          onClick={() => onFilterChange("all")}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 border border-dashed border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Clear Filter
        </button>
      )}
    </div>
  );
}
