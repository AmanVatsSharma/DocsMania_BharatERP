"use client";

import React from "react";
import { 
  BarChart3, TrendingUp, FileText, FolderOpen, 
  Clock, Activity, Target, Zap, Calendar,
  Users, GitBranch, Eye
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

interface AnalyticsDashboardProps {
  projects: Project[];
  docs: Doc[];
}

export default function AnalyticsDashboard({ projects, docs }: AnalyticsDashboardProps) {
  // Calculate analytics
  const analytics = React.useMemo(() => {
    const totalProjects = projects.length;
    const totalDocs = docs.length;
    
    // Docs by project
    const docsByProject = projects.map(p => ({
      project: p,
      count: docs.filter(d => d.project?.id === p.id).length
    })).sort((a, b) => b.count - a.count);

    // Activity timeline
    const now = Date.now();
    const last24h = docs.filter(d => now - new Date(d.updatedAt).getTime() < 24 * 60 * 60 * 1000).length;
    const last7d = docs.filter(d => now - new Date(d.updatedAt).getTime() < 7 * 24 * 60 * 60 * 1000).length;
    const last30d = docs.filter(d => now - new Date(d.updatedAt).getTime() < 30 * 24 * 60 * 60 * 1000).length;

    // Average docs per project
    const avgDocsPerProject = totalProjects > 0 ? (totalDocs / totalProjects).toFixed(1) : "0";

    // Most active project
    const mostActiveProject = docsByProject[0];

    // Recent activity by day (last 14 days)
    const activityByDay: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = docs.filter(d => {
        const docDate = new Date(d.updatedAt);
        return docDate >= date && docDate < nextDate;
      }).length;

      activityByDay.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }

    const maxActivity = Math.max(...activityByDay.map(d => d.count), 1);

    // Document creation timeline
    const creationByMonth: Record<string, number> = {};
    docs.forEach(d => {
      const month = new Date(d.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      creationByMonth[month] = (creationByMonth[month] || 0) + 1;
    });

    return {
      totalProjects,
      totalDocs,
      docsByProject,
      last24h,
      last7d,
      last30d,
      avgDocsPerProject,
      mostActiveProject,
      activityByDay,
      maxActivity,
      creationByMonth
    };
  }, [projects, docs]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FolderOpen className="w-8 h-8 opacity-80" />
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.totalProjects}</div>
          <div className="text-sm opacity-90">Total Projects</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 opacity-80" />
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.totalDocs}</div>
          <div className="text-sm opacity-90">Total Documents</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 opacity-80" />
            <div className="p-2 bg-white/20 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.avgDocsPerProject}</div>
          <div className="text-sm opacity-90">Avg Docs/Project</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 opacity-80" />
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.last24h}</div>
          <div className="text-sm opacity-90">Active Last 24h</div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Activity Timeline</h3>
            <p className="text-sm text-zinc-500">Document updates over the last 14 days</p>
          </div>
          <Activity className="w-5 h-5 text-zinc-400" />
        </div>
        
        <div className="flex items-end justify-between gap-2 h-48">
          {analytics.activityByDay.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center" style={{ height: '140px' }}>
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer relative group"
                  style={{ 
                    height: `${(day.count / analytics.maxActivity) * 100}%`,
                    minHeight: day.count > 0 ? '8px' : '0px'
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.count} updates
                  </div>
                </div>
              </div>
              <div className="text-xs text-zinc-500 text-center transform -rotate-45 origin-top-left whitespace-nowrap">
                {day.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <Clock className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Last 24 hours</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{analytics.last24h}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Last 7 days</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{analytics.last7d}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Last 30 days</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{analytics.last30d}</span>
            </div>
          </div>
        </div>

        {/* Top Projects */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Top Projects</h3>
            <TrendingUp className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="space-y-3">
            {analytics.docsByProject.slice(0, 5).map((item, idx) => (
              <div key={item.project.id} className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                  idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                  idx === 1 ? 'bg-gradient-to-br from-zinc-300 to-zinc-400 text-white' :
                  idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                  'bg-zinc-100 text-zinc-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.project.name}</div>
                  <div className="text-xs text-zinc-500">{item.project.key}</div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-zinc-100 rounded-full">
                  <FileText className="w-3 h-3 text-zinc-600" />
                  <span className="text-sm font-semibold text-zinc-700">{item.count}</span>
                </div>
              </div>
            ))}
            {analytics.docsByProject.length === 0 && (
              <div className="text-sm text-zinc-500 text-center py-4">No projects yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Document Distribution */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Document Distribution</h3>
            <p className="text-sm text-zinc-500">Documents per project</p>
          </div>
          <BarChart3 className="w-5 h-5 text-zinc-400" />
        </div>
        
        <div className="space-y-3">
          {analytics.docsByProject.map((item) => {
            const percentage = analytics.totalDocs > 0 ? (item.count / analytics.totalDocs) * 100 : 0;
            return (
              <div key={item.project.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.project.name}</span>
                  <span className="text-zinc-500">{item.count} docs ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {analytics.docsByProject.length === 0 && (
            <div className="text-sm text-zinc-500 text-center py-4">No documents yet</div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-blue-900">Most Active</div>
          </div>
          {analytics.mostActiveProject ? (
            <>
              <div className="text-lg font-bold text-blue-900">{analytics.mostActiveProject.project.name}</div>
              <div className="text-sm text-blue-700">{analytics.mostActiveProject.count} documents</div>
            </>
          ) : (
            <div className="text-sm text-blue-700">No data yet</div>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-purple-900">Total Coverage</div>
          </div>
          <div className="text-lg font-bold text-purple-900">{analytics.totalProjects} Projects</div>
          <div className="text-sm text-purple-700">{analytics.totalDocs} documents total</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-emerald-900">Growth Rate</div>
          </div>
          <div className="text-lg font-bold text-emerald-900">+{analytics.last7d}</div>
          <div className="text-sm text-emerald-700">Updates this week</div>
        </div>
      </div>
    </div>
  );
}
