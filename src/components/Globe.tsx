import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { AWSRegion, awsRegions } from '@/types/aws';
import InfoPanel from './InfoPanel';

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
  const markerRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const color = isSelected ? '#FFFF00' : region.isLocalZone ? '#4488FF' : '#FF4444';
  
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
  pointsCount = 20 
}: { 
  start: THREE.Vector3; 
  end: THREE.Vector3; 
  selected: boolean;
  pointsCount?: number;
}) {
  // Calculate a curved path between two points
  const curve = useMemo(() => {
    // We're keeping startToEnd for calculations even though it's not directly used later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const startToEnd = new THREE.Vector3().subVectors(end, start);
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    
    // Calculate the angle between the points (in radians)
    const dotProduct = start.dot(end);
    const magnitudeProduct = start.length() * end.length();
    const angle = Math.acos(dotProduct / magnitudeProduct);
    
    // Dynamically adjust curve height based on the angle between points
    // As angle approaches PI (180 degrees), dramatically increase height
    let heightFactor = 0.5; // Reduced from 0.6 to lower the arch height
    if (angle > Math.PI / 2) { // If angle is > 90 degrees
      // Exponentially increase height factor as the angle approaches 180 degrees
      heightFactor = 0.5 + Math.pow((angle - Math.PI/2) / (Math.PI/2), 2) * 1.2; // Reduced from 1.5 to 1.2
    }
    
    const curveHeight = distance * heightFactor;
    
    // For extreme distances (like antipodes), ensure curve goes well above the globe
    // This creates a more dramatic arch for connections that would otherwise go through the globe
    const midPointDirection = midPoint.clone().normalize();
    midPoint.add(midPointDirection.multiplyScalar(curveHeight));
    
    // Create a quadratic bezier curve
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    return curve;
  }, [start, end]);
  
  // Create points along the curve
  const points = useMemo(() => curve.getPoints(pointsCount), [curve, pointsCount]);
  
  // Create a tube geometry along the curve
  const tubeGeometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(path, pointsCount, 0.018, 8, false); // Reduced tube radius from 0.035 to 0.018
  }, [points, pointsCount]);
  
  // Material with animated data flow
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(selected ? 0xffff00 : 0xff4444) },
    opacity: { value: selected ? 0.7 : 0.3 } // Reduced opacity from 0.9/0.5 to 0.7/0.3
  }), [selected]);
  
  useFrame(({ clock }) => {
    if (material.current) {
      material.current.uniforms.time.value = clock.getElapsedTime();
    }
  });
  
  return (
    <mesh geometry={tubeGeometry}>
      <shaderMaterial 
        ref={material}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform vec3 color;
          uniform float opacity;
          varying vec2 vUv;
          
          void main() {
            float speed = 2.0;
            float pulseWidth = 0.1;
            float pulse = mod(vUv.x - time * speed, 1.0);
            float pulseFactor = smoothstep(0.0, pulseWidth, pulse) * smoothstep(pulseWidth * 2.0, pulseWidth, pulse);
            vec3 finalColor = mix(color, vec3(1.0), pulseFactor * 0.7);
            gl_FragColor = vec4(finalColor, opacity);
          }
        `}
        transparent
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
  const meshRef = useRef<THREE.Mesh>(null);
  
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
          color: { value: new THREE.Color(0x0077ff) },
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
  setShowLocalZoneConnections 
}: {
  showRegionConnections: boolean;
  setShowRegionConnections: (value: boolean) => void;
  showLocalZoneConnections: boolean;
  setShowLocalZoneConnections: (value: boolean) => void;
}) {
  return (
    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/80 text-white rounded-lg p-4 w-64 z-10">
      <h2 className="text-lg font-bold mb-4 border-b pb-2">Connection Filters</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={showRegionConnections}
              onChange={() => setShowRegionConnections(!showRegionConnections)}
            />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm">Local Zone Connections</span>
          </label>
        </div>
      </div>
      <div className="mt-4 pt-2 border-t border-gray-700">
        <p className="text-xs text-gray-400">Toggle filters to control which connection lines are displayed on the globe.</p>
      </div>
    </div>
  );
}

// Main globe component
function GlobeObject({ 
  onRegionSelect,
  showRegionConnections,
  showLocalZoneConnections
}: { 
  onRegionSelect: (region: AWSRegion | null) => void;
  showRegionConnections: boolean;
  showLocalZoneConnections: boolean;
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
        />
      ))}
      
      {/* Show region name when selected */}
      {selectedRegion && (
        <Html
          position={regionPositions.find(r => r.region.code === selectedRegion.code)?.position.clone().multiplyScalar(1.2) || [0, 0, 0]}
          center
          distanceFactor={10}
          // The Html component naturally faces the camera
        >
          <div className="text-white text-center px-2 py-1 bg-black bg-opacity-70 rounded whitespace-nowrap flex items-center">
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
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Main component
export default function Globe() {
  const [selectedRegion, setSelectedRegion] = useState<AWSRegion | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [showRegionConnections, setShowRegionConnections] = useState(true);
  const [showLocalZoneConnections, setShowLocalZoneConnections] = useState(false);
  
  // Fix the type issue in handleError for the onError prop
  const handleError = (error: unknown) => {
    console.error('Three.js error:', error);
    setWebglFailed(true);
  };
  
  // Fallback if WebGL fails
  if (webglFailed) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <h2 className="text-2xl mb-4">WebGL Rendering Error</h2>
          <p className="mb-4">Your browser couldn&apos;t render the 3D globe visualization.</p>
          <button 
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-screen bg-black">
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
          gl.setClearColor(new THREE.Color('#000000'));
        }}
        onError={handleError}
      >
        <color attach="background" args={["#000"]} />
        
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