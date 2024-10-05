import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Spinner,
  Heading,
  VStack,
} from "@chakra-ui/react";

const getRiskColor = (riskLevel) => {
  switch (riskLevel.toLowerCase()) {
    case "low":
      return "green.500";
    case "medium":
      return "yellow.500";
    case "high":
      return "red.500";
    case "critical":
      return "red.700";
    default:
      return "gray.500";
  }
};

export default function RiskLevel() {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
          .toISOString()
          .split("T")[0];
        const response = await fetch(
          `https://risk-level-sknw.vercel.app/api/phas/${today}/${tomorrow}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const filteredData = data.filter((obj) =>
          ["low", "medium", "high", "critical"].includes(
            obj.risk_level.toLowerCase()
          )
        );
        setObjects(filteredData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>;
  }

  return (
    <div className="topcomponent">
      <div className="container">
        <VStack overflowX="auto" mt="160px" gap="30px">
          <Heading as="h1" size="xl">
            Objects with Risk Level on Earth
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Close Approach Date</Th>
                <Th>Diameter (km)</Th>
                <Th>Velocity (km/h)</Th>
                <Th>Miss Distance (km)</Th>
                <Th>Risk Level</Th>
              </Tr>
            </Thead>
            <Tbody>
              {objects.map((obj) => (
                <Tr key={obj.id}>
                  <Td>{obj.name}</Td>
                  <Td>{obj.close_approach_date}</Td>
                  <Td>
                    {obj.diameter_km_min.toFixed(2)} -{" "}
                    {obj.diameter_km_max.toFixed(2)}
                  </Td>
                  <Td>{obj.relative_velocity_kph.toFixed(2)}</Td>
                  <Td>{obj.miss_distance_km.toFixed(2)}</Td>
                  <Td>
                    <Text
                      color={getRiskColor(obj.risk_level)}
                      fontWeight="bold"
                      // fontSize={
                      //   obj.risk_level.toLowerCase() === "critical"
                      //     ? "larger"
                      //     : "inherit"
                      // }
                      // textDecoration={
                      //   obj.risk_level.toLowerCase() === "critical"
                      //     ? "underline"
                      //     : "none"
                      // }
                    >
                      {obj.risk_level.toUpperCase()}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </VStack>
      </div>
    </div>
  );
}
