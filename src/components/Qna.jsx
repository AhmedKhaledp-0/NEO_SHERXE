import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const qaData = [
  {
    question: "What are the main technologies used in this project?",
    answer:
      "The main technologies used in this project are:\n\n1. React: For building the user interface\n2. Three.js: For 3D rendering of celestial bodies\n3. React Three Fiber: A React renderer for Three.js\n4. Framer Motion: For animations, particularly in the UI components\n5. Tailwind CSS: For styling and responsive layouts\n6. JavaScript/ES6+: The primary programming language",
  },
  {
    question: "How is Three.js used in this project?",
    answer:
      "Three.js is used extensively in this project for 3D rendering of the solar system. It's used to create and manipulate 3D objects representing planets, orbits, and other celestial bodies. The `Scene` component sets up the Three.js scene, camera, and lighting. The `Planet` and `Orbit` components use Three.js geometries and materials to render celestial bodies and their orbits.",
  },
  {
    question: "How is the celestial body data used in the application?",
    answer:
      "The celestial body data is imported from NASA APIs and pre-calculated resources. In the Orrery component:\n\n1. The data is processed and separated by types of celestial bodies (major bodies, PHAs, NEAs, etc.).\n2. The processed data is filtered based on user selections in the UI controls.\n3. This filtered data is then passed to the Scene component, where it's used to physically render the celestial bodies and trace their orbital paths in 3D space.",
  },
  {
    question:
      "How does the application handle real-time updates of celestial body positions?",
    answer:
      "The application simulates the orbital mechanics of celestial bodies over time:\n\n1. A time state is maintained which is updated at regular intervals based on the selected playback speed.\n2. In each Planet component, the `useFrame` hook from React Three Fiber updates the position on each frame.\n3. The position is accurately calculated based on Keplerian orbital elements (semi-major axis, eccentricity, inclination, etc.).\n4. The calculated positions update the 3D meshes in the Three.js scene dynamically.",
  },
  {
    question: "How is user interaction handled in the 3D scene?",
    answer: (
      <div className="space-y-4">
        <p>
          User interaction in the 3D scene is handled through several
          mechanisms:
        </p>
        <ul className="list-none pl-0 space-y-4">
          <li className="flex gap-4">
            <span className="text-white">-</span>
            <span>
              OrbitControls allows users to zoom, pan, and rotate the camera
              naturally.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="text-white">-</span>
            <span>
              Planet and Orbit components have precise click handlers that
              trigger when clicked.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="text-white">-</span>
            <span>
              Click events seamlessly trigger the co-orbital camera system to
              focus on the selected celestial body.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="text-white">-</span>
            <span>
              The Layers component provides toggleable UI controls for
              visibility filtering.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="text-white">-</span>
            <span>
              The central time controls allow users to quickly adjust the
              simulation speed and jump to specific dates.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
];

export default function Qna() {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black pt-16 px-4 pb-24 selection:bg-white selection:text-black">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto space-y-24">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[0.2em] text-white">
              Q & A
            </h1>
            <div className="max-w-3xl mx-auto border border-white/10 bg-white/5 p-8">
              <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/70 leading-relaxed">
                Everything you need to know about the inner workings of NEO
                Spherex
              </p>
            </div>
          </div>

          {/* Q&A Accordion */}
          <div className="grid grid-cols-1 gap-px bg-white/10 border border-white/10">
            {qaData.map((item, index) => (
              <div
                key={index}
                className="bg-black group hover:bg-white/5 active:bg-white/5 transition-colors duration-500"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-8 md:p-12 text-left"
                >
                  <h3 className="text-lg md:text-xl font-bold uppercase tracking-[0.1em] text-white pr-8">
                    {item.question}
                  </h3>
                  <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border border-white/20 text-white group-hover:bg-white group-active:bg-white group-hover:text-black group-active:text-black transition-colors duration-500">
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`text-xl transform transition-transform duration-500 ${
                        openItem === index ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    openItem === index
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-8 md:p-12 pt-0 border-t border-white/10 mt-2">
                    <div className="font-mono text-sm leading-relaxed text-white/60 pt-8">
                      {typeof item.answer === "string" ? (
                        item.answer.split("\n").map((line, i) => (
                          <p
                            key={i}
                            className={line.trim() === "" ? "h-4" : "mb-4"}
                          >
                            {line}
                          </p>
                        ))
                      ) : (
                        <div className="space-y-4">{item.answer}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
