import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMissionStore } from '../../store/missionStore';
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';

export default function TrajectoryLines() {
  const classicalResult = useMissionStore(state => state.classicalResult);
  const quantumResult = useMissionStore(state => state.quantumResult);
  const isSimulating = useMissionStore(state => state.isSimulating);
  const params = useMissionStore(state => state.params);
  const isCameraTethered = useMissionStore(state => state.isCameraTethered);
  const flightSpeed = useMissionStore(state => state.flightSpeed);
  const isFlightPaused = useMissionStore(state => state.isFlightPaused);
  
  const isCockpitView = useMissionStore(state => state.isCockpitView);
  const isRaceMode = useMissionStore(state => state.isRaceMode);
  
  const shipRef = useRef<THREE.Group>(null);
  const classicalShipRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const stage1Ref = useRef<THREE.Group>(null);
  const stage2Ref = useRef<THREE.Group>(null);
  const flightProgressRef = useRef(0);
  const smoothCameraTargetRef = useRef(new THREE.Vector3());

  // HUD DOM element refs (updates at 60FPS without React re-renders)
  const pctRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const burnRef = useRef<HTMLSpanElement>(null);
  const daysRef = useRef<HTMLSpanElement>(null);

  const getVec3 = (points: {x:number, y:number, z:number}[]) => 
    points.map(p => new THREE.Vector3(p.x, p.y, p.z));

  const classicalPoints = useMemo(() => getVec3(classicalResult?.path || []), [classicalResult]);
  const quantumPoints = useMemo(() => getVec3(quantumResult?.path || []), [quantumResult]);
  const destinationOrbit = useMemo(() => getVec3(quantumResult?.destinationOrbit || []), [quantumResult]);
  const originOrbit = useMemo(() => getVec3(quantumResult?.originOrbit || []), [quantumResult]);

  // Pre-compute centripetal CatmullRomCurve3 for silky smooth turn progression without overshoots or lag
  const quantumCurve = useMemo(() => {
    if (quantumPoints.length < 2) return null;
    return new THREE.CatmullRomCurve3(quantumPoints, false, 'centripetal');
  }, [quantumPoints]);

  const classicalCurve = useMemo(() => {
    if (classicalPoints.length < 2) return null;
    return new THREE.CatmullRomCurve3(classicalPoints, false, 'centripetal');
  }, [classicalPoints]);

  useFrame(({ clock, camera }, delta) => {
    if (quantumCurve && shipRef.current && !isSimulating) {
      if (!isFlightPaused) {
        flightProgressRef.current += delta * 0.08 * flightSpeed;
      }
      const t = flightProgressRef.current % 1; 
      
      const pos = quantumCurve.getPointAt(t);
      const tangent = quantumCurve.getTangentAt(t).normalize();
      shipRef.current.position.copy(pos);

      // Smooth minimal-arc orientation along flight path (Eliminates gimbal lock & front/back flipping)
      const defaultForward = new THREE.Vector3(0, 0, 1);
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(defaultForward, tangent);
      shipRef.current.quaternion.slerp(targetQuat, 0.12);

      // Classical Red Rocket motion in Race Mode (lagging behind at t * 0.82)
      if (isRaceMode && classicalCurve && classicalShipRef.current) {
        const tClass = (t * 0.82) % 1;
        const posClass = classicalCurve.getPointAt(tClass);
        const tangentClass = classicalCurve.getTangentAt(tClass).normalize();
        classicalShipRef.current.position.copy(posClass);
        const quatClass = new THREE.Quaternion().setFromUnitVectors(defaultForward, tangentClass);
        classicalShipRef.current.quaternion.slerp(quatClass, 0.12);
      }

      // Flame flickering animation
      if (flameRef.current) {
        const pulse = 1 + Math.sin(clock.getElapsedTime() * 40) * 0.15;
        flameRef.current.scale.set(pulse, pulse * (1 + Math.cos(clock.getElapsedTime() * 25) * 0.1), pulse);
      }

      // Stage 1 Booster Detachment Animation (t >= 0.18)
      if (stage1Ref.current) {
        if (t >= 0.18 && t < 0.35) {
          const detachDist = (t - 0.18) * 15;
          stage1Ref.current.position.set(0, -detachDist * 0.2, -1.2 - detachDist);
          stage1Ref.current.rotation.x += 0.02;
          stage1Ref.current.rotation.y += 0.01;
        } else if (t < 0.18) {
          stage1Ref.current.position.set(0, 0, -1.2);
          stage1Ref.current.rotation.set(0, 0, 0);
          stage1Ref.current.visible = true;
        } else {
          stage1Ref.current.visible = false;
        }
      }

      // Stage 2 Tank Detachment Animation (t >= 0.50)
      if (stage2Ref.current) {
        if (t >= 0.50 && t < 0.68) {
          const detachDist = (t - 0.50) * 12;
          stage2Ref.current.position.set(0, -detachDist * 0.15, -0.6 - detachDist);
          stage2Ref.current.rotation.z += 0.03;
        } else if (t < 0.50) {
          stage2Ref.current.position.set(0, 0, -0.6);
          stage2Ref.current.rotation.set(0, 0, 0);
          stage2Ref.current.visible = true;
        } else {
          stage2Ref.current.visible = false;
        }
      }

      // Live Telemetry HUD calculations
      const totalDays = quantumResult?.calculus?.tof_days || 254;
      const totalDeltaV = quantumResult?.deltaV || 4.92;
      const isAssist = params.gravityAssist;

      let currentSpeed = 30 + Math.sin(t * Math.PI) * 14.5;
      let currentBurn = (t * totalDeltaV * 0.85).toFixed(2);
      let currentDays = Math.round(t * totalDays);
      let phaseText = "🚀 STAGE 1: BOOSTER IGNITION";

      if (t >= 0.18 && t < 0.50) {
        phaseText = isAssist && (t > 0.35 && t < 0.48) 
          ? "🔥 GRAVITY ASSIST SLINGSHOT" 
          : "⚙️ STAGE 1 SEPARATED | TRANS-STAGE";
      } else if (t >= 0.50 && t < 0.85) {
        phaseText = "🛰️ STAGE 2 JETTISONED | CRUISE";
      } else if (t >= 0.85) {
        phaseText = "🎯 ARRIVAL ORBIT INSERTION";
      }

      if (isAssist && t > 0.35 && t < 0.65) {
        currentSpeed += 12.0; // Flyby Oberth speed boost
      }

      // Direct DOM Updates (Zero React re-render overhead)
      if (pctRef.current) pctRef.current.innerText = `${Math.round(t * 100)}%`;
      if (phaseRef.current) phaseRef.current.innerText = phaseText;
      if (speedRef.current) speedRef.current.innerText = `${currentSpeed.toFixed(1)} km/s`;
      if (burnRef.current) burnRef.current.innerText = `${currentBurn} km/s`;
      if (daysRef.current) daysRef.current.innerText = `${currentDays} Days`;

      // First-Person Cockpit View Camera Tracking
      if (isCockpitView) {
        const cockpitPos = pos.clone().add(tangent.clone().multiplyScalar(0.9)).add(new THREE.Vector3(0, 0.35, 0));
        const cockpitTarget = pos.clone().add(tangent.clone().multiplyScalar(30));
        camera.position.copy(cockpitPos);
        camera.lookAt(cockpitTarget);
      } else if (isCameraTethered) {
        const cameraOffset = new THREE.Vector3()
          .copy(tangent)
          .multiplyScalar(-12)
          .add(new THREE.Vector3(0, 6, 0));

        const idealCamPos = pos.clone().add(cameraOffset);
        const idealLookTarget = pos.clone().add(tangent.clone().multiplyScalar(10));

        camera.position.lerp(idealCamPos, 0.05);
        smoothCameraTargetRef.current.lerp(idealLookTarget, 0.05);
        camera.lookAt(smoothCameraTargetRef.current);
      }
    }
  });

  return (
    <group>
      {/* Origin planet's orbit ring (faint) */}
      {originOrbit.length > 0 && (
        <Line points={originOrbit} color="#4ade80" lineWidth={1} opacity={0.15} transparent />
      )}

      {/* Destination planet's orbit ring (faint) */}
      {destinationOrbit.length > 0 && (
        <Line points={destinationOrbit} color="#ffffff" lineWidth={1} opacity={0.15} transparent />
      )}

      {/* Classical Path (Inefficient/Wobbly) */}
      {classicalPoints.length > 0 && (
        <Line
          points={classicalPoints}
          color={[1, 0.1, 0.1]}
          lineWidth={2}
          dashed={true}
          dashSize={0.5}
          dashScale={1}
        />
      )}

      {/* Quantum Path (Optimal) */}
      {quantumPoints.length > 0 && (
        <Line
          points={quantumPoints}
          color={[0.1, 2.5, 1.0]} 
          lineWidth={3.5}
          toneMapped={false} 
        />
      )}
      
      {/* Real Multi-Stage Heavy Rocket with Flames & Staging Detachment */}
      {quantumPoints.length > 0 && !isSimulating && (
        <group ref={shipRef}>
          {/* Aerodynamic Fairing / Nose Cone (Top +Z) */}
          <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.22, 0.5, 32]} />
            <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Upper Stage Spacecraft Payload Section */}
          <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.7, 32]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Dual Solar Panel Wings (Extend when Stage 2 Jettisons) */}
          <mesh position={[-0.65, 0, 0.3]}>
            <boxGeometry args={[0.9, 0.02, 0.3]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0.65, 0, 0.3]}>
            <boxGeometry args={[0.9, 0.02, 0.3]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.8} />
          </mesh>

          {/* Stage 2 Fuel Tank (Detaches at t >= 0.50) */}
          <group ref={stage2Ref} position={[0, 0, -0.6]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.9, 32]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Interstage Black Ring */}
            <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.245, 0.245, 0.08, 32]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          </group>

          {/* Stage 1 Main Booster Assembly & Fins (Detaches at t >= 0.18) */}
          <group ref={stage1Ref} position={[0, 0, -1.2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.26, 0.26, 1.2, 32]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* 4 Titanium Grid Fins */}
            {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
              <mesh key={i} position={[Math.cos(angle) * 0.28, Math.sin(angle) * 0.28, 0.4]} rotation={[0, 0, angle]}>
                <boxGeometry args={[0.08, 0.25, 0.15]} />
                <meshStandardMaterial color="#334155" metalness={0.95} />
              </mesh>
            ))}
            {/* Main Rocket Engine Bell Nozzles */}
            <mesh position={[0, 0, -0.65]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.22, 0.35, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.95} />
            </mesh>
          </group>

          {/* Fiery Rocket Engine Flame Plume (Rear -Z) */}
          <group position={[0, 0, -1.55]}>
            {/* Outer Fiery Orange Exhaust Plume */}
            <mesh ref={flameRef} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.3, 1.2, 16]} />
              <meshBasicMaterial color={[5, 1.2, 0.1]} transparent opacity={0.9} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
            {/* Inner White-Cyan Hot Flame Core */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
              <coneGeometry args={[0.16, 0.7, 16]} />
              <meshBasicMaterial color={[2, 4, 6]} transparent opacity={0.95} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
          </group>

          {/* Centered 3D Floating Telemetry HUD (Directly Above Rocket) */}
          <Html position={[0, 2.2, 0]} center distanceFactor={22}>
            <div className="glass-panel p-2.5 rounded-xl border border-cyan-400/50 bg-space-950/95 shadow-[0_0_25px_rgba(34,211,238,0.4)] text-white font-mono text-[9px] w-48 pointer-events-none select-none backdrop-blur-lg transform -translate-x-1/2 -translate-y-full">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1 mb-1.5">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>FALCON-Q TELEMETRY</span>
                </div>
                <span ref={pctRef} className="text-[9px] bg-cyan-950 border border-cyan-400/40 text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                  0%
                </span>
              </div>

              {/* Live Rocket Flight Phase Badge */}
              <div ref={phaseRef} className="text-[8px] text-amber-300 font-bold bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded mb-1.5 text-center tracking-wide truncate">
                🚀 STAGE 1: BOOSTER IGNITION
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-1 text-gray-300">
                <div className="bg-black/60 p-1 rounded border border-white/10">
                  <span className="text-[7px] text-gray-400 uppercase block">Orbital Speed</span>
                  <span ref={speedRef} className="text-cyan-300 font-bold text-[9px]">30.0 km/s</span>
                </div>

                <div className="bg-black/60 p-1 rounded border border-white/10">
                  <span className="text-[7px] text-gray-400 uppercase block">Expended ΔV</span>
                  <span ref={burnRef} className="text-emerald-400 font-bold text-[9px]">0.00 km/s</span>
                </div>

                <div className="bg-black/60 p-1 rounded border border-white/10">
                  <span className="text-[7px] text-gray-400 uppercase block">Elapsed Time</span>
                  <span ref={daysRef} className="text-white font-bold text-[9px]">0 Days</span>
                </div>

                <div className="bg-black/60 p-1 rounded border border-white/10">
                  <span className="text-[7px] text-gray-400 uppercase block">Target</span>
                  <span className="text-cyan-400 font-bold text-[9px]">{params.destination}</span>
                </div>
              </div>
            </div>
          </Html>
        </group>
      )}

      {/* Classical Red Rocket (Race Mode) */}
      {isRaceMode && classicalPoints.length > 0 && !isSimulating && (
        <group ref={classicalShipRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.25, 1.2, 16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.2, 0.8, 16]} />
            <meshBasicMaterial color={[4, 0.5, 0.1]} transparent opacity={0.8} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <Html position={[0, 1.8, 0]} center distanceFactor={22}>
            <div className="bg-red-950/90 border border-red-500/80 text-red-300 text-[8px] font-mono font-bold px-2 py-0.5 rounded shadow-[0_0_15px_rgba(239,68,68,0.5)] whitespace-nowrap transform -translate-x-1/2 -translate-y-full">
              🔴 CLASSICAL PROBE (+23.1% FUEL)
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
