import React from "react";
import Orrery from "./Orrery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faDownload,
  faShare,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";

export default function Live() {
  const [, setIsFullscreen] = React.useState(false);
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
    <div className="min-h-screen bg-black relative selection:bg-white selection:text-black">
      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-24 left-4 md:left-8 z-30 max-w-sm">
          <div className="bg-black border border-white/20 p-6 shadow-2xl">
            <h2 className="text-lg font-black uppercase tracking-[0.1em] text-white mb-2">
              Interactive Solar System
            </h2>
            <p className="font-mono text-sm leading-relaxed text-white/60 mb-6">
              Explore celestial bodies in real-time. Use mouse to rotate, scroll
              to zoom, and click objects for details.
            </p>
            <button
              onClick={() => setShowInfo(false)}
              className="text-xs font-bold uppercase tracking-widest text-white hover:text-white/70 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-24 right-4 md:right-8 z-30 flex flex-col gap-2">
        <button
          className="bg-black border border-white/20 w-12 h-12 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors duration-300"
          onClick={toggleFullscreen}
          title="Toggle fullscreen"
        >
          <FontAwesomeIcon icon={faExpand} />
        </button>
        <button
          className="bg-black border border-white/20 w-12 h-12 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors duration-300"
          onClick={() => setShowInfo(!showInfo)}
          title="Toggle info"
        >
          <FontAwesomeIcon icon={faInfoCircle} />
        </button>
      </div>

      {/* Main Orrery View */}
      <div className="w-full h-screen">
        <Orrery />
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-black border border-white/20 px-6 py-3 flex items-center gap-6 shadow-2xl">
          <button
            className="text-white/60 hover:text-white transition-colors duration-300"
            title="Share view"
          >
            <FontAwesomeIcon icon={faShare} />
          </button>
          <button
            className="text-white/60 hover:text-white transition-colors duration-300"
            title="Download data"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
      </div>
    </div>
  );
}
