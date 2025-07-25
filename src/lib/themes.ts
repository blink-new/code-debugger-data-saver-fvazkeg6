export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    warning: string;
    success: string;
    // IDE specific colors
    editor: {
      background: string;
      foreground: string;
      selection: string;
      lineHighlight: string;
      cursor: string;
    };
    sidebar: {
      background: string;
      foreground: string;
      hover: string;
      active: string;
    };
    statusBar: {
      background: string;
      foreground: string;
      error: string;
      warning: string;
      info: string;
    };
    terminal: {
      background: string;
      foreground: string;
      cursor: string;
      selection: string;
    };
  };
}

export const themes: Theme[] = [
  {
    id: 'dark-plus',
    name: 'Dark+ (default dark)',
    colors: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      primary: '#007acc',
      secondary: '#2d2d30',
      accent: '#0e639c',
      muted: '#252526',
      border: '#3e3e42',
      input: '#3c3c3c',
      ring: '#007acc',
      destructive: '#f14c4c',
      warning: '#ffcc02',
      success: '#89d185',
      editor: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        selection: '#264f78',
        lineHighlight: '#2a2d2e',
        cursor: '#aeafad',
      },
      sidebar: {
        background: '#252526',
        foreground: '#cccccc',
        hover: '#2a2d2e',
        active: '#37373d',
      },
      statusBar: {
        background: '#007acc',
        foreground: '#ffffff',
        error: '#f14c4c',
        warning: '#ffcc02',
        info: '#75beff',
      },
      terminal: {
        background: '#0c0c0c',
        foreground: '#cccccc',
        cursor: '#ffffff',
        selection: '#264f78',
      },
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    colors: {
      background: '#272822',
      foreground: '#f8f8f2',
      primary: '#66d9ef',
      secondary: '#3e3d32',
      accent: '#a6e22e',
      muted: '#49483e',
      border: '#75715e',
      input: '#3e3d32',
      ring: '#66d9ef',
      destructive: '#f92672',
      warning: '#e6db74',
      success: '#a6e22e',
      editor: {
        background: '#272822',
        foreground: '#f8f8f2',
        selection: '#49483e',
        lineHighlight: '#3e3d32',
        cursor: '#f8f8f0',
      },
      sidebar: {
        background: '#3e3d32',
        foreground: '#f8f8f2',
        hover: '#49483e',
        active: '#75715e',
      },
      statusBar: {
        background: '#66d9ef',
        foreground: '#272822',
        error: '#f92672',
        warning: '#e6db74',
        info: '#66d9ef',
      },
      terminal: {
        background: '#1e1f1c',
        foreground: '#f8f8f2',
        cursor: '#f8f8f0',
        selection: '#49483e',
      },
    },
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    colors: {
      background: '#0d1117',
      foreground: '#e6edf3',
      primary: '#2f81f7',
      secondary: '#21262d',
      accent: '#238636',
      muted: '#30363d',
      border: '#30363d',
      input: '#21262d',
      ring: '#2f81f7',
      destructive: '#da3633',
      warning: '#d29922',
      success: '#238636',
      editor: {
        background: '#0d1117',
        foreground: '#e6edf3',
        selection: '#264f78',
        lineHighlight: '#161b22',
        cursor: '#e6edf3',
      },
      sidebar: {
        background: '#161b22',
        foreground: '#e6edf3',
        hover: '#21262d',
        active: '#30363d',
      },
      statusBar: {
        background: '#2f81f7',
        foreground: '#ffffff',
        error: '#da3633',
        warning: '#d29922',
        info: '#2f81f7',
      },
      terminal: {
        background: '#010409',
        foreground: '#e6edf3',
        cursor: '#e6edf3',
        selection: '#264f78',
      },
    },
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    colors: {
      background: '#282c34',
      foreground: '#abb2bf',
      primary: '#61afef',
      secondary: '#3e4451',
      accent: '#98c379',
      muted: '#4b5263',
      border: '#5c6370',
      input: '#3e4451',
      ring: '#61afef',
      destructive: '#e06c75',
      warning: '#e5c07b',
      success: '#98c379',
      editor: {
        background: '#282c34',
        foreground: '#abb2bf',
        selection: '#3e4451',
        lineHighlight: '#2c313c',
        cursor: '#528bff',
      },
      sidebar: {
        background: '#21252b',
        foreground: '#abb2bf',
        hover: '#2c313c',
        active: '#3e4451',
      },
      statusBar: {
        background: '#61afef',
        foreground: '#282c34',
        error: '#e06c75',
        warning: '#e5c07b',
        info: '#61afef',
      },
      terminal: {
        background: '#1e2127',
        foreground: '#abb2bf',
        cursor: '#528bff',
        selection: '#3e4451',
      },
    },
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    colors: {
      background: '#002b36',
      foreground: '#839496',
      primary: '#268bd2',
      secondary: '#073642',
      accent: '#859900',
      muted: '#586e75',
      border: '#586e75',
      input: '#073642',
      ring: '#268bd2',
      destructive: '#dc322f',
      warning: '#b58900',
      success: '#859900',
      editor: {
        background: '#002b36',
        foreground: '#839496',
        selection: '#073642',
        lineHighlight: '#073642',
        cursor: '#93a1a1',
      },
      sidebar: {
        background: '#073642',
        foreground: '#839496',
        hover: '#586e75',
        active: '#657b83',
      },
      statusBar: {
        background: '#268bd2',
        foreground: '#fdf6e3',
        error: '#dc322f',
        warning: '#b58900',
        info: '#268bd2',
      },
      terminal: {
        background: '#001e27',
        foreground: '#839496',
        cursor: '#93a1a1',
        selection: '#073642',
      },
    },
  },
];

export const defaultTheme = themes[0]; // Dark+ as default

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--muted', theme.colors.muted);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--input', theme.colors.input);
  root.style.setProperty('--ring', theme.colors.ring);
  root.style.setProperty('--destructive', theme.colors.destructive);
  root.style.setProperty('--warning', theme.colors.warning);
  root.style.setProperty('--success', theme.colors.success);
  
  // IDE specific colors
  root.style.setProperty('--editor-background', theme.colors.editor.background);
  root.style.setProperty('--editor-foreground', theme.colors.editor.foreground);
  root.style.setProperty('--editor-selection', theme.colors.editor.selection);
  root.style.setProperty('--editor-line-highlight', theme.colors.editor.lineHighlight);
  root.style.setProperty('--editor-cursor', theme.colors.editor.cursor);
  
  root.style.setProperty('--sidebar-background', theme.colors.sidebar.background);
  root.style.setProperty('--sidebar-foreground', theme.colors.sidebar.foreground);
  root.style.setProperty('--sidebar-hover', theme.colors.sidebar.hover);
  root.style.setProperty('--sidebar-active', theme.colors.sidebar.active);
  
  root.style.setProperty('--status-bar-background', theme.colors.statusBar.background);
  root.style.setProperty('--status-bar-foreground', theme.colors.statusBar.foreground);
  root.style.setProperty('--status-bar-error', theme.colors.statusBar.error);
  root.style.setProperty('--status-bar-warning', theme.colors.statusBar.warning);
  root.style.setProperty('--status-bar-info', theme.colors.statusBar.info);
  
  root.style.setProperty('--terminal-background', theme.colors.terminal.background);
  root.style.setProperty('--terminal-foreground', theme.colors.terminal.foreground);
  root.style.setProperty('--terminal-cursor', theme.colors.terminal.cursor);
  root.style.setProperty('--terminal-selection', theme.colors.terminal.selection);
  
  // Store theme preference
  localStorage.setItem('ide-theme', theme.id);
}

export function getStoredTheme(): Theme {
  const storedThemeId = localStorage.getItem('ide-theme');
  return themes.find(theme => theme.id === storedThemeId) || defaultTheme;
}