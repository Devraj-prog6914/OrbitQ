import { useMissionStore } from '../../store/missionStore';
import { Globe, MapPin, Orbit } from 'lucide-react';
import { motion } from 'framer-motion';

const PLANET_DB: Record<string, { desc: string, type: string, gravity: string, temp: string, distFromSun: string, distFromEarth: string }> = {
  "Mercury": { desc: "Smallest and innermost planet.", type: "Terrestrial", gravity: "3.7 m/s²", temp: "430°C", distFromSun: "57.9M km", distFromEarth: "91.7M km" },
  "Venus": { desc: "Thick, toxic atmosphere.", type: "Terrestrial", gravity: "8.87 m/s²", temp: "471°C", distFromSun: "108.2M km", distFromEarth: "41.4M km" },
  "Earth": { desc: "Our home planet.", type: "Terrestrial", gravity: "9.8 m/s²", temp: "15°C", distFromSun: "149.6M km", distFromEarth: "0 km" },
  "Mars": { desc: "The Red Planet.", type: "Terrestrial", gravity: "3.72 m/s²", temp: "-65°C", distFromSun: "227.9M km", distFromEarth: "78.3M km" },
  "Jupiter": { desc: "Largest gas giant.", type: "Gas Giant", gravity: "24.79 m/s²", temp: "-110°C", distFromSun: "778.5M km", distFromEarth: "628.7M km" },
  "Saturn": { desc: "Known for its rings.", type: "Gas Giant", gravity: "10.44 m/s²", temp: "-140°C", distFromSun: "1.43B km", distFromEarth: "1.28B km" },
  "Uranus": { desc: "An ice giant rotating on its side.", type: "Ice Giant", gravity: "8.69 m/s²", temp: "-195°C", distFromSun: "2.87B km", distFromEarth: "2.72B km" },
  "Neptune": { desc: "Dark, cold, and whipped by supersonic winds.", type: "Ice Giant", gravity: "11.15 m/s²", temp: "-200°C", distFromSun: "4.50B km", distFromEarth: "4.35B km" },
  "Pluto": { desc: "A complex dwarf planet in the Kuiper Belt.", type: "Dwarf Planet", gravity: "0.62 m/s²", temp: "-225°C", distFromSun: "5.90B km", distFromEarth: "5.75B km" },
};

export default function PlanetInfo() {
  const { params } = useMissionStore();
  const planet = PLANET_DB[params.destination];

  if (!planet) return null;

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-panel rounded-2xl p-6 pointer-events-auto flex flex-col gap-4"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <Globe className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-display font-bold text-white">Target Locator</h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white text-xl">{params.destination}</span>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
            {planet.type}
          </span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          {planet.desc}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-space-800/50 p-3 rounded-lg border border-white/5">
            <span className="flex items-center gap-2 text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
              <MapPin className="w-3 h-3" /> From Earth
            </span>
            <span className="text-sm font-mono text-white">{planet.distFromEarth}</span>
          </div>
          <div className="bg-space-800/50 p-3 rounded-lg border border-white/5">
            <span className="flex items-center gap-2 text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
              <Orbit className="w-3 h-3" /> From Sun
            </span>
            <span className="text-sm font-mono text-white">{planet.distFromSun}</span>
          </div>
          <div className="bg-space-800/50 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">
              Gravity
            </span>
            <span className="text-sm font-mono text-white">{planet.gravity}</span>
          </div>
          <div className="bg-space-800/50 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">
              Avg Temp
            </span>
            <span className="text-sm font-mono text-white">{planet.temp}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
