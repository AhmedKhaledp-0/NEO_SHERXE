import { useState, useEffect, useMemo, useRef } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Ring, Html } from "@react-three/drei";
import * as THREE from "three";

const MU = 398600.4418; // km^3/s^2 (Earth&apos;s standard gravitational parameter)

const getArcPath = (radius, startDeg, endDeg) => {
  let diff = endDeg - startDeg;
  while (diff < 0) diff += 360;
  while (diff >= 360) diff -= 360;
  if (diff === 0) return "";
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  const x1 = radius * Math.cos(startRad);
  const y1 = radius * Math.sin(startRad);
  const x2 = radius * Math.cos(endRad);
  const y2 = radius * Math.sin(endRad);
  const largeArc = diff > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
};

function solveKepler(M, e) {
  if (e < 1) {
    // Normalize M to [-PI, PI] for optimal convergence symmetry
    let mNorm = M % (2 * Math.PI);
    if (mNorm > Math.PI) mNorm -= 2 * Math.PI;

    // Robust initial guess
    let E = mNorm + e * Math.sin(mNorm);

    for (let i = 0; i < 30; i++) {
      let f = E - e * Math.sin(E) - mNorm;
      let df = 1 - e * Math.cos(E);

      let step = f / df;
      // Cap the Newton-Raphson step size to prevent chaotic teleportation!
      if (step > 1.0) step = 1.0;
      if (step < -1.0) step = -1.0;

      E = E - step;
      if (Math.abs(step) < 1e-6) break;
    }

    // Shift back to [0, 2PI]
    if (E < 0) E += 2 * Math.PI;
    return E;
  } else {
    // Hyperbolic Kepler equation: M = e * sinh(H) - H
    let H = M;
    for (let i = 0; i < 30; i++) {
      let f = e * Math.sinh(H) - H - M;
      let df = e * Math.cosh(H) - 1;

      let step = f / df;
      if (step > 1.0) step = 1.0;
      if (step < -1.0) step = -1.0;

      H = H - step;
      if (Math.abs(step) < 1e-6) break;
    }
    return H;
  }
}

function Scene3D({ orbitPoints, satPos3D, a, e, i, raan, argPe }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    const radius = Math.max((a * 2.5) / 1000, 30);
    // Set camera to an elevated angle (Y > 0) viewing the equatorial plane
    // X (Vernal Equinox) will point to the left side
    camera.position.set(radius * 0.8, radius * 0.5, -radius * 0.8);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [camera, a]);

  const linePoints = useMemo(() => {
    return orbitPoints.map(
      (p) => new THREE.Vector3(p.x / 1000, p.z / 1000, -p.y / 1000),
    );
  }, [orbitPoints]);

  const { ascNodePoints, periapsisPoints } = useMemo(() => {
    // Vectors for Ascending Node and Periapsis
    const L = e >= 1 ? (a * 3) / 1000 : (a * (1 + e) + 2000) / 1000;

    // Ascending Node (Angle = RAAN in the equatorial plane)
    const raanRad = (raan * Math.PI) / 180;
    const ascNodeX = L * Math.cos(raanRad);
    const ascNodeZ = -L * Math.sin(raanRad);
    const ascPoints = [
      [0, 0, 0],
      [ascNodeX, 0, ascNodeZ],
    ];

    // Periapsis (Coordinate pX = L, pY = 0 before rotations)
    const iRad = (i * Math.PI) / 180;
    const argPeRad = (argPe * Math.PI) / 180;

    // 1. argPe rotation
    const x1 = L * Math.cos(argPeRad);
    const y1 = L * Math.sin(argPeRad);
    // 2. Inclination rotation
    const x2 = x1;
    const y2 = y1 * Math.cos(iRad);
    const z2 = y1 * Math.sin(iRad);
    // 3. RAAN rotation
    const x3 = x2 * Math.cos(raanRad) - y2 * Math.sin(raanRad);
    const y3 = x2 * Math.sin(raanRad) + y2 * Math.cos(raanRad);

    // Map to Scene3D coordinates
    const periPoints = [
      [0, 0, 0],
      [x3, z2, -y3],
    ];

    return { ascNodePoints: ascPoints, periapsisPoints: periPoints };
  }, [a, e, i, raan, argPe]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.05}
      />
      {/* Solid Black Earth Core (hides lines behind it) */}
      <mesh>
        <sphereGeometry args={[6.37, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Earth Vertical Lines (Longitudes) */}
      {[...Array(16)].map((_, i) => (
        <Ring
          key={i}
          args={[6.378, 6.42, 64]}
          rotation={[0, (i * Math.PI) / 16, 0]}
        >
          <meshBasicMaterial
            color="#ffffff"
            side={THREE.DoubleSide}
            transparent
            opacity={0.2}
          />
        </Ring>
      ))}

      {/* Earth Horizontal Lines (Latitudes) */}
      {[-75, -60, -45, -30, -15, 15, 30, 45, 60, 75].map((deg) => {
        const phi = (deg * Math.PI) / 180;
        const rCos = Math.cos(phi);
        const rSin = Math.sin(phi);
        return (
          <Ring
            key={deg}
            args={[6.378 * rCos, 6.42 * rCos, 64]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 6.378 * rSin, 0]}
          >
            <meshBasicMaterial
              color="#ffffff"
              side={THREE.DoubleSide}
              transparent
              opacity={0.15}
            />
          </Ring>
        );
      })}

      {/* Equator Line on Earth */}
      <Ring args={[6.378, 6.45, 64]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.5}
        />
      </Ring>

      {/* Earth Axis of Rotation & Poles */}
      <Line
        points={[
          [0, -7.5, 0],
          [0, 7.5, 0],
        ]}
        color="rgba(255,255,255,0.3)"
        lineWidth={1}
      />
      <Html position={[0, 7.8, 0]} center>
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontFamily: "monospace",
            fontSize: "11px",
            userSelect: "none",
            pointerEvents: "none",
            fontWeight: "bold",
          }}
        >
          N
        </div>
      </Html>
      <Html position={[0, -7.8, 0]} center>
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontFamily: "monospace",
            fontSize: "11px",
            userSelect: "none",
            pointerEvents: "none",
            fontWeight: "bold",
          }}
        >
          S
        </div>
      </Html>

      {/* Vernal Equinox (Reference Direction) */}
      <Line
        points={[
          [0, 0, 0],
          [12, 0, 0],
        ]}
        color="rgba(255, 255, 255, 0.3)"
        lineWidth={1.5}
      />
      <Html position={[12.5, 0, 0]} center>
        <div
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontFamily: "monospace",
            fontSize: "11px",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontWeight: "bold",
          }}
        >
          V.E. (Vernal Equinox)
        </div>
      </Html>

      {/* Ascending Node Line */}
      <Line
        points={ascNodePoints}
        color="#00ffff"
        lineWidth={1.5}
        opacity={0.5}
        transparent
        dashed
        dashSize={0.5}
        gapSize={0.5}
      />
      <Html position={ascNodePoints[1]} center>
        <div
          style={{
            color: "#00ffff",
            fontFamily: "monospace",
            fontSize: "11px",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontWeight: "bold",
          }}
        >
          ☊ Ascending Node
        </div>
      </Html>

      {/* Periapsis Line */}
      <Line
        points={periapsisPoints}
        color="#ff00ff"
        lineWidth={1.5}
        opacity={0.5}
        transparent
        dashed
        dashSize={0.5}
        gapSize={0.5}
      />
      <Html position={periapsisPoints[1]} center>
        <div
          style={{
            color: "#ff00ff",
            fontFamily: "monospace",
            fontSize: "11px",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontWeight: "bold",
          }}
        >
          ω Periapsis
        </div>
      </Html>

      {/* Orbit Path */}
      <Line
        points={linePoints}
        color="#ffffff"
        lineWidth={1.5}
        opacity={0.8}
        transparent
      />

      {/* Satellite */}
      <mesh
        position={[satPos3D.x / 1000, satPos3D.z / 1000, -satPos3D.y / 1000]}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Label */}
      <Html
        position={[
          satPos3D.x / 1000 + 1.2,
          satPos3D.z / 1000 + 1.2,
          -satPos3D.y / 1000,
        ]}
        center={false}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "12px",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          SAT
        </div>
      </Html>
    </>
  );
}

export default function Education() {
  const [a, setA] = useState(15000); // Semi-major axis (km)
  const [e, setE] = useState(0.5); // Eccentricity
  const [i, setI] = useState(0); // Inclination (deg)
  const [raan, setRaan] = useState(90); // RAAN (deg)
  const [argPe, setArgPe] = useState(45); // Argument of Periapsis (deg)

  const [time, setTime] = useState(0);
  const [safeMode, setSafeMode] = useState(true); // Toggle for crash prevention  // Animation loop
  useEffect(() => {
    let animationFrame;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000; // seconds
      lastTime = currentTime;

      // Speed up time for simulation: 1 real second = 500 simulation seconds
      setTime((prev) => prev + dt * 500);

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [a]);

  // Derived orbital properties
  const safeE = e === 1 ? 1.001 : e;
  let currentNu, currentR;
  if (safeE < 1) {
    const meanAnomaly = (Math.sqrt(MU / Math.pow(a, 3)) * time) % (2 * Math.PI);
    const E = solveKepler(meanAnomaly, safeE);
    // Use atan2 to prevent jumping/teleporting across 180 degrees
    const y = Math.sqrt(1 + safeE) * Math.sin(E / 2);
    const x = Math.sqrt(1 - safeE) * Math.cos(E / 2);
    currentNu = 2 * Math.atan2(y, x);
    currentR = (a * (1 - safeE * safeE)) / (1 + safeE * Math.cos(currentNu));
  } else {
    const meanMotion = Math.sqrt(MU / Math.pow(a, 3));
    const tCycle = 15000;
    const wrappedTime = (time % tCycle) - tCycle / 2;
    const M = meanMotion * wrappedTime;
    const H = solveKepler(M, safeE);
    currentNu =
      2 * Math.atan(Math.sqrt((safeE + 1) / (safeE - 1)) * Math.tanh(H / 2));
    currentR = (a * (safeE * safeE - 1)) / (1 + safeE * Math.cos(currentNu));
  }

  // Compute 2D Orbit Points (Top-Down X-Y plane view of the orbit itself)
  const orbitPoints = useMemo(() => {
    const points = [];
    const numPoints = 300; // Increased resolution for highly eccentric orbits

    const iRad = (i * Math.PI) / 180;
    const raanRad = (raan * Math.PI) / 180;
    const argPeRad = (argPe * Math.PI) / 180;

    const safeE = e === 1 ? 1.001 : e;

    for (let j = 0; j <= numPoints; j++) {
      let pX, pY;

      if (safeE < 1) {
        // Sample evenly by Eccentric Anomaly for smooth spatial distribution
        const E = (j / numPoints) * 2 * Math.PI;
        pX = a * (Math.cos(E) - safeE);
        pY = a * Math.sqrt(1 - safeE * safeE) * Math.sin(E);
      } else {
        // Sample evenly by Hyperbolic Anomaly
        const HMax = 2.5;
        const HMin = -HMax;
        const H = HMin + (j / numPoints) * (HMax - HMin);
        pX = a * (safeE - Math.cosh(H));
        pY = a * Math.sqrt(safeE * safeE - 1) * Math.sinh(H);
      }

      // Rotate by argPe
      const x1 = pX * Math.cos(argPeRad) - pY * Math.sin(argPeRad);
      const y1 = pX * Math.sin(argPeRad) + pY * Math.cos(argPeRad);

      // Rotate by inclination (around X)
      const x2 = x1;
      const y2 = y1 * Math.cos(iRad);
      const z2 = y1 * Math.sin(iRad);

      // Rotate by RAAN (around Z)
      const x3 = x2 * Math.cos(raanRad) - y2 * Math.sin(raanRad);
      const y3 = x2 * Math.sin(raanRad) + y2 * Math.cos(raanRad);

      points.push({ x: x3, y: y3, z: z2 });
    }
    return points;
  }, [a, e, i, raan, argPe]);

  // Compute satellite current 3D position
  const satPos3D = useMemo(() => {
    const iRad = (i * Math.PI) / 180;
    const raanRad = (raan * Math.PI) / 180;
    const argPeRad = (argPe * Math.PI) / 180;

    const pX = currentR * Math.cos(currentNu);
    const pY = currentR * Math.sin(currentNu);

    const x1 = pX * Math.cos(argPeRad) - pY * Math.sin(argPeRad);
    const y1 = pX * Math.sin(argPeRad) + pY * Math.cos(argPeRad);

    const x2 = x1;
    const y2 = y1 * Math.cos(iRad);
    const z2 = y1 * Math.sin(iRad);

    const x3 = x2 * Math.cos(raanRad) - y2 * Math.sin(raanRad);
    const y3 = x2 * Math.sin(raanRad) + y2 * Math.cos(raanRad);

    return { x: x3, y: y3, z: z2 };
  }, [currentR, currentNu, i, raan, argPe]);

  // Viewbox calculations

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-16 pb-16">
      {/* Subtle minimalist grid background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik02MCAwaC02MHY2MGg2MHoiLz48L2c+PC9zdmc+')] mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 border-b border-white/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4 uppercase">
            Orbital Mechanics
          </h1>
          <p className="text-lg text-white/50 font-light max-w-2xl">
            Learn how Keplerian elements define the shape, size, and orientation
            of an orbit. Adjust the parameters below to observe their effects in
            real-time.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Top Row: Controls & Visualizations */}
          <div className="flex flex-col lg:flex-row gap-12 items-stretch">
            {/* Left Column: Controls */}
            <div className="w-full lg:w-1/3 flex flex-col">
              <div className="bg-black border border-white/10 p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-medium tracking-tight text-white uppercase">
                    Keplerian Elements
                  </h2>
                  <label
                    className="flex items-center cursor-pointer group"
                    title="Prevent satellite from crashing into Earth"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={safeMode}
                        onChange={(evt) => {
                          const newSafe = evt.target.checked;
                          setSafeMode(newSafe);
                          if (newSafe) {
                            const maxE = 1 - 6378 / a;
                            if (e > maxE) setE(Number(maxE.toFixed(3)));
                          }
                        }}
                      />
                      <div
                        className={`block w-10 h-6 rounded-full transition-colors ${safeMode ? "bg-white/80" : "bg-white/10"}`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-black w-4 h-4 rounded-full transition-transform ${safeMode ? "transform translate-x-4" : ""}`}
                      ></div>
                    </div>
                    <div
                      className={`ml-3 text-xs font-bold tracking-widest uppercase transition-colors ${safeMode ? "text-white" : "text-white/40"}`}
                    >
                      Safe Mode
                    </div>
                  </label>
                </div>

                {/* Semi-major Axis */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold tracking-widest uppercase text-white/70">
                      Semi-major Axis <InlineMath math="a" />
                    </label>
                    <div className="text-xs text-white/50 font-mono">
                      {a} km
                    </div>
                  </div>
                  <input
                    type="range"
                    min="6550"
                    max="42000"
                    step="10"
                    value={a}
                    onChange={(evt) => {
                      const newA = Number(evt.target.value);
                      setA(newA);
                      if (safeMode) {
                        const maxE = 1 - 6378 / newA;
                        if (e > maxE) setE(Number(maxE.toFixed(3)));
                      }
                    }}
                    className="w-full custom-slider my-3"
                  />
                  <p className="text-xs text-white/40 mt-2 font-light leading-relaxed">
                    Defines the size of the orbit. Half of the longest diameter
                    of the ellipse.
                  </p>
                </div>

                {/* Eccentricity */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold tracking-widest uppercase text-white/70">
                      Eccentricity <InlineMath math="e" />
                    </label>
                    <div className="text-xs text-white/50 font-mono">{e}</div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={safeMode ? (1 - 6378 / a).toFixed(3) : "1.2"}
                    step="0.001"
                    value={e}
                    onChange={(evt) => setE(Number(evt.target.value))}
                    className="w-full custom-slider my-3"
                  />
                  <p className="text-xs text-white/40 mt-2 font-light leading-relaxed">
                    Determines how elongated the orbit is.{" "}
                    {safeMode
                      ? "Capped to avoid crashing into Earth."
                      : "Safe Mode is OFF: Orbits may crash or become hyperbolic (e > 1)."}
                  </p>
                </div>

                {/* Inclination */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold tracking-widest uppercase text-white/70">
                      Inclination <InlineMath math="i" />
                    </label>
                    <div className="text-xs text-white/50 font-mono">{i}°</div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="1"
                    value={i}
                    onChange={(e) => setI(Number(e.target.value))}
                    className="w-full custom-slider my-3"
                  />
                  <p className="text-xs text-white/40 mt-2 font-light leading-relaxed">
                    Vertical tilt of the orbit with respect to the equator.
                  </p>
                </div>

                {/* RAAN */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold tracking-widest uppercase text-white/70">
                      RAAN <InlineMath math="\Omega" />
                    </label>
                    <div className="text-xs text-white/50 font-mono">
                      {raan}°
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={raan}
                    onChange={(e) => setRaan(Number(e.target.value))}
                    className="w-full custom-slider my-3"
                  />
                  <p className="text-xs text-white/40 mt-2 font-light leading-relaxed">
                    Right Ascension of the Ascending Node. Swivels the orbit
                    horizontally.
                  </p>
                </div>

                {/* Argument of Periapsis */}
                <div className="mb-8 flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold tracking-widest uppercase text-white/70">
                      Arg. of Periapsis <InlineMath math="\omega" />
                    </label>
                    <div className="text-xs text-white/50 font-mono">
                      {argPe}°
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={argPe}
                    onChange={(e) => setArgPe(Number(e.target.value))}
                    className="w-full custom-slider my-3"
                  />
                  <p className="text-xs text-white/40 mt-2 font-light leading-relaxed">
                    Orientation of the ellipse within the orbital plane.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Visualizations */}
            <div className="w-full lg:w-2/3 flex flex-col">
              {/* 3D Orbital View */}
              <div className="bg-black border border-white/10 p-8 flex flex-col flex-1 h-full">
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/10 pb-4 gap-4">
                  <h3 className="text-xl font-medium tracking-tight text-white uppercase">
                    3D Orbital Projection
                  </h3>
                </div>

                <div className="w-full flex-1 min-h-[500px] relative bg-black overflow-hidden flex items-center justify-center">
                  <Canvas camera={{ fov: 45 }}>
                    <Scene3D
                      orbitPoints={orbitPoints}
                      satPos3D={satPos3D}
                      a={a}
                      e={e}
                      i={i}
                      raan={raan}
                      argPe={argPe}
                    />
                  </Canvas>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Mathematical Models */}
          <div className="w-full">
            <div className="bg-black border border-white/10 p-8">
              <h2 className="text-2xl font-medium tracking-tight text-white mb-8 uppercase">
                Mathematical Models
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-sm text-white/60 font-light">
                {/* Model 1 */}
                <div className="flex flex-col justify-center">
                  <p className="mb-4">
                    Orbital period <InlineMath math="T" /> (Kepler&apos;s Third Law):
                  </p>
                  <div className="text-white bg-white/5 p-6 rounded border border-white/5 flex items-center justify-center">
                    <BlockMath math="T = 2\pi \sqrt{\frac{a^3}{\mu}}" />
                  </div>
                  <p className="mt-4 text-white/40 tracking-widest uppercase text-xs">
                    Current:{" "}
                    <span className="text-white font-mono text-base">
                      {(
                        (2 * Math.PI * Math.sqrt(Math.pow(a, 3) / MU)) /
                        60
                      ).toFixed(1)}{" "}
                      MIN
                    </span>
                  </p>
                </div>

                {/* Model 2 */}
                <div className="flex flex-col justify-center">
                  <p className="mb-4">
                    Radius <InlineMath math="r" /> vs true anomaly{" "}
                    <InlineMath math="\nu" />:
                  </p>
                  <div className="text-white bg-white/5 p-6 rounded border border-white/5 flex items-center justify-center">
                    <BlockMath math="r = \frac{a(1-e^2)}{1+e\cos\nu}" />
                  </div>
                  <p className="mt-4 text-white/40 tracking-widest uppercase text-xs">
                    Current:{" "}
                    <span className="text-white font-mono text-base">
                      {currentR.toFixed(1)} KM
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Orbital Elements Visualizer */}
          <div className="w-full mt-24 mb-24">
            <h2 className="text-4xl font-medium tracking-tighter text-white mb-16 uppercase border-b border-white/10 pb-8">
              Orbital Elements Deep Dive
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {/* 1. Semi-major Axis */}
              <div className="flex flex-col justify-between h-full bg-transparent">
                <div>
                  <h3 className="text-white text-lg font-medium tracking-widest uppercase mb-4 flex items-center gap-2">
                    Semi-major Axis <InlineMath math="(a)" />
                  </h3>
                  <p className="text-sm text-white/50 mb-8 font-light leading-relaxed">
                    The semi-major axis defines the overall size of the orbit.
                    It is half of the longest diameter of the orbital ellipse. A
                    larger semi-major axis means the satellite orbits further
                    from the Earth and has a longer orbital period.
                  </p>
                </div>
                <svg viewBox="-100 -100 200 200" className="w-full h-48 mb-8">
                  <g transform="scale(1, -1)">
                    {(() => {
                      const vizA = 40 + ((a - 6550) / (42000 - 6550)) * 40;
                      const c = vizA * 0.6;
                      const b = vizA * 0.8;
                      return (
                        <>
                          <ellipse
                            cx={-c}
                            cy="0"
                            rx={vizA}
                            ry={b}
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                          />
                          <circle
                            cx="0"
                            cy="0"
                            r="10"
                            fill="rgba(255,255,255,0.1)"
                          />
                          <circle cx="0" cy="0" r="2" fill="#fff" />
                          <line
                            x1={-c}
                            y1="0"
                            x2={vizA - c}
                            y2="0"
                            stroke="#fff"
                            strokeWidth="1"
                          />
                          <text
                            x={vizA / 2 - c}
                            y="-10"
                            fill="#fff"
                            fontSize="10"
                            textAnchor="middle"
                            transform="scale(1,-1)"
                          >
                            a
                          </text>
                          <circle
                            cx={-c}
                            cy="0"
                            r="2"
                            fill="rgba(255,255,255,0.5)"
                          />
                        </>
                      );
                    })()}
                  </g>
                </svg>
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                    <div className="text-xs text-white/50 font-mono tracking-widest uppercase">
                      Value
                    </div>
                    <div className="text-sm text-white font-mono">{a} km</div>
                  </div>
                  <input
                    type="range"
                    min="6550"
                    max="42000"
                    step="10"
                    value={a}
                    onChange={(evt) => {
                      const newA = Number(evt.target.value);
                      setA(newA);
                      if (safeMode) {
                        const maxE = 1 - 6378 / newA;
                        if (e > maxE) setE(Number(maxE.toFixed(3)));
                      }
                    }}
                    className="w-full custom-slider"
                  />
                </div>
              </div>

              {/* 2. Eccentricity */}
              <div className="flex flex-col justify-between h-full bg-transparent">
                <div>
                  <h3 className="text-white text-lg font-medium tracking-widest uppercase mb-4 flex items-center gap-2">
                    Eccentricity <InlineMath math="(e)" />
                  </h3>
                  <p className="text-sm text-white/50 mb-8 font-light leading-relaxed">
                    Eccentricity defines how far the orbit deviates from a
                    perfect circle. An eccentricity of 0 produces a circular
                    orbit. As it increases towards 1, the orbit stretches into a
                    long ellipse.
                  </p>
                </div>
                <svg viewBox="-100 -100 200 200" className="w-full h-48 mb-8">
                  <g transform="scale(1, -1)">
                    {(() => {
                      const vizA = 70;
                      const vizE = Math.min(e, 0.95);
                      const c = vizA * vizE;
                      const b = vizA * Math.sqrt(1 - vizE * vizE);
                      return (
                        <>
                          <ellipse
                            cx={-c}
                            cy="0"
                            rx={vizA}
                            ry={b}
                            fill="none"
                            stroke="#fff"
                            strokeWidth="1"
                          />
                          <circle
                            cx="0"
                            cy="0"
                            r="10"
                            fill="rgba(255,255,255,0.1)"
                          />
                          <circle cx="0" cy="0" r="2" fill="#fff" />
                          <line
                            x1={-c - vizA}
                            y1="0"
                            x2={vizA - c}
                            y2="0"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                          />
                          <text
                            x="0"
                            y="-15"
                            fill="#fff"
                            fontSize="10"
                            textAnchor="middle"
                            transform="scale(1,-1)"
                          >
                            Focus
                          </text>
                        </>
                      );
                    })()}
                  </g>
                </svg>
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                    <div className="text-xs text-white/50 font-mono tracking-widest uppercase">
                      Value
                    </div>
                    <div className="text-sm text-white font-mono">{e}</div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={safeMode ? (1 - 6378 / a).toFixed(3) : "1.2"}
                    step="0.001"
                    value={e}
                    onChange={(evt) => setE(Number(evt.target.value))}
                    className="w-full custom-slider"
                  />
                </div>
              </div>

              {/* 3. Inclination */}
              <div className="flex flex-col justify-between h-full bg-transparent">
                <div>
                  <h3 className="text-white text-lg font-medium tracking-widest uppercase mb-4 flex items-center gap-2">
                    Inclination <InlineMath math="(i)" />
                  </h3>
                  <p className="text-sm text-white/50 mb-8 font-light leading-relaxed">
                    Inclination is the vertical tilt of the orbital plane
                    relative to Earth&apos;s equator. 0° orbits directly over the
                    equator, while 90° creates a polar orbit over the poles.
                  </p>
                </div>
                <svg viewBox="-100 -100 200 200" className="w-full h-48 mb-8">
                  <g transform="scale(1, -1)">
                    <circle
                      cx="0"
                      cy="0"
                      r="25"
                      fill="rgba(255,255,255,0.05)"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="25"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                    />
                    <line
                      x1="-80"
                      y1="0"
                      x2="80"
                      y2="0"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                    <text
                      x="70"
                      y="-10"
                      fill="rgba(255,255,255,0.5)"
                      fontSize="8"
                      textAnchor="middle"
                      transform="scale(1,-1)"
                    >
                      Equator
                    </text>

                    <g transform={`rotate(${i})`}>
                      <line
                        x1="-90"
                        y1="0"
                        x2="90"
                        y2="0"
                        stroke="#fff"
                        strokeWidth="1"
                      />
                      <ellipse
                        cx="0"
                        cy="0"
                        rx="90"
                        ry="8"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1"
                        strokeOpacity="0.3"
                      />
                    </g>

                    <path
                      d={getArcPath(40, 0, i)}
                      fill="none"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="1"
                    />
                    <text
                      x={45 * Math.cos((i * Math.PI) / 360)}
                      y={-45 * Math.sin((i * Math.PI) / 360)}
                      fill="rgba(255,255,255,0.8)"
                      fontSize="10"
                      textAnchor="middle"
                      transform="scale(1,-1)"
                    >
                      i
                    </text>
                  </g>
                </svg>
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                    <div className="text-xs text-white/50 font-mono tracking-widest uppercase">
                      Value
                    </div>
                    <div className="text-sm text-white font-mono">{i}°</div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="1"
                    value={i}
                    onChange={(e) => setI(Number(e.target.value))}
                    className="w-full custom-slider"
                  />
                </div>
              </div>

              {/* 4. RAAN */}
              <div className="flex flex-col justify-between h-full bg-transparent">
                <div>
                  <h3 className="text-white text-lg font-medium tracking-widest uppercase mb-4 flex items-center gap-2">
                    RAAN <InlineMath math="(\Omega)" />
                  </h3>
                  <p className="text-sm text-white/50 mb-8 font-light leading-relaxed">
                    RAAN acts as a horizontal swivel for the entire orbital
                    plane. It is the angle from the Vernal Equinox to the point
                    where the satellite crosses the equator heading North.
                  </p>
                </div>
                <svg viewBox="-100 -100 200 200" className="w-full h-48 mb-8">
                  <g transform="scale(1, -1)">
                    <circle
                      cx="0"
                      cy="0"
                      r="40"
                      fill="rgba(255,255,255,0.05)"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <line
                      x1="0"
                      y1="0"
                      x2="80"
                      y2="0"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1"
                    />
                    <text
                      x="85"
                      y="-5"
                      fill="rgba(255,255,255,0.6)"
                      fontSize="10"
                      transform="scale(1,-1)"
                    >
                      V.E.
                    </text>

                    <line
                      x1="0"
                      y1="0"
                      x2={80 * Math.cos((raan * Math.PI) / 180)}
                      y2={80 * Math.sin((raan * Math.PI) / 180)}
                      stroke="#fff"
                      strokeWidth="1"
                    />
                    <circle
                      cx={40 * Math.cos((raan * Math.PI) / 180)}
                      cy={40 * Math.sin((raan * Math.PI) / 180)}
                      r="3"
                      fill="#fff"
                    />

                    <path
                      d={getArcPath(20, 0, raan)}
                      fill="none"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="1"
                    />
                    <text
                      x={28 * Math.cos((raan * Math.PI) / 360)}
                      y={-28 * Math.sin((raan * Math.PI) / 360)}
                      fill="rgba(255,255,255,0.8)"
                      fontSize="10"
                      textAnchor="middle"
                      transform="scale(1,-1)"
                    >
                      Ω
                    </text>
                  </g>
                </svg>
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                    <div className="text-xs text-white/50 font-mono tracking-widest uppercase">
                      Value
                    </div>
                    <div className="text-sm text-white font-mono">{raan}°</div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={raan}
                    onChange={(e) => setRaan(Number(e.target.value))}
                    className="w-full custom-slider"
                  />
                </div>
              </div>

              {/* 5. Argument of Periapsis */}
              <div className="flex flex-col justify-between h-full bg-transparent">
                <div>
                  <h3 className="text-white text-lg font-medium tracking-widest uppercase mb-4 flex items-center gap-2">
                    Arg of Periapsis <InlineMath math="(\omega)" />
                  </h3>
                  <p className="text-sm text-white/50 mb-8 font-light leading-relaxed">
                    The Argument of Periapsis rotates the ellipse within its own
                    orbital plane. It defines the angle between the Ascending
                    Node and the periapsis (closest approach).
                  </p>
                </div>
                <svg viewBox="-100 -100 200 200" className="w-full h-48 mb-8">
                  <g transform="scale(1, -1)">
                    <circle cx="0" cy="0" r="10" fill="rgba(255,255,255,0.1)" />
                    <line
                      x1="0"
                      y1="0"
                      x2="80"
                      y2="0"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                    <text
                      x="65"
                      y="-10"
                      fill="rgba(255,255,255,0.5)"
                      fontSize="8"
                      textAnchor="middle"
                      transform="scale(1,-1)"
                    >
                      Asc. Node
                    </text>

                    <g transform={`rotate(${argPe})`}>
                      {(() => {
                        const vizA = 60;
                        const vizE = 0.6;
                        const c = vizA * vizE;
                        const b = vizA * Math.sqrt(1 - vizE * vizE);
                        return (
                          <>
                            <ellipse
                              cx={-c}
                              cy="0"
                              rx={vizA}
                              ry={b}
                              fill="none"
                              stroke="#fff"
                              strokeWidth="1"
                            />
                            <line
                              x1="0"
                              y1="0"
                              x2={vizA - c}
                              y2="0"
                              stroke="rgba(255,255,255,0.5)"
                              strokeWidth="1"
                            />
                            <circle cx={vizA - c} cy="0" r="3" fill="#fff" />
                          </>
                        );
                      })()}
                    </g>

                    <path
                      d={getArcPath(25, 0, argPe)}
                      fill="none"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="1"
                    />
                    <text
                      x={35 * Math.cos((argPe * Math.PI) / 360)}
                      y={-35 * Math.sin((argPe * Math.PI) / 360)}
                      fill="rgba(255,255,255,0.8)"
                      fontSize="10"
                      textAnchor="middle"
                      transform="scale(1,-1)"
                    >
                      ω
                    </text>
                  </g>
                </svg>
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                    <div className="text-xs text-white/50 font-mono tracking-widest uppercase">
                      Value
                    </div>
                    <div className="text-sm text-white font-mono">{argPe}°</div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={argPe}
                    onChange={(e) => setArgPe(Number(e.target.value))}
                    className="w-full custom-slider"
                  />
                </div>
              </div>

              {/* 6. True Anomaly */}
              <div className="flex flex-col justify-between h-full bg-transparent">
                <div>
                  <h3 className="text-white text-lg font-medium tracking-widest uppercase mb-4 flex items-center gap-2">
                    True Anomaly <InlineMath math="(\nu)" />
                  </h3>
                  <p className="text-sm text-white/50 mb-8 font-light leading-relaxed">
                    True Anomaly is the satellite&apos;s real-time position along the
                    orbital path, measured as an angle from the periapsis. It
                    sweeps around the ellipse over time.
                  </p>
                </div>
                <svg viewBox="-100 -100 200 200" className="w-full h-48 mb-8">
                  <g transform="scale(1, -1)">
                    <circle cx="0" cy="0" r="10" fill="rgba(255,255,255,0.1)" />
                    {(() => {
                      const vizA = 60;
                      const vizE = 0.6;
                      const c = vizA * vizE;
                      const b = vizA * Math.sqrt(1 - vizE * vizE);

                      const satNuDeg = (currentNu * 180) / Math.PI;
                      const rViz =
                        (vizA * (1 - vizE * vizE)) /
                        (1 + vizE * Math.cos(currentNu));
                      const satX = rViz * Math.cos(currentNu);
                      const satY = rViz * Math.sin(currentNu);

                      return (
                        <>
                          <ellipse
                            cx={-c}
                            cy="0"
                            rx={vizA}
                            ry={b}
                            fill="none"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="1"
                          />
                          <line
                            x1="0"
                            y1="0"
                            x2={vizA - c}
                            y2="0"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                          />
                          <text
                            x={vizA - c + 15}
                            y="2"
                            fill="rgba(255,255,255,0.5)"
                            fontSize="8"
                            textAnchor="middle"
                            transform="scale(1,-1)"
                          >
                            Perigee
                          </text>

                          <line
                            x1="0"
                            y1="0"
                            x2={satX}
                            y2={satY}
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="1"
                          />
                          <circle cx={satX} cy={satY} r="4" fill="#fff" />

                          <path
                            d={getArcPath(20, 0, satNuDeg)}
                            fill="none"
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="1"
                          />
                          <text
                            x={30 * Math.cos(currentNu / 2)}
                            y={-30 * Math.sin(currentNu / 2)}
                            fill="rgba(255,255,255,0.8)"
                            fontSize="10"
                            textAnchor="middle"
                            transform="scale(1,-1)"
                          >
                            ν
                          </text>
                        </>
                      );
                    })()}
                  </g>
                </svg>
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                    <div className="text-xs text-white/50 font-mono tracking-widest uppercase">
                      Value
                    </div>
                    <div className="text-sm text-white font-mono">
                      {((currentNu * 180) / Math.PI).toFixed(1)}°
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={(currentNu * 180) / Math.PI}
                    readOnly
                    className="w-full custom-slider opacity-50 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
