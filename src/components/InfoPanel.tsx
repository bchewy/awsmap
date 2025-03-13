'use client';

import { AWSRegion } from '@/types/aws';
import { useState } from 'react';
import { useTheme, ThemeName, themeStyles } from '@/contexts/ThemeContext';

interface InfoPanelProps {
  region: AWSRegion | null;
}

export default function InfoPanel({ region }: InfoPanelProps) {
  const [showDetailedView, setShowDetailedView] = useState(false);
  const { theme, setTheme } = useTheme();
  const styles = themeStyles[theme];
  
  // Theme options with icons
  const themeOptions: { name: ThemeName, icon: string, label: string }[] = [
    { name: 'dark', icon: '🌑', label: 'Dark' },
    { name: 'light', icon: '☀️', label: 'Light' },
    { name: 'cosmic', icon: '✨', label: 'Cosmic' },
    { name: 'forest', icon: '🌲', label: 'Forest' },
    { name: 'ocean', icon: '🌊', label: 'Ocean' },
  ];
  
  // Theme switcher component
  const ThemeSwitcher = () => (
    <div className="mt-3 pt-2 border-t border-opacity-30" style={{ borderColor: 'var(--accent)' }}>
      <p className="text-xs mb-2 opacity-80">Theme:</p>
      <div className="flex flex-wrap gap-2">
        {themeOptions.map((option) => (
          <button
            key={option.name}
            onClick={() => setTheme(option.name)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              theme === option.name 
                ? 'ring-1 ring-opacity-50' 
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{ 
              backgroundColor: theme === option.name ? 'var(--accent)' : 'transparent',
              color: theme === option.name ? 'var(--background)' : 'var(--foreground)',
              ringColor: 'var(--accent)'
            }}
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
  
  // If no region is selected, show the hint text and theme switcher
  if (!region) {
    return (
      <div className={`absolute bottom-4 right-4 ${styles.panelBg} text-white p-4 rounded-lg transition-colors`} style={{ color: 'var(--foreground)' }}>
        <p className="text-sm opacity-80">
          <strong>How to use:</strong> Drag to rotate • Scroll to zoom • Click regions to explore
        </p>
        <ThemeSwitcher />
      </div>
    );
  }

  // Generate availability zone names for the region (not for local zones)
  const availabilityZones = !region.isLocalZone 
    ? Array.from({ length: region.availabilityZones }).map((_, index) => {
        const zoneSuffix = String.fromCharCode(97 + index); // a, b, c, etc.
        return `${region.code}${zoneSuffix}`;
      })
    : [];

  return (
    <div className={`absolute bottom-4 right-4 ${styles.panelBg} p-4 rounded-lg max-w-sm transition-colors`} style={{ color: 'var(--foreground)' }}>
      <h2 className="text-xl font-bold mb-2">{region.name}</h2>
      <div className="space-y-1 text-sm">
        <p>Region Code: <span className="font-mono">{region.code}</span></p>
        {region.isLocalZone ? (
          <p>Type: <span className={`font-mono ${styles.textAccent}`}>Local Zone</span></p>
        ) : (
          <div>
            <div className="flex justify-between items-center">
              <p>Availability Zones: {region.availabilityZones}</p>
              <button 
                onClick={() => setShowDetailedView(!showDetailedView)}
                className={`text-xs ${styles.buttonBg} px-2 py-1 rounded ml-2 transition-colors`}
              >
                {showDetailedView ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            {showDetailedView && (
              <div className="mt-2 ml-4 space-y-1 border-l-2 pl-2" style={{ borderColor: 'var(--accent)' }}>
                {availabilityZones.map((zone) => (
                  <div key={zone} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${styles.zoneDot} mr-2`}></div>
                    <p className="font-mono text-xs">{zone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <p>Launched: {region.launched}</p>
        <p className="text-xs mt-2 text-gray-400">
          Location: {region.location.lat.toFixed(2)}°N, {region.location.lng.toFixed(2)}°E
        </p>
      </div>
      <div className={`mt-3 pt-2 border-t ${styles.borderColor}`}>
        <p className="text-xs opacity-80">
          <strong>How to use:</strong> Drag to rotate • Scroll to zoom • Click regions to explore
        </p>
      </div>
      <ThemeSwitcher />
    </div>
  );
} 