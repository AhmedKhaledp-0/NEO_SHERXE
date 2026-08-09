import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import { fetchRiskData } from "../utilities/preloader";

const getRiskColor = (riskLevel) => {
  switch (riskLevel.toLowerCase()) {
    case "low":
      return "border-white/20 text-white/50";
    case "medium":
      return "border-white/60 text-white";
    case "high":
      return "border-white text-black bg-white";
    case "critical":
      return "border-white text-black bg-white animate-pulse";
    default:
      return "border-white/10 text-white/30";
  }
};

export default function RiskLevel() {
  const {
    data: objects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["riskData"],
    queryFn: fetchRiskData,
    staleTime: 1000 * 60 * 60, // 1 hour stale time
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours cache time
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-white animate-spin"
          />
          <p className="text-white/50 uppercase tracking-widest text-sm">
            Calculating trajectories...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center space-y-4 p-8 border border-white/10">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-4xl text-white"
          />
          <p className="text-white/70 font-mono text-sm uppercase tracking-widest">
            Error: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 px-4 pb-24 selection:bg-white selection:text-black">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[0.2em] text-white">
              Risk Assessment
            </h1>
            <p className="text-sm md:text-base font-medium uppercase tracking-[0.3em] text-white/40 max-w-2xl mx-auto">
              Monitoring potential threats from approaching celestial bodies
            </p>
          </div>

          {/* Risk Level Legend */}
          <div className="flex flex-wrap justify-center gap-4">
            {["Low", "Medium", "High", "Critical"].map((level) => (
              <div
                key={level}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border ${getRiskColor(
                  level,
                )}`}
              >
                {level}
              </div>
            ))}
          </div>

          {/* Cards Grid instead of Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {objects.map(
              ({
                id,
                name,
                close_approach_date,
                diameter_km_max,
                diameter_km_min,
                relative_velocity_kph,
                miss_distance_km,
                risk_level,
              }) => (
                <div
                  key={id}
                  className="bg-black p-8 group hover:bg-white/5 transition-colors duration-500 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-2xl font-bold uppercase tracking-widest text-white group-hover:text-white transition-colors duration-300">
                      {name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border ${getRiskColor(
                        risk_level,
                      )}`}
                    >
                      {risk_level}
                    </span>
                  </div>

                  <div className="space-y-4 font-mono text-sm mt-auto">
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                      <span className="uppercase text-white/40 tracking-widest text-[10px]">
                        Approach
                      </span>
                      <span className="text-white/80">
                        {close_approach_date}
                      </span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                      <span className="uppercase text-white/40 tracking-widest text-[10px]">
                        Diameter
                      </span>
                      <span className="text-white/80">
                        {diameter_km_min.toFixed(2)} -{" "}
                        {diameter_km_max.toFixed(2)} km
                      </span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                      <span className="uppercase text-white/40 tracking-widest text-[10px]">
                        Velocity
                      </span>
                      <span className="text-white/80">
                        {Math.round(relative_velocity_kph).toLocaleString()}{" "}
                        km/h
                      </span>
                    </div>
                    <div className="flex justify-between items-end pb-2">
                      <span className="uppercase text-white/40 tracking-widest text-[10px]">
                        Miss Dist
                      </span>
                      <span className="text-white/80">
                        {Math.round(miss_distance_km).toLocaleString()} km
                      </span>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
