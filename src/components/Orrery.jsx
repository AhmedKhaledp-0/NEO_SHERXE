import { useCallback, useEffect, useRef, useState } from "react";
import React, { Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import Planet from "./Planet";
import combinedCelestialData from "../utilities/CombinedCelestialData";
import AnimatedLayers from "./Layers";
import PlanetInfoPanel from "./PlanetInfoPanel";
import Orbit from "./Orbit";
import {
  Button,
  Heading,
  Text,
  VStack,
  Box,
  HStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Input,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";

function Scene({
  visibleBodies,
  time,
  showTags,
  showOrbits,
  onPlanetSelect,
  resetCamera,
}) {
  const { camera, gl } = useThree();
  const frustumRef = useRef(new THREE.Frustum());
  const projScreenMatrixRef = useRef(new THREE.Matrix4());
  const controlsRef = useRef();
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [cameraPosition, setCameraPosition] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(0, 0, 0));
  const [isCameraLocked, setIsCameraLocked] = useState(false);

  const handlePlanetClick = (planetId, position) => {
    const planet = visibleBodies.find((body) => body.planet === planetId);
    setSelectedPlanet(planet);
    onPlanetSelect(planet);
    moveCameraToObject(position);
  };

  const moveCameraToObject = (position) => {
    const sunPosition = new THREE.Vector3(0, 0, 0);
    const sunToPlanet = new THREE.Vector3().subVectors(position, sunPosition);

    // Calculate a perpendicular vector for camera positioning
    const perpendicularVector = new THREE.Vector3(
      -sunToPlanet.z,
      0,
      sunToPlanet.x
    ).normalize();

    // Calculate the new camera position
    const newCameraPosition = new THREE.Vector3().addVectors(
      position,
      perpendicularVector.multiplyScalar(sunToPlanet.length() * 5)
    );

    camera.position.copy(newCameraPosition);
    setCameraTarget(position);
    setIsCameraLocked(true);
    if (controlsRef.current) {
      controlsRef.current.target.copy(position);
      controlsRef.current.update();
    }
  };

  const resetCameraView = useCallback(() => {
    setSelectedPlanet(null);
    camera.position.set(0, -900, 500);
    setCameraTarget(new THREE.Vector3(0, 0, 0));
    setIsCameraLocked(false);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [camera]);

  useEffect(() => {
    if (resetCamera) {
      resetCameraView();
    }
  }, [resetCamera, resetCameraView]);

  useFrame(() => {
    if (isCameraLocked && selectedPlanet) {
      const planetPosition = planetPositions[selectedPlanet.planet];
      if (planetPosition) {
        const sunPosition = new THREE.Vector3(0, 0, 0);
        const sunToPlanet = new THREE.Vector3().subVectors(
          planetPosition,
          sunPosition
        );
        const perpendicularVector = new THREE.Vector3(
          -sunToPlanet.z,
          0,
          sunToPlanet.x
        ).normalize();
        const distanceToSun = sunToPlanet.length();

        // Determine the distance multiplier based on the distance to the sun
        let distanceMultiplier;
        if (distanceToSun < 100) {
          distanceMultiplier = 0.6;
        } else if (distanceToSun < 400) {
          distanceMultiplier = 0.3;
        } else {
          distanceMultiplier = 0.2;
        }
        const newCameraPosition = new THREE.Vector3().addVectors(
          planetPosition,
          perpendicularVector.multiplyScalar(
            sunToPlanet.length() * distanceMultiplier
          )
        );

        camera.position.lerp(newCameraPosition, 0.1);
        camera.lookAt(planetPosition);
        setCameraTarget(planetPosition);

        if (controlsRef.current) {
          controlsRef.current.target.copy(planetPosition);
          controlsRef.current.update();
        }
      }
    }
  });

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
      <OrbitControls ref={controlsRef} args={[camera, gl.domElement]} />

      <ambientLight intensity={0.5} />
      <pointLight
        position={[0, 0, 0]}
        intensity={5}
        distance={100000}
        decay={0}
      />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ffff00" />
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
          {showOrbits && body.type === "majorBody" && (
            <Orbit
              planetId={body.planet}
              argument_of_perifocus={body.w}
              eccentricity={body.e}
              inclination={body.incl}
              longitude_of_ascending_node={body.Omega}
              semi_major_axis={body.a}
              orbitType="normal"
              color={orbitColors[body.planet] || "white"}
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
  const [speed, setSpeed] = useState(10);
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
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handlePlanetSelect = (planet) => {
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
    let intervalId;
    if (!paused) {
      intervalId = setInterval(() => {
        setTime((prevTime) => new Date(prevTime.getTime() + 8640000 * speed));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [speed, paused]);

  const handleSpeedChange = (event) => {
    setSpeed(parseFloat(event.target.value));
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
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
    <div>
      <Box
        className="TimeController"
        position="fixed"
        bottom={["70px", "10px"]}
        left="0"
        right="0"
        zIndex={99999999}
        px={4}
      >
        <Flex
          direction={isMobile ? "column" : "row"}
          align="center"
          justify="center"
          p={2}
          borderRadius="md"
        >
          <Flex align="center" mb={isMobile ? 2 : 0} mr={isMobile ? 0 : 4}>
            <Slider
              min={0.1}
              max={1000}
              step={0.1}
              value={speed}
              onChange={handleSpeedChange}
              w={["150px", "200px"]}
              mr={2}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <Text color="#fff" fontSize="sm" whiteSpace="nowrap">
              Speed: {speed}x
            </Text>
          </Flex>
          <Flex align="center">
            <Input
              type="datetime-local"
              value={time.toISOString().slice(0, 16)}
              onChange={handleDateChange}
              size="sm"
              color="#fff"
              mr={2}
            />
            <Button onClick={togglePause} size="sm">
              <FontAwesomeIcon icon={paused ? faPlay : faPause} />
            </Button>
          </Flex>
        </Flex>
      </Box>
      <Canvas
        style={{ height: "100vh", width: "100vw", padding: "0", margin: "0" }}
      >
        <color attach="background" args={["#101010"]} />
        <PerspectiveCamera
          makeDefault
          position={[0, -900, 500]}
          near={0.1}
          far={1000000}
        />
        <OrbitControls />
        <Scene
          visibleBodies={visibleBodies}
          time={time}
          showTags={showTags}
          showOrbits={showOrbits}
          onPlanetSelect={handlePlanetSelect}
          resetCamera={resetCameraFlag}
        />
      </Canvas>
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
      <PlanetInfoPanel planet={selectedPlanet} onClose={handleResetCamera} />{" "}
    </div>
  );
}

export default Orrery;
