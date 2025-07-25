import React from 'react'
import { Check, Palette } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import type { ThemeName } from '../../contexts/theme'

interface ThemePickerProps {
  isOpen: boolean
  onClose: () => void
}

export const ThemePicker: React.FC<ThemePickerProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, themes } = useTheme()

  const handleThemeSelect = (themeName: ThemeName) => {
    setTheme(themeName)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-theme">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-medium text-primary">Choose Theme</h3>
          </div>
        </div>
        
        <div className="command-palette-results">
          {themes.map((theme) => (
            <div
              key={theme.name}
              className={`command-palette-item ${currentTheme === theme.name ? 'selected' : ''}`}
              onClick={() => handleThemeSelect(theme.name)}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex space-x-1">
                  <div 
                    className="w-3 h-3 rounded-sm border border-theme"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-sm border border-theme"
                    style={{ backgroundColor: theme.colors.background }}
                  />
                  <div 
                    className="w-3 h-3 rounded-sm border border-theme"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="title">{theme.displayName}</div>
                  <div className="text-xs text-secondary mt-1">{theme.description}</div>
                </div>
              </div>
              
              {currentTheme === theme.name && (
                <Check className="w-4 h-4 text-accent" />
              )}
            </div>
          ))}
        </div>
        
        <div className="p-3 border-t border-theme text-xs text-secondary">
          <p>Themes are automatically saved to your preferences</p>
        </div>
      </div>
    </div>
  )
}