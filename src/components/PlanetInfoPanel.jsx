import React from "react";

const PlanetInfoPanel = ({ planet, onClose }) => {
  if (!planet) return null;

  return (
    <div className="planetInfo ">
      <h2 className="">{planet.planet}</h2>
      <p>Semi-major axis: {planet.a.toFixed(2)} AU</p>
      <p>Eccentricity: {planet.e.toFixed(4)}</p>
      <p>Inclination: {planet.incl.toFixed(2)}°</p>
      <button onClick={onClose} className="">
        Close
      </button>
    </div>
  );
};

export default PlanetInfoPanel;
