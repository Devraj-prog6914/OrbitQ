import { useMissionStore } from '../../store/missionStore';
import { Eye, Crosshair, Navigation, AlertTriangle, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CockpitHUD() {
  const { isCockpitView, toggleCockpitView, params, quantumResult } = useMissionStore();

  if (!isCockpitView) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-8 font-mono select-none"
    >
      {/* Top Cockpit Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/40 bg-black/60 backdrop-blur-md p-4 rounded-2xl border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300">
            <Eye className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-cyan-300 tracking-wider flex items-center gap-2">
              SPACECRAFT FIRST-PERSON COCKPIT VIEW
              <span className="text-[10px] bg-red-950 border border-red-500 text-red-400 px-2 py-0.5 rounded font-bold animate-pulse">
                LIVE FPV CAM
              </span>
            </h1>
            <p className="text-xs text-gray-400">Target Vector: {params.destination} | Guidance: Autonomous Quantum QPU</p>
          </div>
        </div>

        <button 
          onClick={toggleCockpitView}
          className="pointer-events-auto bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]"
        >
          EXIT COCKPIT VIEW
        </button>
      </div>

      {/* Center Flight Reticle & Crosshair */}
      <div className="relative flex items-center justify-center h-64">
        {/* Outer Circular Reticle */}
        <div className="w-72 h-72 rounded-full border-2 border-cyan-400/40 flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
          <div className="w-60 h-60 rounded-full border border-cyan-400/20 stroke-dasharray" />
        </div>
        
        {/* Center Crosshair Icon */}
        <Crosshair className="w-16 h-16 text-cyan-400/80 absolute animate-pulse" />
        
        {/* Pitch Horizon Line */}
        <div className="absolute w-96 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        {/* Pitch & Yaw Telemetry Badges */}
        <div className="absolute top-4 text-[10px] text-cyan-300 bg-black/70 border border-cyan-400/40 px-3 py-1 rounded-full">
          PITCH: +1.42° | YAW: 0.00° | ROLL: -0.15°
        </div>
      </div>

      {/* Bottom Cockpit Instrument Tray */}
      <div className="flex items-center justify-between bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/40">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Navigation className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>HEADING: TANGENT VECTOR (FORWARD +Z)</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-400">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>ORBITAL INCLINATION: 0.00° (HELIOCENTRIC ECLIPTIIC)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-amber-300 bg-amber-950/80 border border-amber-500/50 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            GRAVITATIONAL ASSIST MODE: ACTIVE
          </span>
        </div>
      </div>
    </motion.div>
  );
}
