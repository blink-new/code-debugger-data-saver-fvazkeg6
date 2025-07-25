import { useState, useEffect } from 'react';
import { createClient } from '@blinkdotnew/sdk';
import { ErrorLog, DebugSession } from '../../types';
import { 
  Plus, 
  AlertTriangle, 
  AlertCircle,
  XCircle,
  CheckCircle,
  Clock,
  Filter,
  Trash2
} from 'lucide-react';

const blink = createClient({
  projectId: 'code-debugger-data-saver-fvazkeg6',
  authRequired: true
});

const ERROR_TYPES = [
  { value: 'syntax', label: 'Syntax Error' },
  { value: 'runtime', label: 'Runtime Error' },
  { value: 'logic', label: 'Logic Error' },
  { value: 'network', label: 'Network Error' },
  { value: 'database', label: 'Database Error' }
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-blue-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-400' }
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', icon: AlertCircle, color: 'text-red-400' },
  { value: 'investigating', label: 'Investigating', icon: Clock, color: 'text-yellow-400' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-400' }
];

export default function ErrorLogsView() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: ''
  });
  const [newError, setNewError] = useState({
    sessionId: '',
    title: '',
    message: '',
    stackTrace: '',
    errorType: 'runtime' as const,
    severity: 'medium' as const
  });

  const loadData = async () => {
    try {
      const user = await blink.auth.me();
      
      const [errorList, sessionList] = await Promise.all([
        blink.db.errorLogs.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        }),
        blink.db.debugSessions.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
      ]);
      
      setErrors(errorList);
      setSessions(sessionList);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createError = async () => {
    if (!newError.title.trim() || !newError.message.trim() || !newError.sessionId) return;

    try {
      const user = await blink.auth.me();
      
      await blink.db.errorLogs.create({
        id: `error_${Date.now()}`,
        sessionId: newError.sessionId,
        userId: user.id,
        title: newError.title,
        message: newError.message,
        stackTrace: newError.stackTrace || undefined,
        errorType: newError.errorType,
        severity: newError.severity,
        status: 'open',
        createdAt: new Date().toISOString()
      });

      setNewError({
        sessionId: '',
        title: '',
        message: '',
        stackTrace: '',
        errorType: 'runtime',
        severity: 'medium'
      });
      setShowCreateForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to create error log:', error);
    }
  };

  const updateErrorStatus = async (errorId: string, status: 'open' | 'investigating' | 'resolved') => {
    try {
      await blink.db.errorLogs.update(errorId, { status });
      loadData();
    } catch (error) {
      console.error('Failed to update error status:', error);
    }
  };

  const deleteError = async (errorId: string) => {
    if (!confirm('Are you sure you want to delete this error log?')) return;
    
    try {
      await blink.db.errorLogs.delete(errorId);
      loadData();
    } catch (error) {
      console.error('Failed to delete error log:', error);
    }
  };

  const getSessionTitle = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.title || 'Unknown Session';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return AlertCircle;
      case 'low': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const filteredErrors = errors.filter(error => {
    if (filters.type && error.errorType !== filters.type) return false;
    if (filters.severity && error.severity !== filters.severity) return false;
    if (filters.status && error.status !== filters.status) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Error Logs</h1>
          <p className="text-slate-400">Track and manage your error logs</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Error Log
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center mb-3">
          <Filter className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-sm font-medium text-slate-300">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {ERROR_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            {SEVERITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Error Log</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Session *
                </label>
                <select
                  value={newError.sessionId}
                  onChange={(e) => setNewError({ ...newError, sessionId: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Error Type
                </label>
                <select
                  value={newError.errorType}
                  onChange={(e) => setNewError({ ...newError, errorType: e.target.value as any })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ERROR_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Severity
                </label>
                <select
                  value={newError.severity}
                  onChange={(e) => setNewError({ ...newError, severity: e.target.value as any })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SEVERITY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newError.title}
                onChange={(e) => setNewError({ ...newError, title: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter error title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Error Message *
              </label>
              <textarea
                value={newError.message}
                onChange={(e) => setNewError({ ...newError, message: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the error message"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Stack Trace
              </label>
              <textarea
                value={newError.stackTrace}
                onChange={(e) => setNewError({ ...newError, stackTrace: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={6}
                placeholder="Paste stack trace here..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createError}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Error Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error List */}
      {filteredErrors.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {errors.length === 0 ? 'No error logs yet' : 'No errors match your filters'}
          </h3>
          <p className="text-slate-400 mb-6">
            {errors.length === 0 
              ? 'Create your first error log to get started'
              : 'Try adjusting your filters to see more results'
            }
          </p>
          {errors.length === 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create First Error Log
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredErrors.map((error) => {
            const SeverityIcon = getSeverityIcon(error.severity);
            const severityColor = SEVERITY_LEVELS.find(s => s.value === error.severity)?.color || 'text-slate-400';
            const statusOption = STATUS_OPTIONS.find(s => s.value === error.status);
            const StatusIcon = statusOption?.icon || AlertCircle;
            
            return (
              <div key={error.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <SeverityIcon className={`w-5 h-5 mr-2 ${severityColor}`} />
                      <h3 className="text-lg font-semibold text-white mr-3">{error.title}</h3>
                      <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-medium">
                        {ERROR_TYPES.find(t => t.value === error.errorType)?.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-2">
                      Session: {getSessionTitle(error.sessionId)}
                    </p>
                    
                    <div className="flex items-center text-sm text-slate-400 mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(error.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {STATUS_OPTIONS.map((status) => {
                        const Icon = status.icon;
                        return (
                          <button
                            key={status.value}
                            onClick={() => updateErrorStatus(error.id, status.value as any)}
                            className={`p-2 rounded-lg transition-colors ${
                              error.status === status.value
                                ? `${status.color} bg-slate-700`
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                            }`}
                            title={status.label}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => deleteError(error.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Delete Error Log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">Error Message</h4>
                    <p className="text-slate-200 bg-slate-700 p-3 rounded-lg font-mono text-sm">
                      {error.message}
                    </p>
                  </div>
                  
                  {error.stackTrace && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">Stack Trace</h4>
                      <pre className="text-slate-200 bg-slate-700 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                        {error.stackTrace}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}