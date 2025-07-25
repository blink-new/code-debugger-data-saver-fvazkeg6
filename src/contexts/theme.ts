import { createContext } from 'react'

export type ThemeName = 'vscode-dark' | 'monokai' | 'dracula' | 'github-dark' | 'one-dark-pro'

export interface ThemeContextType {
  currentTheme: ThemeName
  setTheme: (theme: ThemeName) => void
  themes: Array<{
    name: ThemeName
    displayName: string
    description: string
    colors: {
      primary: string
      accent: string
      background: string
    }
  }>
}

export const themes = [
  {
    name: 'vscode-dark' as ThemeName,
    displayName: 'VS Code Dark',
    description: 'The classic VS Code dark theme',
    colors: {
      primary: '#1e1e1e',
      accent: '#007acc',
      background: '#252526'
    }
  },
  {
    name: 'monokai' as ThemeName,
    displayName: 'Monokai',
    description: 'The popular Monokai color scheme',
    colors: {
      primary: '#272822',
      accent: '#a6e22e',
      background: '#3e3d32'
    }
  },
  {
    name: 'dracula' as ThemeName,
    displayName: 'Dracula',
    description: 'A dark theme for the masses',
    colors: {
      primary: '#282a36',
      accent: '#bd93f9',
      background: '#44475a'
    }
  },
  {
    name: 'github-dark' as ThemeName,
    displayName: 'GitHub Dark',
    description: 'GitHub\'s dark theme',
    colors: {
      primary: '#0d1117',
      accent: '#2f81f7',
      background: '#161b22'
    }
  },
  {
    name: 'one-dark-pro' as ThemeName,
    displayName: 'One Dark Pro',
    description: 'Atom\'s iconic One Dark theme',
    colors: {
      primary: '#282c34',
      accent: '#528bff',
      background: '#21252b'
    }
  }
]

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)