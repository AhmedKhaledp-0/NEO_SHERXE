import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faSpinner } from "@fortawesome/free-solid-svg-icons";

const getRiskColor = (riskLevel) => {
  switch (riskLevel.toLowerCase()) {
    case "low":
      return "bg-light-success/10 text-light-success dark:bg-dark-success/10 dark:text-dark-success";
    case "medium":
      return "bg-light-warning/10 text-light-warning dark:bg-dark-warning/10 dark:text-dark-warning";
    case "high":
      return "bg-light-danger/10 text-light-danger dark:bg-dark-danger/10 dark:text-dark-danger";
    case "critical":
      return "bg-red-900/10 text-red-900 dark:bg-red-500/10 dark:text-red-500";
    default:
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  }
};

const getRiskPriority = (riskLevel) => {
  switch (riskLevel.toLowerCase()) {
    case 'critical': return 1;
    case 'high': return 2;
    case 'medium': return 3;
    case 'low': return 4;
    default: return 5;
  }
};

export default function RiskLevel() {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
          .toISOString()
          .split("T")[0];
        const response = await fetch(
          `https://risk-level-sknw.vercel.app/api/phas/${today}/${tomorrow}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const filteredData = data
          .filter((obj) =>
            ["low", "medium", "high", "critical"].includes(
              obj.risk_level.toLowerCase()
            )
          )
          .sort((a, b) => {
            // Sort by risk priority
            const priorityDiff = getRiskPriority(a.risk_level) - getRiskPriority(b.risk_level);
            // If same priority, sort by approach date
            if (priorityDiff === 0) {
              return new Date(a.close_approach_date) - new Date(b.close_approach_date);
            }
            return priorityDiff;
          });
        setObjects(filteredData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <FontAwesomeIcon 
            icon={faSpinner} 
            className="text-4xl text-light-primary dark:text-dark-primary animate-spin" 
          />
          <p className="text-light-text/70 dark:text-dark-text/70">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center">
        <div className="card max-w-lg mx-auto text-center space-y-4">
          <FontAwesomeIcon 
            icon={faExclamationTriangle} 
            className="text-4xl text-light-danger dark:text-dark-danger" 
          />
          <p className="text-light-text/70 dark:text-dark-text/70">
            Error: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background pt-24 px-4 pb-12">
      <div className="container mx-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent bg-clip-text text-transparent">
              Near-Earth Objects Risk Assessment
            </h1>
            <p className="text-xl text-light-text/70 dark:text-dark-text/70 max-w-3xl mx-auto">
              Monitoring and analyzing potential risks from celestial bodies approaching Earth
            </p>
          </div>

          {/* Risk Level Legend */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['Low', 'Medium', 'High', 'Critical'].map((level) => (
              <div 
                key={level}
                className={`px-4 py-2 rounded-full text-sm font-medium ${getRiskColor(level)}`}
              >
                {level}
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-light-primary/10 dark:divide-dark-primary/10">
                <thead className="bg-light-primary/5 dark:bg-dark-primary/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Approach Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Diameter (km)</th>
                    <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Velocity (km/h)</th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Miss Distance (km)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-primary/10 dark:divide-dark-primary/10">
                  {objects.map((obj) => (
                    <tr 
                      key={obj.id}
                      className="hover:bg-light-primary/5 dark:hover:bg-dark-primary/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{obj.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{obj.close_approach_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {obj.diameter_km_min.toFixed(2)} - {obj.diameter_km_max.toFixed(2)}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
                        {obj.relative_velocity_kph.toFixed(2)}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm">
                        {obj.miss_distance_km.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(obj.risk_level)}`}>
                          {obj.risk_level.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
