import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faSatellite,
  faChevronRight,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Subtle minimalist grid background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik02MCAwaC02MHY2MGg2MHoiLz48L2c+PC9zdmc+')] mix-blend-screen" />
      </div>

      <div className="relative z-10 pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-16 pb-24 lg:pt-16 lg:pb-40 flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-6xl md:text-[7rem] font-medium text-center tracking-tighter mb-8 leading-none">
            <span className="block text-white mb-2">MONITOR THE</span>
            <span className="block text-white/50">COSMIC FRONTIER</span>
          </h1>

          <p className="text-lg md:text-xl text-center text-white/50 max-w-2xl mb-16 font-light leading-relaxed tracking-wide">
            Advanced real-time tracking of Near-Earth Objects. Visualize orbital
            trajectories and assess impact probabilities with precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <button
              onClick={() => navigate("/live")}
              className="px-10 py-5 bg-white text-black font-medium tracking-widest uppercase text-sm border border-white transition-all hover:bg-transparent active:bg-transparent hover:text-white active:text-white"
            >
              Enter Live View
            </button>

            <button
              onClick={() => navigate("/riskLevel")}
              className="px-10 py-5 bg-transparent border border-white/20 text-white font-medium tracking-widest uppercase text-sm transition-all hover:border-white active:border-white"
            >
              Risk Assessment
            </button>
          </div>
        </section>

        {/* Minimalist Grid Features */}
        <section className="container mx-auto px-6 py-24 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
              CAPABILITIES
            </h2>
            <p className="text-white/40 tracking-widest uppercase text-xs font-bold max-w-xs md:text-right">
              Precision tools for celestial analysis and tracking
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {/* Feature 1 */}
            <div className="bg-black p-10 lg:p-14 group flex flex-col justify-between min-h-[400px]">
              <div>
                <FontAwesomeIcon
                  icon={faRocket}
                  className="text-2xl mb-8 text-white/50 group-hover:text-white group-active:text-white transition-colors"
                />
                <h3 className="text-2xl font-medium mb-4 tracking-tight text-white">
                  Interactive Orrery
                </h3>
                <p className="font-light leading-relaxed text-white/40">
                  Experience a fully interactive 3D model of the solar system.
                  Track precise positions of planets and thousands of known
                  asteroids in real-time.
                </p>
              </div>
              <div
                className="mt-12 flex items-center gap-4 text-xs tracking-widest uppercase font-bold cursor-pointer text-white/70 group-hover:text-white group-active:text-white transition-colors"
                onClick={() => navigate("/live")}
              >
                Access System{" "}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-[10px]"
                />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-black p-10 lg:p-14 group flex flex-col justify-between min-h-[400px]">
              <div>
                <FontAwesomeIcon
                  icon={faShieldHalved}
                  className="text-2xl mb-8 text-white/50 group-hover:text-white group-active:text-white transition-colors"
                />
                <h3 className="text-2xl font-medium mb-4 tracking-tight text-white">
                  Risk Analysis
                </h3>
                <p className="font-light leading-relaxed text-white/40">
                  Monitor the Torino Scale and detailed impact probabilities for
                  potentially hazardous objects (PHOs) passing near Earth.
                </p>
              </div>
              <div
                className="mt-12 flex items-center gap-4 text-xs tracking-widest uppercase font-bold cursor-pointer text-white/70 group-hover:text-white group-active:text-white transition-colors"
                onClick={() => navigate("/riskLevel")}
              >
                View Assessment{" "}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-[10px]"
                />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-black p-10 lg:p-14 group flex flex-col justify-between min-h-[400px]">
              <div>
                <FontAwesomeIcon
                  icon={faSatellite}
                  className="text-2xl mb-8 text-white/50 group-hover:text-white group-active:text-white transition-colors"
                />
                <h3 className="text-2xl font-medium mb-4 tracking-tight text-white">
                  Live Telemetry
                </h3>
                <p className="font-light leading-relaxed text-white/40">
                  Access up-to-the-minute data sourced directly from NASA&apos;s
                  JPL and advanced global astronomical observatories.
                </p>
              </div>
              <div
                className="mt-12 flex items-center gap-4 text-xs tracking-widest uppercase font-bold cursor-pointer text-white/70 group-hover:text-white group-active:text-white transition-colors"
                onClick={() => navigate("/qna")}
              >
                Read Documentation{" "}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-[10px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-32 border-y border-white/10 mt-12">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-5xl font-medium tracking-tighter mb-8">
              INITIATE TRACKING
            </h2>
            <p className="text-white/40 max-w-xl mb-12 font-light leading-relaxed text-lg">
              No installation required. Access the comprehensive database and
              begin monitoring the heavens immediately.
            </p>
            <button
              onClick={() => navigate("/live")}
              className="px-12 py-5 bg-white text-black font-bold tracking-widest uppercase text-sm border border-white transition-all hover:bg-black active:bg-black hover:text-white active:text-white"
            >
              Launch Explorer
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-16 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/10 pt-16">
          <div className="flex items-center gap-4">
            <span className="font-bold text-sm tracking-[0.3em] uppercase">
              NEO SPHERXE
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-xs font-bold tracking-widest uppercase text-white/40">
            <Link
              to="/about"
              className="hover:text-white active:text-white transition-colors"
            >
              About
            </Link>
            <Link
              to="/live"
              className="hover:text-white active:text-white transition-colors"
            >
              Live View
            </Link>
            <Link
              to="/riskLevel"
              className="hover:text-white active:text-white transition-colors"
            >
              Risk Level
            </Link>
            <a
              href="https://github.com/AhmedKhaledp-0/NEO_SHERXE/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white active:text-white transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faGithub} className="text-sm" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
