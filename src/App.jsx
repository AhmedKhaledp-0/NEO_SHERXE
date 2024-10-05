// App.js
import React from "react";
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
import {
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import logo from "./assets/logo.png";
import Orrery from "./components/Orrery";
import RiskLevel from "./components/RiskLevel";

function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <div className="container">
            <HStack w="100%" justifyContent="space-between">
              <Image src={logo} h="80px" />
              <Spacer />
              <ul>
                <li>{/* <image src={}></image> */}</li>
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

              {/* <InputGroup w="300px" borderRadius="8px">
                <InputLeftElement pointerEvents="none">
                  <FontAwesomeIcon icon={faSearch} />
                </InputLeftElement>
                <Input type="text" placeholder="Search" />
              </InputGroup> */}
              <Spacer />
            </HStack>
          </div>
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
