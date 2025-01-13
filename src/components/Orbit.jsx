import React, { useMemo, useState } from "react";
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
  const [hovered, setHovered] = useState(false);

  const argument_of_perifocusRad = toRadians(argument_of_perifocus);
  const inclinationRad = toRadians(inclination);
  const longitude_of_ascending_nodeRad = toRadians(longitude_of_ascending_node);

  const points = useMemo(() => {
    // Early validation
    if (!isFinite(semi_major_axis) || !isFinite(eccentricity) || 
        !isFinite(inclination) || !isFinite(argument_of_perifocus) || 
        !isFinite(longitude_of_ascending_node)) {
      return [];
    }

    // Prevent unrealistic orbits
    if (semi_major_axis <= 0 || eccentricity >= 1 || eccentricity < 0) {
      return [];
    }

    const basePoints = 360;
    const numPoints = Math.min(Math.ceil(basePoints * (1 + eccentricity * 2)), 720); // Limit max points
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

      // Ensure minimum points and close the loop
      if (orbitPoints.length >= 3) {
        orbitPoints.push(orbitPoints[0].clone());
      } else {
        return [];
      }

      return orbitPoints;
    } catch (error) {
      console.warn(`Error calculating orbit for ${planetId}:`, error);
      return [];
    }
  }, [
    semi_major_axis,
    eccentricity,
    longitude_of_ascending_nodeRad,
    argument_of_perifocusRad,
    inclinationRad,
    planetId
  ]);

  if (points.length < 4) return null;

  const scaleFactor = 200;
  const handleClick = (event) => {
    event.stopPropagation();
    // Always use the current position of the planet for orbit clicks
    if (currentPosition) {
      onOrbitClick(planetId, currentPosition.clone());
    } else {
      // If no current position, use the first point of the orbit
      const firstPoint = new THREE.Vector3(
        points[0].x * scaleFactor,
        points[0].y * scaleFactor,
        points[0].z * scaleFactor
      );
      onOrbitClick(planetId, firstPoint);
    }
  };

  const handlePointer = (event, isOver) => {
    if (!event) return;
    event.stopPropagation();
    setHovered(isOver);
  };

  // Add raycast distance for better click detection
  const raycastDistance = useMemo(() => {
    return semi_major_axis * 200 * 0.1; // 10% of orbit size
  }, [semi_major_axis]);

  const orbitStyle = useMemo(() => {
    const baseOpacity = orbitType === "normal" ? 0.5 : 0.3;
    return {
      opacity: hovered ? baseOpacity * 1.5 : baseOpacity,
      lineWidth: hovered ? 2 : 1,
    };
  }, [orbitType, hovered]);

  const renderOrbit = (points, colors = null) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    
    points.forEach((point, i) => {
      positions[i * 3] = point.x * scaleFactor;
      positions[i * 3 + 1] = point.y * scaleFactor;
      positions[i * 3 + 2] = point.z * scaleFactor;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create a tube geometry for better click detection
    const tubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points.map(p => 
        new THREE.Vector3(p.x * scaleFactor, p.y * scaleFactor, p.z * scaleFactor)
      )),
      points.length,
      0.5, // radius
      8, // radiusSegments
      false // closed
    );

    return (
      <group>
        <mesh
          geometry={tubeGeometry}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          visible={false} // invisible but clickable
        >
          <meshBasicMaterial transparent opacity={0.001} />
        </mesh>
        <line geometry={geometry}>
          <lineBasicMaterial
            color={color}
            opacity={orbitStyle.opacity}
            transparent={true}
            linewidth={orbitStyle.lineWidth}
            depthTest={true}
          />
        </line>
      </group>
    );
  };

  if (orbitType === "normal") {
    return renderOrbit(points);
  }

  if (orbitType === "tail") {
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

    return renderOrbit(tailPoints, colors);
  }

  return null;
}

export default Orbit;
