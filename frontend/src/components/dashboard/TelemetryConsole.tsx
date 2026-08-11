import { useMissionStore } from '../../store/missionStore';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

export default function TelemetryConsole() {
  const quantumResult = useMissionStore(state => state.quantumResult);

  if (!quantumResult) return null;

  const { telemetry, quboEquation, quboMatrix } = quantumResult;

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel rounded-xl p-4 font-mono text-xs overflow-hidden flex flex-col gap-3 border border-quantum-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center gap-2 text-quantum-400 font-bold mb-1 border-b border-white/10 pb-2">
        <Terminal className="w-4 h-4" /> LIVE TELEMETRY & PHYSICS STREAM
      </div>

      <div className="flex flex-col gap-3">
        {/* Keplerian Elements */}
        <div className="flex flex-col gap-1.5 text-gray-300">
          <span className="text-quantum-300 font-semibold mb-0.5 text-[10px] uppercase tracking-wider">Keplerian Elements (Calculated)</span>
          <div className="flex justify-between"><span>Semi-Major Axis (a):</span> <span className="text-white font-bold">{telemetry?.semiMajorAxis} AU</span></div>
          <div className="flex justify-between"><span>Eccentricity (e):</span> <span className="text-white font-bold">{telemetry?.eccentricity}</span></div>
          <div className="flex justify-between"><span>Inclination (i):</span> <span className="text-white font-bold">{telemetry?.inclination}°</span></div>
          <div className="flex justify-between"><span>True Anomaly (v):</span> <span className="text-white font-bold">{telemetry?.trueAnomaly}°</span></div>
        </div>

        <div className="border-t border-white/10 my-1" />

        {/* QUBO Equation */}
        <div className="flex flex-col gap-1.5 text-gray-300">
          <span className="text-trajectory-quantum font-semibold mb-0.5 text-[10px] uppercase tracking-wider">Dynamic QUBO Formulation</span>
          <div className="truncate" title={quboEquation}>
            <span className="text-gray-500">Hamiltonian: </span> 
            <span className="text-white font-bold">{quboEquation}</span>
          </div>
          <div>
            <span className="text-gray-500">Penalty Matrix: </span>
            <span className="text-white font-bold break-all">{quboMatrix}</span>
          </div>
          <div className="mt-1 text-trajectory-quantum animate-pulse opacity-70">
            &gt; Solved via Simulated Annealing
          </div>
        </div>
      </div>
    </motion.div>
  );
}
