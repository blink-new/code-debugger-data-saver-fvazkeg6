import React, { useState } from 'react';
import { themes, Theme, applyTheme } from '@/lib/themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Check, Monitor, Sun, Moon } from 'lucide-react';

interface ThemeCustomizerProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeCustomizer({ currentTheme, onThemeChange }: ThemeCustomizerProps) {
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  const handleThemePreview = (theme: Theme) => {
    setPreviewTheme(theme);
    applyTheme(theme);
  };

  const handleThemeSelect = (theme: Theme) => {
    setPreviewTheme(null);
    onThemeChange(theme);
    applyTheme(theme);
  };

  const handleCancelPreview = () => {
    if (previewTheme) {
      setPreviewTheme(null);
      applyTheme(currentTheme);
    }
  };

  const ThemePreview = ({ theme }: { theme: Theme }) => (
    <div className="relative">
      <div 
        className="w-full h-24 rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:scale-105"
        style={{ 
          borderColor: theme.id === currentTheme.id ? theme.colors.primary : 'transparent',
          backgroundColor: theme.colors.background 
        }}
        onClick={() => handleThemePreview(theme)}
      >
        {/* Mini IDE preview */}
        <div className="h-full flex">
          {/* Activity bar */}
          <div 
            className="w-3 h-full"
            style={{ backgroundColor: theme.colors.sidebar.background }}
          />
          
          {/* Sidebar */}
          <div 
            className="w-8 h-full border-r"
            style={{ 
              backgroundColor: theme.colors.sidebar.background,
              borderColor: theme.colors.border 
            }}
          />
          
          {/* Editor area */}
          <div className="flex-1 flex flex-col">
            {/* Tab bar */}
            <div 
              className="h-2 border-b"
              style={{ 
                backgroundColor: theme.colors.muted,
                borderColor: theme.colors.border 
              }}
            />
            
            {/* Editor */}
            <div 
              className="flex-1"
              style={{ backgroundColor: theme.colors.editor.background }}
            >
              <div className="p-1 space-y-0.5">
                <div 
                  className="h-0.5 w-8 rounded"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="h-0.5 w-6 rounded"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <div 
                  className="h-0.5 w-10 rounded"
                  style={{ backgroundColor: theme.colors.foreground, opacity: 0.7 }}
                />
              </div>
            </div>
            
            {/* Status bar */}
            <div 
              className="h-1"
              style={{ backgroundColor: theme.colors.statusBar.background }}
            />
          </div>
        </div>
        
        {/* Selection indicator */}
        {theme.id === currentTheme.id && (
          <div className="absolute top-1 right-1">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Check className="w-2 h-2 text-white" />
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center">
        <h4 className="text-sm font-medium">{theme.name}</h4>
        <div className="flex justify-center gap-1 mt-1">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.colors.accent }}
          />
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.colors.warning }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme Customization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current theme info */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">Current Theme</h3>
                <p className="text-sm text-muted-foreground">{currentTheme.name}</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            {/* Theme grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <ThemePreview key={theme.id} theme={theme} />
              ))}
            </div>

            {/* Preview controls */}
            {previewTheme && (
              <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Previewing: {previewTheme.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Click "Apply" to make this your active theme
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancelPreview}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleThemeSelect(previewTheme)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

            {/* Theme categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Theme Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">Dark Themes</span>
                  <Badge variant="secondary" className="ml-auto">
                    {themes.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded opacity-50">
                  <Sun className="w-4 h-4" />
                  <span className="text-sm">Light Themes</span>
                  <Badge variant="secondary" className="ml-auto">
                    0
                  </Badge>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded opacity-50">
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm">Auto</span>
                  <Badge variant="secondary" className="ml-auto">
                    Soon
                  </Badge>
                </div>
              </div>
            </div>

            {/* Color palette preview */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Color Palette</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(currentTheme.colors).map(([key, value]) => {
                  if (typeof value === 'string') {
                    return (
                      <div key={key} className="text-center">
                        <div 
                          className="w-full h-8 rounded border"
                          style={{ backgroundColor: value }}
                          title={`${key}: ${value}`}
                        />
                        <p className="text-xs mt-1 capitalize">{key}</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}