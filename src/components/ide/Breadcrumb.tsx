import React from 'react';
import { ChevronRight, Home, Folder, FileText } from 'lucide-react';

interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface BreadcrumbProps {
  currentView: string;
  currentFile?: string;
  onNavigate?: (path: string) => void;
}

export function Breadcrumb({ currentView, currentFile, onNavigate }: BreadcrumbProps) {
  const getViewBreadcrumbs = (view: string): BreadcrumbItem[] => {
    const baseBreadcrumbs: BreadcrumbItem[] = [
      {
        id: 'home',
        label: 'TeamDebug IDE',
        icon: <Home className="w-3 h-3" />,
        onClick: () => onNavigate?.('dashboard'),
      },
    ];

    switch (view) {
      case 'dashboard':
        return [
          ...baseBreadcrumbs,
          { id: 'dashboard', label: 'Dashboard', icon: <FileText className="w-3 h-3" /> },
        ];
      
      case 'sessions':
        return [
          ...baseBreadcrumbs,
          { id: 'debug', label: 'Debug', icon: <Folder className="w-3 h-3" /> },
          { id: 'sessions', label: 'Sessions' },
        ];
      
      case 'snippets':
        return [
          ...baseBreadcrumbs,
          { id: 'debug', label: 'Debug', icon: <Folder className="w-3 h-3" /> },
          { id: 'snippets', label: 'Code Snippets' },
        ];
      
      case 'errors':
        return [
          ...baseBreadcrumbs,
          { id: 'debug', label: 'Debug', icon: <Folder className="w-3 h-3" /> },
          { id: 'errors', label: 'Error Logs' },
        ];
      
      case 'ai-chat':
        return [
          ...baseBreadcrumbs,
          { id: 'ai', label: 'AI Features', icon: <Folder className="w-3 h-3" /> },
          { id: 'ai-chat', label: 'AI Assistant' },
        ];
      
      case 'pattern-recognition':
        return [
          ...baseBreadcrumbs,
          { id: 'ai', label: 'AI Features', icon: <Folder className="w-3 h-3" /> },
          { id: 'pattern-recognition', label: 'Pattern Recognition' },
        ];
      
      case 'workflow-designer':
        return [
          ...baseBreadcrumbs,
          { id: 'visual', label: 'Visual Debugging', icon: <Folder className="w-3 h-3" /> },
          { id: 'workflow-designer', label: 'Workflow Designer' },
        ];
      
      case 'execution-timeline':
        return [
          ...baseBreadcrumbs,
          { id: 'visual', label: 'Visual Debugging', icon: <Folder className="w-3 h-3" /> },
          { id: 'execution-timeline', label: 'Execution Timeline' },
        ];
      
      case 'team-dashboard':
        return [
          ...baseBreadcrumbs,
          { id: 'team', label: 'Team Collaboration', icon: <Folder className="w-3 h-3" /> },
          { id: 'team-dashboard', label: 'Team Dashboard' },
        ];
      
      case 'live-sessions':
        return [
          ...baseBreadcrumbs,
          { id: 'team', label: 'Team Collaboration', icon: <Folder className="w-3 h-3" /> },
          { id: 'live-sessions', label: 'Live Sessions' },
        ];
      
      case 'search':
        return [
          ...baseBreadcrumbs,
          { id: 'search', label: 'Search' },
        ];
      
      case 'settings':
        return [
          ...baseBreadcrumbs,
          { id: 'settings', label: 'Settings' },
        ];
      
      case 'terminal':
        return [
          ...baseBreadcrumbs,
          { id: 'terminal', label: 'Terminal' },
        ];
      
      default:
        return baseBreadcrumbs;
    }
  };

  const breadcrumbs = getViewBreadcrumbs(currentView);
  
  // Add current file if provided
  if (currentFile) {
    breadcrumbs.push({
      id: 'current-file',
      label: currentFile,
      icon: <FileText className="w-3 h-3" />,
    });
  }

  return (
    <div className="breadcrumb">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.id}>
          <div 
            className={`breadcrumb-item ${item.onClick ? 'cursor-pointer hover:text-primary' : ''}`}
            onClick={item.onClick}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </div>
          
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="w-3 h-3 breadcrumb-separator" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}