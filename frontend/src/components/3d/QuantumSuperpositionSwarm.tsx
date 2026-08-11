import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMissionStore } from '../../store/missionStore';
import * as THREE from 'three';

export default function QuantumSuperpositionSwarm() {
  const isSimulating = useMissionStore(state => state.isSimulating);
  const quantumResult = useMissionStore(state => state.quantumResult);
  
  const count = 400;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const quantumPoints = useMemo(() => {
    const raw = quantumResult?.path || [];
    return raw.map(p => new THREE.Vector3(p.x, p.y, p.z));
  }, [quantumResult]);

  // Initial random cloud positions
  const initialParticles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 80 + 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.4;
      const speed = Math.random() * 0.5 + 0.2;
      temp.push({
        r, theta, phi, speed,
        currentPos: new THREE.Vector3(
          r * Math.cos(theta) * Math.cos(phi),
          r * Math.sin(phi),
          r * Math.sin(theta) * Math.cos(phi)
        )
      });
    }
    return temp;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    initialParticles.forEach((p, i) => {
      let targetPos = new THREE.Vector3();

      if (isSimulating) {
        // Swarm mode: particles vibrate and orbit in quantum superposition cloud
        const currentTheta = p.theta + t * p.speed * 0.1;
        const currentPhi = p.phi + Math.sin(t * p.speed * 2) * 0.1;
        targetPos.set(
          p.r * Math.cos(currentTheta) * Math.cos(currentPhi),
          p.r * Math.sin(currentPhi) + Math.cos(t * 3 + i) * 2,
          p.r * Math.sin(currentTheta) * Math.cos(currentPhi)
        );
      } else if (quantumPoints.length > 0) {
        // Collapse mode: particles pull into the trajectory line
        const idx = Math.floor((i / count) * (quantumPoints.length - 1));
        const curvePoint = quantumPoints[idx] || quantumPoints[0];
        
        // Add tiny residual quantum uncertainty jitter
        const jitter = new THREE.Vector3(
          Math.sin(t * 5 + i) * 0.3,
          Math.cos(t * 4 + i) * 0.3,
          Math.sin(t * 6 + i) * 0.3
        );
        targetPos.copy(curvePoint).add(jitter);
      } else {
        // Default idle background quantum state
        const currentTheta = p.theta + t * 0.05;
        targetPos.set(
          p.r * Math.cos(currentTheta),
          p.r * 0.1 * Math.sin(t + i),
          p.r * Math.sin(currentTheta)
        );
      }

      // Smooth lerp transition to target position
      p.currentPos.lerp(targetPos, isSimulating ? 0.05 : 0.08);

      dummy.position.copy(p.currentPos);
      const scale = (0.12 + Math.sin(t * 4 + i) * 0.04) * (isSimulating ? 1.5 : 1.0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial 
        color={isSimulating ? [2, 1, 4] : [0.2, 2.5, 3]} 
        transparent 
        opacity={0.85} 
        blending={THREE.AdditiveBlending} 
        toneMapped={false} 
      />
    </instancedMesh>
  );
}
