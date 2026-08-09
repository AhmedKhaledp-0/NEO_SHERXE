import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faTimes,
  faGlobeAmericas,
  faStarOfLife,
  faAsterisk,
  faExclamationTriangle,
  faTag,
  faDrawPolygon,
} from "@fortawesome/free-solid-svg-icons";

const LayerButton = ({ active, onClick, icon, label, count }) => (
  <motion.div
    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/10 active:bg-white/10 transition-all"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
  >
    <div
      className={`flex items-center justify-between flex-1 ${
        active ? "text-white" : "text-white/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <FontAwesomeIcon
          icon={icon}
          className={`text-lg ${active ? "text-white" : "text-white/40"}`}
        />
        <span className="font-medium">{label}</span>
      </div>
      {count && (
        <span className="text-xs px-2 py-1 rounded-full bg-white/15 text-white">
          {count}
        </span>
      )}
    </div>
    <div className="relative">
      <div
        className={`w-4 h-4 rounded border-2 transition-colors ${
          active ? "border-white bg-white" : "border-white/20"
        }`}
      >
        {active && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-black rounded-sm" />
          </motion.div>
        )}
      </div>
    </div>
  </motion.div>
);

const AnimatedLayers = ({
  showPHAs,
  setShowPHAs,
  showNEAs,
  setShowNEAs,
  showPHAsEX,
  setShowPHAsEX,
  showNEAsEX,
  setShowNEAsEX,
  showTags,
  setShowTags,
  showOrbits,
  setShowOrbits,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const layers = [
    {
      label: "Major Planets",
      icon: faGlobeAmericas,
      active: true,
      disabled: true,
      count: 8,
    },
    {
      label: "Potentially Hazardous",
      icon: faExclamationTriangle,
      active: showPHAs,
      toggle: setShowPHAs,
      count: 3000,
    },
    {
      label: "Near Earth Asteroids",
      icon: faAsterisk,
      active: showNEAs,
      toggle: setShowNEAs,
      count: 3000,
    },
    {
      label: "Extended PHAs",
      icon: faStarOfLife,
      active: showPHAsEX,
      toggle: setShowPHAsEX,
      count: 10,
    },
    {
      label: "Extended NEAs",
      icon: faStarOfLife,
      active: showNEAsEX,
      toggle: setShowNEAsEX,
      count: 10,
    },
  ];

  const visualOptions = [
    {
      label: "Object Labels",
      icon: faTag,
      active: showTags,
      toggle: setShowTags,
    },
    {
      label: "Orbit Paths",
      icon: faDrawPolygon,
      active: showOrbits,
      toggle: setShowOrbits,
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-[800]" aria-label="layer toggle">
      <div
        className={`relative bg-black/30 backdrop-blur-md shadow-lg border border-white/20 overflow-hidden ${
          isOpen ? "w-80 rounded-2xl" : "w-12 h-12 rounded-full"
        }`}
      >
        {isOpen ? (
          <div className="px-4 pt-4 pb-16">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">
                Celestial Objects
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                {layers.map((layer) => (
                  <LayerButton
                    key={layer.label}
                    active={layer.active}
                    onClick={() =>
                      !layer.disabled && layer.toggle?.(!layer.active)
                    }
                    icon={layer.icon}
                    label={layer.label}
                    count={layer.count}
                  />
                ))}
              </div>

              <div className="border-t border-white/20 pt-4">
                <h4 className="text-sm font-medium text-white/50 mb-2">
                  Visual Options
                </h4>
                <div className="space-y-2">
                  {visualOptions.map((option) => (
                    <LayerButton
                      key={option.label}
                      active={option.active}
                      onClick={() => option.toggle?.(!option.active)}
                      icon={option.icon}
                      label={option.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="w-full h-full flex items-center justify-center"
            aria-label="panel toggle button"
            onClick={() => setIsOpen(true)}
          >
            <FontAwesomeIcon
              icon={faLayerGroup}
              className="text-xl text-white"
            />
          </button>
        )}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            aria-label="close panel"
            className="absolute bottom-2 right-2 w-12 h-12 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 active:bg-white/10"
          >
            <FontAwesomeIcon icon={faTimes} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimatedLayers;
