import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const qaData = [
  {
    question: "What are the main technologies used in this project?",
    answer:
      "The main technologies used in this project are:\n\n1. React: For building the user interface\n2. Three.js: For 3D rendering of celestial bodies\n3. React Three Fiber: A React renderer for Three.js\n4. Framer Motion: For animations, particularly in the Layers component\n5. Chakra UI: For styling and UI components (as requested in this example)\n6. JavaScript/ES6+: The primary programming language",
  },
  {
    question: "How is Three.js used in this project?",
    answer:
      "Three.js is used extensively in this project for 3D rendering of the solar system. It's used to create and manipulate 3D objects representing planets, orbits, and other celestial bodies. The `Scene` component in App.jsx sets up the Three.js scene, camera, and lighting. The `Planet` and `Orbit` components use Three.js geometries and materials to render celestial bodies and their orbits.",
  },
  {
    question: "How is the celestial body data used in the application?",
    answer:
      "The celestial body data is imported from a file called 'CombinedCelestialData' in the utils folder. This data likely comes from an API but is stored locally for this application. In the Orrery component:\n\n1. The data is processed in a useEffect hook, separating different types of celestial bodies (major bodies, dwarf planets, PHAs, NEAs, etc.).\n2. The processed data is stored in the `celestialBodiesData` state.\n3. A `visibleBodies` array is created by filtering `celestialBodiesData` based on user selections (e.g., show/hide dwarf planets).\n4. This filtered data is then passed to the Scene component, where it's used to render the celestial bodies and their orbits.",
  },
  {
    question:
      "How does the application handle real-time updates of celestial body positions?",
    answer:
      "The application simulates the movement of celestial bodies over time:\n\n1. A `time` state is maintained in the Orrery component, which is updated at regular intervals based on the selected speed.\n2. This `time` state is passed down to the Planet components.\n3. In each Planet component, the `useFrame` hook from React Three Fiber is used to update the position of the planet on each frame render.\n4. The position is calculated based on the current `time` and the orbital elements of the celestial body (semi-major axis, eccentricity, inclination, etc.).\n5. The calculated positions are then used to update the 3D positions of the planet meshes in the Three.js scene.",
  },
  {
    question: "How is user interaction handled in the 3D scene?",
    answer: (
      <div className="prose">
        <p>User interaction in the 3D scene is handled through several mechanisms:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>
            OrbitControls from React Three Fiber allows users to zoom, pan, and
            rotate the camera.
          </li>
          <li>
            The Planet and Orbit components have onClick handlers that trigger
            when a user clicks on a planet or its orbit.
          </li>
          <li>
            These click events update the selected planet state and trigger
            camera movements to focus on the selected celestial body.
          </li>
          <li>
            The AnimatedLayers component provides UI controls for toggling
            visibility of different types of celestial bodies and their
            labels/orbits.
          </li>
          <li>
            The time controls at the top of the scene allow users to adjust the
            simulation speed and date.
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
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-light-text/70 dark:text-dark-text/70">
              Everything you need to know about NEO SHERXE
            </p>
          </div>

          {/* Q&A Accordion */}
          <div className="space-y-4">
            {qaData.map((item, index) => (
              <div
                key={index}
                className="card hover:border-light-primary/50 dark:hover:border-dark-primary/50 transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
                    {item.question}
                  </h3>
                  <FontAwesomeIcon
                    icon={openItem === index ? faChevronUp : faChevronDown}
                    className={`transform transition-transform duration-300 text-light-primary dark:text-dark-primary ${
                      openItem === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openItem === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-4 pt-0 text-light-text/70 dark:text-dark-text/70 prose prose-lg">
                    {typeof item.answer === 'string' ? (
                      item.answer.split('\n').map((line, i) => (
                        <p key={i} className="mb-4">
                          {line}
                        </p>
                      ))
                    ) : (
                      <div className="space-y-4">
                        {item.answer}
                      </div>
                    )}
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
