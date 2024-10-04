import React, { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function Orbit({
  planetId,
  argument_of_perifocus,
  eccentricity,
  inclination,
  longitude_of_ascending_node,
  semi_major_axis,
  currentPosition,
  orbitType,
  color,
  onOrbitClick,
}) {
  const argument_of_perifocusRad = toRadians(argument_of_perifocus);
  const inclinationRad = toRadians(inclination);
  const longitude_of_ascending_nodeRad = toRadians(longitude_of_ascending_node);

  const points = useMemo(() => {
    const numPoints = 360;
    const orbitPoints = [];

    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const r =
        (semi_major_axis * (1 - eccentricity ** 2)) /
        (1 + eccentricity * Math.cos(angle));
      const x =
        r *
        (Math.cos(longitude_of_ascending_nodeRad) *
          Math.cos(angle + argument_of_perifocusRad) -
          Math.sin(longitude_of_ascending_nodeRad) *
            Math.sin(angle + argument_of_perifocusRad) *
            Math.cos(inclinationRad));
      const y =
        r *
        (Math.sin(longitude_of_ascending_nodeRad) *
          Math.cos(angle + argument_of_perifocusRad) +
          Math.cos(longitude_of_ascending_nodeRad) *
            Math.sin(angle + argument_of_perifocusRad) *
            Math.cos(inclinationRad));
      const z =
        r *
        Math.sin(angle + argument_of_perifocusRad) *
        Math.sin(inclinationRad);

      orbitPoints.push(new THREE.Vector3(x, y, z));
    }

    return orbitPoints;
  }, [
    semi_major_axis,
    eccentricity,
    longitude_of_ascending_nodeRad,
    argument_of_perifocusRad,
    inclinationRad,
  ]);

  const scaleFactor = 200;
  const handleClick = (event) => {
    event.stopPropagation();
    onOrbitClick(planetId, currentPosition);
  };

  if (orbitType === "normal") {
    const flattenedPoints = points.flatMap((p) => [
      p.x * scaleFactor,
      p.y * scaleFactor,
      p.z * scaleFactor,
    ]);

    return (
      <Line
        points={flattenedPoints}
        color={color}
        lineWidth={1}
        opacity={0.5}
        transparent
        onClick={handleClick}
      />
    );
  } else if (orbitType === "tail") {
    const currentIndex = useMemo(() => {
      if (!currentPosition) return 0;
      const currentVec = new THREE.Vector3(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z
      ).divideScalar(scaleFactor);
      return points.findIndex((p) => p.distanceTo(currentVec) < 0.1) || 0;
    }, [currentPosition, points, scaleFactor]);

    const tailLength = 100;
    const tailPoints = useMemo(() => {
      const tail = [];
      for (let i = 0; i < tailLength; i++) {
        const index = (currentIndex - i + points.length) % points.length;
        tail.push(points[index]);
      }
      return tail.reverse();
    }, [currentIndex, points, tailLength]);

    const flattenedPoints = tailPoints.flatMap((p) => [
      p.x * scaleFactor,
      p.y * scaleFactor,
      p.z * scaleFactor,
    ]);

    const colors = useMemo(() => {
      return tailPoints.map((_, index) => {
        const progress = index / (tailLength - 1);
        const grayValue = 0.2 + 0.4 * progress;
        const alpha = 1.0 - 0.8 * progress;
        return new THREE.Color(grayValue, grayValue, grayValue).multiplyScalar(
          alpha
        );
      });
    }, [tailPoints, tailLength]);

    return (
      <Line
        points={flattenedPoints}
        vertexColors={colors}
        lineWidth={1}
        opacity={0.5}
        transparent
        onClick={handleClick}
      />
    );
  }

  return null;
}

export default Orbit;
