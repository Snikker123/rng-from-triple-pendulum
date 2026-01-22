import { useEffect, useRef, useState } from "react";
import { TriplePendulum } from "../physics/TriplePendulum";

export default function PendulumCanvas({ g, background, mode, setMode, gravities }) {
  const canvasRef = useRef(null);
  const pendulumRef = useRef(new TriplePendulum(g));
  const [dimensionMode, setDimensionMode] = useState("1D"); // "1D" | "2D"
  const [rangeMin, setRangeMin] = useState(0);
  const [rangeMax, setRangeMax] = useState(1);

  const [running, setRunning] = useState(true);
  const [randomNumbers, setRandomNumbers] = useState([]);
  const [bgImage, setBgImage] = useState(null);

  const trailCanvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = background;
    img.onload = () => setBgImage(img);
  }, [background]);

  useEffect(() => {
    pendulumRef.current.setGravity(g);
  }, [g]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const trailCanvas = document.createElement("canvas");
    trailCanvas.width = canvas.width;
    trailCanvas.height = canvas.height;
    const tctx = trailCanvas.getContext("2d");
    trailCanvasRef.current = tctx;

    let rafId;

    function loop() {
      const p = pendulumRef.current;
      if (running) {
        for (let i = 0; i < 6; i++) {
          p.step(0.002);
        }
      }

      const pos = p.getPositions();
      tctx.globalCompositeOperation = "destination-in";
      tctx.fillStyle = "rgba(255,255,255,0.975)";
      tctx.fillRect(0, 0, trailCanvas.width, trailCanvas.height);
      tctx.globalCompositeOperation = "source-over";

      const y = p.y;
      const alpha1 = Math.min(1, Math.abs(y[3]) / 8 + 0.2);
      const alpha2 = Math.min(1, Math.abs(y[4]) / 8 + 0.2);
      const alpha3 = Math.min(1, Math.abs(y[5]) / 8 + 0.2);

      drawTrailPoint(tctx, pos.x1, pos.y1, "#ff4040", 0.016, alpha1);
      drawTrailPoint(tctx, pos.x2, pos.y2, "#40ff40", 0.016, alpha2);
      drawTrailPoint(tctx, pos.x3, pos.y3, "#4090ff", 0.016, alpha3);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (bgImage) {
        const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
        const x = (canvas.width - bgImage.width * scale) / 2;
        const y = (canvas.height - bgImage.height * scale) / 2;
        ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height, x, y, bgImage.width * scale, bgImage.height * scale);
      }

      ctx.drawImage(trailCanvas, 0, 0);
      drawMain(ctx, pos);

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [running, bgImage]);

  function reset() {
    pendulumRef.current.reset();
    const tctx = trailCanvasRef.current;
    if (tctx) tctx.clearRect(0, 0, tctx.canvas.width, tctx.canvas.height);
    setRandomNumbers([]);
  }

  const getRandomNumber = () => {
  const pos = pendulumRef.current.getPositions();

  const normalize = (v) => {
    const norm01 = (v + 3) / 6;
    return rangeMin + norm01 * (rangeMax - rangeMin);
  };

  const xVal = normalize(pos.x3).toFixed(4);
  const yVal = normalize(pos.y3).toFixed(4);

  if (dimensionMode === "1D") {
    setRandomNumbers(prev => [{ x: xVal }, ...prev]);
  } else {
    setRandomNumbers(prev => [{ x: xVal, y: yVal }, ...prev]);
  }
};

  return (
    <div className="pendulum-main-layout">
      {/* LINKE SPALTE */}
      <div className="left-column">
        <div className="btn-animation-wrapper">
          <button className="btn-animation" onClick={() => setRunning(r => !r)}>
            {running ? "Stop" : "Start"}
          </button>
          <button className="btn-animation" onClick={reset}>
            Reset
          </button>
        </div>

        <div className="canvas-wrapper">
          <canvas
            className="canvas-pendel"
            ref={canvasRef}
            width={900}
            height={700}
          />
        </div>

        <div className="planet-selector">
          {Object.entries(gravities).map(([k, v]) => (
            <button
              key={k}
              className={`btn-planet ${k === mode ? "active" : ""}`}
              onClick={() => setMode(k)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="right-column">
  <div className="random-controls">

    {/* GET RANDOM NUMBER BUTTON */}
    <button className="btn-random" onClick={getRandomNumber}>
      Get random number
    </button>

    {/* DIMENSION TOGGLE */}
    <div className="dimension-toggle">
      <button
        className={dimensionMode === "1D" ? "active" : ""}
        onClick={() => setDimensionMode("1D")}
      >
        1D
      </button>
      <button
        className={dimensionMode === "2D" ? "active" : ""}
        onClick={() => setDimensionMode("2D")}
      >
        2D
      </button>
    </div>

    {/* RANGE INPUTS MIT BESCHRIFTUNG */}
    <div className="range-inputs">
      <label>
        Range:
        <input
          type="number"
          value={rangeMin}
          onChange={e => setRangeMin(Number(e.target.value))}
          placeholder="Min"
        />
        <span>to</span>
        <input
          type="number"
          value={rangeMax}
          onChange={e => setRangeMax(Number(e.target.value))}
          placeholder="Max"
        />
      </label>
    </div>
  </div>

  {/* RANDOM NUMBERS LIST */}
  <div className="random-number-wrapper">
    {randomNumbers.map((entry, idx) => (
      <div className="random-number" key={idx}>
        <span>
          {dimensionMode === "1D"
            ? entry.x
            : `${entry.x}, ${entry.y}`}
        </span>
        <button
          onClick={() =>
            navigator.clipboard.writeText(
              dimensionMode === "1D"
                ? entry.x
                : `${entry.x}, ${entry.y}`
            )
          }
          title="Copy to clipboard"
        >
          📋
        </button>
      </div>
    ))}
  </div>
</div>


      

    </div>
  );
}

/* Hilfsfunktionen zum Zeichnen */
function drawTrailPoint(ctx, x, y, color, radius = 0.016, alpha = 1) {
  ctx.save();
  ctx.translate(450, 250);
  ctx.scale(120, 120);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = colorWithAlpha(color, alpha);
  ctx.shadowColor = colorWithAlpha(color, alpha);
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function colorWithAlpha(hex, alpha) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawMain(ctx, p) {
  ctx.save();
  ctx.translate(450, 250);
  ctx.scale(120, 120);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 0.03;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(p.x1, p.y1);
  ctx.lineTo(p.x2, p.y2);
  ctx.lineTo(p.x3, p.y3);
  ctx.stroke();
  drawBob(ctx, p.x1, p.y1, "#ff4040");
  drawBob(ctx, p.x2, p.y2, "#40ff40");
  drawBob(ctx, p.x3, p.y3, "#4090ff");
  ctx.restore();
}

function drawBob(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, 0.05, 0, Math.PI * 2);
  ctx.fill();
}