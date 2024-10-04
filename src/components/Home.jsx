import {
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { faArrowRight, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import risk from "../assets/risk.png";
import logo from "../assets/logo.png";
import body1 from "../assets/body1.png";
import body2 from "../assets/body2.png";
import body3 from "../assets/body3.png";
import body4 from "../assets/body4.png";
import { Link, NavLink } from "react-router-dom";

const bodyinfos = [
  {
    image: body1,
    title: " Apophis asteroid",
  },
  {
    image: body2,
    title: " 2010 RF12 asteroid",
  },
  { image: body3, title: "Mir Defunct satellite" },
  { image: body4, title: "1998 OR2 asteroid" },
];
export default function Home() {
  return (
    <div className="LandingPage">
      <div className="HeroSection">
        <div className="container">
          <div className="HeroSectionText">
            <VStack color="#fff" w="500px" alignItems="flex-start">
              <Heading as="h1" size="4xl" noOfLines={2} paddingBottom="30px">
                Solar System Exploration
              </Heading>
              <Text> Journey Among Planets and Stars</Text>
              <button className="orangeButtan">
                <span>
                  Go To Live
                  <FontAwesomeIcon icon={faSun} color="#fff" />
                </span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </VStack>
          </div>
        </div>
      </div>
      <div className="OverView">
        <div className="container">
          <VStack alignItems="flex-start">
            <Heading as="h2" size="3xl">
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
              Spur, between the Sagittarius and Perseus arms. Our solar system
              orbits the center of the galaxy at about 515,000 mph (828,000
              kph). It takes about 230 million years to complete one orbit
              around the galactic center.
            </Text>
            <Text className="OverlayText">
              We call it the solar system because it is made up of our star, the
              Sun, and everything bound to it by gravity.
            </Text>
          </VStack>
          <HStack p="88px 0" gap="30px">
            <Image src={risk} width="35%"></Image>
            <VStack w="65%" alignItems="flex-start">
              <button
                className="orangeButtan"
                style={{ padding: "10px  20px ", alignSelf: "flex-end" }}
              >
                <span>Explore</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <Heading as="h2" size="3xl">
                Color hazard scale
              </Heading>
              <Text className="OverlayText">
                The closer we get to Earth, the higher the level of danger
                becomes, with the color gradually turning red to indicate the
                increasing threat. On the other hand, the farther we move away
                from Earth, we enter the safe zone, represented by the green
                color. This scale reflects the potential danger posed by
                celestial bodies, asteroids, comets, and any objects that might
                threaten our planet.
              </Text>
            </VStack>
          </HStack>
          <VStack justifyContent="center" paddingBottom="88px">
            <Heading as="h2" size="2xl">
              Famous celestial bodies that may pose a threat to Earth
            </Heading>
            <HStack w="100%">
              {bodyinfos.map((body) => (
                <VStack key={body.title} w="100%">
                  <Flex
                    background="#000"
                    h="300px"
                    w="300px"
                    borderRadius="18px"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Image
                      src={body.image}
                      className="objectElement"
                      boxSize="150px"
                    ></Image>
                  </Flex>

                  <Text fontWeight="extrabold" fontSize="2xl">
                    {body.title}
                  </Text>
                  <HStack>
                    <a href="#">Read More</a>
                    <div className="orangeButtan fit">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                  </HStack>
                </VStack>
              ))}
            </HStack>
          </VStack>
        </div>
      </div>
      <div className="footer">
        <div className="container">
          <VStack alignItems="flex-start" h="500px">
            <Image src={logo} w="300px" />
            <HStack w="100%">
              <VStack w="40%">
                <Heading as="h3" size="xl">
                  Explore the Universe, Witness Beauty in Every Moment
                </Heading>
              </VStack>
              <VStack
                w="20%"
                justifyContent="flex-start"
                alignItems="flex-start"
              >
                <NavLink to="/live">
                  <Text fontWeight="black" fontSize="2xl">
                    {" "}
                    Live
                  </Text>
                </NavLink>
                <NavLink to="/planets">
                  {" "}
                  <Text fontWeight="black" fontSize="2xl">
                    Planets{" "}
                  </Text>
                </NavLink>
              </VStack>
              <VStack w="20%">
                <NavLink to="/about">
                  {" "}
                  <Text fontWeight="black" fontSize="2xl">
                    About{" "}
                  </Text>
                </NavLink>
              </VStack>

              <VStack w="20%">
                <NavLink to="/qna">
                  {" "}
                  <Text fontWeight="black" fontSize="2xl">
                    Q&A{" "}
                  </Text>
                </NavLink>
              </VStack>
            </HStack>
          </VStack>
        </div>
      </div>
    </div>
  );
}
