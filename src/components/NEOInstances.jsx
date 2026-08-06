import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import {
  precomputeConstants,
  getBodyPosition,
  AU_SCALE,
  EPOCH,
} from "../utilities/kepler";
import vertexShader from "../shaders/neos.vert.glsl?raw";
import fragmentShader from "../shaders/neos.frag.glsl?raw";
import { registerLabel, LABEL_PRIORITY, shortLabelName } from "../utilities/labelManager";

const NEO_COLOR = "#aae6ff";

const NEO_OPACITY = 0.85;

const DAY_MS = 86400000;
const EPOCH_MS = EPOCH.getTime();
const RAYCAST_INTERVAL_MS = 100;

const IDENTITY_MATRIX = new THREE.Matrix4();

function TrackingLabel({
  name,
  constants,
  timeRef,
  positionsRef,
  offset = 1.8,
  selected = false,
}) {
  const groupRef = useRef();
  const spanRef = useRef();
  const tempPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    getBodyPosition(constants, timeRef.current.getTime(), tempPosition);
    if (positionsRef.current) {
      const slot = positionsRef.current[name];
      if (!slot) positionsRef.current[name] = new THREE.Vector3();
      positionsRef.current[name].copy(tempPosition);
    }
    if (groupRef.current) {
      groupRef.current.position.set(
        tempPosition.x * AU_SCALE + offset,
        tempPosition.y * AU_SCALE,
        tempPosition.z * AU_SCALE,
      );
    }
  });

  useEffect(() => {
    const unregister = registerLabel({
      id: `neo-${name}`,
      el: () => spanRef.current,
      getPosition: () => {
        const group = groupRef.current;
        if (!group) return null;
        group.updateWorldMatrix(true, false);
        return group.getWorldPosition(tempPosition);
      },
      priority: () =>
        selected ? LABEL_PRIORITY.SELECTED : LABEL_PRIORITY.HOVERED,
      force: () => selected,
      isHovered: () => !selected,
      interactive: false,
    });
    return unregister;
  }, [name, selected, tempPosition]);

  return (
    <group ref={groupRef}>
      <Html className="select-none" center>
        <span
          ref={spanRef}
          className="neo-label-text text-xs select-none"
          style={{ color: "#ffffff" }}
        >
          {shortLabelName(name)}
        </span>
      </Html>
    </group>
  );
}

function NEOInstances({ bodies, timeRef, positionsRef, onSelect, selectedId }) {
  const { instancedMesh, constants, names, raycastPositions, count } =
    useMemo(() => {
      const count = bodies.length;
      const geometry = new THREE.PlaneGeometry(0.8, 0.8);

      const aArr = new Float32Array(count);
      const eArr = new Float32Array(count);
      const iArr = new Float32Array(count);
      const OmegaArr = new Float32Array(count);
      const omegaArr = new Float32Array(count);
      const M0Arr = new Float32Array(count);
      const nArr = new Float32Array(count);
      const scaleArr = new Float32Array(count);
      const colorArr = new Float32Array(count * 3);

      const constants = new Array(count);
      const names = new Array(count);
      const raycastPositions = new Float32Array(count * 3);

      const color = new THREE.Color();
      bodies.forEach((body, i) => {
        const c = precomputeConstants(body);
        constants[i] = c;
        names[i] = body.planet;

        aArr[i] = c.a;
        eArr[i] = c.e;
        iArr[i] = c.i;
        OmegaArr[i] = c.Omega;
        omegaArr[i] = c.omega;
        M0Arr[i] = 0;
        nArr[i] = c.n;

        const h = Number.isFinite(body.H) ? body.H : 0;
        scaleArr[i] = THREE.MathUtils.clamp(1.35 - h / 25, 0.55, 1.35);

        color.set(NEO_COLOR);
        colorArr[i * 3] = color.r;
        colorArr[i * 3 + 1] = color.g;
        colorArr[i * 3 + 2] = color.b;
      });

      geometry.setAttribute(
        "aElement",
        new THREE.InstancedBufferAttribute(aArr, 1),
      );
      geometry.setAttribute(
        "eElement",
        new THREE.InstancedBufferAttribute(eArr, 1),
      );
      geometry.setAttribute(
        "iElement",
        new THREE.InstancedBufferAttribute(iArr, 1),
      );
      geometry.setAttribute(
        "OmegaElement",
        new THREE.InstancedBufferAttribute(OmegaArr, 1),
      );
      geometry.setAttribute(
        "omegaElement",
        new THREE.InstancedBufferAttribute(omegaArr, 1),
      );
      geometry.setAttribute(
        "M0Element",
        new THREE.InstancedBufferAttribute(M0Arr, 1),
      );
      geometry.setAttribute(
        "nElement",
        new THREE.InstancedBufferAttribute(nArr, 1),
      );
      geometry.setAttribute(
        "scaleElement",
        new THREE.InstancedBufferAttribute(scaleArr, 1),
      );
      geometry.setAttribute(
        "colorElement",
        new THREE.InstancedBufferAttribute(colorArr, 3),
      );

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: NEO_OPACITY },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.InstancedMesh(geometry, material, count);
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      for (let i = 0; i < count; i++) {
        mesh.setMatrixAt(i, IDENTITY_MATRIX);
      }
      mesh.instanceMatrix.needsUpdate = true;

      const sphere = new THREE.Sphere();
      const hitPoint = new THREE.Vector3();
      mesh.raycast = function (raycaster, intersects) {
        for (let i = 0; i < count; i++) {
          sphere.center.set(
            raycastPositions[i * 3],
            raycastPositions[i * 3 + 1],
            raycastPositions[i * 3 + 2],
          );
          sphere.center.applyMatrix4(this.matrixWorld);
          sphere.radius = 0.4 * scaleArr[i];
          if (raycaster.ray.intersectSphere(sphere, hitPoint)) {
            intersects.push({
              distance: raycaster.ray.origin.distanceTo(hitPoint),
              point: hitPoint.clone(),
              object: this,
              instanceId: i,
            });
          }
        }
      };

      return { instancedMesh: mesh, constants, names, raycastPositions, count };
    }, [bodies]);

  const tempPosition = useMemo(() => new THREE.Vector3(), []);

  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const hoveredName = hoveredIndex >= 0 ? names[hoveredIndex] : null;
  const hoveredConstants = hoveredIndex >= 0 ? constants[hoveredIndex] : null;

  useEffect(() => {
    if (count === 0) return;

    const updateCache = () => {
      const timeMs = timeRef.current.getTime();
      for (let i = 0; i < count; i++) {
        getBodyPosition(constants[i], timeMs, tempPosition);
        raycastPositions[i * 3] = tempPosition.x * AU_SCALE;
        raycastPositions[i * 3 + 1] = tempPosition.y * AU_SCALE;
        raycastPositions[i * 3 + 2] = tempPosition.z * AU_SCALE;
      }
    };

    updateCache();
    const intervalId = setInterval(updateCache, RAYCAST_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [constants, count, raycastPositions, positionsRef, timeRef, tempPosition]);

  useFrame(() => {
    const material = instancedMesh.material;
    if (material && material.uniforms) {
      material.uniforms.uTime.value =
        (timeRef.current.getTime() - EPOCH_MS) / DAY_MS;
    }
  });

  const handlePointerMove = (e) => {
    const id = e.instanceId ?? -1;
    if (id !== hoveredIndex) {
      setHoveredIndex(id);
    }
  };

  const handlePointerOut = () => {
    setHoveredIndex(-1);
  };

  const handleClick = (e) => {
    const id = e.instanceId ?? -1;
    if (id < 0 || !bodies[id]) return;
    e.stopPropagation();
    if (onSelect) {
      const pos = positionsRef.current[names[id]];
      onSelect(
        bodies[id],
        pos
          ? new THREE.Vector3(
              pos.x * AU_SCALE,
              pos.y * AU_SCALE,
              pos.z * AU_SCALE,
            )
          : new THREE.Vector3(
              raycastPositions[id * 3],
              raycastPositions[id * 3 + 1],
              raycastPositions[id * 3 + 2],
            ),
      );
    }
  };

  return (
    <>
      <primitive
        object={instancedMesh}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
      {hoveredName && hoveredConstants && (
        <TrackingLabel
          name={hoveredName}
          constants={hoveredConstants}
          timeRef={timeRef}
          positionsRef={positionsRef}
        />
      )}
      {selectedId &&
        selectedId !== hoveredName &&
        (() => {
          const selectedIndex = names.indexOf(selectedId);
          if (selectedIndex < 0) return null;
          return (
            <TrackingLabel
              key={`selected-${names[selectedIndex]}`}
              name={names[selectedIndex]}
              constants={constants[selectedIndex]}
              timeRef={timeRef}
              positionsRef={positionsRef}
              selected
            />
          );
        })()}
    </>
  );
}

export default NEOInstances;
