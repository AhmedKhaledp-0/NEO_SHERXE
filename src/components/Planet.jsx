import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, useGLTF, Billboard } from "@react-three/drei";
import { Detailed } from "@react-three/drei";
import {
  precomputeConstants,
  getBodyPosition,
  AU_SCALE,
} from "../utilities/kepler";
import { registerLabel, LABEL_PRIORITY, shortLabelName } from "../utilities/labelManager";

const labelWorldPosition = new THREE.Vector3();

const planetConfig = {
  "Mercury Barycenter (199)": { size: 2, color: "#c4b5a6" },
  "Venus Barycenter (299)": { size: 3, color: "#ffd85c" },
  "Earth-Moon Barycenter (3)": { size: 3, color: "#4f7cee" },
  "Mars Barycenter (4)": { size: 2.5, color: "#ff6b3e" },
  "Jupiter Barycenter (5)": { size: 8, color: "#f3d3a3" },
  "Saturn Barycenter (6)": { size: 7, color: "#f7d98c" },
  "Uranus Barycenter (7)": { size: 5, color: "#b3e5e5" },
  "Neptune Barycenter (8)": { size: 5, color: "#4b70dd" },
  "Pluto Barycenter (9)": { size: 1, color: "#c4b5a6" },
  "136108 Haumea (2003 EL61)": { size: 1.2, color: "#e0d7c3" },
  "136472 Makemake (2005 FY9)": { size: 1.2, color: "#d9c9a8" },
  "136199 Eris (2003 UB313)": { size: 1.4, color: "#d6d6d6" },
};

const typeConfig = {
  PHAEX: { size: 1.6, color: "#ff8a80" },
  NEAEX: { size: 1.4, color: "#80d8ff" },
};

const PlanetModel = ({ planetId, size, material }) => {
  const { scene } = useGLTF(
    `/models/${planetId.split(" ")[0].toLowerCase()}.glb`,
    false,
    false,
  );

  return (
    <primitive
      object={scene}
      scale={[size / 500, size / 500, size / 500]}
      material={material}
    />
  );
};

function Planet({
  planetId,
  eccentricity,
  semi_major_axis,
  inclination,
  longitude_of_ascending_node,
  argument_of_perifocus,
  mean_motion,
  type,
  showTags,
  id,
  positionsRef,
  timeRef,
  onPlanetClick,
  labelColor,
  selected,
}) {
  const meshRef = useRef();
  const spanRef = useRef();
  const isMainPlanet = id >= 1 && id <= 9;
  const [hovered, setHovered] = useState(false);
  const config = planetConfig[planetId] ||
    typeConfig[type] || { size: 0.1, color: "#ffffff" };
  const isFeatured = type === "PHAEX" || type === "NEAEX";
  const labelPriority = isFeatured
    ? LABEL_PRIORITY.FEATURED
    : LABEL_PRIORITY.PLANET;
  const labelOffset = config.size * 5;

  const stateRef = useRef({ hovered: false, selected: false });
  stateRef.current.hovered = hovered;
  stateRef.current.selected = !!selected;

  useEffect(() => {
    const unregister = registerLabel({
      id: `planet-${planetId}`,
      el: () => spanRef.current,
      getPosition: () => {
        const group = meshRef.current;
        if (!group) return null;
        group.updateWorldMatrix(true, false);
        const position = group.getWorldPosition(labelWorldPosition);
        position.x += labelOffset;
        return position;
      },
      priority: () =>
        stateRef.current.selected
          ? LABEL_PRIORITY.SELECTED
          : stateRef.current.hovered
            ? LABEL_PRIORITY.HOVERED
            : labelPriority,
      force: () => stateRef.current.selected,
      isHovered: () => stateRef.current.hovered,
      interactive: true,
    });
    return unregister;
  }, [planetId, labelPriority, labelOffset]);

  const constants = useMemo(
    () =>
      precomputeConstants({
        e: eccentricity,
        a: semi_major_axis,
        incl: inclination,
        Omega: longitude_of_ascending_node,
        w: argument_of_perifocus,
        n: mean_motion,
      }),
    [
      eccentricity,
      semi_major_axis,
      inclination,
      longitude_of_ascending_node,
      argument_of_perifocus,
      mean_motion,
    ],
  );

  const ringGeometry = useMemo(
    () => new THREE.RingGeometry(config.size * 0.7, config.size * 0.85, 6),
    [config.size],
  );

  const geometries = useMemo(
    () => ({
      high: new THREE.SphereGeometry(config.size, 48, 24),
      medium: new THREE.SphereGeometry(config.size, 24, 16),
      low: new THREE.SphereGeometry(config.size, 12, 8),
    }),
    [config.size],
  );

  const materials = useMemo(
    () => ({
      standard: new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.7,
        metalness: 0.3,
        side: THREE.DoubleSide,
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
      }),
      ring: new THREE.MeshBasicMaterial({
        color: "#d1d5db",
        transparent: true,
        opacity: 0.9,
      }),
      ringHover: new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 1,
      }),
    }),
    [config.color],
  );

  const tempPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    getBodyPosition(constants, timeRef.current.getTime(), tempPosition);
    meshRef.current.position.set(
      tempPosition.x * AU_SCALE,
      tempPosition.y * AU_SCALE,
      tempPosition.z * AU_SCALE,
    );
    meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
    if (positionsRef.current) {
      const slot = positionsRef.current[planetId];
      if (!slot) positionsRef.current[planetId] = new THREE.Vector3();
      positionsRef.current[planetId].copy(tempPosition);
    }
  });

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

  return (
    <group
      ref={meshRef}
      onClick={handlePlanetClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {isMainPlanet ? (
        <Detailed distances={[0, 100, 200, 500]}>
          <Suspense
            fallback={
              <mesh
                geometry={geometries.medium}
                material={hovered ? materials.hover : materials.standard}
              />
            }
          >
            <PlanetModel
              planetId={planetId}
              size={config.size}
              material={materials.standard}
            />
          </Suspense>
          <mesh
            geometry={geometries.medium}
            material={hovered ? materials.hover : materials.standard}
          />
          <mesh geometry={geometries.low} material={materials.standard} />
        </Detailed>
      ) : isFeatured ? (
        <Billboard>
          <mesh
            geometry={ringGeometry}
            material={hovered ? materials.ringHover : materials.ring}
          />
        </Billboard>
      ) : (
        <mesh
          geometry={geometries.low}
          material={hovered ? materials.hover : materials.standard}
          scale={config.size * 0.2}
        />
      )}
      {(showTags || selected) && (
        <Html
          className="select-none"
          position={[config.size * 5, 0, 0]}
          center
        >
          <span
            ref={spanRef}
            className="neo-label-text text-xs select-none"
            style={{ color: labelColor || "#ffffff" }}
            onClick={handleTagClick}
          >
            {shortLabelName(planetId)}
          </span>
        </Html>
      )}
    </group>
  );
}

const PlanetMemo = React.memo(Planet);

export default PlanetMemo;
