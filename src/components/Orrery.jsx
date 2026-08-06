import React, {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faBackward,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import Planet from "./Planet";
import NEOInstances from "./NEOInstances";
import combinedCelestialData from "../utilities/CombinedCelestialData";
import AnimatedLayers from "./Layers";
import Orbit from "./Orbit";
import { StarField } from "./StarField";
import LabelManager from "./LabelManager";
import { shortLabelName } from "../utilities/labelManager";
import {
  AU_SCALE,
  precomputeConstants,
  getBodyPosition,
} from "../utilities/kepler";

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
  "Mercury Barycenter (199)": "#b0a89a",
  "Venus Barycenter (299)": "#b8a86a",
  "Earth-Moon Barycenter (3)": "#7f96c0",
  "Mars Barycenter (4)": "#c0786a",
  "Jupiter Barycenter (5)": "#c09a6a",
  "Saturn Barycenter (6)": "#b3a278",
  "Uranus Barycenter (7)": "#7faeae",
  "Neptune Barycenter (8)": "#7a7ab0",
  "Pluto Barycenter (9)": "#a89f92",
};

const featuredColors = {
  PHAEX: "#ffffff",
  NEAEX: "#ffffff",
};

const FEATURED_ORBIT_COLOR = "#8a8a8a";

function labelColorFor(body) {
  if (orbitColors[body.planet]) return orbitColors[body.planet];
  if (featuredColors[body.type]) return featuredColors[body.type];
  return "#ffffff";
}

const FLY_DURATION = 1400;
const RETURN_DURATION = 1500;
/** How many AU closer to the Sun the camera orbit is vs the asteroid's */
const CAMERA_ORBIT_OFFSET_AU = 0.12;
/** Floor factor — camera orbit is at least this fraction of the asteroid's a */
const MIN_ORBIT_FACTOR = 0.7;
/** Camera pitch offset in degrees (negative = look down) */
const CAMERA_PITCH_DEG = -10;
const CAMERA_PITCH_Z = Math.tan(THREE.MathUtils.degToRad(-CAMERA_PITCH_DEG));

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Pre-allocated vectors so the hot loop produces zero garbage
const _camPos = new THREE.Vector3();
const _astPos = new THREE.Vector3();

/**
 * Co-orbital camera — NASA Eyes style.
 *
 * The camera rides a "shadow orbit" with the same shape (e, i, Ω, ω) as the
 * selected asteroid but a slightly smaller semi-major axis `a`. Its mean
 * motion is forced to match the asteroid's, so both sweep the same angle at
 * the same rate. Because the orbits are geometrically similar, the asteroid
 * barely moves on screen — only the background drifts gently.
 *
 * OrbitControls is disabled while tracking to avoid fighting with the
 * orbit-driven camera position.
 */
function CameraTracker({
  controlsRef,
  selectedId,
  selectedBody,
  resetCamera,
  timeRef,
}) {
  const { camera } = useThree();

  const phase = useRef("idle"); // idle | flying | tracking | returning
  const tStart = useRef(0);
  const fromPos = useRef(new THREE.Vector3());
  const fromTarget = useRef(new THREE.Vector3());
  const prevId = useRef(null);
  const savedUp = useRef(new THREE.Vector3());

  // Orbit constants (computed once per selection)
  const camOrbit = useRef(null);
  const astOrbit = useRef(null);

  // ── selection / deselection ──────────────────────────────────────────
  useEffect(() => {
    const old = prevId.current;
    prevId.current = selectedId;

    if (selectedId && selectedId !== old && selectedBody) {
      // Build asteroid orbit constants
      const astC = precomputeConstants(selectedBody);

      // Camera orbit: same shape, smaller radius, same angular speed
      const camA = Math.max(
        selectedBody.a * MIN_ORBIT_FACTOR,
        selectedBody.a - CAMERA_ORBIT_OFFSET_AU,
      );
      const camC = precomputeConstants({ ...selectedBody, a: camA });
      camC.n = astC.n; // force identical angular speed

      astOrbit.current = astC;
      camOrbit.current = camC;

      // Snapshot current camera state for the fly-to lerp
      fromPos.current.copy(camera.position);
      fromTarget.current.copy(
        controlsRef.current?.target ?? new THREE.Vector3(),
      );
      savedUp.current.copy(camera.up);

      tStart.current = performance.now();
      phase.current = "flying";

      // Disable orbit controls while tracking
      if (controlsRef.current) controlsRef.current.enabled = false;
    } else if (!selectedId && old) {
      // Deselected → fly back
      fromPos.current.copy(camera.position);
      fromTarget.current.copy(
        controlsRef.current?.target ?? new THREE.Vector3(),
      );

      camOrbit.current = null;
      astOrbit.current = null;

      tStart.current = performance.now();
      phase.current = "returning";
    }
  }, [selectedId, selectedBody, camera, controlsRef, timeRef]);

  // ── explicit reset (close panel button) ──────────────────────────────
  useEffect(() => {
    if (resetCamera && phase.current !== "returning") {
      fromPos.current.copy(camera.position);
      fromTarget.current.copy(
        controlsRef.current?.target ?? new THREE.Vector3(),
      );

      camOrbit.current = null;
      astOrbit.current = null;

      tStart.current = performance.now();
      phase.current = "returning";
    }
  }, [resetCamera, camera, controlsRef]);

  // ── per-frame ────────────────────────────────────────────────────────
  useFrame(() => {
    const p = phase.current;
    if (p === "idle") return;

    const ctl = controlsRef.current;
    const timeMs = timeRef.current.getTime();

    if (p === "flying") {
      const t = Math.min(
        (performance.now() - tStart.current) / FLY_DURATION,
        1,
      );
      const e = easeInOutCubic(t);

      // Compute live orbit positions so we fly toward where the object IS,
      // not where it was when clicked
      if (camOrbit.current && astOrbit.current) {
        getBodyPosition(camOrbit.current, timeMs, _camPos);
        getBodyPosition(astOrbit.current, timeMs, _astPos);

        _camPos.multiplyScalar(AU_SCALE);
        _astPos.multiplyScalar(AU_SCALE);

        // Elevate camera above the orbital plane for the pitch offset
        const dist = _camPos.distanceTo(_astPos);
        _camPos.z += dist * CAMERA_PITCH_Z;

        camera.position.lerpVectors(fromPos.current, _camPos, e);
        camera.up.set(0, 0, 1);
        camera.lookAt(_astPos);

        if (ctl) {
          ctl.target.lerpVectors(fromTarget.current, _astPos, e);
          ctl.update();
        }
      }

      if (t >= 1) phase.current = "tracking";
    } else if (p === "tracking") {
      if (!camOrbit.current || !astOrbit.current) return;

      getBodyPosition(camOrbit.current, timeMs, _camPos);
      getBodyPosition(astOrbit.current, timeMs, _astPos);

      _camPos.multiplyScalar(AU_SCALE);
      _astPos.multiplyScalar(AU_SCALE);

      // Elevate camera above the orbital plane for the pitch offset
      const dist = _camPos.distanceTo(_astPos);
      _camPos.z += dist * CAMERA_PITCH_Z;

      camera.position.copy(_camPos);
      camera.up.set(0, 0, 1);
      camera.lookAt(_astPos);

      if (ctl) {
        ctl.target.copy(_astPos);
      }
    } else if (p === "returning") {
      const t = Math.min(
        (performance.now() - tStart.current) / RETURN_DURATION,
        1,
      );
      const e = easeInOutCubic(t);

      const defPos = new THREE.Vector3(...DEFAULT_CAMERA_POSITION);
      const defTgt = new THREE.Vector3(0, 0, 0);

      camera.position.lerpVectors(fromPos.current, defPos, e);
      camera.up.lerpVectors(
        new THREE.Vector3(0, 0, 1),
        savedUp.current,
        e,
      );
      camera.lookAt(
        defTgt.clone().lerp(fromTarget.current, 1 - e),
      );

      if (ctl) {
        ctl.target.lerpVectors(fromTarget.current, defTgt, e);
        ctl.update();
      }

      if (t >= 1) {
        camera.up.copy(savedUp.current);
        phase.current = "idle";
        // Re-enable orbit controls
        if (ctl) ctl.enabled = true;
      }
    }
  });

  return null;
}

const Scene = React.memo(function Scene({
  visibleBodies,
  timeRef,
  positionsRef,
  showTags,
  showOrbits,
  onPlanetSelect,
  resetCamera,
  selectedId,
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const colors = sceneColors;
  const [hoveredId, setHoveredId] = useState(null);

  // Look up the full body data for the selected object (needed by co-orbital camera)
  const selectedBody = useMemo(() => {
    if (!selectedId) return null;
    return visibleBodies.find((b) => b.planet === selectedId) || null;
  }, [selectedId, visibleBodies]);

  const handlePlanetClick = useCallback(
    (planetId, position) => {
      const planet = visibleBodies.find((body) => body.planet === planetId);
      if (planet && position) {
        onPlanetSelect(planet);
      }
    },
    [visibleBodies, onPlanetSelect],
  );

  const handleNEOSelect = useCallback(
    (body) => {
      onPlanetSelect(body);
    },
    [onPlanetSelect],
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
        minDistance={5}
        maxDistance={25000}
        enableDamping
        dampingFactor={0.12}
      />

      {/* Co-orbital camera tracker */}
      <CameraTracker
        controlsRef={controlsRef}
        selectedId={selectedId}
        selectedBody={selectedBody}
        resetCamera={resetCamera}
        timeRef={timeRef}
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
            setHoveredId={setHoveredId}
          />
          {showOrbits && selectedId !== body.planet && (
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
              hovered={hoveredId === body.planet}
            />
          )}
        </Fragment>
      ))}
      {extended.map((body) => (
        <Fragment key={body.planet}>
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
            setHoveredId={setHoveredId}
          />
          {showOrbits && selectedId !== body.planet && (
            <Orbit
              planetId={body.planet}
              argument_of_perifocus={body.w}
              eccentricity={body.e}
              inclination={body.incl}
              longitude_of_ascending_node={body.Omega}
              semi_major_axis={body.a}
              orbitType="featured"
              color={FEATURED_ORBIT_COLOR}
              tailColor={FEATURED_ORBIT_COLOR}
              positionsRef={positionsRef}
              onOrbitClick={handlePlanetClick}
              hovered={hoveredId === body.planet}
            />
          )}
        </Fragment>
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
  const positionsRef = useRef({});
  const [infoOpen, setInfoOpen] = useState(false);

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
    setInfoOpen(true);
  }, []);

  const handleResetCamera = useCallback(() => {
    setSelectedPlanet(null);
    setResetCameraFlag(true);
    setInfoOpen(false);
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

  const processedBodies = useMemo(
    () => [
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
    ],
    [],
  );

  const visibleBodies = useMemo(
    () =>
      processedBodies.filter(
        (body) =>
          body.type === "majorBody" ||
          (body.type === "PHA" && showPHAs) ||
          (body.type === "NEA" && showNEAs) ||
          (body.type === "PHAEX" && showPHAsEX) ||
          (body.type === "NEAEX" && showNEAsEX),
      ),
    [
      processedBodies,
      showPHAs,
      showNEAs,
      showPHAsEX,
      showNEAsEX,
    ],
  );

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
              positionsRef={positionsRef}
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
                  className={`w-8 h-8 aspect-square flex items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${
                    speed < 0
                      ? "bg-white/15 text-white border-white/10"
                      : "text-zinc-400 border-white/10 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <FontAwesomeIcon icon={faBackward} />
                </button>
                <button
                  onClick={togglePause}
                  aria-label="toggle pause-play"
                  className="w-8 h-8 aspect-square flex items-center justify-center rounded-full text-zinc-400 border border-white/10 hover:text-white hover:bg-white/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
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
                  className="bg-transparent text-zinc-300 border-b border-transparent focus:border-zinc-300 focus:outline-none px-1 py-1 text-sm w-52 text-center placeholder-zinc-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleLive}
                  aria-label="return to live time"
                  className="rounded-full border border-white/10 text-zinc-300 px-3 py-1 text-xs hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
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
              className="w-64 md:w-80 accent-zinc-300"
            />
            <span className="text-zinc-400 text-xs font-medium tracking-wide whitespace-nowrap">
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
          <div className="pointer-events-auto fixed bottom-3 left-3 right-3 z-50 sm:left-4 sm:right-auto sm:bottom-4 sm:max-w-md">
            <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white shadow-lg backdrop-blur-md sm:max-w-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
                    Following
                  </div>
                  <div className="mt-1 truncate text-base font-semibold text-white sm:text-lg">
                    {shortLabelName(selectedPlanet.planet)}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {selectedPlanet.type || "N/A"} • ID {selectedPlanet.id || "N/A"}
                  </div>
                </div>
                <button
                  onClick={handleResetCamera}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                  <span>Back</span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-zinc-200 sm:grid-cols-4">
                <PlainStat label="a" value={formatMaybe(selectedPlanet.a, 3, " AU")} />
                <PlainStat label="e" value={formatMaybe(selectedPlanet.e, 6)} />
                <PlainStat label="i" value={formatMaybe(selectedPlanet.incl, 2, "°")} />
                <PlainStat label="P" value={selectedPlanet.P ? formatMaybe(selectedPlanet.P, 2, " y") : "N/A"} />
              </div>

              <div className="mt-3 text-xs text-zinc-400">
                Live position: {formatMaybe(positionsRef.current[selectedPlanet.planet]?.x, 4)} / {formatMaybe(positionsRef.current[selectedPlanet.planet]?.y, 4)} / {formatMaybe(positionsRef.current[selectedPlanet.planet]?.z, 4)}
              </div>

              <button
                onClick={() => setInfoOpen((current) => !current)}
                className="mt-2 text-xs text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-white"
                aria-label={infoOpen ? "Hide more details" : "Show more details"}
              >
                {infoOpen ? "Hide more details" : "Show more details"}
              </button>

              {infoOpen && (
                <div className="mt-3 space-y-3 border-t border-white/10 pt-3 text-xs text-zinc-300">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <MiniText label="X" value={formatMaybe(positionsRef.current[selectedPlanet.planet]?.x, 6)} />
                    <MiniText label="Y" value={formatMaybe(positionsRef.current[selectedPlanet.planet]?.y, 6)} />
                    <MiniText label="Z" value={formatMaybe(positionsRef.current[selectedPlanet.planet]?.z, 6)} />
                    <MiniText label="Ω" value={formatMaybe(selectedPlanet.Omega, 2, "°")} />
                    <MiniText label="ω" value={formatMaybe(selectedPlanet.w, 2, "°")} />
                    <MiniText label="M" value={formatMaybe(selectedPlanet.M, 2, "°")} />
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => setInfoOpen(false)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Hide details
                    </button>
                    <button
                      onClick={handleResetCamera}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Return to solar system
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const formatMaybe = (value, decimals = 3, unit = "") =>
  typeof value === "number" ? `${value.toFixed(decimals)}${unit}` : "N/A";

const PlainStat = ({ label, value }) => (
  <div className="flex items-center gap-2 whitespace-nowrap">
    <span className="text-zinc-500">{label}</span>
    <span className="text-white">{value}</span>
  </div>
);

const MiniText = ({ label, value }) => (
  <div className="rounded-lg bg-white/5 px-3 py-2">
    <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
    <div className="mt-1 text-white">{value}</div>
  </div>
);

export default Orrery;
