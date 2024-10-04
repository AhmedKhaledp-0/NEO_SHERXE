import { Button, Heading, Text, VStack } from "@chakra-ui/react";
import { faArrowRight, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

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
        </div>
      </div>
    </div>
  );
}
