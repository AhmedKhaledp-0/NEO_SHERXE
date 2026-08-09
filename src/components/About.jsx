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
    text: "Track and monitor dangerous asteroid encounters before they hit Earth.",
  },
  {
    id: 2,
    icon: faGlobe,
    title: "Space Agency Monitoring",
    text: "Making complex agency-level space tracking technology accessible to the public.",
  },
  {
    id: 3,
    icon: faUserAstronaut,
    title: "Interactive Experience",
    text: "An interactive web orrery allowing people to explore and track NEOs.",
  },
  {
    id: 4,
    icon: faRocket,
    title: "Welcome to NEO Spherex",
    text: "Your personal gateway for exploring Near-Earth Objects in real-time.",
  },
  {
    id: 5,
    icon: faDatabase,
    title: "Powered by NASA",
    text: "Powered by NASA resources and APIs for accurate celestial data and risk levels.",
  },
];

const features = [
  {
    id: 1,
    text: "Interactive 3D map to visualize the solar system. Zoom, pan, and click objects.",
  },
  {
    id: 2,
    text: "Dynamic filtering to toggle specific celestial categories and customize your viewport.",
  },
  {
    id: 3,
    text: "Time controller allowing users to easily fast-forward or rewind orbital simulations.",
  },
  {
    id: 4,
    text: "Toggleable identification labels for all rendered planets and near-Earth objects.",
  },
  {
    id: 5,
    text: "Colored orbital trajectories to clearly visualize the paths of celestial bodies.",
  },
  {
    id: 6,
    text: "Visual risk level indicators highlighting the potential danger of approaching objects.",
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black pt-16 px-4 pb-24 selection:bg-white selection:text-black">
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
