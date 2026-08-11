import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, X } from 'lucide-react';

export default function HardwareTab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-6 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:border-quantum-500 transition-all pointer-events-auto"
      >
        <Cpu className="w-4 h-4 text-quantum-400" />
        Hardware Integration Architecture
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
          >
            <div className="glass-panel p-8 rounded-2xl max-w-2xl w-full relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                <Cpu className="text-quantum-400 w-8 h-8" />
                Proof of Concept: Hardware Roadmap
              </h2>
              
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  <strong>ORBIT-Q</strong> is currently utilizing a <em>Simulated Annealing</em> algorithm running locally to solve the QUBO formulation. However, the system architecture is designed specifically for real-world hardware integration.
                </p>

                <div className="bg-space-800/50 p-4 rounded-xl border border-white/5">
                  <h3 className="text-quantum-400 font-bold mb-2">1. QPU Integration (D-Wave Advantage)</h3>
                  <p className="text-sm">
                    Our `QuantumOptimizer` class is abstracted. In production, we swap the local `neal` sampler with D-Wave's `DWaveSampler` via the Leap Cloud API, enabling real Quantum Processing Units to solve the generated Penalty Matrix.
                  </p>
                </div>

                <div className="bg-space-800/50 p-4 rounded-xl border border-white/5">
                  <h3 className="text-quantum-400 font-bold mb-2">2. Live Sensor Telemetry</h3>
                  <p className="text-sm">
                    The frontend interface and Zustand state management can easily bind to WebSocket streams from Arduino/Raspberry Pi prototype sensors (e.g., dynamic mass calculation, accelerometer data) instead of manual form inputs.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
