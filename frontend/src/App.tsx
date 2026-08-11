import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import SolarSystem from './components/3d/SolarSystem';
import MissionControl from './components/dashboard/MissionControl';
import OptimizationResults from './components/dashboard/OptimizationResults';
import TelemetryConsole from './components/dashboard/TelemetryConsole';
import PlanetInfo from './components/dashboard/PlanetInfo';
import CalculationsMatrix from './components/dashboard/CalculationsMatrix';
import QuantumLabModal from './components/dashboard/QuantumLabModal';
import CockpitHUD from './components/dashboard/CockpitHUD';

function App() {
  return (
    <div className="w-screen h-screen relative bg-space-900 overflow-hidden font-sans">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 20, 40], fov: 50 }}>
          <color attach="background" args={['#010204']} />
          <ambientLight intensity={0.05} />
          <pointLight position={[0, 0, 0]} intensity={3} color="#FFDCA8" />
          
          {/* Deep Space Dense Starfield */}
          <Stars radius={400} depth={80} count={12000} factor={8} saturation={0.5} fade speed={0.4} />
          {/* Foreground Twinkling Stars */}
          <Stars radius={150} depth={30} count={3000} factor={4} saturation={1} fade speed={1.2} />
          
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            maxDistance={200}
            minDistance={5}
          />
          
          <Suspense fallback={null}>
            <SolarSystem />
          </Suspense>
          
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6">
        {/* Left Column: Input controls & telemetry tray */}
        <div className="absolute left-6 top-6 bottom-6 w-96 pointer-events-auto flex flex-col gap-6 overflow-y-auto no-scrollbar">
          <MissionControl />
          <TelemetryConsole />
        </div>

        {/* Right Column: Dynamic target database & optimization performance */}
        <div className="absolute right-6 top-6 bottom-6 w-96 pointer-events-auto flex flex-col gap-6 overflow-y-auto no-scrollbar">
          <PlanetInfo />
          <OptimizationResults />
        </div>
      </div>

      {/* Modal Decks & FPV Overlay */}
      <CalculationsMatrix />
      <QuantumLabModal />
      <CockpitHUD />
    </div>
  );
}

export default App;
