import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faMeteor,
  faRocket,
  faExclamationTriangle,
  faGlobe,
  faUserAstronaut,
  faDatabase,
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
    <div className="min-h-screen bg-black pt-32 px-4 pb-24 selection:bg-white selection:text-black">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto space-y-24">
          {/* Title Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[0.2em] text-white">
              About Us
            </h1>
            <div className="max-w-3xl mx-auto border border-white/10 bg-white/5 p-8">
              <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/70 leading-relaxed">
                Neo Sherxe is a team dedicated to exploring space, focusing on
                potential threats to Earth like asteroids and other celestial
                bodies.
              </p>
            </div>
          </div>

          {/* Key Points Section */}
          <div className="space-y-12">
            <h2 className="text-2xl font-black text-center uppercase tracking-[0.2em] text-white">
              Our Mission
            </h2>
            <div className="grid grid-cols-1 gap-px bg-white/10 border border-white/10">
              {points.map((point) => (
                <div
                  key={point.id}
                  className="bg-black p-8 md:p-12 group hover:bg-white/5 transition-colors duration-500"
                >
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    <div className="shrink-0 w-16 h-16 flex items-center justify-center border border-white/20 text-white group-hover:bg-white group-hover:text-black transition-colors duration-500">
                      <FontAwesomeIcon icon={point.icon} className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-[0.1em] text-white mb-4">
                        {point.title}
                      </h3>
                      <p className="font-mono text-sm leading-relaxed text-white/60">
                        {point.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-12">
            <h2 className="text-2xl font-black text-center uppercase tracking-[0.2em] text-white">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-black p-8 group hover:bg-white/5 transition-colors duration-500"
                >
                  <div className="flex items-start gap-4">
                    <FontAwesomeIcon
                      icon={faMeteor}
                      className="text-white/30 mt-1"
                    />
                    <p className="font-mono text-sm leading-relaxed text-white/60">
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
              onClick={() => navigate("/live")}
              className="inline-flex items-center justify-center gap-4 px-10 py-5 border border-white/20 bg-transparent text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300"
            >
              <FontAwesomeIcon icon={faRocket} />
              <span>Start Exploring</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          {/* Team Section */}
          <div className="space-y-12">
            <h2 className="text-2xl font-black text-center uppercase tracking-[0.2em] text-white">
              Meet Our Team
            </h2>
            <TeamMemberCards />
          </div>
        </div>
      </div>
    </div>
  );
}
