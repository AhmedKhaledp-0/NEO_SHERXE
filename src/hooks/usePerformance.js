import { useEffect } from 'react';
import * as THREE from 'three';

export function usePerformance(gl) {
  useEffect(() => {
    if (!gl) return;

    // Optimize WebGL renderer
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.setSize(window.innerWidth, window.innerHeight);
    gl.shadowMap.enabled = false; // Disable shadows for better performance
    gl.powerPreference = "high-performance";
    
    // Enable texture compression
    gl.capabilities.maxTextureSize = 2048;
    gl.capabilities.isWebGL2 = true;

    // Memory management
    const cleanup = () => {
      THREE.Cache.clear();
      gl.dispose();
    };

    return cleanup;
  }, [gl]);
}
