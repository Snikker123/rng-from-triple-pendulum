
export class TriplePendulum {
  constructor(g = 9.81) {
    this.g = g;

    this.l1 = 1;
    this.l2 = 1;
    this.l3 = 1;

    // Zustand [θ1, θ2, θ3, ω1, ω2, ω3]
    this.y = new Float64Array([2.0, 2.0, 2.0, 0, 0, 0]);
    this.randomStart();
   

    // Wiederverwendete Buffer für RK4
    this.k1 = new Float64Array(6);
    this.k2 = new Float64Array(6);
    this.k3 = new Float64Array(6);
    this.k4 = new Float64Array(6);
    this.tmp = new Float64Array(6);
  }

  setGravity(g) {
    this.g = g;
  }

  // ===== Ableitungen: Kern der Physik =====
  derivatives(out, y) {
    const th1 = y[0], th2 = y[1], th3 = y[2];
    const w1  = y[3], w2  = y[4], w3  = y[5];

    const c12 = Math.cos(th1 - th2);
    const c23 = Math.cos(th2 - th3);
    const c13 = Math.cos(th1 - th3);

    const s12 = Math.sin(th1 - th2);
    const s23 = Math.sin(th2 - th3);
    const s13 = Math.sin(th1 - th3);

    // M * ddθ = F
    const M00 = 3,      M01 = c12, M02 = c13;
    const M10 = c12,    M11 = 2,   M12 = c23;
    const M20 = c13,    M21 = c23, M22 = 1;

    const F0 =
      -3 * this.g * Math.sin(th1)
      - w2*w2 * s12
      - w3*w3 * s13;

    const F1 =
      -2 * this.g * Math.sin(th2)
      + w1*w1 * s12
      - w3*w3 * s23;

    const F2 =
      -this.g * Math.sin(th3)
      + w1*w1 * s13
      + w2*w2 * s23;

    // --- Expliziter 3x3 Solver (schnell & allocationsfrei) ---
    const det =
      M00*(M11*M22 - M12*M21) -
      M01*(M10*M22 - M12*M20) +
      M02*(M10*M21 - M11*M20);

    const invDet = 1 / det;

    const a0 = invDet * (
      F0*(M11*M22 - M12*M21) -
      M01*(F1*M22 - M12*F2) +
      M02*(F1*M21 - M11*F2)
    );

    const a1 = invDet * (
      M00*(F1*M22 - M12*F2) -
      F0*(M10*M22 - M12*M20) +
      M02*(M10*F2 - F1*M20)
    );

    const a2 = invDet * (
      M00*(M11*F2 - F1*M21) -
      M01*(M10*F2 - F1*M20) +
      F0*(M10*M21 - M11*M20)
    );

    out[0] = w1;
    out[1] = w2;
    out[2] = w3;
    out[3] = a0;
    out[4] = a1;
    out[5] = a2;
  }

  // ===== RK4 Schritt =====
  step(dt) {
    const y = this.y;

    this.derivatives(this.k1, y);

    for (let i=0;i<6;i++)
      this.tmp[i] = y[i] + this.k1[i]*dt*0.5;
    this.derivatives(this.k2, this.tmp);

    for (let i=0;i<6;i++)
      this.tmp[i] = y[i] + this.k2[i]*dt*0.5;
    this.derivatives(this.k3, this.tmp);

    for (let i=0;i<6;i++)
      this.tmp[i] = y[i] + this.k3[i]*dt;
    this.derivatives(this.k4, this.tmp);

    for (let i=0;i<6;i++) {
      y[i] += dt/6 * (
        this.k1[i] +
        2*this.k2[i] +
        2*this.k3[i] +
        this.k4[i]
      );
    }

    // Winkel numerisch begrenzen
    y[0] = wrapAngle(y[0]);
    y[1] = wrapAngle(y[1]);
    y[2] = wrapAngle(y[2]);
  }

   randomStart(){
       const rand1 = Math.random()*2*Math.PI;
       const rand2 = Math.random()*2*Math.PI;
       const rand3 = Math.random()*2*Math.PI;
        this.y[0]=rand1;
        this.y[1]=rand2;
        this.y[2]=rand3;

        this.y[3]=0;
        this.y[4]=0;
        this.y[5]=0;

    }

  getPositions() {
    const th1 = this.y[0];
    const th2 = this.y[1];
    const th3 = this.y[2];

    const x1 = this.l1 * Math.sin(th1);
    const y1 = this.l1 * Math.cos(th1);

    const x2 = x1 + this.l2 * Math.sin(th2);
    const y2 = y1 + this.l2 * Math.cos(th2);

    const x3 = x2 + this.l3 * Math.sin(th3);
    const y3 = y2 + this.l3 * Math.cos(th3);

    return { x1,y1,x2,y2,x3,y3 };
  }
  reset() {
  this.randomStart();
        }
}



function wrapAngle(a) {
  const PI2 = Math.PI*2;
  return a - PI2*Math.floor((a+Math.PI)/PI2);
}
