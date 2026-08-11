import { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { Cpu, X, Zap, Sliders, Activity, Layers, Network, Info, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuantumLabModal() {
  const { 
    isQuantumLabOpen, toggleQuantumLab, quantumResult, params,
    annealingTime, setAnnealingTime, chainStrength, setChainStrength 
  } = useMissionStore();

  const [hoveredQubit, setHoveredQubit] = useState<{ r: number; c: number; val: number } | null>(null);

  if (!isQuantumLabOpen) return null;

  // 6x6 Qubit Coupling Matrix mock
  const qubitMatrix = [
    [1.49, 0.19, -0.42, 0.00, 0.81, 0.12],
    [0.19, 0.72, 0.35, -0.61, 0.00, 0.44],
    [-0.42, 0.35, -0.49, 0.88, 0.15, 0.00],
    [0.00, -0.61, 0.88, 1.12, -0.33, 0.57],
    [0.81, 0.00, 0.15, -0.33, 0.94, -0.21],
    [0.12, 0.44, 0.00, 0.57, -0.21, 0.68]
  ];

  // Dynamic Critical Point shift based on Annealing Duration slider
  const criticalX = 110 + (annealingTime / 200) * 50;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-panel w-full max-w-5xl rounded-2xl p-6 border border-cyan-400/50 shadow-[0_0_60px_rgba(34,211,238,0.3)] bg-space-900/95 flex flex-col gap-5 max-h-[92vh] overflow-y-auto text-white no-scrollbar"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <Cpu className="w-6 h-6 animate-pulse text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-white tracking-wider">
                    QUANTUM HARDWARE & ANNEALING LAB
                  </h2>
                  <span className="text-[10px] bg-cyan-950 border border-cyan-400/50 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold tracking-widest shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    D-WAVE PEGASUS P16
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Ising Hamiltonian H(x), Qubit Coupling J_ij, and Transverse Field Dynamics
                </p>
              </div>
            </div>

            <button 
              onClick={toggleQuantumLab}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid Layout: 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Panel 1: Quantum Annealing Schedule (Gamma vs B) */}
            <div className="bg-space-800/80 p-4.5 rounded-xl border border-cyan-500/20 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Activity className="w-4 h-4 text-cyan-400" /> Quantum Annealing Energy Schedule
                </h3>
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-400/30">
                  T_anneal = {annealingTime} μs
                </span>
              </div>

              {/* Annealing Schedule SVG Curve */}
              <div className="relative h-40 w-full bg-black/60 rounded-xl p-3 border border-white/10 flex flex-col justify-between overflow-hidden">
                <svg className="w-full h-28 overflow-hidden" viewBox="0 0 300 90">
                  {/* Background Grid Lines */}
                  <line x1="0" y1="22" x2="300" y2="22" stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.5" />
                  <line x1="0" y1="45" x2="300" y2="45" stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.5" />
                  <line x1="0" y1="67" x2="300" y2="67" stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.5" />
                  
                  {/* Dynamic Critical Point Vertical Line */}
                  <line x1={criticalX} y1="0" x2={criticalX} y2="90" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1.5" />
                  
                  {/* Transverse Field Gamma(s) - Cyan Drop Curve */}
                  <path 
                    d="M 10 8 Q 120 12 290 82" 
                    fill="none" 
                    stroke="#38bdf8" 
                    strokeWidth="3.5"
                  />

                  {/* Problem Hamiltonian B(s) - Emerald Rise Curve */}
                  <path 
                    d="M 10 82 Q 160 78 290 8" 
                    fill="none" 
                    stroke="#4ade80" 
                    strokeWidth="3.5"
                  />

                  {/* Quantum Tunneling Point Glowing Circle */}
                  <circle cx={criticalX} cy="45" r="6" fill="#f59e0b" className="animate-ping" />
                  <circle cx={criticalX} cy="45" r="4.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
                </svg>

                {/* Clear Legend Below SVG */}
                <div className="flex items-center justify-between text-[9px] font-mono text-gray-300 bg-black/40 px-2 py-1 rounded border border-white/5">
                  <span className="text-cyan-400 font-bold">■ Transverse Field Γ(s)</span>
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    Critical Point s* ≈ 0.45
                  </span>
                  <span className="text-emerald-400 font-bold">■ Problem Hamiltonian B(s)</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed font-mono bg-black/30 p-2 rounded-lg border border-white/5">
                At normalized anne time <span className="text-amber-300 font-bold">s* ≈ 0.45</span>, quantum superposition collapse initiates. Transverse field energy drops while QUBO penalty forces quantum tunneling into the ground state trajectory.
              </p>
            </div>

            {/* Panel 2: Qubit Coupling Matrix (Q_ij Heatmap) */}
            <div className="bg-space-800/80 p-4.5 rounded-xl border border-cyan-500/20 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Network className="w-4 h-4 text-cyan-400" /> Physical Qubit Coupling Matrix (Q_ij)
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-400/30 font-bold">
                  2,048 Active Qubits
                </span>
              </div>

              {/* 6x6 Heatmap Grid */}
              <div className="grid grid-cols-6 gap-1.5 p-2 bg-black/60 rounded-xl border border-white/10">
                {qubitMatrix.map((row, r) => 
                  row.map((val, c) => {
                    const isDiag = r === c;
                    const opacity = Math.abs(val) / 1.5;
                    return (
                      <div 
                        key={`${r}-${c}`}
                        onMouseEnter={() => setHoveredQubit({ r, c, val })}
                        onMouseLeave={() => setHoveredQubit(null)}
                        className="h-7 rounded-lg flex items-center justify-center text-[9px] font-mono font-bold transition-all hover:scale-110 hover:z-10 cursor-pointer shadow-sm"
                        style={{
                          background: isDiag 
                            ? `rgba(56, 189, 248, ${0.35 + opacity * 0.45})` 
                            : val > 0 
                            ? `rgba(74, 222, 128, ${0.25 + opacity * 0.6})` 
                            : `rgba(244, 63, 94, ${0.25 + opacity * 0.6})`,
                          border: isDiag 
                            ? '1.5px solid #38bdf8' 
                            : val > 0 
                            ? '1px solid rgba(74, 222, 128, 0.4)' 
                            : '1px solid rgba(244, 63, 94, 0.4)',
                          color: '#ffffff'
                        }}
                      >
                        {val}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Live Qubit Hover Telemetry Bar */}
              <div className="text-[10px] font-mono p-2 bg-black/50 rounded-lg border border-cyan-500/30 flex items-center justify-between text-gray-300">
                {hoveredQubit ? (
                  <span className="text-cyan-300 font-bold">
                    🔍 Qubit [{hoveredQubit.r}, {hoveredQubit.c}]: Energy = {hoveredQubit.val} ({hoveredQubit.r === hoveredQubit.c ? 'Bias h_i' : hoveredQubit.val > 0 ? 'Ferromagnetic J_ij' : 'Anti-Ferro J_ij'})
                  </span>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Biases (h_i)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Ferromagnetic (J_ij &gt; 0)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Anti-Ferro (J_ij &lt; 0)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Panel 3: QAOA Quantum Gate Circuit Diagram */}
            <div className="bg-space-800/80 p-4.5 rounded-xl border border-cyan-500/20 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Layers className="w-4 h-4 text-cyan-400" /> QAOA Gate Circuit (p=2 Ansatz)
                </h3>
                <span className="text-[10px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-400/30 font-bold">
                  IBM Qiskit / PennyLane
                </span>
              </div>

              {/* QAOA Circuit Lines */}
              <div className="bg-black/60 p-3 rounded-xl border border-white/10 font-mono text-[10px] flex flex-col gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-7 font-bold">|q₀⟩</span>
                  <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded-md font-bold shadow-[0_0_8px_rgba(34,211,238,0.2)]">H</span>
                  <span className="h-0.5 bg-cyan-500/40 w-5" />
                  <span className="px-2 py-1 bg-purple-500/20 border border-purple-400/50 text-purple-300 rounded-md font-bold shadow-[0_0_8px_rgba(168,85,247,0.2)]">U(γ)</span>
                  <span className="h-0.5 bg-purple-500/40 w-5" />
                  <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 rounded-md font-bold shadow-[0_0_8px_rgba(52,211,153,0.2)]">Rx(β)</span>
                  <span className="h-0.5 bg-emerald-500/40 w-5" />
                  <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/50 text-amber-300 rounded-md text-[9px] font-bold">measure</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-7 font-bold">|q₁⟩</span>
                  <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded-md font-bold shadow-[0_0_8px_rgba(34,211,238,0.2)]">H</span>
                  <span className="h-0.5 bg-cyan-500/40 w-5" />
                  <span className="px-2 py-1 bg-purple-500/20 border border-purple-400/50 text-purple-300 rounded-md font-bold shadow-[0_0_8px_rgba(168,85,247,0.2)]">U(γ)</span>
                  <span className="h-0.5 bg-purple-500/40 w-5" />
                  <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 rounded-md font-bold shadow-[0_0_8px_rgba(52,211,153,0.2)]">Rx(β)</span>
                  <span className="h-0.5 bg-emerald-500/40 w-5" />
                  <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/50 text-amber-300 rounded-md text-[9px] font-bold">measure</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-7 font-bold">|q₂⟩</span>
                  <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded-md font-bold shadow-[0_0_8px_rgba(34,211,238,0.2)]">H</span>
                  <span className="h-0.5 bg-cyan-500/40 w-5" />
                  <span className="px-2 py-1 bg-purple-500/20 border border-purple-400/50 text-purple-300 rounded-md font-bold shadow-[0_0_8px_rgba(168,85,247,0.2)]">U(γ)</span>
                  <span className="h-0.5 bg-purple-500/40 w-5" />
                  <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 rounded-md font-bold shadow-[0_0_8px_rgba(52,211,153,0.2)]">Rx(β)</span>
                  <span className="h-0.5 bg-emerald-500/40 w-5" />
                  <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/50 text-amber-300 rounded-md text-[9px] font-bold">measure</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed font-mono bg-black/30 p-2 rounded-lg border border-white/5">
                Variational parameters (γ = 0.421, β = 0.895) are optimized using COBYLA gradient descent to approximate the ground state |ψ(γ,β)⟩.
              </p>
            </div>

            {/* Panel 4: Hardware Hyperparameter Controls */}
            <div className="bg-space-800/80 p-4.5 rounded-xl border border-cyan-500/20 flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Sliders className="w-4 h-4 text-cyan-400" /> Quantum Hardware Parameters
                </h3>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-950 px-2 py-0.5 rounded border border-amber-400/30 font-bold">
                  Live Hardware Tuning
                </span>
              </div>

              {/* Annealing Time Slider */}
              <div className="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-gray-300">Annealing Duration (T_anneal)</span>
                  <span className="text-cyan-300 font-bold">{annealingTime} μs</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={annealingTime}
                  onChange={(e) => setAnnealingTime(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Qubit Chain Strength Slider */}
              <div className="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-gray-300">Qubit Chain Strength (J_chain)</span>
                  <span className="text-emerald-400 font-bold">{chainStrength.toFixed(1)}</span>
                </div>
                <input 
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={chainStrength}
                  onChange={(e) => setChainStrength(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Qubit Hardware Status Banner */}
              <div className="p-3 bg-cyan-950/60 border border-cyan-400/40 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <Zap className="w-5 h-5 text-cyan-400 animate-bounce" />
                <div className="text-[10px] font-mono">
                  <span className="text-cyan-300 font-bold block">D-Wave Advantage Online</span>
                  <span className="text-gray-400">Operating Temp: 15 mK | Single-Qubit Readout Fidelity: 99.82%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Close Action */}
          <div className="flex justify-between items-center border-t border-white/10 pt-3.5">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>QUANTUM HARDWARE TOPOLOGY VERIFIED BY BQPhy SDK</span>
            </div>

            <button
              onClick={toggleQuantumLab}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(2,132,199,0.4)] hover:shadow-[0_0_30px_rgba(2,132,199,0.7)]"
            >
              CLOSE QUANTUM LAB
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
