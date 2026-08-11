import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMissionStore } from '../../store/missionStore';
import * as THREE from 'three';

const MASSES = [
  { pos: [0, 0, 0], mass: 120 }, // Sun
  { pos: [10, 0, 0], mass: 18 }, // Earth
  { pos: [7.23, 0, 0], mass: 14 }, // Venus
  { pos: [15.24, 0, 0], mass: 12 }, // Mars
  { pos: [52.0, 0, 0], mass: 45 }, // Jupiter
  { pos: [95.8, 0, 0], mass: 35 }, // Saturn
];

export default function SpacetimeGravityGrid() {
  const isGravityGridVisible = useMissionStore(state => state.isGravityGridVisible);
  const meshRef = useRef<THREE.Mesh>(null);

  const gridResolution = 80;
  const gridSize = 240;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(gridSize, gridSize, gridResolution, gridResolution);
    geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane
    return geo;
  }, [gridSize, gridResolution]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !isGravityGridVisible) return;
    const posAttr = geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < posAttr.count; i++) {
      const x = array[i * 3];
      const z = array[i * 3 + 2];

      let dip = 0;
      for (const m of MASSES) {
        const dx = x - m.pos[0];
        const dz = z - m.pos[2];
        const distSq = dx * dx + dz * dz;
        dip -= (m.mass * 8) / (Math.sqrt(distSq) + 4.5);
      }

      array[i * 3 + 1] = Math.max(dip, -15); // Sag downward on Y axis
    }

    posAttr.needsUpdate = true;
  });

  if (!isGravityGridVisible) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -0.5, 0]}>
      <meshBasicMaterial 
        color="#1e3a8a" 
        wireframe={true} 
        transparent={true} 
        opacity={0.18} 
      />
    </mesh>
  );
}
