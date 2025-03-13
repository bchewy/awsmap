'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'dark' | 'light' | 'cosmic' | 'forest' | 'ocean';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const defaultContext: ThemeContextType = {
  theme: 'dark',
  setTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const themeStyles = {
  dark: {
    background: '#0a0a0a', 
    foreground: '#ededed',
    accent: '#3b82f6',
    panelBg: 'bg-black/80',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    zoneDot: 'bg-blue-400',
    borderColor: 'border-gray-700',
    textAccent: 'text-blue-400',
  },
  light: {
    background: '#ffffff',
    foreground: '#171717',
    accent: '#2563eb',
    panelBg: 'bg-white/90',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    zoneDot: 'bg-blue-500',
    borderColor: 'border-gray-300',
    textAccent: 'text-blue-600',
  },
  cosmic: {
    background: '#0f0f23',
    foreground: '#e2e8f0',
    accent: '#d946ef',
    panelBg: 'bg-indigo-950/80',
    buttonBg: 'bg-purple-600 hover:bg-purple-700',
    zoneDot: 'bg-purple-400',
    borderColor: 'border-indigo-800',
    textAccent: 'text-purple-400',
  },
  forest: {
    background: '#0f1f0f',
    foreground: '#e2e8e0',
    accent: '#22c55e',
    panelBg: 'bg-green-950/80',
    buttonBg: 'bg-green-600 hover:bg-green-700',
    zoneDot: 'bg-green-400',
    borderColor: 'border-green-800',
    textAccent: 'text-green-400',
  },
  ocean: {
    background: '#0c192f',
    foreground: '#e2e8f0',
    accent: '#0ea5e9',
    panelBg: 'bg-blue-950/80',
    buttonBg: 'bg-cyan-600 hover:bg-cyan-700',
    zoneDot: 'bg-cyan-400',
    borderColor: 'border-blue-800',
    textAccent: 'text-cyan-400',
  }
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeName>('dark');

  useEffect(() => {
    const root = document.documentElement;
    const styles = themeStyles[theme];
    
    root.style.setProperty('--background', styles.background);
    root.style.setProperty('--foreground', styles.foreground);
    root.style.setProperty('--accent', styles.accent);
    
    // Add a data-theme attribute for class-based styling
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 