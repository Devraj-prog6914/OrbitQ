import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1. Subtle Floating Space Dust Particles
export function SpaceDust({ count = 800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorChoices = [
      new THREE.Color("#00ffff"),
      new THREE.Color("#a78bfa"),
      new THREE.Color("#38bdf8"),
      new THREE.Color("#ffffff")
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 400;

      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime() * 0.005;
    pointsRef.current.rotation.y = t * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.3} vertexColors transparent opacity={0.35} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// 2. Flying Comet with Small Trail
export function FlyingComet() {
  const cometGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!cometGroupRef.current) return;
    const t = clock.getElapsedTime() * 0.04;
    const a = 120;
    const b = 50;
    const x = a * Math.cos(t) - 20;
    const z = b * Math.sin(t) + 10;
    const y = Math.sin(t * 2) * 8;

    cometGroupRef.current.position.set(x, y, z);
    cometGroupRef.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group ref={cometGroupRef}>
      {/* Comet Nucleus */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={[4, 3, 1.5]} toneMapped={false} />
      </mesh>
      {/* Cyan Ion Glow */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Comet Dust Tail */}
      <mesh position={[0, 0, -3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.8, 7, 16, 1, true]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// 3. Orbiting Earth Satellite (ISS & Probe)
export function EarthSatellite() {
  const satGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!satGroupRef.current) return;
    const t = clock.getElapsedTime() * 0.1;
    // Orbit around Earth (located at x = 10, y = 0, z = 0)
    const r = 2.0;
    const x = 10.0 + r * Math.cos(t);
    const z = r * Math.sin(t);
    const y = Math.sin(t * 1.5) * 0.4;

    satGroupRef.current.position.set(x, y, z);
    satGroupRef.current.rotation.y = t * 0.3;
  });

  return (
    <group ref={satGroupRef}>
      {/* Satellite Main Body */}
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.25]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Solar Panel Array Left */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.45, 0.015, 0.2]} />
        <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Solar Panel Array Right */}
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={[0.45, 0.015, 0.2]} />
        <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Flashing Beacon LED */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#22c55e" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function SpaceEnvironment() {
  return (
    <group>
      <SpaceDust />
      <FlyingComet />
      <EarthSatellite />
    </group>
  );
}
