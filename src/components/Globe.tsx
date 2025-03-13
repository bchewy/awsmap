'use client';

import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { AWSRegion, awsRegions } from '@/types/aws';
import InfoPanel from './InfoPanel';
import { useTheme, themeStyles } from '@/contexts/ThemeContext';

// Setup for WebGL context loss handling
function WebGLContextHandler() {
  const { gl, scene, camera } = useThree();
  const [, setContextLost] = useState(false);
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost - attempting to recover');
      setContextLost(true);
      
      // Release resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
    
    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setContextLost(false);
      
      // Force re-render
      gl.render(scene, camera);
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    // Lower GL performance settings
    gl.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);
    gl.setSize(window.innerWidth, window.innerHeight);
    gl.shadowMap.enabled = false;
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, scene, camera]);
  
  return null;
}

// Hexagonal AWS region marker with floating data points
function RegionMarker({ region, position, isSelected, onClick }: { 
  region: AWSRegion; 
  position: THREE.Vector3; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const { theme } = useTheme();
  const markerRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Color based on theme and selection
  const color = useMemo(() => {
    if (isSelected) {
      switch(theme) {
        case 'light': return '#2563eb';  // blue-600
        case 'dark': return '#FFFF00';   // yellow
        case 'cosmic': return '#d946ef'; // purple
        case 'forest': return '#22c55e'; // green
        case 'ocean': return '#0ea5e9';  // cyan
        default: return '#FFFF00';       // default yellow
      }
    } 
    return region.isLocalZone ? '#4488FF' : '#FF4444';
  }, [isSelected, region.isLocalZone, theme]);
  
  // Load pin emoji texture
  const pinTexture = useTexture('/textures/pin-emoji.png');
  
  // Simplified animation that doesn't modify position
  useFrame(({ clock }) => {
    if (markerRef.current) {
      // Only scale animation for selected/hovered markers
      if (isSelected || hovered) {
        const scale = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.1;
        markerRef.current.scale.set(scale, scale, scale);
      }
    }
  });

  // Calculate slightly elevated position to prevent z-fighting
  const elevatedPosition = useMemo(() => {
    // Create a position that's slightly above the globe surface (but not too much)
    const normalizedDirection = position.clone().normalize();
    return position.clone().add(normalizedDirection.multiplyScalar(0.005));
  }, [position]);

  return (
    <group 
      ref={markerRef}
      position={elevatedPosition}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      renderOrder={1} // Ensure pins render on top
    >
      {/* Pin emoji marker */}
      <sprite scale={[0.06, 0.06, 0.06]} renderOrder={2}>
        <spriteMaterial 
          map={pinTexture} 
          color={color}
          sizeAttenuation={false}
          depthTest={true} // Re-enable depth testing
          transparent={true}
          opacity={1}
        />
      </sprite>
      
      {/* Ring around the marker */}
      <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={1}>
        <ringGeometry args={[0.03, 0.04, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} depthTest={true} />
      </mesh>
    </group>
  );
}

// Curved connection line between regions using tube geometry
function RegionConnection({ 
  start, 
  end, 
  selected, 
  pointsCount = 20,
  animated = true
}: { 
  start: THREE.Vector3; 
  end: THREE.Vector3; 
  selected: boolean;
  pointsCount?: number;
  animated?: boolean;
}) {
  const { theme } = useTheme();
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Color based on selection and theme
  const lineColor = useMemo(() => {
    if (selected) {
      switch(theme) {
        case 'light': return new THREE.Color('#2563eb'); // blue-600
        case 'dark': return new THREE.Color('#FFFF00');  // yellow
        case 'cosmic': return new THREE.Color('#d946ef'); // purple
        case 'forest': return new THREE.Color('#22c55e'); // green
        case 'ocean': return new THREE.Color('#0ea5e9');  // cyan
        default: return new THREE.Color('#FFFF00');
      }
    }
    return new THREE.Color('#FFFFFF');
  }, [selected, theme]);
  
  // Calculate a curved path between two points
  const curve = useMemo(() => {
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    
    // Calculate angle between points
    const dotProduct = start.dot(end);
    const magnitudeProduct = start.length() * end.length();
    const angle = Math.acos(dotProduct / magnitudeProduct);
    
    // Adjust curve height based on angle
    let heightFactor = 0.5;
    if (angle > Math.PI / 2) {
      heightFactor = 0.5 + Math.pow((angle - Math.PI/2) / (Math.PI/2), 2) * 1.2;
    }
    
    const curveHeight = distance * heightFactor;
    
    // Create elevated midpoint
    const midPointDirection = midPoint.clone().normalize();
    midPoint.add(midPointDirection.multiplyScalar(curveHeight));
    
    // Create bezier curve
    return new THREE.QuadraticBezierCurve3(start, midPoint, end);
  }, [start, end]);
  
  // Create points along the curve
  const points = useMemo(() => curve.getPoints(pointsCount), [curve, pointsCount]);
  
  // Create a tube geometry
  const tubeGeometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(path, pointsCount, 0.035, 8, false);
  }, [points, pointsCount]);

  // Track previous material to update
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Create uniforms for shader - recreate when animated prop changes
  const uniforms = useMemo(() => ({
    color: { value: lineColor },
    time: { value: 0 },
    opacity: { value: selected ? 0.9 : 0.5 },
    animated: { value: animated ? 1.0 : 0.0 }
  }), [lineColor, selected, animated]);
  
  // Update shader time in animation frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Always update time regardless of animation state
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
      
      // Force update the animation state uniform to match prop
      materialRef.current.uniforms.animated.value = animated ? 1.0 : 0.0;
      
      // Update opacity to match selected state
      materialRef.current.uniforms.opacity.value = selected ? 0.9 : 0.5;
      
      // Ensure uniforms are marked for update
      materialRef.current.uniformsNeedUpdate = true;
    }
  });
  
  // Use effect to force material recreation when animation state changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.animated.value = animated ? 1.0 : 0.0;
      materialRef.current.uniformsNeedUpdate = true;
    }
  }, [animated]);
  
  return (
    <mesh ref={meshRef} geometry={tubeGeometry}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          uniform float time;
          uniform float opacity;
          uniform float animated;
          varying vec2 vUv;
          
          void main() {
            // Base color with theme-appropriate opacity
            vec4 baseColor = vec4(color, opacity);
            
            // Animation effect
            if (animated > 0.5) {
              // Create several moving dots along the line for better visibility
              float flowSpeed = 0.5;
              float dotSize = 0.05;
              float dotSpacing = 0.2;
              
              // Primary dots
              float dotPosition = mod(vUv.x - time * flowSpeed, 1.0);
              float dots = mod(dotPosition, dotSpacing);
              float flowOpacity = smoothstep(dotSize, 0.0, dots) * 0.6;
              
              // Secondary dots (offset) for fuller animation
              float dotPosition2 = mod(vUv.x - time * flowSpeed + dotSpacing * 0.5, 1.0);
              float dots2 = mod(dotPosition2, dotSpacing);
              float flowOpacity2 = smoothstep(dotSize, 0.0, dots2) * 0.3;
              
              // Combine effects for a more visible animation
              vec3 brightColor = color + vec3(0.3, 0.3, 0.3);
              gl_FragColor = vec4(mix(color, brightColor, flowOpacity + flowOpacity2), opacity + flowOpacity);
            } else {
              // When animation is off, just show the base color
              gl_FragColor = baseColor;
            }
          }
        `}
      />
    </mesh>
  );
}

// Particle system for region data visualization
function DataParticles({ originPosition, count = 50, color = '#FF4444', spread = 1 }: {
  originPosition: THREE.Vector3;
  count?: number;
  color?: string;
  spread?: number;
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = originPosition.x + (Math.random() - 0.5) * spread;
      positions[idx + 1] = originPosition.y + (Math.random() - 0.5) * spread;
      positions[idx + 2] = originPosition.z + (Math.random() - 0.5) * spread;
    }
    return positions;
  }, [originPosition, count, spread]);
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const time = clock.getElapsedTime();
      const geometry = particlesRef.current.geometry;
      const positionAttribute = geometry.getAttribute('position');
      
      for (let i = 0; i < count; i++) {
        const y = positionAttribute.getY(i);
        
        // Move particles in a circular motion
        const angle = time * 0.5 + i * 0.01;
        const radius = 0.1 + 0.05 * Math.sin(time * 0.3 + i);
        
        positionAttribute.setX(i, originPosition.x + Math.cos(angle) * radius);
        positionAttribute.setY(i, y + Math.sin(time * 0.2 + i * 0.1) * 0.02);
        positionAttribute.setZ(i, originPosition.z + Math.sin(angle) * radius);
      }
      
      positionAttribute.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          needsUpdate={true}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={color}
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
}

// Atmospheric glow effect
function AtmosphereGlow() {
  const { theme } = useTheme();
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Atmosphere color based on theme
  const atmosphereColor = useMemo(() => {
    switch(theme) {
      case 'light': return new THREE.Color(0x3b82f6);
      case 'dark': return new THREE.Color(0x0077ff);
      case 'cosmic': return new THREE.Color(0x8b5cf6);
      case 'forest': return new THREE.Color(0x10b981);
      case 'ocean': return new THREE.Color(0x0ea5e9);
      default: return new THREE.Color(0x0077ff);
    }
  }, [theme]);
  
  useFrame(({ clock }) => {
    if (meshRef.current && meshRef.current.material) {
      const time = clock.getElapsedTime();
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms && material.uniforms.opacity) {
        material.uniforms.opacity.value = 0.3 + Math.sin(time * 0.5) * 0.1;
      }
    }
  });
  
  return (
    <mesh ref={meshRef} scale={[1.15, 1.15, 1.15]}>
      <sphereGeometry args={[2, 32, 32]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{
          color: { value: atmosphereColor },
          time: { value: 0 },
          opacity: { value: 0.3 }
        }}
        vertexShader={`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          uniform vec3 color;
          uniform float time;
          uniform float opacity;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(color, intensity * opacity);
          }
        `}
      />
    </mesh>
  );
}

// Sidebar filter component
function FilterSidebar({ 
  showRegionConnections, 
  setShowRegionConnections, 
  showLocalZoneConnections, 
  setShowLocalZoneConnections,
  animateConnections,
  setAnimateConnections
}: {
  showRegionConnections: boolean;
  setShowRegionConnections: (value: boolean) => void;
  showLocalZoneConnections: boolean;
  setShowLocalZoneConnections: (value: boolean) => void;
  animateConnections: boolean;
  setAnimateConnections: (value: boolean) => void;
}) {
  const { theme } = useTheme();
  const styles = themeStyles[theme];
  
  return (
    <div className={`absolute top-1/2 right-4 transform -translate-y-1/2 ${styles.panelBg} rounded-lg p-4 w-64 z-10 transition-colors`} style={{ color: 'var(--foreground)' }}>
      <h2 className="text-lg font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--accent)' }}>Connection Filters</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={showRegionConnections}
              onChange={() => setShowRegionConnections(!showRegionConnections)}
            />
            <div className={`relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-opacity-50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors`} style={{ 
              backgroundColor: showRegionConnections ? 'var(--accent)' : theme === 'light' ? '#d1d5db' : '#4b5563',
              boxShadow: showRegionConnections ? '0 0 8px var(--accent)' : 'none',
            }}></div>
            <span className="ml-3 text-sm">Region Connections</span>
          </label>
        </div>
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={showLocalZoneConnections}
              onChange={() => setShowLocalZoneConnections(!showLocalZoneConnections)}
            />
            <div className={`relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-opacity-50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors`} style={{ 
              backgroundColor: showLocalZoneConnections ? 'var(--accent)' : theme === 'light' ? '#d1d5db' : '#4b5563',
              boxShadow: showLocalZoneConnections ? '0 0 8px var(--accent)' : 'none',
            }}></div>
            <span className="ml-3 text-sm">Local Zone Connections</span>
          </label>
        </div>
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={animateConnections}
              onChange={() => setAnimateConnections(!animateConnections)}
            />
            <div className={`relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-opacity-50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors`} style={{ 
              backgroundColor: animateConnections ? 'var(--accent)' : theme === 'light' ? '#d1d5db' : '#4b5563',
              boxShadow: animateConnections ? '0 0 8px var(--accent)' : 'none',
            }}></div>
            <span className="ml-3 text-sm">Animate Connections</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Main globe component
function GlobeObject({ 
  onRegionSelect,
  showRegionConnections,
  showLocalZoneConnections,
  animateConnections
}: { 
  onRegionSelect: (region: AWSRegion | null) => void;
  showRegionConnections: boolean;
  showLocalZoneConnections: boolean;
  animateConnections: boolean;
}) {
  const globeRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [selectedRegion, setSelectedRegion] = useState<AWSRegion | null>(null);
  
  // Load textures with better options
  const earthMap = useLoader(TextureLoader, '/textures/earth-topo-16k.jpg');
  
  // Apply texture properties after loading
  useEffect(() => {
    if (earthMap) {
      earthMap.wrapS = earthMap.wrapT = THREE.RepeatWrapping;
      earthMap.anisotropy = 16; // Increase anisotropic filtering for sharper textures at angles
    }
  }, [earthMap]);
  
  const cloudMap = useLoader(TextureLoader, '/textures/earth-clouds-4k.png');
  
  // Apply texture properties after loading
  useEffect(() => {
    if (cloudMap) {
      cloudMap.wrapS = cloudMap.wrapT = THREE.RepeatWrapping;
      cloudMap.anisotropy = 16;
    }
  }, [cloudMap]);
  
  // Ensure proper initial alignment
  useEffect(() => {
    if (globeRef.current && cloudRef.current) {
      // Apply initial rotation to align texture with coordinate system
      globeRef.current.rotation.set(0, Math.PI, 0);
      cloudRef.current.rotation.copy(globeRef.current.rotation);
    }
  }, []);
  
  // Convert lat/long to 3D coordinates
  const regionPositions = useMemo(() => {
    return awsRegions.map(region => {
      // Convert latitude and longitude from degrees to radians
      const latRad = region.location.lat * (Math.PI / 180);
      const lngRad = region.location.lng * (Math.PI / 180);
      const radius = 2;
      
      // Standard spherical to Cartesian conversion for correct geographic positioning
      // This formula creates a sphere where:
      // - 0° latitude, 0° longitude is at (radius, 0, 0)
      // - 90° latitude is at (0, radius, 0) (North Pole)
      // - 0° latitude, 90° longitude is at (0, 0, radius)
      const x = radius * Math.cos(latRad) * Math.cos(lngRad);
      const y = radius * Math.sin(latRad);
      const z = -radius * Math.cos(latRad) * Math.sin(lngRad); // Negative Z for correct orientation
      
      return {
        region,
        position: new THREE.Vector3(x, y, z)
      };
    });
  }, []);
  
  // Calculate connections between regions and local zones based on filters
  const connections = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3; isSelected: boolean }[] = [];
    
    if (!showRegionConnections && !showLocalZoneConnections) {
      return result; // Return empty array if both filters are off
    }
    
    const maxConnections = 3;
    
    // Filter regions based on selected filters
    let filteredRegions = regionPositions;
    
    // For region connections only
    if (showRegionConnections && !showLocalZoneConnections) {
      filteredRegions = regionPositions.filter(rp => !rp.region.isLocalZone);
    }
    
    // Process all source regions
    regionPositions.forEach((source) => {
      // Skip if we're only showing region connections and this is a local zone
      if (!showLocalZoneConnections && source.region.isLocalZone) return;
      
      // Determine target candidates based on filters
      let targetCandidates = filteredRegions;
      
      // For region-to-region connections
      if (!showLocalZoneConnections) {
        targetCandidates = regionPositions.filter(rp => !rp.region.isLocalZone);
      }
      
      // For local zone connections, connect to parent region if available
      if (showLocalZoneConnections && source.region.isLocalZone) {
        // Extract parent region code (e.g., "us-east-1" from "us-east-1-nyc-2a")
        const parentRegionCode = source.region.code.split('-').slice(0, 3).join('-');
        const parentRegion = regionPositions.find(rp => rp.region.code === parentRegionCode);
        
        if (parentRegion) {
          const isSelected = !!(selectedRegion && 
            (source.region.code === selectedRegion.code || parentRegion.region.code === selectedRegion.code));
          
          result.push({
            start: source.position,
            end: parentRegion.position,
            isSelected
          });
          
          return; // Skip the nearest-neighbors logic for local zones
        }
      }
      
      // For region-to-region connections
      if (showRegionConnections && !source.region.isLocalZone) {
        // Sort by distance
        const distances = targetCandidates
          .filter(target => target !== source) // Exclude self
          .map((target) => ({ 
            target,
            distance: source.position.distanceTo(target.position) 
          }))
          .sort((a, b) => a.distance - b.distance);
        
        // Connect to nearest regions
        distances.slice(0, maxConnections).forEach(({ target }) => {
          // Skip local zones if that filter is off
          if (!showLocalZoneConnections && target.region.isLocalZone) return;
          
          // Check if this connection already exists (avoid duplicates)
          const connectionExists = result.some(c => 
            (c.start === source.position && c.end === target.position) || 
            (c.start === target.position && c.end === source.position)
          );
          
          if (!connectionExists) {
            const isSelected = !!(selectedRegion && 
              (source.region.code === selectedRegion.code || target.region.code === selectedRegion.code));
            
            result.push({
              start: source.position,
              end: target.position,
              isSelected
            });
          }
        });
      }
    });
    
    return result;
  }, [regionPositions, selectedRegion, showRegionConnections, showLocalZoneConnections]);
  
  // Handle region selection
  const handleRegionClick = (region: AWSRegion) => {
    setSelectedRegion(region);
    onRegionSelect(region);
  };
  
  // Clear region selection
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling to parent elements
    setSelectedRegion(null);
    onRegionSelect(null);
  };
  
  return (
    <group ref={globeRef} rotation={[0, Math.PI, 0]}>
      {/* Earth sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2, 96, 96]} />
        <meshStandardMaterial 
          map={earthMap}
          roughness={0.8}
          metalness={0.1}
          emissive={new THREE.Color(0x222222)}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Cloud layer */}
      <mesh ref={cloudRef} scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshPhongMaterial 
          map={cloudMap}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      
      {/* Atmospheric glow */}
      <AtmosphereGlow />
      
      {/* Region markers */}
      {regionPositions.map(({ region, position }) => (
        <RegionMarker
          key={region.code}
          region={region}
          position={position}
          isSelected={selectedRegion?.code === region.code}
          onClick={() => handleRegionClick(region)}
        />
      ))}
      
      {/* Data particles for selected region */}
      {selectedRegion && (
        <DataParticles 
          originPosition={regionPositions.find(r => r.region.code === selectedRegion.code)?.position || new THREE.Vector3()}
          count={30}
          color="#FFFF00"
          spread={0.4}
        />
      )}
      
      {/* Region connections */}
      {connections.map((connection, i) => (
        <RegionConnection
          key={i}
          start={connection.start}
          end={connection.end}
          selected={connection.isSelected}
          animated={animateConnections}
        />
      ))}
      
      {/* Show region name when selected */}
      {selectedRegion && (
        <Html
          position={regionPositions.find(r => r.region.code === selectedRegion.code)?.position.clone().multiplyScalar(1.2) || [0, 0, 0]}
          center
          distanceFactor={3}
        >
          <div className="text-white text-center px-2 py-1 bg-black bg-opacity-70 rounded whitespace-nowrap flex items-center text-sm">
            <span>{selectedRegion.name}</span>
            <button 
              onClick={clearSelection} 
              className="ml-2 text-xs bg-red-600 hover:bg-red-700 rounded-full w-4 h-4 flex items-center justify-center focus:outline-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

// Starfield background with parallax effect
function StarField() {
  const { theme } = useTheme();
  const starsRef = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });
  
  // Create random star positions
  const starCount = 2000;
  const starPositions = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);
  
  // Star color based on theme
  const starColor = useMemo(() => {
    switch(theme) {
      case 'light': return '#404040';
      case 'dark': return '#ffffff';
      case 'cosmic': return '#e879f9';
      case 'forest': return '#a3e635';
      case 'ocean': return '#7dd3fc';
      default: return '#ffffff';
    }
  }, [theme]);
  
  // Star opacity based on theme
  const starOpacity = useMemo(() => {
    return theme === 'light' ? 0.6 : 0.8;
  }, [theme]);
  
  // Monitor mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Animate stars with parallax effect
  useFrame(({ clock }) => {
    if (starsRef.current) {
      // Slight rotation for dynamic effect
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      
      // Parallax effect based on mouse position
      starsRef.current.position.x = mouse.current.x * 0.5;
      starsRef.current.position.y = mouse.current.y * 0.5;
    }
  });
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starCount}
          array={starPositions}
          itemSize={3}
          args={[starPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={starColor}
        transparent
        opacity={starOpacity}
        sizeAttenuation
      />
    </points>
  );
}

// Main component
export default function Globe() {
  const { theme } = useTheme();
  const [selectedRegion, setSelectedRegion] = useState<AWSRegion | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [showRegionConnections, setShowRegionConnections] = useState(true);
  const [showLocalZoneConnections, setShowLocalZoneConnections] = useState(false);
  const [animateConnections, setAnimateConnections] = useState(true);
  
  // Background color based on theme
  const canvasBackgroundColor = useMemo(() => {
    switch(theme) {
      case 'light': return '#fafafa';
      case 'dark': return '#000000';
      case 'cosmic': return '#0f0f23';
      case 'forest': return '#0f1f0f';
      case 'ocean': return '#0c192f';
      default: return '#000000';
    }
  }, [theme]);
  
  // Fix the type issue in handleError for the onError prop
  const handleError = (error: unknown) => {
    console.error('Three.js error:', error);
    setWebglFailed(true);
  };
  
  // Fallback if WebGL fails
  if (webglFailed) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: themeStyles[theme].background }}>
        <div className="text-center p-4" style={{ color: themeStyles[theme].foreground }}>
          <h2 className="text-2xl mb-4">WebGL Rendering Error</h2>
          <p className="mb-4">Your browser couldn&apos;t render the 3D globe visualization.</p>
          <button 
            className={`px-4 py-2 rounded ${themeStyles[theme].buttonBg}`}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-screen" style={{ background: themeStyles[theme].background }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true,
          precision: "lowp"
        }}
        dpr={window.devicePixelRatio > 1 ? 1.5 : 1}
        performance={{ min: 0.5 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(canvasBackgroundColor));
        }}
        onError={handleError}
      >
        <color attach="background" args={[canvasBackgroundColor]} />
        
        {/* Improved lighting for even illumination */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 3, 5]} intensity={1.0} castShadow={false} />
        <directionalLight position={[-5, 3, 5]} intensity={1.0} castShadow={false} />
        <directionalLight position={[0, -5, 5]} intensity={1.0} castShadow={false} />
        <directionalLight position={[0, 5, -5]} intensity={1.0} castShadow={false} />
        
        {/* Handle context loss */}
        <WebGLContextHandler />
        
        {/* Background elements */}
        <Suspense fallback={null}>
          <StarField />
          
          {/* Main globe with regions */}
          <GlobeObject 
            onRegionSelect={setSelectedRegion} 
            showRegionConnections={showRegionConnections}
            showLocalZoneConnections={showLocalZoneConnections}
            animateConnections={animateConnections}
          />
        </Suspense>
        
        {/* Camera controls - Modified to allow closer zooming */}
        <OrbitControls
          enablePan={false}
          minDistance={2.5} // Decreased from 4 to allow closer zooming
          maxDistance={12}
          rotateSpeed={0.5}
          enableDamping
          dampingFactor={0.1}
          autoRotate={false}
          minPolarAngle={Math.PI * 0.05}
          maxPolarAngle={Math.PI * 0.95}
        />
      </Canvas>
      
      {/* Filter sidebar */}
      <FilterSidebar 
        showRegionConnections={showRegionConnections}
        setShowRegionConnections={setShowRegionConnections}
        showLocalZoneConnections={showLocalZoneConnections}
        setShowLocalZoneConnections={setShowLocalZoneConnections}
        animateConnections={animateConnections}
        setAnimateConnections={setAnimateConnections}
      />
      
      {/* Info panel */}
      <InfoPanel region={selectedRegion} />
      
      {/* Title - Fixed overlapping text issue */}
      <div className="absolute top-4 left-4 text-white">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 inline-block">
            AWS Global Infrastructure
          </span>
        </h1>
        <p className="text-sm opacity-75">Explore AWS regions and their interconnections</p>
      </div>
    </div>
  );
} 