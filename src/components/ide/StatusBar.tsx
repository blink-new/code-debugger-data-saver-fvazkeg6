import React from 'react'
import { CheckCircle, AlertCircle, XCircle, Wifi, WifiOff, Clock, User } from 'lucide-react'

interface StatusBarProps {
  user?: {
    email: string
    name?: string
  }
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
  errors: number
  warnings: number
  currentFile?: string
  lineNumber?: number
  columnNumber?: number
  language?: string
  encoding?: string
  onThemeClick?: () => void
  onSettingsClick?: () => void
}

export const StatusBar: React.FC<StatusBarProps> = ({
  user,
  connectionStatus,
  errors,
  warnings,
  currentFile,
  lineNumber,
  columnNumber,
  language,
  encoding = 'UTF-8',
  onThemeClick,
  onSettingsClick
}) => {
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-3 h-3" />
      case 'disconnected':
        return <WifiOff className="w-3 h-3" />
      case 'connecting':
        return <div className="loading-spinner" />
      default:
        return <WifiOff className="w-3 h-3" />
    }
  }

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-success'
      case 'disconnected':
        return 'text-error'
      case 'connecting':
        return 'text-warning'
      default:
        return 'text-error'
    }
  }

  return (
    <div className="status-bar">
      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className={`status-bar-item ${getConnectionColor()}`}>
          {getConnectionIcon()}
          <span className="ml-1 text-xs">
            {connectionStatus === 'connected' ? 'Online' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
          </span>
        </div>

        {/* Error and Warning Count */}
        {errors > 0 && (
          <div className="status-bar-item text-error">
            <XCircle className="w-3 h-3" />
            <span className="ml-1 text-xs">{errors}</span>
          </div>
        )}
        
        {warnings > 0 && (
          <div className="status-bar-item text-warning">
            <AlertCircle className="w-3 h-3" />
            <span className="ml-1 text-xs">{warnings}</span>
          </div>
        )}

        {/* Current Time */}
        <div className="status-bar-item">
          <Clock className="w-3 h-3" />
          <span className="ml-1 text-xs">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* File Info */}
        {currentFile && (
          <>
            <div className="status-bar-item">
              <span className="text-xs">{currentFile}</span>
            </div>
            
            {lineNumber && columnNumber && (
              <div className="status-bar-item">
                <span className="text-xs">Ln {lineNumber}, Col {columnNumber}</span>
              </div>
            )}
            
            {language && (
              <div className="status-bar-item" onClick={onThemeClick}>
                <span className="text-xs">{language}</span>
              </div>
            )}
            
            <div className="status-bar-item">
              <span className="text-xs">{encoding}</span>
            </div>
          </>
        )}

        {/* User Info */}
        {user && (
          <div className="status-bar-item">
            <User className="w-3 h-3" />
            <span className="ml-1 text-xs">{user.name || user.email}</span>
          </div>
        )}

        {/* Settings */}
        <div className="status-bar-item" onClick={onSettingsClick}>
          <span className="text-xs cursor-pointer hover:text-accent">Settings</span>
        </div>
      </div>
    </div>
  )
}