import React, { useState, useEffect } from 'react'
import { createClient } from '@blinkdotnew/sdk'

import { ThemeProvider } from './contexts/ThemeContext'
import { IDELayout } from './components/ide/IDELayout'
import Dashboard from './components/dashboard/Dashboard'
import SessionsView from './components/sessions/SessionsView'
import CodeSnippetsView from './components/snippets/CodeSnippetsView'
import ErrorLogsView from './components/errors/ErrorLogsView'
import SearchView from './components/search/SearchView'

const blink = createClient({
  projectId: 'code-debugger-data-saver-fvazkeg6',
  authRequired: true
})

type ViewMode = 'dashboard' | 'sessions' | 'snippets' | 'errors' | 'search' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState(0)
  const [warnings, setWarnings] = useState(0)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Load error and warning counts
  useEffect(() => {
    const loadCounts = async () => {
      if (!user) return
      
      try {
        const errorLogs = await blink.db.errorLogs.list({
          where: { userId: user.id, status: 'open' }
        })
        
        const errorCount = errorLogs.filter(log => log.severity === 'critical' || log.severity === 'high').length
        const warningCount = errorLogs.filter(log => log.severity === 'medium').length
        
        setErrors(errorCount)
        setWarnings(warningCount)
      } catch (error) {
        console.error('Failed to load counts:', error)
      }
    }

    loadCounts()
  }, [user])

  const handleNewSession = () => {
    setCurrentView('sessions')
    // Additional logic for creating new session
  }

  const handleSaveSession = () => {
    // Logic for saving current session
    console.log('Saving session...')
  }

  const handleExportData = () => {
    // Logic for exporting data
    console.log('Exporting data...')
  }

  const handleImportData = () => {
    // Logic for importing data
    console.log('Importing data...')
  }

  const handleRefreshData = () => {
    // Logic for refreshing data
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-primary">Loading DebugVault Pro...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-4">DebugVault Pro IDE</div>
          <div className="text-secondary">Please sign in to continue</div>
          <button
            onClick={() => blink.auth.login()}
            className="mt-4 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'sessions':
        return <SessionsView />
      case 'snippets':
        return <CodeSnippetsView />
      case 'errors':
        return <ErrorLogsView />
      case 'search':
        return <SearchView />
      case 'settings':
        return (
          <div className="p-8 bg-primary text-primary">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-secondary">Settings panel coming soon...</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <ThemeProvider>
      <IDELayout
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
        errors={errors}
        warnings={warnings}
        currentFile="debug-session.ts"
        onNewSession={handleNewSession}
        onSaveSession={handleSaveSession}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onRefreshData={handleRefreshData}
      >
        {renderCurrentView()}
      </IDELayout>
    </ThemeProvider>
  )
}

export default App