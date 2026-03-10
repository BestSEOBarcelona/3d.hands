import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Particles } from './Particles';
import { Results } from '@mediapipe/hands';

interface SceneProps {
  handResults: Results | null;
  onShapeChange?: (index: number) => void;
  shapeIndex?: number;
  color?: string;
  size?: number;
}

export const Scene: React.FC<SceneProps> = React.memo(({ handResults, onShapeChange, shapeIndex, color, size }) => {
  return (
    <div className="w-full h-full bg-[#050505]">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={1}
        gl={{ 
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true
        }}
      >
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        
        <Suspense fallback={null}>
          <Particles 
            handResults={handResults} 
            onShapeChange={onShapeChange}
            externalShapeIndex={shapeIndex} 
            color={color}
            size={size}
          />
          <Stars radius={100} depth={50} count={800} factor={4} saturation={0} fade speed={0.05} />
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
});
