import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faRocket,
  faGlobe,
  faSatellite,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-light-primary/5 dark:from-dark-primary/5 to-transparent"></div>
          {/* Add animated stars background here if needed */}
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-7xl md:text-8xl font-bold mb-8">
              <span className="bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent bg-clip-text text-transparent">
                NEO SPHERXE
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-light-text/70 dark:text-dark-text/70 mb-12 max-w-2xl mx-auto">
              Explore Near-Earth Objects and track celestial bodies in real-time
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate("/live")}
                className="btn-primary flex items-center justify-center py-2 px-4 gap-3"
              >
                <FontAwesomeIcon icon={faRocket} className="text-xl" />
                <span>Launch Explorer</span>
              </button>
              <button
                onClick={() => navigate("/riskLevel")}
                className="btn-primary py-2 px-4 bg-light-secondary dark:bg-dark-secondary flex items-center justify-center gap-3"
              >
                <FontAwesomeIcon icon={faSatellite} className="text-xl" />
                <span>Check Risk Levels</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-light-surface/50 dark:bg-dark-surface/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="card text-center">
              <FontAwesomeIcon
                icon={faRocket}
                className="text-4xl text-light-primary dark:text-dark-primary mb-6"
              />
              <h3 className="text-xl font-bold mb-4">Real-time Tracking</h3>
              <p className="text-light-text/70 dark:text-dark-text/70">
                Monitor near-Earth objects as they move through our solar system
              </p>
            </div>
            <div className="card text-center">
              <FontAwesomeIcon
                icon={faGlobe}
                className="text-4xl text-light-primary dark:text-dark-primary mb-6"
              />
              <h3 className="text-xl font-bold mb-4">Global Coverage</h3>
              <p className="text-light-text/70 dark:text-dark-text/70">
                Comprehensive data from multiple space agencies and
                observatories
              </p>
            </div>
            <div className="card text-center">
              <FontAwesomeIcon
                icon={faSatellite}
                className="text-4xl text-light-primary dark:text-dark-primary mb-6"
              />
              <h3 className="text-xl font-bold mb-4">Risk Assessment</h3>
              <p className="text-light-text/70 dark:text-dark-text/70">
                Advanced analysis of potential impact risks and trajectories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-light-surface/30 dark:bg-dark-surface/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">
                <span className="bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent bg-clip-text text-transparent">
                  NEO SPHERXE
                </span>
              </h3>
              <p className="text-light-text/70 dark:text-dark-text/70">
                Exploring the cosmos, one object at a time
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <div className="flex flex-col space-y-2">
                <Link
                  to="/live"
                  className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                >
                  Live Tracking
                </Link>
                <Link
                  to="/riskLevel"
                  className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                >
                  Risk Levels
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Learn More</h4>
              <div className="flex flex-col space-y-2">
                <Link
                  to="/about"
                  className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                >
                  About Us
                </Link>
                <Link
                  to="/qna"
                  className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Connect</h4>
              <div className="flex flex-col space-y-2">
                <a
                  href="https://github.com/AhmedKhaledp-0/NEO_SHERXE/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                >
                  <FontAwesomeIcon icon={faGithub} className="text-xl" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
