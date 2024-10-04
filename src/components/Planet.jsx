import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, useGLTF } from "@react-three/drei";
import { Detailed } from "@react-three/drei";

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

  useFrame(() => {
    const { e, a, i, Ω, ω, n } = constants;

    const deltaT = (time.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24); // time difference in days
    let M = n * deltaT;
    M = M % (2 * Math.PI);
    if (M < 0) M += 2 * Math.PI;

    let E = M;
    for (let j = 0; j < 10; j++) {
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
  });
  useEffect(() => {
    if (onPositionUpdate) {
      onPositionUpdate(planetId, currentPosition);
    }
  }, [currentPosition, planetId, onPositionUpdate]);
  const handleClick = (event) => {
    event.stopPropagation();
    onPlanetClick(planetId, currentPosition);
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
    <group ref={meshRef}>
      {isMainPlanet ? (
        <Detailed distances={[150, 300, 400]}>
          <primitive
            object={scene}
            scale={planetDiameters[planetId] / 1000000}
            onClick={handleClick}
          />
          <mesh
            scale={2}
            geometry={planetGeometry.mediumDetail}
            onClick={handleClick}
          >
            <meshStandardMaterial color={planetColors[planetId] || "white"} />
          </mesh>
          <mesh
            scale={2}
            geometry={planetGeometry.lowDetail}
            onClick={handleClick}
          >
            <meshStandardMaterial color={planetColors[planetId] || "white"} />
          </mesh>
        </Detailed>
      ) : null}
      {showTags && (
        <Html>
          <div className="planetTag">{planetId.split("Barycenter")[0]}</div>
        </Html>
      )}
    </group>
  );
}

export default Planet;
