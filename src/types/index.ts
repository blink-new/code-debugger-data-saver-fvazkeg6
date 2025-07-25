// MVP Types for DebugVault
export interface DebugSession {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  status: 'active' | 'resolved' | 'archived';
}

export interface CodeSnippet {
  id: string;
  sessionId: string;
  userId: string;
  title: string;
  code: string;
  language: string;
  filePath?: string;
  lineNumber?: number;
  createdAt: string;
}

export interface ErrorLog {
  id: string;
  sessionId: string;
  userId: string;
  title: string;
  message: string;
  stackTrace?: string;
  errorType: 'syntax' | 'runtime' | 'logic' | 'network' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
}

export type ViewMode = 'dashboard' | 'sessions' | 'snippets' | 'errors' | 'search' | 'settings';

export interface SearchFilters {
  query: string;
  type?: 'sessions' | 'snippets' | 'errors';
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  status?: string;
  severity?: string;
}