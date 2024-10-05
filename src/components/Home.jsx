import React from "react";
import {
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
  Box,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import { faArrowRight, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, NavLink, useNavigate } from "react-router-dom";
import risk from "../assets/risk.png";
import logo from "../assets/logo.png";
import body1 from "../assets/body1.png";
import body2 from "../assets/body2.png";
import body3 from "../assets/body3.png";
import body4 from "../assets/body4.png";

const bodyinfos = [
  { image: body1, title: "Apophis asteroid" },
  { image: body2, title: "2010 RF12 asteroid" },
  { image: body3, title: "Mir Defunct satellite" },
  { image: body4, title: "1998 OR2 asteroid" },
];

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleLiveClick = () => navigate("/live");
  const handleRiskClick = () => navigate("/riskLevel");

  return (
    <Box className="LandingPage">
      <Box className="HeroSection" minHeight="100vh">
        <Flex
          className="container"
          direction="column"
          align="center"
          justify="center"
          minHeight="100vh"
          p={4}
        >
          <VStack
            color="#fff"
            maxWidth="500px"
            alignItems={["center", "center", "flex-start", "flex-start"]}
            spacing={6}
            textAlign={["center", "left"]}
          >
            <Heading as="h1" size={["2xl", "4xl"]} noOfLines={2} w="100%">
              Solar System Exploration
            </Heading>
            <Text fontSize={["md", "lg"]}>Journey Among Planets and Stars</Text>
            <Button
              className="orangeButtan"
              onClick={handleLiveClick}
              rightIcon={<FontAwesomeIcon icon={faArrowRight} />}
            >
              <Flex align="center">
                <Text mr={2}>Go To Live</Text>
                <FontAwesomeIcon icon={faSun} />
              </Flex>
            </Button>
          </VStack>
        </Flex>
      </Box>

      <Box className="OverView" py={12}>
        <Flex className="container" direction="column" px={4}>
          <VStack alignItems="flex-start" spacing={8} mb={12}>
            <Heading as="h2" size={["2xl", "3xl"]}>
              Solar System Overview
            </Heading>
            <Text className="OverlayText">
              The solar system has one star, eight planets, five officially
              named dwarf planets, hundreds of moons, thousands of comets, and
              more than a million asteroids.
            </Text>
            <Text className="OverlayText">
              Our solar system is located in the Milky Way, a barred spiral
              galaxy with two major arms, and two minor arms. Our Sun is in a
              small, partial arm of the Milky Way called the Orion Arm, or Orion
              Spur, between the Sagittarius and Perseus arms.
            </Text>
            <Text className="OverlayText">
              We call it the solar system because it is made up of our star, the
              Sun, and everything bound to it by gravity.
            </Text>
          </VStack>

          <Flex
            direction={["column", "column", "row"]}
            gap="30px"
            w="100%"
            mb={12}
          >
            <Image src={risk} maxW={["100%", "100%", "35%"]} mb={[4, 4, 0]} />
            <VStack
              w={["100%", "100%", "65%"]}
              alignItems="flex-start"
              spacing={4}
            >
              <Button
                className="orangeButtan"
                alignSelf="flex-end"
                onClick={handleRiskClick}
                rightIcon={<FontAwesomeIcon icon={faArrowRight} />}
              >
                Explore
              </Button>
              <Heading as="h2" size={["xl", "2xl", "3xl"]}>
                Color hazard scale
              </Heading>
              <Text className="OverlayText">
                The closer we get to Earth, the higher the level of danger
                becomes, with the color gradually turning red to indicate the
                increasing threat. On the other hand, the farther we move away
                from Earth, we enter the safe zone, represented by the green
                color.
              </Text>
            </VStack>
          </Flex>
        </Flex>
      </Box>

      <Box className="footer" bg="gray.800" color="white" py={12}>
        <Flex className="container" direction="column" px={4}>
          <VStack alignItems="flex-start" spacing={8} mb={12}>
            <Image src={logo} w={["200px", "300px"]} />
            <SimpleGrid columns={[1, 2, 4]} spacing={8} w="100%">
              <VStack alignItems="flex-start" spacing={4}>
                <Heading as="h3" size="lg">
                  Explore the Universe, Witness Beauty in Every Moment
                </Heading>
              </VStack>
              <VStack alignItems="flex-start" spacing={4}>
                <NavLink to="/live">
                  <Text fontWeight="bold" fontSize="xl">
                    Live
                  </Text>
                </NavLink>
                <NavLink to="/riskLevel">
                  <Text fontWeight="bold" fontSize="xl">
                    Risk level
                  </Text>
                </NavLink>
              </VStack>
              <VStack alignItems="flex-start" spacing={4}>
                <NavLink to="/about">
                  <Text fontWeight="bold" fontSize="xl">
                    About
                  </Text>
                </NavLink>
              </VStack>
              <VStack alignItems="flex-start" spacing={4}>
                <NavLink to="/qna">
                  <Text fontWeight="bold" fontSize="xl">
                    Q&A
                  </Text>
                </NavLink>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Flex>
      </Box>
    </Box>
  );
}
