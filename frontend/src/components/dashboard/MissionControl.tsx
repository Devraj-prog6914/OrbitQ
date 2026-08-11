import { useMissionStore } from '../../store/missionStore';
import { Rocket, Settings, Calendar, Weight, Video, MapPin, Play, Pause, Gauge, Eye, Flag, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MissionControl() {
  const { 
    params, setParams, runSimulation, isSimulating, quantumResult, 
    isCameraTethered, toggleCameraTether, flightSpeed, setFlightSpeed, 
    isFlightPaused, toggleFlightPause, isCockpitView, toggleCockpitView,
    isRaceMode, toggleRaceMode, isGravityGridVisible, toggleGravityGrid
  } = useMissionStore();

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-panel w-96 rounded-2xl p-6 pointer-events-auto flex flex-col gap-6"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Rocket className="w-8 h-8 text-quantum-400" />
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-wide">ORBIT-Q</h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase">Quantum Mission Planner</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Real Earth Launch Spaceport */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" /> Earth Launch Spaceport
          </label>
          <select 
            value={params.launchSite || 'Kennedy Space Center (NASA, USA)'}
            onChange={(e) => setParams({ launchSite: e.target.value })}
            className="bg-space-800/50 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-quantum-500 transition-colors"
          >
            <option value="Kennedy Space Center (NASA, USA)">Kennedy Space Center (NASA, USA - 28.5°N)</option>
            <option value="Satish Dhawan Space Centre (ISRO, India)">Satish Dhawan Space Centre (ISRO, India - 13.7°N)</option>
            <option value="Guiana Space Centre (ESA, French Guiana)">Guiana Space Centre (ESA, Fr. Guiana - 5.2°N)</option>
            <option value="Baikonur Cosmodrome (Roscosmos, Kazakhstan)">Baikonur Cosmodrome (Roscosmos - 45.9°N)</option>
            <option value="Vandenberg Space Force Base (USSF, USA)">Vandenberg Space Force Base (USA - 34.7°N)</option>
            <option value="Tanegashima Space Center (JAXA, Japan)">Tanegashima Space Center (JAXA, Japan - 30.4°N)</option>
            <option value="Wenchang Space Launch Site (CNSA, China)">Wenchang Space Launch Site (CNSA - 19.6°N)</option>
          </select>
        </div>

        {/* Destination Target */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Settings className="w-4 h-4 text-quantum-400" /> Destination
          </label>
          <select 
            value={params.destination}
            onChange={(e) => setParams({ destination: e.target.value })}
            className="bg-space-800/50 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-quantum-500 transition-colors"
          >
            <option value="Mercury">Mercury (Inner Terrestrial)</option>
            <option value="Venus">Venus (Inner Terrestrial)</option>
            <option value="Mars">Mars (Red Planet)</option>
            <option value="Jupiter">Jupiter (Gas Giant)</option>
            <option value="Saturn">Saturn (Gas Giant)</option>
            <option value="Uranus">Uranus (Ice Giant)</option>
            <option value="Neptune">Neptune (Ice Giant)</option>
            <option value="Pluto">Pluto (Dwarf Planet)</option>
          </select>
        </div>

        {/* Gravity Assist Toggle */}
        <div className="flex items-center justify-between p-3 bg-space-800/40 border border-white/10 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Gravity Assist
            </span>
            <span className="text-[10px] text-gray-400">Route via Venus flyby</span>
          </div>

          <button
            type="button"
            onClick={() => setParams({ gravityAssist: !params.gravityAssist })}
            className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
              params.gravityAssist ? 'bg-emerald-500' : 'bg-gray-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              params.gravityAssist ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Spacecraft Mass */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Weight className="w-4 h-4 text-quantum-400" /> Spacecraft Mass (kg)
          </label>
          <input 
            type="number" 
            value={params.mass}
            onChange={(e) => setParams({ mass: Number(e.target.value) })}
            className="bg-space-800/50 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-quantum-500 transition-colors"
          />
        </div>

        {/* Launch Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-quantum-400" /> Launch Date
          </label>
          <input 
            type="date" 
            value={params.launchDate}
            onChange={(e) => setParams({ launchDate: e.target.value })}
            className="bg-space-800/50 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-quantum-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="bg-quantum-600 hover:bg-quantum-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(2,132,199,0.3)] hover:shadow-[0_0_30px_rgba(2,132,199,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
        >
          {isSimulating ? 'Computing Trajectory...' : 'OPTIMIZE TRAJECTORY'}
        </button>

        {/* Spacetime Gravity Grid Toggle */}
        <button
          onClick={toggleGravityGrid}
          className={`w-full py-2 px-3 rounded-lg border font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
            isGravityGridVisible 
              ? 'bg-blue-500/20 border-blue-400/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
              : 'bg-space-800/50 hover:bg-white/10 border-white/10 text-gray-400'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" />
          {isGravityGridVisible ? '🌌 SPACETIME GRAVITY WELL GRID (ON)' : '🌌 SPACETIME GRAVITY WELL GRID (OFF)'}
        </button>

        {quantumResult && (
          <>
            {/* First-Person Cockpit View Toggle */}
            <button
              onClick={toggleCockpitView}
              className={`w-full py-2.5 px-3 rounded-lg border font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                isCockpitView 
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse' 
                  : 'bg-space-800/50 hover:bg-white/10 border-white/10 text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              {isCockpitView ? '👁️ FIRST-PERSON COCKPIT VIEW (ACTIVE)' : '👁️ FIRST-PERSON COCKPIT VIEW'}
            </button>

            {/* Quantum vs Classical Race Mode Toggle */}
            <button
              onClick={toggleRaceMode}
              className={`w-full py-2.5 px-3 rounded-lg border font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                isRaceMode 
                  ? 'bg-red-500/20 border-red-400/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' 
                  : 'bg-space-800/50 hover:bg-white/10 border-white/10 text-gray-300'
              }`}
            >
              <Flag className="w-4 h-4 text-red-400" />
              {isRaceMode ? '🏁 RACE MODE: QUANTUM VS CLASSICAL (ACTIVE)' : '🏁 RACE MODE: QUANTUM VS CLASSICAL'}
            </button>

            <button
              onClick={toggleCameraTether}
              className={`w-full py-2.5 px-3 rounded-lg border font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                isCameraTethered 
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                  : 'bg-space-800/50 hover:bg-white/10 border-white/10 text-gray-300'
              }`}
            >
              <Video className="w-4 h-4 text-cyan-400" />
              {isCameraTethered ? '🎥 TETHERED TO PROBE (ACTIVE)' : '🎥 TETHER CAMERA TO PROBE'}
            </button>

            {/* Interactive Flight Speed Control Deck */}
            <div className="flex flex-col gap-2 bg-space-800/60 p-3 rounded-xl border border-white/10 mt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Flight Speed: <span className="text-cyan-300 font-mono">{flightSpeed.toFixed(2)}x</span>
                </label>
                <button
                  onClick={toggleFlightPause}
                  className="bg-space-700 hover:bg-space-600 px-2.5 py-1 rounded text-xs font-bold text-white flex items-center gap-1 border border-white/10 transition-colors"
                >
                  {isFlightPaused ? <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  {isFlightPaused ? 'RESUME' : 'PAUSE'}
                </button>
              </div>

              <input 
                type="range"
                min="0.05"
                max="3.0"
                step="0.05"
                value={flightSpeed}
                onChange={(e) => setFlightSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
              />

              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-0.5">
                <button onClick={() => setFlightSpeed(0.2)} className={`px-2 py-0.5 rounded border transition-colors ${flightSpeed === 0.2 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' : 'border-white/5 hover:bg-white/5'}`}>0.2x SLOW-MO</button>
                <button onClick={() => setFlightSpeed(1.0)} className={`px-2 py-0.5 rounded border transition-colors ${flightSpeed === 1.0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' : 'border-white/5 hover:bg-white/5'}`}>1.0x NORMAL</button>
                <button onClick={() => setFlightSpeed(2.5)} className={`px-2 py-0.5 rounded border transition-colors ${flightSpeed === 2.5 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' : 'border-white/5 hover:bg-white/5'}`}>2.5x FAST</button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
