import {
  Heading,
  HStack,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useNavigate } from "react-router-dom";
import TeamMemberCards from "./TeamMemberCards";
const points = [
  {
    id: 1,
    text: "How often do you hear about an asteroid that is so close to the Earth that it may hit the Earth ??",
  },
  {
    id: 2,
    text: "These asteroids and comets are regularly monitored by space agencies using advanced astronomical tools to predict their paths and assess any potential danger. However, for the general public, understanding or tracking these celestial bodies can seem out of reach due to the complex technology involved.",
  },
  {
    id: 3,
    text: "So what about creating an interactive orrery web app that enables people to explore, learn, and keep an eye on   NEOs .",
  },
  {
    id: 4,
    text: "Welcome! Let me introduce you to NEO spherex , your personal gateway to tracking and exploring Near-Earth Objects in real-time.",
  },
  {
    id: 5,
    text: "We use the NASA resources and APIs to create an interactive web app designed to provide users with real-time access to information about Near-Earth Objects (NEOs), including asteroids and comets that orbit near our plane and their risk level.",
  },
];

const features = [
  {
    id: 1,
    text: " At the heart of NEO spherex is our interactive 3D map, where you can visualize the solar system and orbits of asteroids and comets near Earth. You can zoom in, pan around, and click on any object to learn more about it.",
  },
  {
    id: 2,
    text: " clickable checkbox to limit the objects that appear on the scene to allow users to customize their view ",
  },
  {
    id: 3,
    text: " User interface controls to limit the number of NEOS, NECs, or PHAs to display in the orrery.",
  },
  {
    id: 4,
    text: " Time controller so a user can control the simulation process",
  },
  {
    id: 5,
    text: " Labels for planets, NEOs and a toggle to turn them on and off",
  },
  { id: 6, text: " Colored orbital trajectories of the celestial bodies" },
  { id: 7, text: " Color visualization of risk level for NEO" },
  {
    id: 8,
    text: " Output the data of object to an excel and enable to download it ",
  },
];
export default function About() {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate("/live");
  };
  return (
    <div className="topcomponent">
      <div className="container">
        <VStack mt="160px" alignItems="flex-start" gap="10px">
          <Heading as="h1" size="xl">
            Neo Sherxe is a team dedicated to exploring space, focusing on
            potential threats to Earth like asteroids and other celestial
            bodies.
          </Heading>
          <UnorderedList styleType="'- '">
            {points.map((point) => (
              <ListItem>
                <Text key={point.id} fontWeight="extrabold" fontSize="xl">
                  {point.text}
                </Text>
              </ListItem>
            ))}
          </UnorderedList>
          <Heading as="h2" size="xl">
            The orrery features:
          </Heading>
          <OrderedList>
            {features.map((feature) => (
              <ListItem>
                <Text key={feature.id} fontWeight="extrabold" fontSize="xl">
                  {feature.text}
                </Text>
              </ListItem>
            ))}
          </OrderedList>
          <button
            onClick={handleExploreClick}
            className="orangeButtan"
            style={{
              width: "100%",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <HStack>
              <Text>Explore Now</Text>
              <FontAwesomeIcon icon={faArrowRight} />
            </HStack>
          </button>
          <Heading as="h2" size="xl" mt={8}>
            Our Team
          </Heading>
          <TeamMemberCards />
        </VStack>
      </div>
    </div>
  );
}
