import React, { useState, useCallback } from 'react'
import { 
  Home, 
  FileText, 
  Code, 
  Bug, 
  Search, 
  Settings, 
  Palette,
  Users,
  Terminal,
  Copy,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

import { ActivityBar, type ActivityBarItem } from './ActivityBar'
import { StatusBar } from './StatusBar'
import { CommandPalette, type Command } from './CommandPalette'
import { ContextMenu, type ContextMenuItem } from './ContextMenu'
import { ThemePicker } from './ThemePicker'
import { useKeyboardShortcuts, type KeyboardShortcut } from '../../hooks/useKeyboardShortcuts'
import { useTheme } from '../../hooks/useTheme'

interface IDELayoutProps {
  children: React.ReactNode
  currentView: string
  onViewChange: (view: string) => void
  user?: {
    email: string
    name?: string
  }
  errors?: number
  warnings?: number
  currentFile?: string
  onNewSession?: () => void
  onSaveSession?: () => void
  onExportData?: () => void
  onImportData?: () => void
  onRefreshData?: () => void
}

export const IDELayout: React.FC<IDELayoutProps> = ({
  children,
  currentView,
  onViewChange,
  user,
  errors = 0,
  warnings = 0,
  currentFile,
  onNewSession,
  onSaveSession,
  onExportData,
  onImportData,
  onRefreshData
}) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    items: ContextMenuItem[]
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    items: []
  })

  const { currentTheme } = useTheme()

  // Activity Bar Items
  const activityBarItems: ActivityBarItem[] = [
    {
      id: 'dashboard',
      icon: <Home className="w-4 h-4" />,
      label: 'Dashboard',
      active: currentView === 'dashboard',
      onClick: () => onViewChange('dashboard')
    },
    {
      id: 'sessions',
      icon: <Bug className="w-4 h-4" />,
      label: 'Debug Sessions',
      active: currentView === 'sessions',
      onClick: () => onViewChange('sessions')
    },
    {
      id: 'snippets',
      icon: <Code className="w-4 h-4" />,
      label: 'Code Snippets',
      active: currentView === 'snippets',
      onClick: () => onViewChange('snippets')
    },
    {
      id: 'errors',
      icon: <Terminal className="w-4 h-4" />,
      label: 'Error Logs',
      badge: errors,
      active: currentView === 'errors',
      onClick: () => onViewChange('errors')
    },
    {
      id: 'search',
      icon: <Search className="w-4 h-4" />,
      label: 'Search',
      active: currentView === 'search',
      onClick: () => onViewChange('search')
    },
    {
      id: 'settings',
      icon: <Settings className="w-4 h-4" />,
      label: 'Settings',
      active: currentView === 'settings',
      onClick: () => onViewChange('settings')
    }
  ]

  // Command Palette Commands
  const commands: Command[] = [
    {
      id: 'new-session',
      title: 'New Debug Session',
      description: 'Create a new debugging session',
      icon: <Bug className="w-4 h-4" />,
      action: () => onNewSession?.(),
      shortcut: 'Ctrl+N',
      category: 'Session'
    },
    {
      id: 'save-session',
      title: 'Save Current Session',
      description: 'Save the current debugging session',
      icon: <FileText className="w-4 h-4" />,
      action: () => onSaveSession?.(),
      shortcut: 'Ctrl+S',
      category: 'Session'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Export all debugging data',
      icon: <Download className="w-4 h-4" />,
      action: () => onExportData?.(),
      shortcut: 'Ctrl+E',
      category: 'Data'
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Import debugging data',
      icon: <Upload className="w-4 h-4" />,
      action: () => onImportData?.(),
      shortcut: 'Ctrl+I',
      category: 'Data'
    },
    {
      id: 'refresh-data',
      title: 'Refresh Data',
      description: 'Refresh all data from server',
      icon: <RefreshCw className="w-4 h-4" />,
      action: () => onRefreshData?.(),
      shortcut: 'F5',
      category: 'Data'
    },
    {
      id: 'change-theme',
      title: 'Change Theme',
      description: 'Switch between color themes',
      icon: <Palette className="w-4 h-4" />,
      action: () => setThemePickerOpen(true),
      shortcut: 'Ctrl+K Ctrl+T',
      category: 'Appearance'
    },
    {
      id: 'command-palette',
      title: 'Command Palette',
      description: 'Show all available commands',
      icon: <Terminal className="w-4 h-4" />,
      action: () => setCommandPaletteOpen(true),
      shortcut: 'Ctrl+Shift+P',
      category: 'General'
    },
    {
      id: 'go-dashboard',
      title: 'Go to Dashboard',
      description: 'Navigate to dashboard',
      icon: <Home className="w-4 h-4" />,
      action: () => onViewChange('dashboard'),
      shortcut: 'Ctrl+1',
      category: 'Navigation'
    },
    {
      id: 'go-sessions',
      title: 'Go to Sessions',
      description: 'Navigate to debug sessions',
      icon: <Bug className="w-4 h-4" />,
      action: () => onViewChange('sessions'),
      shortcut: 'Ctrl+2',
      category: 'Navigation'
    },
    {
      id: 'go-snippets',
      title: 'Go to Code Snippets',
      description: 'Navigate to code snippets',
      icon: <Code className="w-4 h-4" />,
      action: () => onViewChange('snippets'),
      shortcut: 'Ctrl+3',
      category: 'Navigation'
    },
    {
      id: 'go-search',
      title: 'Go to Search',
      description: 'Navigate to search',
      icon: <Search className="w-4 h-4" />,
      action: () => onViewChange('search'),
      shortcut: 'Ctrl+F',
      category: 'Navigation'
    }
  ]

  // Keyboard Shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      action: () => setCommandPaletteOpen(true),
      description: 'Open Command Palette',
      category: 'General'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => onNewSession?.(),
      description: 'New Debug Session',
      category: 'Session'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => onSaveSession?.(),
      description: 'Save Session',
      category: 'Session'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => onExportData?.(),
      description: 'Export Data',
      category: 'Data'
    },
    {
      key: 'i',
      ctrlKey: true,
      action: () => onImportData?.(),
      description: 'Import Data',
      category: 'Data'
    },
    {
      key: 'F5',
      action: () => onRefreshData?.(),
      description: 'Refresh Data',
      category: 'Data'
    },
    {
      key: '1',
      ctrlKey: true,
      action: () => onViewChange('dashboard'),
      description: 'Go to Dashboard',
      category: 'Navigation'
    },
    {
      key: '2',
      ctrlKey: true,
      action: () => onViewChange('sessions'),
      description: 'Go to Sessions',
      category: 'Navigation'
    },
    {
      key: '3',
      ctrlKey: true,
      action: () => onViewChange('snippets'),
      description: 'Go to Code Snippets',
      category: 'Navigation'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => onViewChange('search'),
      description: 'Go to Search',
      category: 'Navigation'
    }
  ]

  useKeyboardShortcuts(shortcuts)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    const contextItems: ContextMenuItem[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: <Copy className="w-4 h-4" />,
        action: () => navigator.clipboard.writeText(window.getSelection()?.toString() || ''),
        shortcut: 'Ctrl+C'
      },
      {
        id: 'separator1',
        label: '',
        action: () => {},
        separator: true
      },
      {
        id: 'new-session',
        label: 'New Debug Session',
        icon: <Bug className="w-4 h-4" />,
        action: () => onNewSession?.(),
        shortcut: 'Ctrl+N'
      },
      {
        id: 'save-session',
        label: 'Save Session',
        icon: <FileText className="w-4 h-4" />,
        action: () => onSaveSession?.(),
        shortcut: 'Ctrl+S'
      },
      {
        id: 'separator2',
        label: '',
        action: () => {},
        separator: true
      },
      {
        id: 'change-theme',
        label: 'Change Theme',
        icon: <Palette className="w-4 h-4" />,
        action: () => setThemePickerOpen(true)
      },
      {
        id: 'refresh',
        label: 'Refresh',
        icon: <RefreshCw className="w-4 h-4" />,
        action: () => onRefreshData?.(),
        shortcut: 'F5'
      }
    ]

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      items: contextItems
    })
  }, [onNewSession, onSaveSession, onRefreshData])

  return (
    <div className="ide-container" onContextMenu={handleContextMenu}>
      <ActivityBar items={activityBarItems} activeItem={currentView} />
      
      <div className="main-content">
        <div className="flex-1 bg-primary">
          {children}
        </div>
        
        <StatusBar
          user={user}
          connectionStatus="connected"
          errors={errors}
          warnings={warnings}
          currentFile={currentFile}
          lineNumber={1}
          columnNumber={1}
          language="TypeScript"
          onThemeClick={() => setThemePickerOpen(true)}
          onSettingsClick={() => onViewChange('settings')}
        />
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={contextMenu.items}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
      />

      <ThemePicker
        isOpen={themePickerOpen}
        onClose={() => setThemePickerOpen(false)}
      />
    </div>
  )
}