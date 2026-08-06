import major_body_data from "./major_body_data.json";
// import NEOs_data from "./NEOs_data.json";
import PHAs_date from "./PHAs_but20.json";
import NEAs_data from "./NEAs_but20.json";
import PHAs_dateEX from "./PHAs20.json";
import NEAs_dataEX from "./NEAs20.json";

const combinedCelestialData = {
  majorBodies: major_body_data,
  PHAs: PHAs_date,
  NEAs: NEAs_data,
  PHAsEX: PHAs_dateEX,
  NEAsEX: NEAs_dataEX,
};

export default combinedCelestialData;
