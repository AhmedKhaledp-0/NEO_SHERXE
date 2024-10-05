import { Button, Heading, Text, VStack, Box } from "@chakra-ui/react";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

const CustomTooltip = ({ label, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <Box
          position="absolute"
          top="-40px"
          left="50%"
          transform="translateX(-50%)"
          bg="gray.700"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="sm"
          zIndex={1}
          w="200px"
          maxWidth="300px"
        >
          {label}
        </Box>
      )}
    </Box>
  );
};

const PlanetInfoPanel = ({ planet, onClose }) => {
  if (!planet) return null;

  const orbitElements = [
    {
      label: "Semi-major axis",
      value: planet.a.toFixed(2),
      unit: "AU",
      info: "The longest radius of an elliptical orbit",
    },
    {
      label: "Eccentricity",
      value: planet.e.toFixed(4),
      info: "A measure of how much an orbit deviates from a perfect circle",
    },
    {
      label: "Inclination",
      value: planet.incl.toFixed(2),
      unit: "°",
      info: "The angle between the orbital plane and the reference plane",
    },
    {
      label: "Apoapsis distance",
      value: planet.Q.toFixed(2),
      unit: "°",
      info: "The point of orbit furthest from the central body",
    },
    {
      label: "Orbital period",
      value: planet.P.toFixed(2),
      unit: "Day",
      info: "The time taken to complete one orbit",
    },
    {
      label: "Longitude of Asc. Node",
      value: planet.Omega.toFixed(2),
      unit: "°",
      info: "The angle from the reference direction to the ascending node",
    },
    {
      label: "Mean anomaly at 2000",
      value: planet.M.toFixed(2),
      unit: "°",
      info: "Angular distance from periapsis which a body would have if it moved in a circular orbit",
    },
    {
      label: "True anomaly at 2000",
      value: planet.nu.toFixed(2),
      unit: "°",
      info: "The angle between the direction of periapsis and the current position of the body",
    },
    {
      label: "Argument of perifocus",
      value: planet.w.toFixed(2),
      unit: "°",
      info: "The angle from the ascending node to the periapsis",
    },
    {
      label: "Periapsis distance",
      value: planet.q.toFixed(4),
      unit: "AU",
      info: "The point of orbit closest to the central body",
    },
  ];

  return (
    <div className="planetInfo">
      <VStack
        justifyContent="flex-start"
        alignItems="flex-start"
        color="white"
        m="20px"
        p="20px"
        spacing={2}
      >
        <Button onClick={onClose} colorScheme="red" alignSelf="flex-end">
          <FontAwesomeIcon icon={faClose} />
        </Button>
        <Heading as="h4" size="lg" mb={4}>
          {planet.planet.split(" ")[0]}
        </Heading>
        {orbitElements.map((element, index) => (
          <CustomTooltip key={index} label={element.info}>
            <Text cursor="help">
              {element.label}: {element.value} {element.unit || ""}
            </Text>
          </CustomTooltip>
        ))}
      </VStack>
    </div>
  );
};

export default PlanetInfoPanel;
