import React, { useMemo } from 'react';
import * as THREE from 'three';

export function StarField({ count = 25000, isDark = true }) {
  const starField = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Better spherical distribution
      const radius = 2000 + Math.random() * 1000;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Generate random star colors (white to slightly blue/yellow)
      const brightness = isDark ? 0.9 + Math.random() * 0.1 : 0.7 + Math.random() * 0.3;
      colors[i * 3] = brightness * (0.9 + Math.random() * 0.1); // Red
      colors[i * 3 + 1] = brightness; // Green
      colors[i * 3 + 2] = brightness * (1 + Math.random() * 0.1); // Blue (slightly stronger)
    }

    return { positions, colors };
  }, [count, isDark]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.75,
      sizeAttenuation: false, // Disable size attenuation to keep stars visible
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 1 : 0.8,
      blending: THREE.AdditiveBlending,
      fog: false
    });
  }, [isDark]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={starField.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={starField.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={material} />
    </points>
  );
}
