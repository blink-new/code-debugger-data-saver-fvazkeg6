import { useState, useEffect } from 'react';
import { createClient } from '@blinkdotnew/sdk';
import { DebugSession } from '../../types';
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  Tag,
  CheckCircle,
  AlertCircle,
  Archive,
  Download
} from 'lucide-react';

const blink = createClient({
  projectId: 'code-debugger-data-saver-fvazkeg6',
  authRequired: true
});

export default function SessionsView() {
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    tags: ''
  });

  const loadSessions = async () => {
    try {
      const user = await blink.auth.me();
      const sessionList = await blink.db.debugSessions.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setSessions(sessionList);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const createSession = async () => {
    if (!newSession.title.trim()) return;

    try {
      const user = await blink.auth.me();
      const tags = newSession.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      await blink.db.debugSessions.create({
        id: `session_${Date.now()}`,
        userId: user.id,
        title: newSession.title,
        description: newSession.description || undefined,
        tags: JSON.stringify(tags),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setNewSession({ title: '', description: '', tags: '' });
      setShowCreateForm(false);
      loadSessions();
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: 'active' | 'resolved' | 'archived') => {
    try {
      await blink.db.debugSessions.update(sessionId, {
        status,
        updatedAt: new Date().toISOString()
      });
      loadSessions();
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const exportSession = async (session: DebugSession) => {
    try {
      // Get session data with snippets and errors
      const [snippets, errors] = await Promise.all([
        blink.db.codeSnippets.list({ where: { sessionId: session.id } }),
        blink.db.errorLogs.list({ where: { sessionId: session.id } })
      ]);

      const tags = session.tags ? JSON.parse(session.tags) : [];
      
      const markdown = `# ${session.title}

**Created:** ${new Date(session.createdAt).toLocaleString()}
**Status:** ${session.status}
**Tags:** ${tags.join(', ')}

## Description
${session.description || 'No description provided'}

## Code Snippets (${snippets.length})
${snippets.map(snippet => `
### ${snippet.title}
**Language:** ${snippet.language}
${snippet.filePath ? `**File:** ${snippet.filePath}` : ''}
${snippet.lineNumber ? `**Line:** ${snippet.lineNumber}` : ''}

\`\`\`${snippet.language}
${snippet.code}
\`\`\`
`).join('\n')}

## Error Logs (${errors.length})
${errors.map(error => `
### ${error.title}
**Type:** ${error.errorType}
**Severity:** ${error.severity}
**Status:** ${error.status}

**Message:** ${error.message}

${error.stackTrace ? `**Stack Trace:**
\`\`\`
${error.stackTrace}
\`\`\`
` : ''}
`).join('\n')}

---
*Exported from DebugVault MVP*
`;

      // Download as file
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export session:', error);
    }
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Debug Sessions</h1>
          <p className="text-slate-400">Manage your debugging sessions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Session</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter session title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe what you're debugging"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newSession.tags}
                onChange={(e) => setNewSession({ ...newSession, tags: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="react, api, bug"
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
                onClick={createSession}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No sessions yet</h3>
          <p className="text-slate-400 mb-6">Create your first debugging session to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create First Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const tags = session.tags ? JSON.parse(session.tags) : [];
            
            return (
              <div key={session.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-white mr-3">{session.title}</h3>
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
                    
                    {session.description && (
                      <p className="text-slate-300 mb-3">{session.description}</p>
                    )}
                    
                    <div className="flex items-center text-sm text-slate-400 mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      Created {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                    
                    {tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        {tags.map((tag: string, index: number) => (
                          <span key={index} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => exportSession(session)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Export as Markdown"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    {session.status === 'active' && (
                      <button
                        onClick={() => updateSessionStatus(session.id, 'resolved')}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Mark as Resolved"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    {session.status !== 'archived' && (
                      <button
                        onClick={() => updateSessionStatus(session.id, 'archived')}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Archive Session"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}