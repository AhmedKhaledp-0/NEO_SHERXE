import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AU_SCALE } from "../utilities/kepler";

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

const TAIL_LENGTH = 100;
const FEATURED_TAIL_LENGTH = 200;
const FEATURED_TAIL_MAX_OPACITY = 0.9;

function Orbit({
  planetId,
  argument_of_perifocus,
  eccentricity,
  inclination,
  longitude_of_ascending_node,
  semi_major_axis,
  orbitType,
  color,
  tailColor = "#cccccc",
  positionsRef,
  onOrbitClick,
}) {
  const [hovered, setHovered] = useState(false);
  const tailLineRef = useRef();
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  const isFeatured = orbitType === "featured";
  const tailLength = isFeatured ? FEATURED_TAIL_LENGTH : TAIL_LENGTH;
  const tailMaxOpacity = isFeatured ? FEATURED_TAIL_MAX_OPACITY : 0.45;
  const tailColorValue = useMemo(() => new THREE.Color(tailColor), [tailColor]);

  const argument_of_perifocusRad = toRadians(argument_of_perifocus);
  const inclinationRad = toRadians(inclination);
  const longitude_of_ascending_nodeRad = toRadians(longitude_of_ascending_node);

  const points = useMemo(() => {
    if (
      !isFinite(semi_major_axis) ||
      !isFinite(eccentricity) ||
      !isFinite(inclination) ||
      !isFinite(argument_of_perifocus) ||
      !isFinite(longitude_of_ascending_node)
    ) {
      return [];
    }

    if (semi_major_axis <= 0 || eccentricity >= 1 || eccentricity < 0) {
      return [];
    }

    const basePoints = 360;
    const numPoints = Math.min(
      Math.ceil(basePoints * (1 + eccentricity * 2)),
      720,
    );
    const orbitPoints = [];

    try {
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const denominator = 1 + eccentricity * Math.cos(angle);

        if (Math.abs(denominator) < 0.000001) continue;

        const r = (semi_major_axis * (1 - eccentricity ** 2)) / denominator;

        if (!isFinite(r) || r <= 0) continue;

        const cos_Omega = Math.cos(longitude_of_ascending_nodeRad);
        const sin_Omega = Math.sin(longitude_of_ascending_nodeRad);
        const cos_w_v = Math.cos(angle + argument_of_perifocusRad);
        const sin_w_v = Math.sin(angle + argument_of_perifocusRad);
        const cos_i = Math.cos(inclinationRad);

        const x = r * (cos_Omega * cos_w_v - sin_Omega * sin_w_v * cos_i);
        const y = r * (sin_Omega * cos_w_v + cos_Omega * sin_w_v * cos_i);
        const z = r * sin_w_v * Math.sin(inclinationRad);

        if (isFinite(x) && isFinite(y) && isFinite(z)) {
          orbitPoints.push(new THREE.Vector3(x, y, z));
        }
      }

      if (orbitPoints.length >= 3) {
        orbitPoints.push(orbitPoints[0].clone());
      } else {
        return [];
      }

      return orbitPoints;
    } catch {
      return [];
    }
  }, [
    semi_major_axis,
    eccentricity,
    argument_of_perifocus,
    inclination,
    longitude_of_ascending_node,
    longitude_of_ascending_nodeRad,
    argument_of_perifocusRad,
    inclinationRad,
  ]);

  const { lineGeometry, tubeGeometry, tailGeometry } = useMemo(() => {
    const linePositions = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      linePositions[i * 3] = points[i].x * AU_SCALE;
      linePositions[i * 3 + 1] = points[i].y * AU_SCALE;
      linePositions[i * 3 + 2] = points[i].z * AU_SCALE;
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3),
    );

    let tubeGeometry = null;
    if (orbitType === "normal") {
      const curve = new THREE.CatmullRomCurve3(
        points.map((p) => p.clone().multiplyScalar(AU_SCALE)),
      );
      tubeGeometry = new THREE.TubeGeometry(
        curve,
        Math.min(points.length, 256),
        0.5,
        4,
        false,
      );
    }

    let tailGeometry = null;
    if (orbitType === "tail" || orbitType === "featured") {
      const tailPositions = new Float32Array(tailLength * 3);
      tailGeometry = new THREE.BufferGeometry();
      tailGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(tailPositions, 3),
      );
      if (isFeatured) {
        const tailColors = new Float32Array(tailLength * 3);
        tailGeometry.setAttribute(
          "color",
          new THREE.BufferAttribute(tailColors, 3),
        );
      }
      tailGeometry.setDrawRange(0, tailLength);
    }

    return { lineGeometry, tubeGeometry, tailGeometry };
  }, [points, orbitType, tailLength, isFeatured]);

  useFrame(() => {
    if (orbitType !== "tail" && orbitType !== "featured") return;
    const line = tailLineRef.current;
    const pos = positionsRef && positionsRef.current[planetId];
    if (!line || !pos) return;

    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      tempVec.subVectors(points[i], pos);
      const d = tempVec.lengthSq();
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }

    const posAttr = line.geometry.attributes.position;
    const colAttr = line.geometry.attributes.color;

    for (let k = 0; k < tailLength; k++) {
      const idx = (best - (tailLength - 1 - k) + points.length) % points.length;
      const p = points[idx];
      posAttr.setXYZ(k, p.x * AU_SCALE, p.y * AU_SCALE, p.z * AU_SCALE);
      if (colAttr) {
        const fade = (k / (tailLength - 1)) * tailMaxOpacity;
        colAttr.setXYZ(
          k,
          tailColorValue.r * fade,
          tailColorValue.g * fade,
          tailColorValue.b * fade,
        );
      }
    }

    posAttr.needsUpdate = true;
    if (colAttr) colAttr.needsUpdate = true;
  });

  if (points.length < 4) return null;

  const baseOpacity = orbitType === "normal" ? 0.5 : isFeatured ? 0.1 : 0.3;

  const handleClick = (event) => {
    event.stopPropagation();
    const pos = positionsRef && positionsRef.current[planetId];
    if (pos) {
      onOrbitClick(planetId, pos.clone().multiplyScalar(AU_SCALE));
    } else {
      onOrbitClick(planetId, points[0].clone().multiplyScalar(AU_SCALE));
    }
  };

  return (
    <group>
      {tubeGeometry && (
        <mesh
          geometry={tubeGeometry}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          visible={false}
        >
          <meshBasicMaterial transparent opacity={0.001} />
        </mesh>
      )}
      {!isFeatured && (
        <line geometry={lineGeometry}>
          <lineBasicMaterial
            color={color}
            opacity={hovered ? baseOpacity * 1.5 : baseOpacity}
            transparent={true}
            depthTest={true}
          />
        </line>
      )}
      {isFeatured && (
        <line ref={tailLineRef} geometry={tailGeometry}>
          <lineBasicMaterial vertexColors transparent />
        </line>
      )}
      {orbitType === "tail" && (
        <line ref={tailLineRef} geometry={tailGeometry}>
          <lineBasicMaterial
            color={color}
            opacity={hovered ? 0.6 : 0.45}
            transparent={true}
          />
        </line>
      )}
    </group>
  );
}

export default React.memo(Orbit);
