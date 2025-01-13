import React from "react";
import Orrery from "./Orrery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faInfoCircle, 
  faDownload, 
  faShare,
  faExpand
} from "@fortawesome/free-solid-svg-icons";

export default function Live() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(true);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background relative">
      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 left-4 z-30 max-w-sm">
          <div className="glass-card p-4">
            <h2 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
              Interactive Solar System
            </h2>
            <p className="text-sm text-light-text/70 dark:text-dark-text/70 mb-4">
              Explore celestial bodies in real-time. Use mouse to rotate, scroll to zoom, and click objects for details.
            </p>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-sm text-light-primary dark:text-dark-primary hover:underline"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-20 right-4 z-30 flex flex-col gap-2">
        <button 
          className="glass-card p-2 hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
          onClick={toggleFullscreen}
          title="Toggle fullscreen"
        >
          <FontAwesomeIcon 
            icon={faExpand} 
            className="text-light-primary dark:text-dark-primary"
          />
        </button>
        <button 
          className="glass-card p-2 hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
          onClick={() => setShowInfo(!showInfo)}
          title="Toggle info"
        >
          <FontAwesomeIcon 
            icon={faInfoCircle} 
            className="text-light-primary dark:text-dark-primary"
          />
        </button>
      </div>

      {/* Main Orrery View */}
      <div className="w-full h-screen">
        <Orrery />
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="glass-card px-4 py-2 flex items-center gap-4">
          <button 
            className="text-light-primary dark:text-dark-primary hover:opacity-75 transition-opacity"
            title="Share view"
          >
            <FontAwesomeIcon icon={faShare} />
          </button>
          <button 
            className="text-light-primary dark:text-dark-primary hover:opacity-75 transition-opacity"
            title="Download data"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
      </div>
    </div>
  );
}
