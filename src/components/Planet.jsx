import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, useGLTF } from "@react-three/drei";
import { Detailed } from "@react-three/drei";

// Update scale values to be more visible
const planetConfig = {
  "Mercury Barycenter (199)": { size: 2, color: "#c4b5a6", scale: 1 },
  "Venus Barycenter (299)": { size: 3, color: "#ffd85c", scale: 1 },
  "Earth-Moon Barycenter (3)": { size: 3, color: "#4f7cee", scale: 1 },
  "Mars Barycenter (4)": { size: 2.5, color: "#ff6b3e", scale: 1 },
  "Jupiter Barycenter (5)": { size: 8, color: "#f3d3a3", scale: 1 },
  "Saturn Barycenter (6)": { size: 7, color: "#f7d98c", scale: 1 },
  "Uranus Barycenter (7)": { size: 5, color: "#b3e5e5", scale: 1 },
  "Neptune Barycenter (8)": { size: 5, color: "#4b70dd", scale: 1 },
  "Pluto Barycenter (9)": { size: 1, color: "#c4b5a6", scale: 1 },
};

function Planet({
  planetId,
  position,
  velocity,
  eccentricity,
  semi_major_axis,
  inclination,
  longitude_of_ascending_node,
  argument_of_perifocus,
  mean_anomaly,
  time,
  epoch,
  showTags,
  id,
  onPositionUpdate,
  onPlanetClick,
  onOrbitClick,
}) {
  const meshRef = useRef();
  const AuToM = 1.496e11;
  const [currentPosition, setCurrentPosition] = useState(new THREE.Vector3());
  const isMainPlanet = id >= 1 && id <= 9;
  const [hovered, setHovered] = useState(false);
  const config = planetConfig[planetId] || { size: 0.1, color: "#ffffff", scale: 1 };

  const { scene } = isMainPlanet
    ? useGLTF(`/models/${planetId.split(" ")[0].toLowerCase()}.glb`)
    : { scene: null };
  function calculateOrbitalPeriod(semiMajorAxis) {
    const G = 6.6743e-11; // Gravitational constant in m^3 kg^-1 s^-2
    const M = 1.989e30; // Mass of the Sun in kg
    const semiMajorAxisInM = semiMajorAxis * AuToM;
    const T_seconds = Math.sqrt(
      (4 * Math.PI * Math.PI * Math.pow(semiMajorAxisInM, 3)) / (G * M)
    );
    return T_seconds / (60 * 60 * 24);
  }
  const T = calculateOrbitalPeriod(semi_major_axis);
  const constants = useMemo(() => {
    return {
      e: eccentricity,
      a: semi_major_axis,
      i: THREE.MathUtils.degToRad(inclination),
      Ω: THREE.MathUtils.degToRad(longitude_of_ascending_node),
      ω: THREE.MathUtils.degToRad(argument_of_perifocus),
      n: (2 * Math.PI) / T,
    };
  }, [
    eccentricity,
    semi_major_axis,
    inclination,
    longitude_of_ascending_node,
    argument_of_perifocus,
  ]);
  const planetGeometry = useMemo(() => {
    const highDetail = new THREE.SphereGeometry(1, 32, 32);
    const mediumDetail = new THREE.SphereGeometry(1, 16, 16);
    const lowDetail = new THREE.SphereGeometry(1, 3, 3);
    return { highDetail, mediumDetail, lowDetail };
  }, []);

  // Create geometries with different levels of detail
  const geometries = useMemo(() => ({
    high: new THREE.SphereGeometry(config.size, 64, 32), // Increased detail
    medium: new THREE.SphereGeometry(config.size, 32, 16),
    low: new THREE.SphereGeometry(config.size, 16, 12)
  }), [config.size]);

  // Create materials with improved visual effects
  const materials = useMemo(() => ({
    standard: new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.7,
      metalness: 0.3,
      side: THREE.DoubleSide, // Make visible from both sides
      transparent: true,
      opacity: 1,
    }),
    hover: new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.5,
      metalness: 0.5,
      emissive: new THREE.Color(config.color).multiplyScalar(0.2),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
    })
  }), [config.color]);

  useFrame(() => {
    const { e, a, i, Ω, ω, n } = constants;

    const deltaT = (time.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24); // time difference in days
    let M = n * deltaT;
    M = M % (2 * Math.PI);
    if (M < 0) M += 2 * Math.PI;

    let E = M;
    for (let j = 0; j < 5; j++) {
      E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }

    const ν = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2));

    const r = a * (1 - e * Math.cos(E));
    const x =
      r *
      (Math.cos(Ω) * Math.cos(ω + ν) -
        Math.sin(Ω) * Math.sin(ω + ν) * Math.cos(i));
    const y =
      r *
      (Math.sin(Ω) * Math.cos(ω + ν) +
        Math.cos(Ω) * Math.sin(ω + ν) * Math.cos(i));
    const z = r * (Math.sin(ω + ν) * Math.sin(i));

    const newPosition = new THREE.Vector3(x * 200, y * 200, z * 200);
    meshRef.current.position.copy(newPosition);
    setCurrentPosition(newPosition);

    const scale = config.scale * (hovered ? 1.1 : 1);
    meshRef.current.scale.setScalar(scale);
  });
  useEffect(() => {
    if (onPositionUpdate) {
      onPositionUpdate(planetId, currentPosition);
    }
  }, [currentPosition, planetId, onPositionUpdate]);
  const handlePlanetClick = (event) => {
    event.stopPropagation();
    if (meshRef.current && onPlanetClick) {
      onPlanetClick(planetId, meshRef.current.position.clone());
    }
  };
  const handleTagClick = (event) => {
    event.stopPropagation();
    if (meshRef.current && onPlanetClick) {
      onPlanetClick(planetId, meshRef.current.position.clone());
    }
  };
  const planetColors = {
    "Mercury Barycenter (199)": "gold",
    "Venus Barycenter (299)": "yellow",
    "Earth-Moon Barycenter (3)": "blue",
    "Mars Barycenter (4)": "red",
    "Jupiter Barycenter (5)": "orange",
    "Saturn Barycenter (6)": "khaki",
    "Uranus Barycenter (7)": "aqua",
    "Neptune Barycenter (8)": "purple",
    "Pluto Barycenter (9)": "beige",
  };
  const planetDiameters = {
    "Mercury Barycenter (199)": 4879, // Diameter in kilometers
    "Venus Barycenter (299)": 12104,
    "Earth-Moon Barycenter (3)": 12742,
    "Mars Barycenter (4)": 6779,
    "Jupiter Barycenter (5)": 139820,
    "Saturn Barycenter (6)": 116460,
    "Uranus Barycenter (7)": 50724,
    "Neptune Barycenter (8)": 49244,
    "Pluto Barycenter (9)": 2376,
  };
  return (
    <group 
      ref={meshRef}
      onClick={handlePlanetClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {isMainPlanet ? (
        <Detailed distances={[0, 100, 200, 500]}>
          {scene ? (
            <primitive
              object={scene}
              scale={[config.size/500, config.size/500, config.size/500]}
              material={materials.standard}
            />
          ) : (
            <mesh
              geometry={geometries.high}
              material={hovered ? materials.hover : materials.standard}
            />
          )}
          <mesh 
            geometry={geometries.medium}
            material={hovered ? materials.hover : materials.standard}
          />
          <mesh 
            geometry={geometries.low}
            material={materials.standard}
          />
        </Detailed>
      ) : (
        <mesh
          geometry={geometries.low}
          material={materials.standard}
          scale={config.size * 0.2}
        />
      )}
      {showTags && (
        <Html
          className="select-none"
          position={[0, config.size * 1.5, 0]}
          center
          style={{
            opacity: hovered ? 1 : 0.8,
            transition: 'transform 0.2s, opacity 0.2s',
            transform: `scale(${hovered ? 1.1 : 1})`,
            pointerEvents: 'auto'
          }}
        >
          <div 
            className="px-2 py-1 rounded bg-black/50 text-white text-xs whitespace-nowrap backdrop-blur-sm hover:bg-black/70"
            onClick={handleTagClick}
          >
            {planetId.split("Barycenter")[0]}
          </div>
        </Html>
      )}
    </group>
  );
}

export default Planet;
