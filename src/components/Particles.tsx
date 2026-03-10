import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Results } from '@mediapipe/hands';

interface ParticlesProps {
  handResults: Results | null;
  externalShapeIndex?: number;
}

const PARTICLE_COUNT = 5000;

type ShapeType = 'SPHERE' | 'CUBE' | 'TORUS' | 'PYRAMID' | 'SPIRAL';
const SHAPES: ShapeType[] = ['SPHERE', 'CUBE', 'TORUS', 'PYRAMID', 'SPIRAL'];

export const Particles: React.FC<ParticlesProps> = ({ handResults, externalShapeIndex = 0 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  const smoothedHandRef = useRef(new THREE.Vector3(0, 0, 0));
  const lastHandPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const swipeCooldownRef = useRef(0);
  const [localShapeIndex, setLocalShapeIndex] = useState(0);

  // Sync local shape with external shape if provided
  useEffect(() => {
    setLocalShapeIndex(externalShapeIndex);
  }, [externalShapeIndex]);

  const [positions] = useState(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  });

  // Pre-calculate target positions for current shape to avoid heavy math in loop
  const getTargetPos = (i: number, shape: ShapeType, time: number, target: THREE.Vector3, isClosed: boolean) => {
    const t = i / PARTICLE_COUNT;
    const scale = isClosed ? 0.3 : 1.0; // Compact vs Expansive scale
    
    switch (shape) {
      case 'SPHERE': {
        const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
        const r = 3 * scale;
        target.set(
          Math.cos(theta) * Math.sin(phi) * r,
          Math.sin(theta) * Math.sin(phi) * r,
          Math.cos(phi) * r
        );
        break;
      }
      case 'CUBE': {
        const side = Math.ceil(Math.pow(PARTICLE_COUNT, 1/3));
        const x = (i % side) - side / 2;
        const y = (Math.floor(i / side) % side) - side / 2;
        const z = (Math.floor(i / (side * side))) - side / 2;
        const s = 0.4 * scale;
        target.set(x * s, y * s, z * s);
        break;
      }
      case 'TORUS': {
        const u = t * Math.PI * 2;
        const v = (i % 50) / 50 * Math.PI * 2;
        const R = 3 * scale;
        const r = 1 * scale;
        target.set(
          (R + r * Math.cos(v)) * Math.cos(u),
          (R + r * Math.cos(v)) * Math.sin(u),
          r * Math.sin(v)
        );
        break;
      }
      case 'PYRAMID': {
        const layers = 30;
        const layer = Math.floor(Math.sqrt(i / (PARTICLE_COUNT / (layers * layers))));
        const layerFrac = layer / layers;
        const pointsInLayer = i % Math.max(1, Math.floor(PARTICLE_COUNT / layers));
        const angle = (pointsInLayer / (PARTICLE_COUNT / layers)) * Math.PI * 2;
        const radius = (1 - layerFrac) * 4 * scale;
        target.set(
          Math.cos(angle) * radius,
          (layerFrac * 6 - 3) * scale,
          Math.sin(angle) * radius
        );
        break;
      }
      case 'SPIRAL': {
        const angle = 0.1 * i;
        const r = 0.05 * i * 0.1 * scale;
        target.set(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          (Math.random() - 0.5) * 0.5 * scale
        );
        break;
      }
    }
  };

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const time = state.clock.getElapsedTime();
    
    // Hand tracking & Swipe detection
    const targetHand = new THREE.Vector3(0, 0, 0);
    let hasHand = false;
    let isClosed = false;

    if (handResults?.multiHandLandmarks?.[0]) {
      const landmarks = handResults.multiHandLandmarks[0];
      const tip = landmarks[8];
      targetHand.set(
        (0.5 - tip.x) * viewport.width,
        (0.5 - tip.y) * viewport.height,
        0
      );
      hasHand = true;

      // Finger counting logic
      let fingersUp = 0;
      
      // Index, Middle, Ring, Pinky (Landmarks: 8, 12, 16, 20)
      // We compare the tip y-coordinate with the PIP joint y-coordinate (6, 10, 14, 18)
      const fingerTips = [8, 12, 16, 20];
      const fingerPips = [6, 10, 14, 18];
      
      for (let i = 0; i < fingerTips.length; i++) {
        // In MediaPipe Y is 0 at top, so tip.y < pip.y means the finger is "up"
        if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y) {
          fingersUp++;
        }
      }
      
      // Thumb (Landmark 4)
      // Heuristic: check if thumb tip is far enough from the palm center
      const thumbTip = landmarks[4];
      const thumbBase = landmarks[2];
      const wrist = landmarks[0];
      const thumbDist = Math.sqrt(Math.pow(thumbTip.x - wrist.x, 2) + Math.pow(thumbTip.y - wrist.y, 2));
      const baseDist = Math.sqrt(Math.pow(thumbBase.x - wrist.x, 2) + Math.pow(thumbBase.y - wrist.y, 2));
      if (thumbDist > baseDist * 1.2) fingersUp++;

      // Map fingers to shapes and scale
      if (fingersUp > 0) {
        const newShapeIndex = Math.min(fingersUp - 1, SHAPES.length - 1);
        setLocalShapeIndex(newShapeIndex);
        isClosed = false;
      } else {
        isClosed = true;
      }

      lastHandPosRef.current.copy(targetHand);
    }

    if (swipeCooldownRef.current > 0) swipeCooldownRef.current--;

    smoothedHandRef.current.lerp(targetHand, 0.015);

    const tempTarget = new THREE.Vector3();
    const currentShape = SHAPES[localShapeIndex];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;
      
      // Get target position for the current shape, passing the hand state
      getTargetPos(i, currentShape, time, tempTarget, isClosed);

      // Smooth transition to shape (lerp)
      const lerpSpeed = isClosed ? 0.08 : 0.05; // Slightly faster when closing
      positionsAttr.array[ix] += (tempTarget.x - positionsAttr.array[ix]) * lerpSpeed;
      positionsAttr.array[iy] += (tempTarget.y - positionsAttr.array[iy]) * lerpSpeed;
      positionsAttr.array[iz] += (tempTarget.z - positionsAttr.array[iz]) * lerpSpeed;

      // Subtle floating noise
      positionsAttr.array[ix] += Math.sin(time * 0.2 + i) * 0.005;
      positionsAttr.array[iy] += Math.cos(time * 0.2 + i * 0.5) * 0.005;

      // Hand Interaction (Repulsion)
      if (hasHand) {
        const dx = positionsAttr.array[ix] - smoothedHandRef.current.x;
        const dy = positionsAttr.array[iy] - smoothedHandRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          const push = (5 - dist) * 0.002;
          positionsAttr.array[ix] += dx * push;
          positionsAttr.array[iy] += dy * push;
        }
      }
    }

    positionsAttr.needsUpdate = true;
    pointsRef.current.rotation.y += 0.001;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#00ffcc"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};
