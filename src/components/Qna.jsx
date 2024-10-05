import React from "react";
import {
  ChakraProvider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  VStack,
  Heading,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

export default function Qna() {
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
        <Box>
          User interaction in the 3D scene is handled through several
          mechanisms:
          <UnorderedList mt={2}>
            <ListItem>
              OrbitControls from React Three Fiber allows users to zoom, pan,
              and rotate the camera.
            </ListItem>
            <ListItem>
              The Planet and Orbit components have onClick handlers that trigger
              when a user clicks on a planet or its orbit.
            </ListItem>
            <ListItem>
              These click events update the selected planet state and trigger
              camera movements to focus on the selected celestial body.
            </ListItem>
            <ListItem>
              The AnimatedLayers component provides UI controls for toggling
              visibility of different types of celestial bodies and their
              labels/orbits.
            </ListItem>
            <ListItem>
              The time controls at the top of the scene allow users to adjust
              the simulation speed and date.
            </ListItem>
          </UnorderedList>
        </Box>
      ),
    },
  ];

  return (
    <div className="topcomponent">
      <div className="container">
        <VStack
          w="100%"
          mt="160px"
          gap="30px"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Heading as="h1" size="2xl">
            {" "}
            Q&A
          </Heading>
          <Accordion allowMultiple w="100%">
            {qaData.map((item, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    <Box
                      flex="1"
                      textAlign="left"
                      fontSize="20px"
                      fontWeight="bold"
                    >
                      {item.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>{item.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      </div>
    </div>
  );
}
