import { useState } from "react";
import PendulumCanvas from "./components/PendulumCanvas";
import './styles.scss';

const GRAVITIES = {
  earth: { g: 9.81, img: "/earth.jpg", label: "Erde" },
  mars:  { g: 3.71, img: "/mars.jpg",  label: "Mars" },
  venus: { g: 8.87, img: "/venus.jpg", label: "Venus" },
};

export default function App() {
  const [mode, setMode] = useState("earth");
  const { g, img } = GRAVITIES[mode];

  return (
    <div className="container-main">
      <h1>RNG from Triple Pendulum</h1>

      <div className="info-text">
        The triple Pendulum is a system of three pendulums that are connected to each other. 
        Its known for its chaotic behavior.  
        My Idea was to use this as a generator for random numbers, by taking the coordinates 
        of the end of the 3rd pendulum and norming them to [0,1].
        Note that these are of course only pseudo random numbers since the system is deterministic.
        <br /><br />
        Is this a resource efficient rng? Absolutely not!
        <br />
        Did I have fun implementing it anyway? Yes!
        <br />
        Also its really mesmerizing to watch.
      </div>

      <div className="main-content">
        <PendulumCanvas 
          g={g} 
          background={img} 
          mode={mode} 
          setMode={setMode} 
          gravities={GRAVITIES} 
        />
      </div>

      <div className="figures-panel">
  <h2>"Scientific" Figures</h2>
  <div className="figures-grid">
    <img src="/figures/Figure_1.png" alt="Figure 1" />
    <img src="/figures/Figure_2.png" alt="Figure 2" />
    <img src="/figures/g=15.png" alt="Figure 3" />
    <img src="/figures/dt=0.05.png" alt="Figure 4" />
    <img src="/figures/theBrain.png" alt="Figure 5" />
    <img src="/figures/1million.png" alt="Figure 6" />
    <img src="/figures/geschwungen.png" alt="Figure 7" />
  </div>
</div>

      <footer>this page was brought to you by Richard B</footer>
    </div>
  );
}