import React, { useState } from 'react';
import { X, FileText, Code, Bug, Settings, Terminal, Users, Brain, Search } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  icon: React.ReactNode;
  isDirty: boolean;
  isActive: boolean;
  closable: boolean;
}

interface TabBarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onCloseTab?: (tabId: string) => void;
}

export function TabBar({ currentView, onViewChange, onCloseTab }: TabBarProps) {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <FileText className="w-4 h-4" />,
      isDirty: false,
      isActive: currentView === 'dashboard',
      closable: false,
    },
    {
      id: 'sessions',
      title: 'Debug Sessions',
      icon: <Bug className="w-4 h-4" />,
      isDirty: true,
      isActive: currentView === 'sessions',
      closable: true,
    },
    {
      id: 'snippets',
      title: 'Code Snippets',
      icon: <Code className="w-4 h-4" />,
      isDirty: false,
      isActive: currentView === 'snippets',
      closable: true,
    },
    {
      id: 'ai-chat',
      title: 'AI Assistant',
      icon: <Brain className="w-4 h-4" />,
      isDirty: false,
      isActive: currentView === 'ai-chat',
      closable: true,
    },
  ]);

  const handleTabClick = (tabId: string) => {
    setTabs(tabs.map(tab => ({ ...tab, isActive: tab.id === tabId })));
    onViewChange(tabId);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const tabToClose = tabs.find(tab => tab.id === tabId);
    if (!tabToClose?.closable) return;

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    // If closing active tab, switch to the first remaining tab
    if (tabToClose.isActive && newTabs.length > 0) {
      const nextTab = newTabs[0];
      setTabs(newTabs.map(tab => ({ ...tab, isActive: tab.id === nextTab.id })));
      onViewChange(nextTab.id);
    }
    
    onCloseTab?.(tabId);
  };

  const handleMiddleClick = (tabId: string, e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      handleCloseTab(tabId, e);
    }
  };

  return (
    <div className="flex items-center bg-muted border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`ide-tab ${tab.isActive ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.id)}
          onMouseDown={(e) => handleMiddleClick(tab.id, e)}
          title={tab.title}
        >
          {tab.icon}
          <span className="truncate">
            {tab.title}
            {tab.isDirty && <span className="text-warning ml-1">•</span>}
          </span>
          
          {tab.closable && (
            <button
              className="close-button"
              onClick={(e) => handleCloseTab(tab.id, e)}
              title="Close tab"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      
      {/* Add new tab button */}
      <div className="flex items-center justify-center w-8 h-8 hover:bg-sidebar-hover cursor-pointer">
        <span className="text-lg leading-none">+</span>
      </div>
    </div>
  );
}