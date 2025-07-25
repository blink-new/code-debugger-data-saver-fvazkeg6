import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@blinkdotnew/sdk';
import { DebugSession, CodeSnippet, ErrorLog, SearchFilters } from '../../types';
import { 
  Search, 
  FolderOpen, 
  Code2, 
  AlertTriangle,
  Calendar,
  Tag,
  Filter,
  X
} from 'lucide-react';

const blink = createClient({
  projectId: 'code-debugger-data-saver-fvazkeg6',
  authRequired: true
});

export default function SearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: undefined,
    dateRange: undefined,
    tags: [],
    status: '',
    severity: ''
  });
  const [results, setResults] = useState({
    sessions: [] as DebugSession[],
    snippets: [] as CodeSnippet[],
    errors: [] as ErrorLog[]
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setResults({ sessions: [], snippets: [], errors: [] });
      return;
    }

    setLoading(true);
    try {
      const user = await blink.auth.me();
      const query = searchQuery.toLowerCase();

      // Search sessions
      const allSessions = await blink.db.debugSessions.list({
        where: { userId: user.id }
      });
      const filteredSessions = allSessions.filter(session => 
        session.title.toLowerCase().includes(query) ||
        (session.description && session.description.toLowerCase().includes(query)) ||
        (session.tags && JSON.parse(session.tags).some((tag: string) => 
          tag.toLowerCase().includes(query)
        ))
      );

      // Search snippets
      const allSnippets = await blink.db.codeSnippets.list({
        where: { userId: user.id }
      });
      const filteredSnippets = allSnippets.filter(snippet =>
        snippet.title.toLowerCase().includes(query) ||
        snippet.code.toLowerCase().includes(query) ||
        (snippet.filePath && snippet.filePath.toLowerCase().includes(query))
      );

      // Search errors
      const allErrors = await blink.db.errorLogs.list({
        where: { userId: user.id }
      });
      const filteredErrors = allErrors.filter(error =>
        error.title.toLowerCase().includes(query) ||
        error.message.toLowerCase().includes(query) ||
        (error.stackTrace && error.stackTrace.toLowerCase().includes(query))
      );

      // Apply additional filters
      let finalSessions = filteredSessions;
      let finalSnippets = filteredSnippets;
      let finalErrors = filteredErrors;

      if (filters.type) {
        if (filters.type !== 'sessions') finalSessions = [];
        if (filters.type !== 'snippets') finalSnippets = [];
        if (filters.type !== 'errors') finalErrors = [];
      }

      if (filters.status) {
        finalSessions = finalSessions.filter(s => s.status === filters.status);
        finalErrors = finalErrors.filter(e => e.status === filters.status);
      }

      if (filters.severity) {
        finalErrors = finalErrors.filter(e => e.severity === filters.severity);
      }

      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        finalSessions = finalSessions.filter(s => {
          const date = new Date(s.createdAt);
          return date >= startDate && date <= endDate;
        });
        
        finalSnippets = finalSnippets.filter(s => {
          const date = new Date(s.createdAt);
          return date >= startDate && date <= endDate;
        });
        
        finalErrors = finalErrors.filter(e => {
          const date = new Date(e.createdAt);
          return date >= startDate && date <= endDate;
        });
      }

      setResults({
        sessions: finalSessions,
        snippets: finalSnippets,
        errors: finalErrors
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, performSearch]);

  const clearFilters = () => {
    setFilters({
      query: '',
      type: undefined,
      dateRange: undefined,
      tags: [],
      status: '',
      severity: ''
    });
  };

  const totalResults = results.sessions.length + results.snippets.length + results.errors.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
        <p className="text-slate-400">Search across all your debugging data</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search sessions, code snippets, and error logs..."
        />
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-slate-300 hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            {(filters.type || filters.status || filters.severity || filters.dateRange) && (
              <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="sessions">Sessions</option>
                  <option value="snippets">Code Snippets</option>
                  <option value="errors">Error Logs</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Searching...</p>
        </div>
      ) : searchQuery ? (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <p className="text-slate-300">
              Found <span className="font-semibold text-white">{totalResults}</span> results for 
              <span className="font-semibold text-white"> "{searchQuery}"</span>
            </p>
            {totalResults > 0 && (
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                {results.sessions.length > 0 && (
                  <span>{results.sessions.length} sessions</span>
                )}
                {results.snippets.length > 0 && (
                  <span>{results.snippets.length} snippets</span>
                )}
                {results.errors.length > 0 && (
                  <span>{results.errors.length} errors</span>
                )}
              </div>
            )}
          </div>

          {totalResults === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-slate-400">Try adjusting your search query or filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sessions Results */}
              {results.sessions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FolderOpen className="w-5 h-5 mr-2" />
                    Sessions ({results.sessions.length})
                  </h2>
                  <div className="space-y-3">
                    {results.sessions.map((session) => {
                      const tags = session.tags ? JSON.parse(session.tags) : [];
                      return (
                        <div key={session.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1">{session.title}</h3>
                              {session.description && (
                                <p className="text-slate-300 text-sm mb-2">{session.description}</p>
                              )}
                              <div className="flex items-center text-xs text-slate-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(session.createdAt).toLocaleDateString()}
                                {tags.length > 0 && (
                                  <>
                                    <Tag className="w-3 h-3 ml-3 mr-1" />
                                    {tags.slice(0, 3).join(', ')}
                                    {tags.length > 3 && ` +${tags.length - 3} more`}
                                  </>
                                )}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'resolved' 
                                ? 'bg-green-900 text-green-300'
                                : session.status === 'active'
                                ? 'bg-blue-900 text-blue-300'
                                : 'bg-slate-600 text-slate-300'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Snippets Results */}
              {results.snippets.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Code2 className="w-5 h-5 mr-2" />
                    Code Snippets ({results.snippets.length})
                  </h2>
                  <div className="space-y-3">
                    {results.snippets.map((snippet) => (
                      <div key={snippet.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{snippet.title}</h3>
                            <div className="flex items-center text-xs text-slate-400 mb-2">
                              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded mr-2">
                                {snippet.language}
                              </span>
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(snippet.createdAt).toLocaleDateString()}
                              {snippet.filePath && (
                                <>
                                  <span className="mx-2">•</span>
                                  {snippet.filePath}
                                  {snippet.lineNumber && `:${snippet.lineNumber}`}
                                </>
                              )}
                            </div>
                            <pre className="text-slate-300 text-sm bg-slate-700 p-2 rounded overflow-x-auto">
                              {snippet.code.length > 200 
                                ? snippet.code.substring(0, 200) + '...'
                                : snippet.code
                              }
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors Results */}
              {results.errors.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Error Logs ({results.errors.length})
                  </h2>
                  <div className="space-y-3">
                    {results.errors.map((error) => (
                      <div key={error.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{error.title}</h3>
                            <p className="text-slate-300 text-sm mb-2">{error.message}</p>
                            <div className="flex items-center text-xs text-slate-400">
                              <span className={`px-2 py-1 rounded text-xs font-medium mr-2 ${
                                error.severity === 'critical' ? 'bg-red-900 text-red-300' :
                                error.severity === 'high' ? 'bg-orange-900 text-orange-300' :
                                error.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-blue-900 text-blue-300'
                              }`}>
                                {error.severity}
                              </span>
                              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded mr-2">
                                {error.errorType}
                              </span>
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(error.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            error.status === 'resolved' 
                              ? 'bg-green-900 text-green-300'
                              : error.status === 'investigating'
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {error.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Start searching</h3>
          <p className="text-slate-400">Enter a search query to find sessions, code snippets, and error logs</p>
        </div>
      )}
    </div>
  );
}