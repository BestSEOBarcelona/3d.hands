import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Results } from '@mediapipe/hands';

interface ParticlesProps {
  handResults: Results | null;
  onShapeChange?: (index: number) => void;
  externalShapeIndex?: number;
  color?: string;
  size?: number;
}

const PARTICLE_COUNT = 5000;

type ShapeType = 'THUMBS_UP' | 'GUN' | 'CLOVER' | 'CROWN' | 'FIREWORKS' | 'GALAXY';
const SHAPES: ShapeType[] = ['THUMBS_UP', 'GUN', 'CLOVER', 'CROWN', 'FIREWORKS', 'GALAXY'];

export const Particles: React.FC<ParticlesProps> = ({ 
  handResults, 
  onShapeChange,
  externalShapeIndex = 0,
  color = "#00ffcc",
  size = 0.12
}) => {
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
    const scale = isClosed ? 0.3 : 1.0;
    
    switch (shape) {
      case 'THUMBS_UP': {
        // Hand base (fist) + Thumb
        if (i < PARTICLE_COUNT * 0.75) {
          // Fist: Rounded box
          const x = (Math.random() - 0.5) * 3 * scale;
          const y = (Math.random() - 0.5) * 2.5 * scale - 1.5 * scale;
          const z = (Math.random() - 0.5) * 2 * scale;
          target.set(x, y, z);
        } else {
          // Thumb: Cylinder pointing up
          const angle = (i / (PARTICLE_COUNT * 0.25)) * Math.PI * 2;
          const h = (i % 100) / 100 * 3.5 * scale;
          const r = 0.7 * scale;
          target.set(
            Math.cos(angle) * r - 1.2 * scale,
            h - 0.5 * scale,
            Math.sin(angle) * r
          );
        }
        break;
      }
      case 'GUN': {
        // Barrel + Grip
        if (i < PARTICLE_COUNT * 0.65) {
          // Barrel: Horizontal cylinder
          const angle = (i / (PARTICLE_COUNT * 0.65)) * Math.PI * 2;
          const l = (i % 200) / 200 * 6 * scale;
          const r = 0.5 * scale;
          target.set(l - 1 * scale, Math.cos(angle) * r + 0.5 * scale, Math.sin(angle) * r);
        } else {
          // Grip: Vertical cylinder
          const angle = (i / (PARTICLE_COUNT * 0.35)) * Math.PI * 2;
          const h = (i % 150) / 150 * 3.5 * scale;
          const r = 0.7 * scale;
          target.set(Math.cos(angle) * r - 1 * scale, -h + 0.5 * scale, Math.sin(angle) * r);
        }
        break;
      }
      case 'CLOVER': {
        // 3-leaf clover using polar math
        const petals = 3;
        const angle = t * Math.PI * 2;
        const r = (2 + 1.5 * Math.abs(Math.cos(petals * angle / 2))) * 1.5 * scale;
        // Add a stem
        if (i > PARTICLE_COUNT * 0.9) {
          const st = (i - PARTICLE_COUNT * 0.9) / (PARTICLE_COUNT * 0.1);
          target.set(0.2 * scale, -st * 4 * scale, 0);
        } else {
          target.set(
            Math.cos(angle) * r,
            Math.sin(angle) * r,
            (Math.random() - 0.5) * 0.3 * scale
          );
        }
        break;
      }
      case 'CROWN': {
        // Ring base + spikes
        const angle = t * Math.PI * 2;
        const radius = 3.5 * scale;
        const numSpikes = 5;
        // Zigzag for spikes
        const spikeFactor = Math.abs((angle * numSpikes / Math.PI) % 2 - 1);
        const h = spikeFactor * 3 * scale;
        target.set(
          Math.cos(angle) * radius,
          h - 1 * scale,
          Math.sin(angle) * radius
        );
        break;
      }
      case 'FIREWORKS': {
        // Expanding and fading shell
        const cycle = (time * 1.2) % 2;
        const r = cycle * 8 * scale;
        const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
        // Add some "trails" or jitter
        const jitter = Math.sin(time * 10 + i) * 0.1 * cycle;
        target.set(
          Math.cos(theta) * Math.sin(phi) * (r + jitter),
          Math.sin(theta) * Math.sin(phi) * (r + jitter),
          Math.cos(phi) * (r + jitter)
        );
        break;
      }
      case 'GALAXY': {
        // Spiral galaxy with arms
        const arm = i % 3;
        const angleOffset = (arm * Math.PI * 2) / 3;
        const dist = t * 8 * scale;
        const angle = dist * 1.5 + angleOffset + time * 0.2;
        const thickness = (1 - t) * 1.5 * scale;
        const noiseX = (Math.random() - 0.5) * thickness;
        const noiseY = (Math.random() - 0.5) * thickness * 0.3;
        const noiseZ = (Math.random() - 0.5) * thickness;
        target.set(
          Math.cos(angle) * dist + noiseX,
          noiseY,
          Math.sin(angle) * dist + noiseZ
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
        if (newShapeIndex !== localShapeIndex) {
          setLocalShapeIndex(newShapeIndex);
          onShapeChange?.(newShapeIndex);
        }
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
        size={size}
        color={color}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};
