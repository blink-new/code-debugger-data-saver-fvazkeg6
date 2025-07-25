import { useState, useEffect } from 'react';
import { createClient } from '@blinkdotnew/sdk';
import { CodeSnippet, DebugSession } from '../../types';
import Editor from '@monaco-editor/react';
import { 
  Plus, 
  Code2, 
  FileText,
  Copy,
  Check,
  Trash2
} from 'lucide-react';

const blink = createClient({
  projectId: 'code-debugger-data-saver-fvazkeg6',
  authRequired: true
});

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'json', 'xml'
];

export default function CodeSnippetsView() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newSnippet, setNewSnippet] = useState({
    sessionId: '',
    title: '',
    code: '',
    language: 'javascript',
    filePath: '',
    lineNumber: ''
  });

  const loadData = async () => {
    try {
      const user = await blink.auth.me();
      
      const [snippetList, sessionList] = await Promise.all([
        blink.db.codeSnippets.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        }),
        blink.db.debugSessions.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
      ]);
      
      setSnippets(snippetList);
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

  const createSnippet = async () => {
    if (!newSnippet.title.trim() || !newSnippet.code.trim() || !newSnippet.sessionId) return;

    try {
      const user = await blink.auth.me();
      
      await blink.db.codeSnippets.create({
        id: `snippet_${Date.now()}`,
        sessionId: newSnippet.sessionId,
        userId: user.id,
        title: newSnippet.title,
        code: newSnippet.code,
        language: newSnippet.language,
        filePath: newSnippet.filePath || undefined,
        lineNumber: newSnippet.lineNumber ? parseInt(newSnippet.lineNumber) : undefined,
        createdAt: new Date().toISOString()
      });

      setNewSnippet({
        sessionId: '',
        title: '',
        code: '',
        language: 'javascript',
        filePath: '',
        lineNumber: ''
      });
      setShowCreateForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to create snippet:', error);
    }
  };

  const deleteSnippet = async (snippetId: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return;
    
    try {
      await blink.db.codeSnippets.delete(snippetId);
      loadData();
    } catch (error) {
      console.error('Failed to delete snippet:', error);
    }
  };

  const copyToClipboard = async (code: string, snippetId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(snippetId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getSessionTitle = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.title || 'Unknown Session';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-700 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Code Snippets</h1>
          <p className="text-slate-400">Store and manage your code snippets</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Snippet
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Snippet</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Session *
                </label>
                <select
                  value={newSnippet.sessionId}
                  onChange={(e) => setNewSnippet({ ...newSnippet, sessionId: e.target.value })}
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
                  Language
                </label>
                <select
                  value={newSnippet.language}
                  onChange={(e) => setNewSnippet({ ...newSnippet, language: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
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
                value={newSnippet.title}
                onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter snippet title"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  File Path
                </label>
                <input
                  type="text"
                  value={newSnippet.filePath}
                  onChange={(e) => setNewSnippet({ ...newSnippet, filePath: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/src/components/App.tsx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Line Number
                </label>
                <input
                  type="number"
                  value={newSnippet.lineNumber}
                  onChange={(e) => setNewSnippet({ ...newSnippet, lineNumber: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="42"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Code *
              </label>
              <div className="border border-slate-600 rounded-lg overflow-hidden">
                <Editor
                  height="200px"
                  language={newSnippet.language}
                  value={newSnippet.code}
                  onChange={(value) => setNewSnippet({ ...newSnippet, code: value || '' })}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSnippet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snippets List */}
      {snippets.length === 0 ? (
        <div className="text-center py-12">
          <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No code snippets yet</h3>
          <p className="text-slate-400 mb-6">Save your first code snippet to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create First Snippet
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="bg-slate-800 rounded-lg border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-white mr-3">{snippet.title}</h3>
                      <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-medium">
                        {snippet.language}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-2">
                      Session: {getSessionTitle(snippet.sessionId)}
                    </p>
                    
                    {(snippet.filePath || snippet.lineNumber) && (
                      <div className="flex items-center text-sm text-slate-400">
                        <FileText className="w-4 h-4 mr-1" />
                        {snippet.filePath}
                        {snippet.lineNumber && `:${snippet.lineNumber}`}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(snippet.code, snippet.id)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Copy to Clipboard"
                    >
                      {copiedId === snippet.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteSnippet(snippet.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Delete Snippet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-slate-600 rounded-b-lg overflow-hidden">
                <Editor
                  height="300px"
                  language={snippet.language}
                  value={snippet.code}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}