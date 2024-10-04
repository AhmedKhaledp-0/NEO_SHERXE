import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faTimes } from "@fortawesome/free-solid-svg-icons";

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

  const toggleOpen = () => setIsOpen(!isOpen);

  const containerVariants = {
    closed: {
      width: 40,
      height: 40,
      zIndex: 999999999,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
    open: {
      width: 300,
      height: 300,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
  };

  const contentVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1, transition: { delay: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
  };

  const layers = [
    {
      label: "Dwarf Planets",
      state: showDwarfPlanets,
      setState: setShowDwarfPlanets,
    },
    { label: "PHAs", state: showPHAs, setState: setShowPHAs },
    { label: "NEAs", state: showNEAs, setState: setShowNEAs },
    { label: "PHAsEX", state: showPHAsEX, setState: setShowPHAsEX },
    { label: "NEAsEX", state: showNEAsEX, setState: setShowNEAsEX },
    { label: "Tags", state: showTags, setState: setShowTags },
    { label: "Orbits", state: showOrbits, setState: setShowOrbits },
  ];

  return (
    <motion.div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "white",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        overflow: "hidden",
        cursor: "pointer",
      }}
      variants={containerVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      onClick={toggleOpen}
    >
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            variants={contentVariants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ marginTop: "30px" }}>
              {layers.map((layer, index) => (
                <motion.div
                  key={layer.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <input
                    type="checkbox"
                    checked={layer.state}
                    onChange={() => layer.setState(!layer.state)}
                    style={{ marginRight: "10px" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span style={{ color: "#333" }}>{layer.label}</span>
                </motion.div>
              ))}
            </div>
            <motion.div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <FontAwesomeIcon icon={faTimes} color="gray" size="lg" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon icon={faLayerGroup} color="gray" size="lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedLayers;
