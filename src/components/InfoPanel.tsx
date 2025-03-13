import { AWSRegion } from '@/types/aws';
import { useState } from 'react';

interface InfoPanelProps {
  region: AWSRegion | null;
}

export default function InfoPanel({ region }: InfoPanelProps) {
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  // If no region is selected, only show the hint text
  if (!region) {
    return (
      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg">
        <p className="text-sm opacity-80">
          <strong>How to use:</strong> Drag to rotate • Scroll to zoom • Click regions to explore
        </p>
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
    <div className="absolute bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-sm">
      <h2 className="text-xl font-bold mb-2">{region.name}</h2>
      <div className="space-y-1 text-sm">
        <p>Region Code: <span className="font-mono">{region.code}</span></p>
        {region.isLocalZone ? (
          <p>Type: <span className="font-mono text-blue-400">Local Zone</span></p>
        ) : (
          <div>
            <div className="flex justify-between items-center">
              <p>Availability Zones: {region.availabilityZones}</p>
              <button 
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded ml-2"
              >
                {showDetailedView ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            {showDetailedView && (
              <div className="mt-2 ml-4 space-y-1 border-l-2 border-blue-500 pl-2">
                {availabilityZones.map((zone) => (
                  <div key={zone} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
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
      <div className="mt-3 pt-2 border-t border-gray-700">
        <p className="text-xs opacity-80">
          <strong>How to use:</strong> Drag to rotate • Scroll to zoom • Click regions to explore
        </p>
      </div>
    </div>
  );
} 