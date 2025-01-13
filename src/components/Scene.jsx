import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { usePerformance } from '../hooks/usePerformance';

export function Scene({ visibleBodies, time, showTags, showOrbits }) {
  const { gl, camera } = useThree();
  usePerformance(gl);

  // Geometries and materials memoization
  const geometries = useMemo(() => ({
    planet: new THREE.SphereGeometry(1, 32, 32),
    smallBody: new THREE.SphereGeometry(0.5, 8, 8),
  }), []);

  const materials = useMemo(() => ({
    sun: new THREE.MeshBasicMaterial({ color: '#ffff00' }),
    planet: new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.3 }),
    smallBody: new THREE.MeshStandardMaterial({ color: 'green' }),
  }), []);

  // Instance groups for better performance
  const majorBodies = useMemo(() => 
    visibleBodies.filter(body => body.type === "majorBody"),
    [visibleBodies]
  );

  const minorBodies = useMemo(() => 
    visibleBodies.filter(body => body.type !== "majorBody"),
    [visibleBodies]
  );

  // Use object pooling for positions
  const positionPool = useRef(new THREE.Vector3());
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={5} distance={100000} decay={0} />

      {/* Sun */}
      <mesh geometry={geometries.planet} material={materials.sun} scale={2} />

      {/* Major Bodies */}
      <Instances 
        limit={majorBodies.length} 
        geometry={geometries.planet}
        material={materials.planet}
      >
        {majorBodies.map((body) => (
          <MajorBody key={body.id} body={body} time={time} />
        ))}
      </Instances>

      {/* Minor Bodies */}
      <Instances 
        limit={minorBodies.length} 
        geometry={geometries.smallBody}
        material={materials.smallBody}
      >
        {minorBodies.map((body) => (
          <MinorBody key={body.id} body={body} time={time} />
        ))}
      </Instances>

      {/* Optimized Orbits */}
      {showOrbits && (
        <InstancedOrbits 
          bodies={visibleBodies}
          materials={materials}
        />
      )}
    </>
  );
}
