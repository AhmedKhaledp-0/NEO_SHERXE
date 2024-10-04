import { Button, Heading, Text, VStack } from "@chakra-ui/react";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const PlanetInfoPanel = ({ planet, onClose }) => {
  if (!planet) return null;

  return (
    <div className="planetInfo ">
      <VStack justifyContent="flex-start" alignItems="flex-start" color="white">
        <Button onClick={onClose} colorScheme="red" alignSelf="flex-end">
          <FontAwesomeIcon icon={faClose} />
        </Button>
        <Heading as="h4" size="lg">
          {planet.planet.split(" ")[0]}
        </Heading>
        {console.log(planet)}
        <Text>Semi-major axis: {planet.a.toFixed(2)} AU</Text>
        <Text>Eccentricity: {planet.e.toFixed(4)}</Text>
        <Text>Inclination: {planet.incl.toFixed(2)}°</Text>
        <Text>Apoapsis distance : {planet.Q.toFixed(2)} °</Text>
        <Text>Orabital period : {planet.P.toFixed(2)} Day</Text>
        <Text>Longitude of Asc. Node : {planet.Omega.toFixed(2)} °</Text>
        <Text>Mean anomally at 2000 : {planet.M.toFixed(2)} °</Text>
        <Text>True anomally at 2000 : {planet.nu.toFixed(2)} °</Text>
        <Text>Arrgument of perifocus : {planet.w.toFixed(2)} °</Text>
        <Text>Periapsis distance : {planet.q.toFixed(4)} AU</Text>
      </VStack>
    </div>
  );
};

export default PlanetInfoPanel;
