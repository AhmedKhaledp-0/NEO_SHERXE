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
    text: "Earth is constantly surrounded by celestial bodies, yet we rarely hear about asteroids until they make a dangerously close approach. Monitoring these near-Earth encounters is critical for our planetary defense and ongoing survival.",
  },
  {
    id: 2,
    icon: faGlobe,
    title: "Space Agency Monitoring",
    text: "Space agencies continuously monitor these threats using advanced astronomical tools to predict paths and assess danger. However, for the general public, tracking these complex celestial mechanics often feels inaccessible due to the highly technical data involved.",
  },
  {
    id: 3,
    icon: faUserAstronaut,
    title: "Interactive Experience",
    text: "We bridge this gap by offering a fully interactive, browser-based orrery. This platform empowers everyday people to actively explore our solar system, learn about orbital dynamics, and keep a watchful eye on approaching near-Earth objects.",
  },
  {
    id: 4,
    icon: faRocket,
    title: "Welcome to NEO Spherex",
    text: "Welcome to NEO Spherex, your personal astronomical gateway. We provide a highly intuitive interface designed specifically for tracking, analyzing, and exploring potentially hazardous Near-Earth Objects in real-time, right from the comfort of your own device.",
  },
  {
    id: 5,
    icon: faDatabase,
    title: "Powered by NASA",
    text: "Powered directly by live NASA APIs, our application delivers accurate, up-to-the-minute data. Users can access comprehensive statistics on asteroids and comets sharing our orbital plane, complete with real-time trajectory modeling and detailed threat risk assessments.",
  },
];

const features = [
  {
    id: 1,
    text: "At the core of NEO Spherex lies our interactive 3D map. Visualize the solar system, track asteroid orbits near Earth, and click any celestial body to uncover detailed, real-time data.",
  },
  {
    id: 2,
    text: "Customize your viewing experience with dynamic filtering. Toggle specific categories on or off to focus entirely on the exact near-Earth objects that matter most to your research.",
  },
  {
    id: 3,
    text: "Take full command of the orrery interface. Precisely limit the rendering count of NEOs, NECs, and PHAs to maintain optimal performance while analyzing critical planetary data.",
  },
  {
    id: 4,
    text: "Travel through time with our simulation controller. Fast-forward or rewind orbital mechanics to predict future approaches and observe historical trajectories of potentially hazardous objects.",
  },
  {
    id: 5,
    text: "Navigate the cosmos clearly using our interactive labeling system. Instantly toggle identification tags for planets and NEOs to maintain a clean, readable viewport during deep space exploration.",
  },
  {
    id: 6,
    text: "Visualize complex orbital paths through color-coded trajectories. Instantly differentiate between stable planetary orbits and erratic comet paths to quickly grasp the layout of our inner solar system.",
  },
  {
    id: 7,
    text: "Assess threats instantly with color-coded risk visualization. Our integrated hazard system highlights near-Earth objects based on their potential danger, allowing for rapid identification of critical approach vectors.",
  },
  {
    id: 8,
    text: "Export critical data seamlessly for external analysis. Download comprehensive datasets of selected celestial bodies directly to Excel spreadsheets for advanced astronomical research and detailed offline tracking.",
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
