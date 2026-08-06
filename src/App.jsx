import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Routes,
} from "react-router-dom";
import "./index.css";
import Home from "./components/Home";
import About from "./components/About";
import Qna from "./components/Qna";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faHome,
  faGlobe,
  faExclamationTriangle,
  faInfoCircle,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import Orrery from "./components/Orrery";
import RiskLevel from "./components/RiskLevel";
import DataPreloader from "./components/DataPreloader";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-dark-background text-dark-text">
        <nav className="fixed w-full top-0 z-40 bg-linear-to-b from-black/70 via-black/30 to-transparent">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <span className="text-xl font-bold bg-linear-to-r from-dark-primary to-dark-accent bg-clip-text text-transparent z-50 relative">
                NEO SPHERXE
              </span>

              <div className="flex items-center gap-4">
                {!isMobile ? (
                  <div className="flex items-center space-x-4">
                    <NavLink to="/" end className="nav-link">
                      Home
                    </NavLink>
                    <NavLink to="/live" className="nav-link">
                      Live
                    </NavLink>
                    <NavLink to="/riskLevel" className="nav-link">
                      Risk Level
                    </NavLink>
                    <NavLink to="/about" className="nav-link">
                      About
                    </NavLink>
                    <NavLink to="/qna" className="nav-link">
                      Q&A
                    </NavLink>
                  </div>
                ) : (
                  <button
                    onClick={toggleMenu}
                    className="w-9 h-9 aspect-square flex justify-center items-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-all duration-200 z-50 relative"
                  >
                    <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Popup */}
          {isMobile && (
            <div
              className={`fixed inset-0 z-90 transition-opacity duration-300  ${
                isOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              {/* Backdrop: removed extra translate to reduce jitter */}
              <div
                className="absolute inset-0 bg-linear-to-br from-black/98 via-black/95 to-black/90 backdrop-blur-lg"
                onClick={() => setIsOpen(false)}
              />

              {/* Menu Content */}
              <div
                className={`absolute inset-y-0 left-0 w-full bg-dark-background/95 flex flex-col
                           transform transition-all duration-300 ease-out h-dvh
                           ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
              >
                {/* Navigation Links - Full height with better spacing */}
                <div className="flex-1 flex flex-col justify-center py-16">
                  <div className="px-6 space-y-6">
                    <NavLink
                      to="/"
                      end
                      className={({ isActive }) =>
                        `flex items-center px-6 py-4 rounded-2xl transition-all duration-300
                         ${
                           isActive
                             ? "bg-dark-text/90 text-dark-background"
                             : "hover:bg-dark-text/10"
                         }`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mr-4">
                        <FontAwesomeIcon icon={faHome} />
                      </div>
                      <span className="text-lg font-medium">Home</span>
                    </NavLink>

                    <NavLink
                      to="/live"
                      className={({ isActive }) =>
                        `flex items-center px-6 py-4 rounded-2xl transition-all duration-300
                         ${
                           isActive
                             ? "bg-dark-text/90 text-dark-background"
                             : "hover:bg-dark-text/10"
                         }`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mr-4">
                        <FontAwesomeIcon icon={faGlobe} />
                      </div>
                      <span className="text-lg font-medium">Live View</span>
                    </NavLink>

                    <NavLink
                      to="/riskLevel"
                      className={({ isActive }) =>
                        `flex items-center px-6 py-4 rounded-2xl transition-all duration-300
                         ${
                           isActive
                             ? "bg-dark-text/90 text-dark-background"
                             : "hover:bg-dark-text/10"
                         }`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mr-4">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                      </div>
                      <span className="text-lg font-medium">Risk Level</span>
                    </NavLink>

                    <NavLink
                      to="/about"
                      className={({ isActive }) =>
                        `flex items-center px-6 py-4 rounded-2xl transition-all duration-300
                         ${
                           isActive
                             ? "bg-dark-text/90 text-dark-background"
                             : "hover:bg-dark-text/10"
                         }`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mr-4">
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </div>
                      <span className="text-lg font-medium">About</span>
                    </NavLink>

                    <NavLink
                      to="/qna"
                      className={({ isActive }) =>
                        `flex items-center px-6 py-4 rounded-2xl transition-all duration-300
                         ${
                           isActive
                             ? "bg-dark-text/90 text-dark-background"
                             : "hover:bg-dark-text/10"
                         }`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mr-4">
                        <FontAwesomeIcon icon={faQuestionCircle} />
                      </div>
                      <span className="text-lg font-medium">Q&A</span>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        <main className="pt-16">
          <DataPreloader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live" element={<Orrery />} />
            <Route path="/riskLevel" element={<RiskLevel />} />
            <Route path="/about" element={<About />} />
            <Route path="/qna" element={<Qna />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
