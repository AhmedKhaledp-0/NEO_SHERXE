import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchRiskData } from "../utilities/preloader";

/**
 * Component that preloads data in the background without rendering anything
 * This component should be included at the app root level
 */
const DataPreloader = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch risk data immediately when the app loads
    queryClient.prefetchQuery({
      queryKey: ["riskData"],
      queryFn: fetchRiskData,
      staleTime: 1000 * 60 * 60, // 1 hour stale time
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours cache time
    });

    // Set up an interval to refresh the data in the background every hour
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["riskData"] });
    }, 1000 * 60 * 60); // Every hour

    return () => clearInterval(intervalId);
  }, [queryClient]);

  // This component doesn't render anything
  return null;
};

export default DataPreloader;
