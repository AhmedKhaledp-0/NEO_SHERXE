export const fetchRiskData = async () => {
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

  return data
    .filter((obj) =>
      ["low", "medium", "high", "critical"].includes(
        obj.risk_level.toLowerCase()
      )
    )
    .sort((a, b) => {
      const priorityDiff =
        getRiskPriority(a.risk_level) - getRiskPriority(b.risk_level);
      if (priorityDiff === 0) {
        return (
          new Date(a.close_approach_date) - new Date(b.close_approach_date)
        );
      }
      return priorityDiff;
    });
};

const getRiskPriority = (riskLevel) => {
  switch (riskLevel.toLowerCase()) {
    case "critical":
      return 1;
    case "high":
      return 2;
    case "medium":
      return 3;
    case "low":
      return 4;
    default:
      return 5;
  }
};
