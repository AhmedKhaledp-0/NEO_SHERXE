# NEO SPHERXE - Near-Earth Object Visualization Platform

## Project Overview

NEO SPHERXE is an interactive web application inspired by the NASA Space Apps Challenge. The platform provides real-time visualization and tracking of Near-Earth Objects (NEOs), including asteroids and potentially hazardous objects, using NASA's data resources and APIs.

## Key Features

- **Interactive 3D Solar System:** Real-time visualization of planets, NEOs, and their orbits
- **Multiple Object Categories:**
  - Major Solar System Bodies
  - Dwarf Planets
  - Near-Earth Asteroids (NEAs)
  - Potentially Hazardous Asteroids (PHAs)
- **Advanced Controls:**
  - Time manipulation (pause, play, speed adjustment)
  - Customizable object visibility
  - Interactive camera controls
  - Object labels and orbit visualization
- **Risk Assessment:** Real-time monitoring and risk level evaluation of approaching NEOs
- **Detailed Information:** Comprehensive data about celestial objects including orbital parameters and physical characteristics

## Technology Stack

- **Frontend Framework:** React
- **3D Rendering:** Three.js with React Three Fiber
- **State Management:** React Hooks
- **UI Components:** TailwindCSS
- **3D Models & Effects:** React Three Drei
- **Icons:** FontAwesome
- **Data Sources:** NASA APIs and Resources

## Installation

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn
- Git

### Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/NEO_SPHERXE.git
   cd NEO_SPHERXE
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup:**
   - Create a `.env` file in the root directory
   - Add necessary environment variables (if any)

4. **Start Development Server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage Guide

1. **Navigation:**
   - Use mouse/trackpad to rotate the view
   - Scroll to zoom in/out
   - Right-click and drag to pan

2. **Object Controls:**
   - Toggle visibility of different celestial bodies using the layers panel
   - Click on objects to view detailed information
   - Use the time controller to adjust simulation speed

3. **Risk Assessment:**
   - Access the risk level dashboard to view approaching NEOs
   - Monitor threat levels and approach dates
   - Filter objects based on risk categories

## Project Structure

```
NEO_SPHERXE/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── utilities/     # Helper functions
│   ├── assets/        # Static resources
│   └── styles/        # CSS and styling files
├── public/            # Public assets
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Technical Details

### Orbital Calculations

The application uses Kepler's orbital mechanics for precise celestial body positioning:

#### Kepler's Orbital Elements

$$\begin{align*}
\text{where:}\\
a &: \text{Semi-major axis}\\
e &: \text{Eccentricity}\\
i &: \text{Inclination}\\
\Omega &: \text{Longitude of ascending node}\\
\omega &: \text{Argument of periapsis}\\
M &: \text{Mean anomaly}
\end{align*}$$

#### Position Calculations

1. **Eccentric Anomaly (E)** from Mean Anomaly (M):
   $M = E - e\sin(E)$ (Kepler's Equation)

2. **True Anomaly (ν)** from Eccentric Anomaly:
   $\nu = 2\arctan\left(\sqrt{\frac{1+e}{1-e}}\tan\frac{E}{2}\right)$

3. **Radius Vector (r)**:
   $r = a(1-e\cos(E))$

4. **Cartesian Coordinates**:

   $$\begin{align*}
   x &= r[\cos(\Omega)\cos(\omega + \nu) - \sin(\Omega)\sin(\omega + \nu)\cos(i)]\\
   y &= r[\sin(\Omega)\cos(\omega + \nu) + \cos(\Omega)\sin(\omega + \nu)\cos(i)]\\
   z &= r\sin(\omega + \nu)\sin(i)
   \end{align*}$$

### Risk Assessment Parameters

$$\begin{align*}
\text{Risk Level} &= f(d, v, s, m)\\
\text{where:}\\
d &: \text{Distance from Earth (AU)}\\
v &: \text{Relative velocity (km/s)}\\
s &: \text{Object size (meters)}\\
m &: \text{MOID (Minimum Orbit Intersection Distance)}
\end{align*}$$

### Data Sources

1. **NASA APIs Used:**
   - JPL Small-Body Database
   - NEO Earth Close Approaches

2. **Update Frequency:**
   - Real-time calculations for object positions
   - Daily updates for NEO risk assessments
   - Hourly updates for close approach data

## Team Members

### Core Team

- **Salma Saad**
  - Role: Team Leader
  - LinkedIn: [Salma Saad](https://www.linkedin.com/in/salma-saad-255903204/)
  - Email: salmasaad2131@gmail.com

- **Ahmed Khaled Fathi**
  - Role: Frontend Developer
  - GitHub: [AhmedKhaledp-0](https://github.com/AhmedKhaledp-0)
  - Email: brokeninfp@gmail.com

- **Raghad Mahmoud**
  - Role: UI/UX Designer
  - LinkedIn: [Raghad Mahmoud](https://www.linkedin.com/in/raghad-mahmoud-00a48b2a4/)
  - Behance: [Portfolio](https://www.behance.net/raghadmahmoud9)
  - Email: Raghadmahmoud301@gmail.com

- **Basma Sabry Elhussieni**
  - Role: Backend and Data Analyzer
  - LinkedIn: [Basma Sabry](https://www.linkedin.com/in/basma-sabry-084092248/)
  - GitHub: [Basma-90](https://github.com/Basma-90)

- **Mohamed Ahmed Badry**
  - Role: Backend and Data Analyzer
  - LinkedIn: [Mohamed Badry](https://www.linkedin.com/in/mohamed-badry-205097220/)

- **Abd Elhadi Elsayed**
  - Role: Video Editor, Data Collection
  - Email: a.enghadi26@gmail.com

## Performance Optimizations

1. **Rendering Optimizations:**
   - Instance mesh batching
   - Dynamic level of detail (LOD)
   - Frustum culling
   - Texture compression

2. **Calculation Optimizations:**
   - Web Workers for heavy calculations
   - Memoization of orbital parameters
   - Efficient data structures for position tracking

3. **Data Management:**
   - Client-side caching
   - Progressive loading
   - Optimized state management

## Known Limitations

1. **Computational Constraints:**
   - Maximum of 1000 simultaneous NEO objects
   - Time simulation limited to ±100 years from present
   - Position accuracy decreases with prediction distance

2. **Browser Requirements:**
   - WebGL 2.0 support required
   - Minimum 4GB RAM recommended
   - Modern browser (Chrome 80+, Firefox 75+, Safari 13+)

