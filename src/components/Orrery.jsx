import { useCallback, useEffect, useRef, useState } from "react";
import React, { Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPause, 
  faPlay, 
  faSpinner,
  faExclamationTriangle 
} from "@fortawesome/free-solid-svg-icons";
import Planet from "./Planet";
import combinedCelestialData from "../utilities/CombinedCelestialData";
import AnimatedLayers from "./Layers";
import PlanetInfoPanel from "./PlanetInfoPanel";
import Orbit from "./Orbit";
import { StarField } from './StarField';

// Add theme colors for the scene
const sceneColors = {
  light: {
    background: '#fff',
    sun: '#ffff00',
    ambientLight: 0.3,
    pointLight: 3,
  },
  dark: {
    background: '#000000',
    sun: '#ffd700',
    ambientLight: 0.2,
    pointLight: 4,
  }
};

function Scene({
  visibleBodies,
  time,
  showTags,
  showOrbits,
  onPlanetSelect,
  resetCamera,
  isDark
}) {
  const { camera, gl } = useThree();
  const frustumRef = useRef(new THREE.Frustum());
  const projScreenMatrixRef = useRef(new THREE.Matrix4());
  const controlsRef = useRef();
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [cameraPosition, setCameraPosition] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(0, 0, 0));
  const [isCameraLocked, setIsCameraLocked] = useState(false);

  const colors = isDark ? sceneColors.dark : sceneColors.light;

  const handlePlanetClick = (planetId, position) => {
    console.log('Click detected:', planetId); // Debug log
    const planet = visibleBodies.find((body) => body.planet === planetId);
    if (planet && position) {
      console.log('Moving to planet:', planet.planet); // Debug log
      setSelectedPlanet(planet);
      onPlanetSelect(planet);
      moveCameraToObject(position);
    }
  };

  const moveCameraToObject = useCallback((position) => {
    if (!position) return;

    const startPosition = camera.position.clone();
    const startTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3();

    // Calculate closer camera position based on object distance
    const distanceToObject = position.length();
    const cameraDistance = Math.min(Math.max(distanceToObject * 0.3, 20), 200); // Reduced distances
    const angle = Math.PI / 6; // 30 degrees - lower angle for closer view
    
    const newCameraPosition = new THREE.Vector3(
      position.x + Math.cos(angle) * cameraDistance,
      position.y + Math.sin(angle) * cameraDistance,
      position.z + cameraDistance * 0.3 // Reduced height offset
    );

    // Faster animation
    const duration = 1000; // 1 second
    const startTime = Date.now();

    function updateCamera() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smoother easing function
      const easing = progress < 0.5
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
    setIsCameraLocked(true);
    setCameraTarget(position);
  }, [camera]);

  const resetCameraView = useCallback(() => {
    const startPosition = camera.position.clone();
    const startTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3();
    const defaultPosition = new THREE.Vector3(0, -900, 500);
    const defaultTarget = new THREE.Vector3(0, 0, 0);
    
    // Animation settings
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    function updateCamera() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const easing = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Update camera position
      camera.position.lerpVectors(startPosition, defaultPosition, easing);
      
      // Update controls target
      if (controlsRef.current) {
        const currentTarget = controlsRef.current.target;
        currentTarget.lerpVectors(startTarget, defaultTarget, easing);
        controlsRef.current.update();
      }

      // Look at the center
      camera.lookAt(defaultTarget);

      if (progress < 1) {
        requestAnimationFrame(updateCamera);
      } else {
        setIsCameraLocked(false);
      }
    }

    updateCamera();
    setSelectedPlanet(null);
    setCameraTarget(defaultTarget);
  }, [camera]);

  useEffect(() => {
    if (resetCamera) {
      resetCameraView();
    }
  }, [resetCamera, resetCameraView]);

  useFrame(() => {
    camera.updateMatrixWorld();
    projScreenMatrixRef.current.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustumRef.current.setFromProjectionMatrix(projScreenMatrixRef.current);
  });

  const [planetPositions, setPlanetPositions] = useState({});

  const updatePlanetPosition = (planetId, position) => {
    setPlanetPositions((prev) => ({ ...prev, [planetId]: position }));
  };

  const instancedMeshRef = useRef();
  const [instancedMeshes, setInstancedMeshes] = useState([]);

  useEffect(() => {
    const smallBodies = visibleBodies.filter(
      (body) => body.type !== "majorBody"
    );
    const instancedMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: "green" }),
      smallBodies.length
    );
    setInstancedMeshes([instancedMesh]);
  }, [visibleBodies]);

  useFrame(() => {
    if (instancedMeshRef.current) {
      visibleBodies.forEach((body, index) => {
        if (body.type !== "majorBody") {
          const matrix = new THREE.Matrix4();
          const position = planetPositions[body.planet] || new THREE.Vector3();
          matrix.setPosition(position);
          instancedMeshRef.current.setMatrixAt(index, matrix);
        }
      });
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
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
  return (
    <>
      <StarField count={3000} isDark={isDark} />
      
      {/* Adjust fog to start further away */}
      <fog attach="fog" args={[isDark ? '#000000' : '#0a0f1c', 3000, 5000]} />
      
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
      {visibleBodies.map((body) => (
        <React.Fragment key={body.planet}>
          <Planet
            planetId={body.planet}
            position={body.position}
            velocity={body.velocity}
            eccentricity={body.e}
            semi_major_axis={body.a}
            inclination={body.incl}
            longitude_of_ascending_node={body.Omega}
            argument_of_perifocus={body.w}
            mean_anomaly={body.M}
            time={time}
            epoch={new Date("2000-01-01")}
            showTags={showTags}
            id={body.id}
            onPositionUpdate={updatePlanetPosition}
            onPlanetClick={handlePlanetClick}
          />
          {showOrbits && (body.type === "majorBody" || body.type === "dwarfPlanet") && (
            <Orbit
              planetId={body.planet}
              argument_of_perifocus={body.w}
              eccentricity={body.e}
              inclination={body.incl}
              longitude_of_ascending_node={body.Omega}
              semi_major_axis={body.a}
              orbitType="normal"
              color={orbitColors[body.planet] || "white"}
              onOrbitClick={(id, pos) => {
                console.log('Orbit clicked:', id); // Debug log
                handlePlanetClick(id, pos);
              }}
              currentPosition={planetPositions[body.planet]}
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
              currentPosition={planetPositions[body.planet]}
              orbitType="tail"
              onOrbitClick={handlePlanetClick}
            />
          )}
          {/* {showOrbits && body.type === "NEAEX" && (
            <Orbit
              planetId={body.planet}
              argument_of_perifocus={body.w}
              eccentricity={body.e}
              inclination={body.incl}
              longitude_of_ascending_node={body.Omega}
              semi_major_axis={body.a}
              currentPosition={planetPositions[body.planet]}
              orbitType="tail"
              onOrbitClick={handlePlanetClick}
            />
          )}
          {showOrbits && body.type === "PHAEX" && (
            <Orbit
              planetId={body.planet}
              argument_of_perifocus={body.w}
              eccentricity={body.e}
              inclination={body.incl}
              longitude_of_ascending_node={body.Omega}
              semi_major_axis={body.a}
              currentPosition={planetPositions[body.planet]}
              orbitType="tail"
              onOrbitClick={handlePlanetClick}
            />
          )} */}
        </React.Fragment>
      ))}
      {instancedMeshes.map((mesh, index) => (
        <primitive key={index} object={mesh} ref={instancedMeshRef} />
      ))}
    </>
  );
}

function Orrery() {
  const [celestialBodiesData, setCelestialBodiesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [speed, setSpeed] = useState(1); // Changed default speed to 1
  const [paused, setPaused] = useState(false);
  const [showDwarfPlanets, setShowDwarfPlanets] = useState(true);
  const [showPHAs, setShowPHAs] = useState(false);
  const [showNEAs, setShowNEAs] = useState(false);
  const [showPHAsEX, setShowPHAsEX] = useState(true);
  const [showNEAsEX, setShowNEAsEX] = useState(true);

  const [showTags, setShowTags] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [planetPositions, setPlanetPositions] = useState({});
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [resetCameraFlag, setResetCameraFlag] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const lastUpdateTime = useRef(performance.now());
  const frameId = useRef();

  const handlePlanetSelect = (planet) => {
    if (!planet) {
      console.warn('No planet data received');
      return;
    }
    console.log('Selected planet:', planet);
    setSelectedPlanet(planet);
  };

  const handleResetCamera = () => {
    setSelectedPlanet(null);
    setResetCameraFlag(true);
  };
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

    const updateTime = (currentTime) => {
      const deltaTime = currentTime - lastUpdateTime.current;
      // Convert speed to milliseconds per frame (60 FPS target)
      const timeIncrement = (deltaTime * speed * 86400) / 60; // 86400 seconds in a day
      
      setTime(prevTime => new Date(prevTime.getTime() + timeIncrement));
      lastUpdateTime.current = currentTime;
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
    setTime(newDate);
  };
  const togglePause = () => {
    setPaused((prev) => !prev);
  };
  const toggleDwarfPlanets = () => {
    setShowDwarfPlanets((prev) => !prev);
  };
  const togglePHAs = () => {
    setShowPHAs((prev) => !prev);
  };
  const toggleNEAs = () => {
    setShowNEAs((prev) => !prev);
  };
  const toggleTags = () => {
    setShowTags((prev) => !prev);
  };
  const toggleOrbits = () => {
    setshowOrbits((prev) => !prev);
  };

  const toggleTPHAsEX = () => {
    setShowPHAsEX((prev) => !prev);
  };

  const toggleNEAsEX = () => {
    setShowNEAsEX((prev) => !prev);
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
    } catch (error) {
      setError(
        "Failed to process celestial body data. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          <p className="text-light-text/70 dark:text-dark-text/70">
            {error}
          </p>
        </div>
      </div>
    );
  }
  const visibleBodies = celestialBodiesData.filter(
    (body) =>
      body.type === "majorBody" ||
      (body.type === "dwarfPlanet" && showDwarfPlanets) ||
      (body.type === "PHA" && showPHAs) ||
      (body.type === "NEA" && showNEAs) ||
      (body.type === "PHAEX" && showPHAsEX) ||
      (body.type === "NEAEX" && showNEAsEX)
  );

  const updatePlanetimsition = (planetId, position) => {
    setPlanetPositions((prev) => ({ ...prev, [planetId]: position }));
  };

  return (
    <div className="relative w-full h-[100vh-80px] bg-light-background dark:bg-dark-background mt-0">
      {/* Full height canvas container with no margin */}
      <div className="absolute inset-0 z-10">
        <Canvas
          dpr={[1, 2]} // Adaptive device pixel ratio
          frameloop="always" // Ensure constant frame updates
          performance={{
            current: 1,
            min: 0.5,
            max: 1,
            debounce: 200
          }}
          camera={{
            fov: 45,
            near: 0.1,
            far: 100000000, // Increased far plane
            position: [0, -900, 500]
          }}
          gl={{
            antialias: true,
            alpha: false,
            stencil: false,
            depth: true,
            logarithmicDepthBuffer: true, // Enable logarithmic depth buffer
          }}
          style={{
            background: isDark ? '#030712' : '#0a0f1c',
            height: '100vh', // Ensure full viewport height
            position: 'fixed', // Fix position to viewport
            top: 0, // Align to top
            left: 0, // Align to left
          }}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Suspense fallback={null}>
            <Scene
              visibleBodies={visibleBodies}
              time={time}
              showTags={showTags}
              showOrbits={showOrbits}
              onPlanetSelect={handlePlanetSelect}
              resetCamera={resetCameraFlag}
              isDark={isDark}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Adjust UI overlay container to account for navbar */}
      <div className="pointer-events-none fixed inset-0 z-20">
        {/* Time Controller - move up slightly to avoid bottom edge */}
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.1"
                max="100"
                step="0.1"
                value={speed}
                onChange={handleSpeedChange}
                className="w-32 md:w-48"
              />
              <span className="text-sm text-light-text dark:text-dark-text whitespace-nowrap">
                {speed === 1 ? '1x (Real-time)' : `${speed}x`}
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
                className="btn-primary p-2"
              >
                <FontAwesomeIcon icon={paused ? faPlay : faPause} />
              </button>
            </div>
          </div>
        </div>

        {/* Other UI elements */}
        <div className="pointer-events-auto">
          <AnimatedLayers
            // Remove any existing position classes as they're now in the component
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

        {/* Planet Info Panel - Add pointer-events-auto */}
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
