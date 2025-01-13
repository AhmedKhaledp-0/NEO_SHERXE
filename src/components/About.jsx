import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight, 
  faAsterisk, 
  faMeteor, 
  faRocket, 
  faExclamationTriangle,
  faGlobe,
  faUserAstronaut,
  faDatabase 
} from "@fortawesome/free-solid-svg-icons";
import TeamMemberCards from "./TeamMemberCards";

const points = [
  {
    id: 1,
    icon: faExclamationTriangle,
    title: "Earth's Close Encounters",
    text: "How often do you hear about an asteroid that is so close to the Earth that it may hit the Earth ??",
  },
  {
    id: 2,
    icon: faGlobe,
    title: "Space Agency Monitoring",
    text: "These asteroids and comets are regularly monitored by space agencies using advanced astronomical tools to predict their paths and assess any potential danger. However, for the general public, understanding or tracking these celestial bodies can seem out of reach due to the complex technology involved.",
  },
  {
    id: 3,
    icon: faUserAstronaut,
    title: "Interactive Experience",
    text: "So what about creating an interactive orrery web app that enables people to explore, learn, and keep an eye on NEOs.",
  },
  {
    id: 4,
    icon: faRocket,
    title: "Welcome to NEO Spherex",
    text: "Welcome! Let me introduce you to NEO spherex, your personal gateway to tracking and exploring Near-Earth Objects in real-time.",
  },
  {
    id: 5,
    icon: faDatabase,
    title: "Powered by NASA",
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

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Title Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent bg-clip-text text-transparent">
              Exploring Space, Protecting Earth
            </h1>
            <div className="card max-w-3xl mx-auto">
              <p className="text-xl text-light-text/80 dark:text-dark-text/80">
                Neo Sherxe is a team dedicated to exploring space, focusing on
                potential threats to Earth like asteroids and other celestial
                bodies.
              </p>
            </div>
          </div>

          {/* Key Points Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-12 text-center text-light-text dark:text-dark-text">
              Our Mission
              <div className="w-24 h-1 bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent mx-auto mt-4"></div>
            </h2>
            {points.map((point) => (
              <div key={point.id} className="card group hover:border-light-primary dark:hover:border-dark-primary">
                <div className="flex items-start gap-4">
                  <FontAwesomeIcon 
                    icon={point.icon} 
                    className="text-light-primary dark:text-dark-primary mt-1" 
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
                      {point.title}
                    </h3>
                    <p className="text-lg text-light-text/80 dark:text-dark-text/80">
                      {point.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-light-text dark:text-dark-text">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.id} className="card group">
                  <div className="flex items-start gap-4">
                    <FontAwesomeIcon 
                      icon={faMeteor} 
                      className="text-light-primary dark:text-dark-primary mt-1" 
                    />
                    <p className="text-light-text/80 dark:text-dark-text/80">
                      {feature.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <button
              onClick={() => navigate('/live')}
              className="btn-primary inline-flex items-center justify-center gap-3"
            >
              <FontAwesomeIcon icon={faRocket} />
              <span>Start Exploring</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          {/* Team Section */}
          <div>
            <h2 className="text-3xl font-bold mb-12 text-center text-light-text dark:text-dark-text">
              Meet Our Team
            </h2>
            <TeamMemberCards />
          </div>
        </div>
      </div>
    </div>
  );
}
