import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Routes,
} from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Live from "./components/Live";
import Planets from "./components/Planets";
import About from "./components/About";
import Qna from "./components/Qna";
import { HStack, Image, Spacer, Box, Button, VStack } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import logo from "./assets/logo.png";
import Orrery from "./components/Orrery";
import RiskLevel from "./components/RiskLevel";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
      <div className="app">
        <nav>
          <div className="container">
            <HStack w="100%" justifyContent="space-between">
              <Image src={logo} h={["50px", "80px"]} />
              {isMobile ? (
                <Button onClick={toggleMenu}>
                  <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
                </Button>
              ) : (
                <ul className="desktop-menu">
                  <li>
                    <NavLink to="/" end>
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/live">Live</NavLink>
                  </li>
                  <li>
                    <NavLink to="/riskLevel">Risk level</NavLink>
                  </li>
                  <li>
                    <NavLink to="/about">About</NavLink>
                  </li>
                  <li>
                    <NavLink to="/qna">Q&A</NavLink>
                  </li>
                </ul>
              )}
            </HStack>
          </div>
          {isMobile && isOpen && (
            <Box className="mobile-menu">
              <VStack spacing={4} align="stretch">
                <NavLink to="/" end onClick={toggleMenu}>
                  Home
                </NavLink>
                <NavLink to="/live" onClick={toggleMenu}>
                  Live
                </NavLink>
                <NavLink to="/riskLevel" onClick={toggleMenu}>
                  Risk level
                </NavLink>
                <NavLink to="/about" onClick={toggleMenu}>
                  About
                </NavLink>
                <NavLink to="/qna" onClick={toggleMenu}>
                  Q&A
                </NavLink>
              </VStack>
            </Box>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Orrery />} />
          <Route path="/riskLevel" element={<RiskLevel />} />
          <Route path="/about" element={<About />} />
          <Route path="/qna" element={<Qna />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
