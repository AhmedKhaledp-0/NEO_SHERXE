import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  faCircle
} from "@fortawesome/free-solid-svg-icons";

const LayerButton = ({ active, onClick, icon, label, count }) => (
  <motion.div
    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
  >
    <div className={`flex items-center justify-between flex-1 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={icon} className={`text-lg ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
        <span className="font-medium">{label}</span>
      </div>
      {count && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
          {count}
        </span>
      )}
    </div>
    <div className="relative">
      <div className={`w-4 h-4 rounded border-2 transition-colors ${
        active 
          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400' 
          : 'border-gray-300 dark:border-gray-600'
      }`}>
        {active && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-white rounded-sm" />
          </motion.div>
        )}
      </div>
    </div>
  </motion.div>
);

const AnimatedLayers = ({
  showDwarfPlanets,
  setShowDwarfPlanets,
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
      count: 8
    },
    {
      label: "Dwarf Planets",
      icon: faCircle,
      active: showDwarfPlanets,
      toggle: setShowDwarfPlanets,
      count: 5
    },
    {
      label: "Potentially Hazardous",
      icon: faExclamationTriangle,
      active: showPHAs,
      toggle: setShowPHAs,
      count: 3000
    },
    {
      label: "Near Earth Asteroids",
      icon: faAsterisk,
      active: showNEAs,
      toggle: setShowNEAs,
      count: 3000
    },
    {
      label: "Extended PHAs",
      icon: faStarOfLife,
      active: showPHAsEX,
      toggle: setShowPHAsEX,
      count: 20
    },
    {
      label: "Extended NEAs",
      icon: faStarOfLife,
      active: showNEAsEX,
      toggle: setShowNEAsEX,
      count: 20
    },
  ];

  const visualOptions = [
    {
      label: "Object Labels",
      icon: faTag,
      active: showTags,
      toggle: setShowTags
    },
    {
      label: "Orbit Paths",
      icon: faDrawPolygon,
      active: showOrbits,
      toggle: setShowOrbits
    }
  ];

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-[800]"
      initial="closed"
      animate={isOpen ? "open" : "closed"}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        variants={{
          open: { width: 320, height: 'auto', transition: { duration: 0.2 } },
          closed: { width: 48, height: 48, transition: { duration: 0.2 } }
        }}
      >
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              className="p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Celestial Objects
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  {layers.map((layer) => (
                    <LayerButton
                      key={layer.label}
                      active={layer.active}
                      onClick={() => !layer.disabled && layer.toggle?.(!layer.active)}
                      icon={layer.icon}
                      label={layer.label}
                      count={layer.count}
                    />
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
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
            </motion.div>
          ) : (
            <motion.button
              className="w-full h-full flex items-center justify-center"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon 
                icon={faLayerGroup} 
                className="text-xl text-gray-600 dark:text-gray-400" 
              />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedLayers;
