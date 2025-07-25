import { useState, useEffect } from 'react';
import { createClient } from '@blinkdotnew/sdk';
import { DebugSession, CodeSnippet, ErrorLog } from '../../types';
import { 
  FolderOpen, 
  Code2, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const blink = createClient({
  projectId: 'code-debugger-data-saver-fvazkeg6',
  authRequired: true
});

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalSnippets: 0,
    totalErrors: 0,
    resolvedErrors: 0
  });
  const [recentSessions, setRecentSessions] = useState<DebugSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me();
      
      // Load stats
      const [sessions, snippets, errors] = await Promise.all([
        blink.db.debugSessions.list({ where: { userId: user.id } }),
        blink.db.codeSnippets.list({ where: { userId: user.id } }),
        blink.db.errorLogs.list({ where: { userId: user.id } })
      ]);

      const resolvedErrors = errors.filter(error => error.status === 'resolved').length;

      setStats({
        totalSessions: sessions.length,
        totalSnippets: snippets.length,
        totalErrors: errors.length,
        resolvedErrors
      });

      // Load recent sessions
      const recent = await blink.db.debugSessions.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 5
      });
      
      setRecentSessions(recent);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const resolutionRate = stats.totalErrors > 0 
    ? Math.round((stats.resolvedErrors / stats.totalErrors) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your debugging activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Sessions</p>
              <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Code Snippets</p>
              <p className="text-2xl font-bold text-white">{stats.totalSnippets}</p>
            </div>
            <Code2 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Error Logs</p>
              <p className="text-2xl font-bold text-white">{stats.totalErrors}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Resolution Rate</p>
              <p className="text-2xl font-bold text-white">{resolutionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
        </div>
        <div className="p-6">
          {recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No debugging sessions yet</p>
              <p className="text-sm text-slate-500">Create your first session to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{session.title}</h3>
                    {session.description && (
                      <p className="text-sm text-slate-400 mt-1">{session.description}</p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'resolved' 
                        ? 'bg-green-900 text-green-300'
                        : session.status === 'active'
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-slate-600 text-slate-300'
                    }`}>
                      {session.status}
                    </span>
                    {session.status === 'resolved' && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}