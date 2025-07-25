import { ViewMode } from '../../types';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Code2, 
  AlertTriangle, 
  Search,
  User,
  LogOut
} from 'lucide-react';
import { createClient } from '@blinkdotnew/sdk';

const blink = createClient({
  projectId: 'code-debugger-data-saver-fvazkeg6',
  authRequired: true
});

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  user: any;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sessions', label: 'Sessions', icon: FolderOpen },
  { id: 'snippets', label: 'Code Snippets', icon: Code2 },
  { id: 'errors', label: 'Error Logs', icon: AlertTriangle },
  { id: 'search', label: 'Search', icon: Search },
];

export default function Sidebar({ currentView, onViewChange, user }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">DebugVault</h1>
        <p className="text-sm text-slate-400 mt-1">MVP Edition</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id as ViewMode)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email || 'Developer'}
            </p>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>
        <button
          onClick={() => blink.auth.logout()}
          className="w-full flex items-center px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}