import { faClose, faInfoCircle, faChartLine, faGlobe, faStar, faRuler } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

const PlanetInfoPanel = ({ planet, onClose }) => {
  if (!planet) return null;
  const [activeTab, setActiveTab] = useState(0);

  const formatValue = (value, decimals = 3, unit = '') => {
    return typeof value === 'number' ? `${value.toFixed(decimals)}${unit}` : 'N/A';
  };

  return (
    <div className="fixed inset-x-0 top-20 mx-auto z-[1000] w-[95%] md:w-96 md:right-4 md:left-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white">
            {planet.targetname.split(" ")[0]}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <p className="text-white/80 text-sm">
          {planet.type || 'Celestial Body'} • ID: {planet.id || 'N/A'}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white/50 dark:bg-gray-800/50">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {['Overview', 'Orbital', 'Position'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors
                ${activeTab === index 
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <FontAwesomeIcon 
                icon={[faInfoCircle, faChartLine, faGlobe][index]} 
                className="mr-2" 
              />
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="p-6">
          {activeTab === 0 && (
            <div className="space-y-6">
              <DataSection
                icon={faStar}
                title="Basic Information"
                items={[
                  { label: "Object Type", value: planet.type || 'N/A' },
                  { label: "Body ID", value: planet.id || 'N/A' },
                  { label: "Epoch", value: planet.datetime_str || 'N/A' }
                ]}
              />
              <DataSection
                icon={faRuler}
                title="Physical Properties"
                items={[
                  { label: "Distance from Sun", value: formatValue(planet.a, 3, ' AU') },
                  { label: "Orbital Period", value: planet.P ? formatValue(planet.P, 2, ' years') : 'N/A' }
                ]}
              />
            </div>
          )}

          {activeTab === 1 && (
            <DataSection
              icon={faChartLine}
              title="Orbital Elements"
              items={[
                { label: "Semi-major axis", value: formatValue(planet.a, 4, ' AU') },
                { label: "Eccentricity", value: formatValue(planet.e, 6) },
                { label: "Inclination", value: formatValue(planet.incl, 2, '°') },
                { label: "Asc. Node", value: formatValue(planet.Omega, 2, '°') },
                { label: "Arg. of Perihelion", value: formatValue(planet.w, 2, '°') },
                { label: "Mean Anomaly", value: formatValue(planet.M, 2, '°') }
              ]}
            />
          )}

          {activeTab === 2 && (
            <div className="space-y-6">
              <VectorDisplay
                title="Position Vector (AU)"
                x={planet.x}
                y={planet.y}
                z={planet.z}
                precision={6}
              />
              <VectorDisplay
                title="Velocity Vector (AU/day)"
                x={planet.vx}
                y={planet.vy}
                z={planet.vz}
                precision={8}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DataSection = ({ icon, title, items }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
      <FontAwesomeIcon icon={icon} className="text-indigo-500 dark:text-indigo-400" />
      <span className="font-semibold">{title}</span>
    </div>
    <div className="space-y-2 pl-6">
      {items.map((item, index) => (
        <InfoRow key={index} {...item} />
      ))}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center px-1 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);

const VectorDisplay = ({ title, x, y, z, precision = 6 }) => (
  <div className="space-y-2">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
    <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
      {[
        { label: 'X', value: x },
        { label: 'Y', value: y },
        { label: 'Z', value: z }
      ].map(({ label, value }) => (
        <div key={label} className="text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {typeof value === 'number' ? value.toFixed(precision) : 'N/A'}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default PlanetInfoPanel;
