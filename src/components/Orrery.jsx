import React, {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faSpinner,
  faExclamationTriangle,
  faBackward,
} from "@fortawesome/free-solid-svg-icons";
import Planet from "./Planet";
import NEOInstances from "./NEOInstances";
import combinedCelestialData from "../utilities/CombinedCelestialData";
import AnimatedLayers from "./Layers";
import PlanetInfoPanel from "./PlanetInfoPanel";
import Orbit from "./Orbit";
import { StarField } from "./StarField";
import LabelManager from "./LabelManager";

const sceneColors = {
  background: "#000000",
  sun: "#ffd700",
  ambientLight: 0.2,
  pointLight: 4,
};

const DEFAULT_CAMERA_POSITION = [0, -795, 667];

const HOUR_MS = 3600 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;

const TIME_WARP_PRESETS = [
  ["1x", 1],
  ...[...Array(23)].map((_, i) => [`${i + 1}h/s`, ((i + 1) * HOUR_MS) / 1000]),
  ...[...Array(6)].map((_, i) => [`${i + 1}d/s`, ((i + 1) * DAY_MS) / 1000]),
  ...[...Array(3)].map((_, i) => [`${i + 1}w/s`, ((i + 1) * WEEK_MS) / 1000]),
  ...[...Array(6)].map((_, i) => [`${i + 1}m/s`, ((i + 1) * MONTH_MS) / 1000]),
];

const SLIDER_MAX = TIME_WARP_PRESETS.length - 1;

function presetIndexForSpeed(speed) {
  const magnitude = Math.abs(speed);
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < TIME_WARP_PRESETS.length; i++) {
    const dist =
      Math.abs(TIME_WARP_PRESETS[i][1] - magnitude) / TIME_WARP_PRESETS[i][1];
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

function speedToSlider(speed) {
  return presetIndexForSpeed(speed);
}

function formatSpeed(speed) {
  const sign = speed < 0 ? "-" : "";
  const magnitude = Math.abs(speed);
  const preset = TIME_WARP_PRESETS.find(
    ([, m]) => Math.abs(magnitude - m) / m < 0.001,
  );
  if (preset) return `${sign}${preset[0]}`;
  return `${sign}${Math.round(magnitude)}x`;
}

function toReadableDate(date) {
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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

const featuredColors = {
  PHAEX: "#ffffff",
  NEAEX: "#ffffff",
};

function labelColorFor(body) {
  if (orbitColors[body.planet]) return orbitColors[body.planet];
  if (featuredColors[body.type]) return featuredColors[body.type];
  return "#ffffff";
}

const Scene = React.memo(function Scene({
  visibleBodies,
  timeRef,
  showTags,
  showOrbits,
  onPlanetSelect,
  resetCamera,
  selectedId,
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const positionsRef = useRef({});
  const colors = sceneColors;

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
        200,
      );
      const angle = Math.PI / 6;

      const newCameraPosition = new THREE.Vector3(
        position.x + Math.cos(angle) * cameraDistance,
        position.y + Math.sin(angle) * cameraDistance,
        position.z + cameraDistance * 0.3,
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
    [camera],
  );

  const resetCameraView = useCallback(() => {
    const startPosition = camera.position.clone();
    const startTarget = controlsRef.current
      ? controlsRef.current.target.clone()
      : new THREE.Vector3();
    const defaultPosition = new THREE.Vector3(...DEFAULT_CAMERA_POSITION);
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
    [visibleBodies, onPlanetSelect, moveCameraToObject],
  );

  const handleNEOSelect = useCallback(
    (body, position) => {
      onPlanetSelect(body);
      moveCameraToObject(position);
    },
    [onPlanetSelect, moveCameraToObject],
  );

  const { majorAndDwarf, extended, bulkNEOs } = useMemo(() => {
    const majorAndDwarf = [];
    const extended = [];
    const bulkNEOs = [];
    for (const body of visibleBodies) {
      if (body.type === "majorBody") {
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
      <StarField count={10000} />

      <fog attach="fog" args={["#000000", 12000, 80000]} />

      <OrbitControls
        ref={controlsRef}
        args={[camera, gl.domElement]}
        minDistance={10}
        maxDistance={25000}
      />

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
            labelColor={labelColorFor(body)}
            selected={selectedId === body.planet}
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
          labelColor={labelColorFor(body)}
          selected={selectedId === body.planet}
        />
      ))}
      {bulkNEOs.length > 0 && (
        <NEOInstances
          bodies={bulkNEOs}
          timeRef={timeRef}
          positionsRef={positionsRef}
          onSelect={handleNEOSelect}
          selectedId={selectedId}
        />
      )}
      <LabelManager />
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
  const [showPHAs, setShowPHAs] = useState(false);
  const [showNEAs, setShowNEAs] = useState(false);
  const [showPHAsEX, setShowPHAsEX] = useState(true);
  const [showNEAsEX, setShowNEAsEX] = useState(true);

  const [showTags, setShowTags] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [resetCameraFlag, setResetCameraFlag] = useState(false);

  const [editingDate, setEditingDate] = useState(false);
  const [dateText, setDateText] = useState(() => toReadableDate(new Date()));

  const simTimeRef = useRef(new Date());
  const lastUpdateTime = useRef(performance.now());
  const frameId = useRef();

  useEffect(() => {
    if (!editingDate) {
      setDateText(toReadableDate(time));
    }
  }, [time, editingDate]);

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
        simTimeRef.current.getTime() + deltaTime * speed,
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
    const index = Math.round(parseFloat(event.target.value));
    const presetSpeed = TIME_WARP_PRESETS[index][1];
    setSpeed((prev) => (prev < 0 ? -presetSpeed : presetSpeed));
  };

  const toggleReverse = () => {
    setSpeed((prev) => (prev < 0 ? Math.abs(prev) : -Math.abs(prev)));
  };

  const handleDateChange = (event) => {
    setDateText(event.target.value);
    const newDate = event.target.value
      ? new Date(event.target.value)
      : new Date();
    if (!Number.isNaN(newDate.getTime())) {
      simTimeRef.current = newDate;
      setTime(newDate);
    }
  };

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  const handleLive = () => {
    const now = new Date();
    simTimeRef.current = now;
    setTime(now);
    setPaused(false);
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
        "Failed to process celestial body data. Please try again later.",
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
          (body.type === "PHA" && showPHAs) ||
          (body.type === "NEA" && showNEAs) ||
          (body.type === "PHAEX" && showPHAsEX) ||
          (body.type === "NEAEX" && showNEAsEX),
      ),
    [
      celestialBodiesData,
      showPHAs,
      showNEAs,
      showPHAsEX,
      showNEAsEX,
    ],
  );

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-dark-background/80 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-dark-primary animate-spin"
          />
          <p className="text-dark-text/70">Loading solar system...</p>
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
            className="text-4xl text-dark-danger"
          />
          <p className="text-dark-text/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100vh-80px] bg-dark-background mt-0">
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
            position: DEFAULT_CAMERA_POSITION,
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
            background: "#030712",
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
              selectedId={selectedPlanet ? selectedPlanet.planet : null}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none fixed inset-0 z-20">
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="flex flex-col items-center gap-2 px-6 py-4">
            <div className="grid grid-cols-[auto_1fr_auto] items-center w-full gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleReverse}
                  aria-label="reverse time"
                  title={speed < 0 ? "Play forward" : "Rewind"}
                  className={`w-10 h-10 aspect-square flex items-center justify-center rounded-full border transition-all duration-200 ${
                    speed < 0
                      ? "bg-white text-black border-white"
                      : "text-white border-white/20 hover:bg-white/10"
                  }`}
                >
                  <FontAwesomeIcon icon={faBackward} />
                </button>
                <button
                  onClick={togglePause}
                  aria-label="toggle pause-play"
                  className="w-10 h-10 aspect-square flex items-center justify-center rounded-full text-white border border-white/20 hover:bg-white/10 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={paused ? faPlay : faPause} />
                </button>
              </div>

              <div className="flex justify-center">
                <input
                  type="text"
                  value={dateText}
                  onFocus={() => setEditingDate(true)}
                  onBlur={() => setEditingDate(false)}
                  onChange={handleDateChange}
                  placeholder="Enter date, e.g. Aug 6, 2026"
                  className="bg-transparent text-white border-b border-transparent focus:border-white focus:outline-none px-1 py-1 text-sm w-52 text-center placeholder-white/40"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleLive}
                  aria-label="return to live time"
                  className="rounded-full border border-white/20 text-white px-4 py-1.5 text-sm hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Live
                </button>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max={SLIDER_MAX}
              step="1"
              value={speedToSlider(speed)}
              onChange={handleSpeedChange}
              className="w-64 md:w-80 accent-white"
            />
            <span className="text-white text-sm font-medium tracking-wide whitespace-nowrap">
              {formatSpeed(speed)}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto">
          <AnimatedLayers
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
