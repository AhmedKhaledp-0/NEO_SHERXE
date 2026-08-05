import React, { Fragment, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  AdaptiveDpr,
  AdaptiveEvents,
} from "@react-three/drei";
import * as THREE from "three";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import Planet from "./Planet";
import NEOInstances from "./NEOInstances";
import combinedCelestialData from "../utilities/CombinedCelestialData";
import AnimatedLayers from "./Layers";
import PlanetInfoPanel from "./PlanetInfoPanel";
import Orbit from "./Orbit";
import { StarField } from "./StarField";

const sceneColors = {
  light: {
    background: "#fff",
    sun: "#ffff00",
    ambientLight: 0.3,
    pointLight: 3,
  },
  dark: {
    background: "#000000",
    sun: "#ffd700",
    ambientLight: 0.2,
    pointLight: 4,
  },
};

const orbitColors = {
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

const Scene = React.memo(function Scene({
  visibleBodies,
  timeRef,
  showTags,
  showOrbits,
  onPlanetSelect,
  resetCamera,
  isDark,
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const positionsRef = useRef({});
  const colors = isDark ? sceneColors.dark : sceneColors.light;

  const moveCameraToObject = useCallback(
    (position) => {
      if (!position) return;

      const startPosition = camera.position.clone();
      const startTarget = controlsRef.current
        ? controlsRef.current.target.clone()
        : new THREE.Vector3();

      const distanceToObject = position.length();
      const cameraDistance = Math.min(
        Math.max(distanceToObject * 0.3, 20),
        200
      );
      const angle = Math.PI / 6;

      const newCameraPosition = new THREE.Vector3(
        position.x + Math.cos(angle) * cameraDistance,
        position.y + Math.sin(angle) * cameraDistance,
        position.z + cameraDistance * 0.3
      );

      const duration = 1000;
      const startTime = Date.now();

      function updateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easing =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        camera.position.lerpVectors(startPosition, newCameraPosition, easing);

        if (controlsRef.current) {
          const currentTarget = controlsRef.current.target;
          currentTarget.lerpVectors(startTarget, position, easing);
          controlsRef.current.update();
        }

        camera.lookAt(position);

        if (progress < 1) {
          requestAnimationFrame(updateCamera);
        }
      }

      updateCamera();
    },
    [camera]
  );

  const resetCameraView = useCallback(() => {
    const startPosition = camera.position.clone();
    const startTarget = controlsRef.current
      ? controlsRef.current.target.clone()
      : new THREE.Vector3();
    const defaultPosition = new THREE.Vector3(0, -900, 500);
    const defaultTarget = new THREE.Vector3(0, 0, 0);

    const duration = 1500;
    const startTime = Date.now();

    function updateCamera() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easing =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.lerpVectors(startPosition, defaultPosition, easing);

      if (controlsRef.current) {
        const currentTarget = controlsRef.current.target;
        currentTarget.lerpVectors(startTarget, defaultTarget, easing);
        controlsRef.current.update();
      }

      camera.lookAt(defaultTarget);

      if (progress < 1) {
        requestAnimationFrame(updateCamera);
      }
    }

    updateCamera();
  }, [camera]);

  useEffect(() => {
    if (resetCamera) {
      resetCameraView();
    }
  }, [resetCamera, resetCameraView]);

  const handlePlanetClick = useCallback(
    (planetId, position) => {
      const planet = visibleBodies.find((body) => body.planet === planetId);
      if (planet && position) {
        onPlanetSelect(planet);
        moveCameraToObject(position);
      }
    },
    [visibleBodies, onPlanetSelect, moveCameraToObject]
  );

  const handleNEOSelect = useCallback(
    (body, position) => {
      onPlanetSelect(body);
      moveCameraToObject(position);
    },
    [onPlanetSelect, moveCameraToObject]
  );

  const { majorAndDwarf, extended, bulkNEOs } = useMemo(() => {
    const majorAndDwarf = [];
    const extended = [];
    const bulkNEOs = [];
    for (const body of visibleBodies) {
      if (body.type === "majorBody" || body.type === "dwarfPlanet") {
        majorAndDwarf.push(body);
      } else if (body.type === "PHAEX" || body.type === "NEAEX") {
        extended.push(body);
      } else {
        bulkNEOs.push(body);
      }
    }
    return { majorAndDwarf, extended, bulkNEOs };
  }, [visibleBodies]);

  return (
    <>
      <StarField count={3000} isDark={isDark} />

      <fog attach="fog" args={[isDark ? "#000000" : "#0a0f1c", 3000, 5000]} />

      <OrbitControls ref={controlsRef} args={[camera, gl.domElement]} />

      <ambientLight intensity={colors.ambientLight} />
      <pointLight
        position={[0, 0, 0]}
        intensity={colors.pointLight}
        distance={100000}
        decay={0}
      />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color={colors.sun} />
      </mesh>
      {majorAndDwarf.map((body) => (
        <Fragment key={body.planet}>
          <Planet
            planetId={body.planet}
            position={body.position}
            velocity={body.velocity}
            eccentricity={body.e}
            semi_major_axis={body.a}
            inclination={body.incl}
            longitude_of_ascending_node={body.Omega}
            argument_of_perifocus={body.w}
            mean_motion={body.n}
            type={body.type}
            showTags={showTags}
            id={body.id}
            positionsRef={positionsRef}
            timeRef={timeRef}
            onPlanetClick={handlePlanetClick}
          />
          {showOrbits && (
            <Orbit
              planetId={body.planet}
              argument_of_perifocus={body.w}
              eccentricity={body.e}
              inclination={body.incl}
              longitude_of_ascending_node={body.Omega}
              semi_major_axis={body.a}
              orbitType="normal"
              color={orbitColors[body.planet] || "white"}
              positionsRef={positionsRef}
              onOrbitClick={handlePlanetClick}
            />
          )}
          {showOrbits && body.type === "dwarfPlanet" && (
            <Orbit
              planetId={body.planet}
              argument_of_perifocus={body.w}
              eccentricity={body.e}
              inclination={body.incl}
              longitude_of_ascending_node={body.Omega}
              semi_major_axis={body.a}
              orbitType="tail"
              color={orbitColors[body.planet] || "white"}
              positionsRef={positionsRef}
              onOrbitClick={handlePlanetClick}
            />
          )}
        </Fragment>
      ))}
      {extended.map((body) => (
        <Planet
          key={body.planet}
          planetId={body.planet}
          position={body.position}
          velocity={body.velocity}
          eccentricity={body.e}
          semi_major_axis={body.a}
          inclination={body.incl}
          longitude_of_ascending_node={body.Omega}
          argument_of_perifocus={body.w}
          mean_motion={body.n}
          type={body.type}
          showTags={showTags}
          id={body.id}
          positionsRef={positionsRef}
          timeRef={timeRef}
          onPlanetClick={handlePlanetClick}
        />
      ))}
      {bulkNEOs.length > 0 && (
        <NEOInstances
          bodies={bulkNEOs}
          timeRef={timeRef}
          positionsRef={positionsRef}
          onSelect={handleNEOSelect}
        />
      )}
    </>
  );
});

function Orrery() {
  const [celestialBodiesData, setCelestialBodiesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [showDwarfPlanets, setShowDwarfPlanets] = useState(true);
  const [showPHAs, setShowPHAs] = useState(false);
  const [showNEAs, setShowNEAs] = useState(false);
  const [showPHAsEX, setShowPHAsEX] = useState(true);
  const [showNEAsEX, setShowNEAsEX] = useState(true);

  const [showTags, setShowTags] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [resetCameraFlag, setResetCameraFlag] = useState(false);
  const [isDark] = useState(false);

  const simTimeRef = useRef(new Date());
  const lastUpdateTime = useRef(performance.now());
  const frameId = useRef();

  const handlePlanetSelect = useCallback((planet) => {
    if (!planet) {
      console.warn("No planet data received");
      return;
    }
    setSelectedPlanet(planet);
  }, []);

  const handleResetCamera = useCallback(() => {
    setSelectedPlanet(null);
    setResetCameraFlag(true);
  }, []);

  useEffect(() => {
    if (resetCameraFlag) {
      setResetCameraFlag(false);
    }
  }, [resetCameraFlag]);

  useEffect(() => {
    if (paused) {
      cancelAnimationFrame(frameId.current);
      return;
    }

    lastUpdateTime.current = performance.now();
    let lastUiUpdate = 0;

    const updateTime = (currentTime) => {
      const deltaTime = currentTime - lastUpdateTime.current;
      simTimeRef.current = new Date(
        simTimeRef.current.getTime() + deltaTime * speed
      );
      lastUpdateTime.current = currentTime;

      if (currentTime - lastUiUpdate > 250) {
        lastUiUpdate = currentTime;
        setTime(new Date(simTimeRef.current));
      }
      frameId.current = requestAnimationFrame(updateTime);
    };

    frameId.current = requestAnimationFrame(updateTime);

    return () => {
      cancelAnimationFrame(frameId.current);
    };
  }, [speed, paused]);

  const handleSpeedChange = (event) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value
      ? new Date(event.target.value)
      : new Date();
    simTimeRef.current = newDate;
    setTime(newDate);
  };

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      const processedData = [
        ...combinedCelestialData.majorBodies.map((body) => ({
          ...body.vectors,
          ...body.elements,
          id: body.body_id,
          planet: body.vectors.targetname,
          type: "majorBody",
        })),
        ...combinedCelestialData.dwarfPlanets.map((body) => ({
          ...body.vectors,
          ...body.elements,
          id: body.body_id,
          planet: body.vectors.targetname,
          type: "dwarfPlanet",
        })),
        ...combinedCelestialData.PHAs.map((body) => ({
          ...body.vectors,
          ...body.elements,
          id: body.body_id,
          planet: body.vectors.targetname,
          type: "PHA",
        })),
        ...combinedCelestialData.NEAs.map((body) => ({
          ...body.vectors,
          ...body.elements,
          id: body.body_id,
          planet: body.vectors.targetname,
          type: "NEA",
        })),
        ...combinedCelestialData.PHAsEX.map((body) => ({
          ...body.vectors,
          ...body.elements,
          id: body.body_id,
          planet: body.vectors.targetname,
          type: "PHAEX",
        })),
        ...combinedCelestialData.NEAsEX.map((body) => ({
          ...body.vectors,
          ...body.elements,
          id: body.body_id,
          planet: body.vectors.targetname,
          type: "NEAEX",
        })),
      ];

      setCelestialBodiesData(processedData);
    } catch {
      setError(
        "Failed to process celestial body data. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const visibleBodies = useMemo(
    () =>
      celestialBodiesData.filter(
        (body) =>
          body.type === "majorBody" ||
          (body.type === "dwarfPlanet" && showDwarfPlanets) ||
          (body.type === "PHA" && showPHAs) ||
          (body.type === "NEA" && showNEAs) ||
          (body.type === "PHAEX" && showPHAsEX) ||
          (body.type === "NEAEX" && showNEAsEX)
      ),
    [
      celestialBodiesData,
      showDwarfPlanets,
      showPHAs,
      showNEAs,
      showPHAsEX,
      showNEAsEX,
    ]
  );

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-light-background/80 dark:bg-dark-background/80 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-light-primary dark:text-dark-primary animate-spin"
          />
          <p className="text-light-text/70 dark:text-dark-text/70">
            Loading solar system...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="card max-w-md mx-auto text-center space-y-4">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-4xl text-light-danger dark:text-dark-danger"
          />
          <p className="text-light-text/70 dark:text-dark-text/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100vh-80px] bg-light-background dark:bg-dark-background mt-0">
      <div className="absolute inset-0 z-10">
        <Canvas
          dpr={[1, 2]}
          frameloop="always"
          performance={{
            current: 1,
            min: 0.5,
            max: 1,
            debounce: 200,
          }}
          camera={{
            fov: 45,
            near: 0.1,
            far: 100000000,
            position: [0, -900, 500],
          }}
          gl={{
            antialias: true,
            alpha: false,
            stencil: false,
            depth: true,
            logarithmicDepthBuffer: true,
            powerPreference: "high-performance",
          }}
          style={{
            background: isDark ? "#030712" : "#0a0f1c",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
          }}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Suspense fallback={null}>
            <Scene
              visibleBodies={visibleBodies}
              timeRef={simTimeRef}
              showTags={showTags}
              showOrbits={showOrbits}
              onPlanetSelect={handlePlanetSelect}
              resetCamera={resetCameraFlag}
              isDark={isDark}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none fixed inset-0 z-20">
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.1"
                max="900000"
                step="90"
                value={speed}
                onChange={handleSpeedChange}
                className="w-48 md:w-64"
              />
              <span className="text-sm text-light-text dark:text-dark-text whitespace-nowrap">
                {speed === 1 ? "1x (Real-time)" : `${speed}x`}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="datetime-local"
                value={time.toISOString().slice(0, 16)}
                onChange={handleDateChange}
                className="bg-transparent border border-light-primary/20 dark:border-dark-primary/20 rounded px-2 py-1 text-sm"
              />
              <button
                onClick={togglePause}
                aria-label="toggle pause-play"
                className="btn-primary flex justify-center w-10 h-10  aspect-square items-center "
              >
                <FontAwesomeIcon icon={paused ? faPlay : faPause} />
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto">
          <AnimatedLayers
            showDwarfPlanets={showDwarfPlanets}
            setShowDwarfPlanets={setShowDwarfPlanets}
            showPHAs={showPHAs}
            setShowPHAs={setShowPHAs}
            showNEAs={showNEAs}
            setShowNEAs={setShowNEAs}
            showPHAsEX={showPHAsEX}
            setShowPHAsEX={setShowPHAsEX}
            showNEAsEX={showNEAsEX}
            setShowNEAsEX={setShowNEAsEX}
            showTags={showTags}
            setShowTags={setShowTags}
            showOrbits={showOrbits}
            setShowOrbits={setShowOrbits}
          />
        </div>

        {selectedPlanet && (
          <div className="pointer-events-auto">
            <PlanetInfoPanel
              planet={selectedPlanet}
              onClose={() => {
                setSelectedPlanet(null);
                handleResetCamera();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Orrery;
