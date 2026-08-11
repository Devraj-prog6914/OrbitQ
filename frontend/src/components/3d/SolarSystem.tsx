import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import TrajectoryLines from './TrajectoryLines';
import SpaceEnvironment from './SpaceEnvironment';
import QuantumSuperpositionSwarm from './QuantumSuperpositionSwarm';
import SpacetimeGravityGrid from './SpacetimeGravityGrid';
import { useMissionStore } from '../../store/missionStore';

const PLANET_SCALES: Record<string, number> = {
  "Mercury": 0.35,
  "Venus": 0.85,
  "Earth": 1.0,
  "Mars": 0.55,
  "Jupiter": 2.5,
  "Saturn": 2.1,
  "Uranus": 1.3,
  "Neptune": 1.25,
  "Pluto": 0.25
};

const PLANETS: Record<string, { color: string, distance: number }> = {
  "Mercury": { color: "#A8A8A8", distance: 3.87 },
  "Venus": { color: "#E08F42", distance: 7.23 },
  "Earth": { color: "#2B82C9", distance: 10.0 },
  "Mars": { color: "#E27B58", distance: 15.24 },
  "Jupiter": { color: "#D39C7E", distance: 52.0 },
  "Saturn": { color: "#C5AB6E", distance: 95.8 },
  "Uranus": { color: "#4B70DD", distance: 192.0 },
  "Neptune": { color: "#3B5D9C", distance: 301.0 },
  "Pluto": { color: "#D0D0D0", distance: 395.0 }
};

const PLANET_INITIAL_ANGLES: Record<string, number> = {
  "Mercury": 0,
  "Venus": 0.6,
  "Earth": 1.2,
  "Mars": 1.9,
  "Jupiter": 2.7,
  "Saturn": 3.6,
  "Uranus": 4.4,
  "Neptune": 5.2,
  "Pluto": 6.0
};

function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 3000;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const r = 22 + Math.random() * 8; // Between Mars and Jupiter
      const theta = Math.random() * 2 * Math.PI;
      const y = (Math.random() - 0.5) * 3;
      const scale = Math.random() * 0.05 + 0.01;
      
      temp.push({
        r, theta, y, scale,
        speed: (Math.random() * 0.05 + 0.05) * (Math.random() > 0.5 ? 1 : -1)
      });
    }
    return temp;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime() * 0.02;
    
    particles.forEach((p, i) => {
      const currentTheta = p.theta + p.speed * time;
      const x = p.r * Math.cos(currentTheta);
      const z = p.r * Math.sin(currentTheta);
      
      dummy.position.set(x, p.y, z);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.rotation.set(time * p.speed, time * p.speed * 2, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#888888" roughness={0.9} />
    </instancedMesh>
  );
}

function PlanetNode({ 
  name, info, isSelected, isAssist, earthMap, earthNormal, earthSpecular, earthClouds,
  trajectoryStartPos, trajectoryEndPos, trajectoryAssistPos 
}: any) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const scale = PLANET_SCALES[name] || 0.6;
  const isEarth = name === "Earth";

  // Keplerian orbital speed: omega = K / r^1.1
  const omega = 0.25 / Math.pow(info.distance, 1.1);
  const initialAngle = PLANET_INITIAL_ANGLES[name] || 0;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      if (isEarth && trajectoryStartPos) {
        groupRef.current.position.copy(trajectoryStartPos);
      } else if (isSelected && trajectoryEndPos) {
        groupRef.current.position.copy(trajectoryEndPos);
      } else if (isAssist && trajectoryAssistPos) {
        groupRef.current.position.copy(trajectoryAssistPos);
      } else {
        // Keplerian background orbital revolution around Sun (Center [0,0,0])
        const currentAngle = initialAngle + omega * t;
        const x = info.distance * Math.cos(currentAngle);
        const z = info.distance * Math.sin(currentAngle);
        groupRef.current.position.set(x, 0, z);
      }
    }

    // Axial self-rotation
    if (bodyRef.current) {
      bodyRef.current.rotation.y = t * 0.15;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = t * 0.18;
    }
  });

  return (
    <group ref={groupRef}>
      {isEarth ? (
        <group>
          <group ref={bodyRef}>
            <mesh>
              <sphereGeometry args={[scale, 64, 64]} />
              <meshStandardMaterial 
                map={earthMap} 
                normalMap={earthNormal}
                roughnessMap={earthSpecular}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>
          </group>
          <mesh ref={cloudsRef}>
            <sphereGeometry args={[scale * 1.02, 64, 64]} />
            <meshStandardMaterial 
              map={earthClouds}
              transparent={true}
              opacity={0.4}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[scale * 1.08, 64, 64]} />
            <meshBasicMaterial color={[0.1, 0.3, 1]} transparent opacity={0.15} toneMapped={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ) : (
        <group>
          <group ref={bodyRef}>
            <mesh>
              <sphereGeometry args={[scale, 64, 64]} />
              <meshStandardMaterial 
                color={info.color} 
                roughness={0.85} 
                metalness={0.05}
                opacity={isSelected || isAssist ? 1.0 : 0.6}
                transparent={!(isSelected || isAssist)}
              />
            </mesh>

            {name === "Saturn" && (
              <mesh rotation={[Math.PI / 3, 0, 0]}>
                <ringGeometry args={[scale * 1.4, scale * 2.5, 64]} />
                <meshBasicMaterial color="#c5ab6e" side={THREE.DoubleSide} transparent opacity={0.4} />
              </mesh>
            )}

            <mesh>
              <sphereGeometry args={[scale * 1.05, 32, 32]} />
              <meshBasicMaterial 
                color={isSelected ? "#22d3ee" : (isAssist ? "#4ade80" : info.color)} 
                transparent 
                opacity={isSelected ? 0.35 : (isAssist ? 0.25 : 0.03)} 
                toneMapped={false} 
                blending={THREE.AdditiveBlending} 
              />
            </mesh>
          </group>
        </group>
      )}

      {/* Target HUD Highlight Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.4, scale * 1.55, 32]} />
          <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Assist HUD Highlight Ring */}
      {isAssist && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.4, scale * 1.55, 32]} />
          <meshBasicMaterial color="#4ade80" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

export default function SolarSystem() {
  const { params, quantumResult } = useMissionStore();
  
  const sunRef = useRef<THREE.Mesh>(null);
  
  // High quality textures (CORS safe from unpkg)
  const [
    earthMap, earthNormal, earthSpecular, earthClouds
  ] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-water.png',
    'https://unpkg.com/three-globe/example/img/earth-water.png'
  ]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sunRef.current) sunRef.current.rotation.y = t * 0.02;
  });

  const assistPlanet = (quantumResult as any)?.assistPlanet;
  const quantumPath = quantumResult?.path || [];

  const trajectoryStartPos = useMemo(() => {
    if (quantumPath.length === 0) return null;
    const p = quantumPath[0];
    return new THREE.Vector3(p.x, p.y, p.z);
  }, [quantumPath]);

  const trajectoryEndPos = useMemo(() => {
    if (quantumPath.length === 0) return null;
    const p = quantumPath[quantumPath.length - 1];
    return new THREE.Vector3(p.x, p.y, p.z);
  }, [quantumPath]);

  const trajectoryAssistPos = useMemo(() => {
    if (quantumPath.length === 0 || !assistPlanet) return null;
    const midIdx = Math.floor(quantumPath.length / 2);
    const p = quantumPath[midIdx];
    return new THREE.Vector3(p.x, p.y, p.z);
  }, [quantumPath, assistPlanet]);

  return (
    <group>
      {/* Glowy Sun with HDR Bloom */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial color={[4, 1.5, 0.2]} toneMapped={false} />
      </mesh>
      
      {/* Point light to perfectly light up the planets */}
      <pointLight position={[0, 0, 0]} intensity={400} distance={300} decay={1.5} color="#FFF5D6" />
      <ambientLight intensity={0.1} />

      {/* Render concentric planetary orbit rings for full solar system visualization */}
      {Object.entries(PLANETS).map(([name, info]) => (
        <mesh key={`orbit-ring-${name}`} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[info.distance - 0.05, info.distance + 0.05, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.07} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Render all 8 planets + Pluto with Keplerian orbital revolution and exact trajectory anchoring */}
      {Object.entries(PLANETS).map(([name, info]) => (
        <PlanetNode 
          key={name}
          name={name}
          info={info}
          isSelected={name === params.destination}
          isAssist={name === assistPlanet}
          earthMap={earthMap}
          earthNormal={earthNormal}
          earthSpecular={earthSpecular}
          earthClouds={earthClouds}
          trajectoryStartPos={trajectoryStartPos}
          trajectoryEndPos={trajectoryEndPos}
          trajectoryAssistPos={trajectoryAssistPos}
        />
      ))}
      
      <AsteroidBelt />
      <SpaceEnvironment />
      <SpacetimeGravityGrid />
      <QuantumSuperpositionSwarm />
      <TrajectoryLines />
    </group>
  );
}
