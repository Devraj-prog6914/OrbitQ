import { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, FileText, Cpu } from 'lucide-react';

export default function OptimizationResults() {
  const { classicalResult, quantumResult, isSimulating, toggleMatrix, toggleQuantumLab, exportFlightPlan, error } = useMissionStore();
  const [activeTab, setActiveTab] = useState<'deltaV' | 'time' | 'runtime'>('deltaV');

  if (!classicalResult && !quantumResult && !isSimulating && !error) {
    return null;
  }

  const comparisonData = [
    {
      name: 'Differential Evolution',
      deltaV: classicalResult?.deltaV || 0,
      fuel: classicalResult?.fuelCost || 0,
      time: classicalResult?.travelTime || 0,
      runtime: classicalResult?.runtime || 0,
    },
    {
      name: 'QuantumNow (QIEO)',
      deltaV: quantumResult?.deltaV || 0,
      fuel: quantumResult?.fuelCost || 0,
      time: quantumResult?.travelTime || 0,
      runtime: quantumResult?.runtime || 0,
    },
  ];

  // Calculate savings
  const fuelSaved = classicalResult && quantumResult 
    ? ((classicalResult.fuelCost - quantumResult.fuelCost) / classicalResult.fuelCost * 100).toFixed(1) 
    : 0;

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-panel w-[400px] rounded-2xl p-6 pointer-events-auto flex flex-col gap-6 max-h-full overflow-y-auto"
    >
      <h2 className="text-xl font-display font-bold text-white border-b border-white/10 pb-3">
        Optimization Analysis
      </h2>

      {isSimulating ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-12 h-12 border-4 border-quantum-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-quantum-400 font-medium animate-pulse">Running QUBO Solvers...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-sm font-mono break-all max-w-full">
            <span className="font-bold block mb-2">SYSTEM ERROR:</span>
            {error}
          </div>
        </div>
      ) : (
        <>
          {/* Metrics Highlight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-trajectory-quantum/10 border border-trajectory-quantum/30 rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Fuel Saved</span>
              <span className="text-3xl font-display font-bold text-trajectory-quantum">{fuelSaved}%</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Algorithm Engine</span>
              <span className="text-sm font-display font-bold text-white mt-2">BQPhy SDK / QuantumNow</span>
            </div>
          </div>

          {/* Chart Selector Tabs */}
          <div className="flex bg-space-800/80 rounded-lg p-1 border border-white/5 gap-1">
            <button
              onClick={() => setActiveTab('deltaV')}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${activeTab === 'deltaV' ? 'bg-quantum-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              ΔV Burn
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${activeTab === 'time' ? 'bg-quantum-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              Travel Time
            </button>
            <button
              onClick={() => setActiveTab('runtime')}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${activeTab === 'runtime' ? 'bg-quantum-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              Solve Speed
            </button>
          </div>

          {/* Chart Section */}
          <div className="flex flex-col gap-4">
            {activeTab === 'deltaV' && (
              <div className="h-48">
                <h3 className="text-sm font-medium text-gray-400 mb-2">ΔV Requirement (km/s)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="deltaV" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Differential Evolution' ? '#EF4444' : '#10B981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'time' && (
              <div className="h-48">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Travel Time (Days)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Differential Evolution' ? '#EF4444' : '#10B981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'runtime' && (
              <div className="h-48">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Algorithm Runtime (Seconds)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="runtime" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Differential Evolution' ? '#EF4444' : '#10B981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          {/* Action Buttons */}
          {quantumResult && (
            <div className="flex flex-col gap-2.5 mt-2">
              <button 
                onClick={toggleMatrix}
                className="w-full bg-quantum-600/35 hover:bg-quantum-500/50 border border-quantum-400/50 py-3 rounded-lg text-white font-mono font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-2 pointer-events-auto shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] animate-pulse"
              >
                <Activity className="w-5 h-5 text-quantum-300 animate-spin" style={{ animationDuration: '4s' }} />
                EXPLORE DYNAMICS CALCULUS MATRIX
              </button>

              <button 
                onClick={toggleQuantumLab}
                className="w-full bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 py-2.5 rounded-lg text-cyan-300 font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 pointer-events-auto shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                ⚛️ QUANTUM HARDWARE & ANNEALING LAB
              </button>

              <button 
                onClick={exportFlightPlan}
                className="w-full glass-panel hover:bg-white/10 border border-white/15 py-2.5 rounded-lg text-gray-200 font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 pointer-events-auto"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                EXPORT OFFICIAL FLIGHT REPORT (PDF)
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
