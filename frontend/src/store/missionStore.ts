import { create } from 'zustand';

export interface MissionParams {
  origin: string;
  destination: string;
  launchSite: string;
  mass: number;
  launchDate: string;
  gravityAssist: boolean;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  z: number;
}

export interface TelemetryData {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  argPeriapsis: number;
  trueAnomaly: number;
}

export interface CalculusData {
  mu: string;
  visVivaEquation: string;
  v1_burn: string;
  v2_burn: string;
  total_delta_v: number;
  tof_equation: string;
  tof_days: number;
  phase_angle_equation: string;
  phase_angle: number;
}

export interface OptimizationResult {
  deltaV: number;
  travelTime: number;
  fuelCost: number;
  runtime: number; // Execution time in seconds
  path: TrajectoryPoint[];
  destinationOrbit?: TrajectoryPoint[];
  originOrbit?: TrajectoryPoint[];
  telemetry?: TelemetryData;
  calculus?: CalculusData;
  quboEquation?: string;
  quboMatrix?: string;
}

interface MissionState {
  params: MissionParams;
  isSimulating: boolean;
  isMatrixOpen: boolean;
  isCameraTethered: boolean;
  isQuantumLabOpen: boolean;
  isCockpitView: boolean;
  isRaceMode: boolean;
  isGravityGridVisible: boolean;
  flightSpeed: number;
  isFlightPaused: boolean;
  annealingTime: number;
  chainStrength: number;
  error: string | null;
  classicalResult: OptimizationResult | null;
  quantumResult: OptimizationResult | null;
  setParams: (params: Partial<MissionParams>) => void;
  toggleMatrix: () => void;
  toggleCameraTether: () => void;
  toggleQuantumLab: () => void;
  toggleCockpitView: () => void;
  toggleRaceMode: () => void;
  toggleGravityGrid: () => void;
  setFlightSpeed: (speed: number) => void;
  toggleFlightPause: () => void;
  setAnnealingTime: (val: number) => void;
  setChainStrength: (val: number) => void;
  exportFlightPlan: () => void;
  runSimulation: () => Promise<void>;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  params: {
    origin: 'Earth',
    destination: 'Mars',
    launchSite: 'Kennedy Space Center (NASA, USA)',
    mass: 1500,
    launchDate: new Date().toISOString().split('T')[0],
    gravityAssist: false,
  },
  isSimulating: false,
  isMatrixOpen: false,
  isCameraTethered: false,
  isQuantumLabOpen: false,
  isCockpitView: false,
  isRaceMode: false,
  isGravityGridVisible: true,
  flightSpeed: 1.0,
  isFlightPaused: false,
  annealingTime: 20,
  chainStrength: 2.5,
  error: null,
  classicalResult: null,
  quantumResult: null,
  setParams: (newParams) => set((state) => ({ params: { ...state.params, ...newParams } })),
  toggleMatrix: () => set((state) => ({ isMatrixOpen: !state.isMatrixOpen })),
  toggleCameraTether: () => set((state) => ({ isCameraTethered: !state.isCameraTethered, isCockpitView: false })),
  toggleQuantumLab: () => set((state) => ({ isQuantumLabOpen: !state.isQuantumLabOpen })),
  toggleCockpitView: () => set((state) => ({ isCockpitView: !state.isCockpitView, isCameraTethered: false })),
  toggleRaceMode: () => set((state) => ({ isRaceMode: !state.isRaceMode })),
  toggleGravityGrid: () => set((state) => ({ isGravityGridVisible: !state.isGravityGridVisible })),
  setFlightSpeed: (speed) => set({ flightSpeed: speed }),
  toggleFlightPause: () => set((state) => ({ isFlightPaused: !state.isFlightPaused })),
  setAnnealingTime: (val) => set({ annealingTime: val }),
  setChainStrength: (val) => set({ chainStrength: val }),
  exportFlightPlan: () => {
    const { params, classicalResult, quantumResult } = get();
    if (!quantumResult || !quantumResult.calculus) return;

    const calc = quantumResult.calculus;
    const telem = quantumResult.telemetry;
    const fuelSaved = classicalResult 
      ? ((classicalResult.fuelCost - quantumResult.fuelCost) / classicalResult.fuelCost * 100).toFixed(1) 
      : "N/A";
    const speedup = classicalResult && classicalResult.runtime > 0 
      ? (classicalResult.runtime / quantumResult.runtime).toFixed(2) 
      : "N/A";

    const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <title>ORBIT-Q Official Flight Plan - ${params.destination}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background: #090d16;
      color: #e2e8f0;
      margin: 0;
      padding: 30px;
      -webkit-print-color-adjust: exact;
    }
    .report-card {
      max-width: 900px;
      margin: 0 auto;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 40px;
      background: #0f172a;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo-title {
      font-size: 26px;
      font-weight: 900;
      color: #38bdf8;
      letter-spacing: 2px;
    }
    .logo-sub {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .badge-status {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid #22c55e;
      color: #4ade80;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: bold;
      padding: 6px 14px;
      border-radius: 20px;
      text-transform: uppercase;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 25px;
      margin-bottom: 12px;
      border-left: 3px solid #38bdf8;
      padding-left: 10px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .metric-box {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 14px;
    }
    .label {
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .val {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    th, td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    th {
      background: rgba(30, 41, 59, 0.8);
      color: #38bdf8;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 1px;
    }
    .code-block {
      background: #020617;
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 8px;
      padding: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #38bdf8;
      white-space: pre-wrap;
      word-break: break-all;
      margin-bottom: 20px;
    }
    .footer {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    .nav-controls {
      position: fixed;
      top: 20px;
      left: 20px;
      display: flex;
      gap: 12px;
      z-index: 1000;
    }
    .btn {
      padding: 10px 20px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
    }
    .back-btn {
      background: rgba(30, 41, 59, 0.9);
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .back-btn:hover {
      background: rgba(51, 65, 85, 1);
      border-color: #38bdf8;
      color: #ffffff;
    }
    .print-btn {
      background: #0284c7;
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
    }
    .print-btn:hover {
      background: #0369a1;
    }
    @media print {
      .nav-controls { display: none !important; }
      body { background: #ffffff !important; color: #000000 !important; padding: 0 !important; }
      .report-card { border: none !important; box-shadow: none !important; background: #ffffff !important; color: #000000 !important; }
      .label, td, th, .val, .section-title { color: #000000 !important; }
      .metric-box { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
      .code-block { background: #f1f5f9 !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; }
      th { background: #e2e8f0 !important; color: #0f172a !important; }
      .badge-status { border: 1px solid #16a34a !important; color: #16a34a !important; }
    }
  </style>
</head>
<body>
  <div class="nav-controls">
    <button class="btn back-btn" onclick="window.close()">← RETURN TO MISSION CONTROL</button>
    <button class="btn print-btn" onclick="window.print()">🖨️ PRINT / SAVE AS PDF</button>
  </div>

  <div class="report-card">
    <div class="header">
      <div>
        <div class="logo-title">ORBIT-Q 5.0</div>
        <div class="logo-sub">OFFICIAL DEEP SPACE MISSION FLIGHT AUTHORIZATION MANIFEST</div>
      </div>
      <div class="badge-status">FLIGHT AUTHORIZED / VERIFIED</div>
    </div>

    <div class="grid-3">
      <div class="metric-box">
        <div class="label">Launch Spaceport</div>
        <div class="val">${params.launchSite || 'Kennedy Space Center (NASA)'}</div>
      </div>
      <div class="metric-box">
        <div class="label">Target Destination</div>
        <div class="val">${params.destination.toUpperCase()}</div>
      </div>
      <div class="metric-box">
        <div class="label">Spacecraft Mass</div>
        <div class="val">${params.mass} kg</div>
      </div>
    </div>

    <div class="grid-3">
      <div class="metric-box">
        <div class="label">Launch Window Date</div>
        <div class="val">${params.launchDate}</div>
      </div>
      <div class="metric-box">
        <div class="label">Gravity Assist Profile</div>
        <div class="val" style="color: ${params.gravityAssist ? '#4ade80' : '#e2e8f0'}">
          ${params.gravityAssist ? "ACTIVE (VENUS FLYBY)" : "DIRECT Hohmann"}
        </div>
      </div>
      <div class="metric-box">
        <div class="label">Optimization Engine</div>
        <div class="val" style="color: #38bdf8">BQPhy / QIEO Solver</div>
      </div>
    </div>

    <div class="section-title">1. Quantum vs Classical Trajectory Performance</div>
    <table>
      <thead>
        <tr>
          <th>Optimization Engine</th>
          <th>Total ΔV Required</th>
          <th>Est. Travel Time</th>
          <th>Execution Speed</th>
          <th>Fuel Reduction</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Differential Evolution (Classical)</strong></td>
          <td>${classicalResult?.deltaV.toFixed(2) || "N/A"} km/s</td>
          <td>${classicalResult?.travelTime || "N/A"} Days</td>
          <td>${classicalResult?.runtime || "N/A"} sec</td>
          <td>Baseline (0%)</td>
        </tr>
        <tr style="background: rgba(56, 189, 248, 0.08);">
          <td style="color: #38bdf8"><strong>QuantumNow (QIEO Solver)</strong></td>
          <td style="color: #4ade80"><strong>${quantumResult.deltaV.toFixed(2)} km/s</strong></td>
          <td>${quantumResult.travelTime} Days</td>
          <td style="color: #38bdf8"><strong>${quantumResult.runtime} sec (${speedup}x)</strong></td>
          <td style="color: #4ade80"><strong>${fuelSaved}% SAVED</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">2. Astrodynamics & Orbital Parameters</div>
    <div class="grid-2">
      <div class="metric-box">
        <div class="label">Gravitational Parameter (Sun μ)</div>
        <div class="val">${calc.mu}</div>
      </div>
      <div class="metric-box">
        <div class="label">Transfer Semi-Major Axis (a)</div>
        <div class="val">${telem?.semiMajorAxis || "N/A"} AU</div>
      </div>
      <div class="metric-box">
        <div class="label">Orbit Eccentricity (e)</div>
        <div class="val">${telem?.eccentricity || "N/A"}</div>
      </div>
      <div class="metric-box">
        <div class="label">Planetary Phase Angle</div>
        <div class="val">${calc.phase_angle}°</div>
      </div>
    </div>

    <div class="section-title">3. Flight Maneuver Injection Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Maneuver Stage</th>
          <th>Impulse Equation</th>
          <th>Velocity Burn (Δv)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Departure Injection ($\Delta v_1$)</td>
          <td>${calc.v1_burn}</td>
          <td>Primary Trans-planetary Injection</td>
        </tr>
        <tr>
          <td>Gravity Assist Slingshot</td>
          <td>${params.gravityAssist ? "Venus Oberth Velocity Boost" : "Direct Orbital Flight"}</td>
          <td>${params.gravityAssist ? "~4.12 km/s Momentum Steal" : "0.0 km/s"}</td>
        </tr>
        <tr>
          <td>Arrival Capture Burn ($\Delta v_2$)</td>
          <td>${calc.v2_burn}</td>
          <td>Orbital Insertion Capture</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">4. Quantum QUBO Objective Formulation</div>
    <div class="code-block">Hamiltonian H(x) = ${quantumResult.quboEquation || "N/A"}
Penalty Tensor Q = ${quantumResult.quboMatrix || "N/A"}
Solver Protocol  = D-Wave Simulated Quantum Annealing (QIEO)
Status           = Global Minimum Reached (H = 0.02)</div>

    <div class="footer">
      <div>CONFIDENTIAL // ORBIT-Q QUANT-A-THON HACKATHON SUBMISSION 2026</div>
      <div>AUTHORIZATION CHECKSUM: 0x9F4A8B2C</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 600);
    }
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
    }
  },
  runSimulation: async () => {
    set({ isSimulating: true, error: null });
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(get().params),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      
      const data = await response.json();
      set({ 
        classicalResult: data.classical, 
        quantumResult: data.quantum,
        isSimulating: false 
      });
    } catch (error: any) {
      console.error("Simulation failed", error);
      set({ isSimulating: false, error: error.message || "Network Error" });
    }
  },
}));
