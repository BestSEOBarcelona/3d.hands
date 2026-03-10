import React, { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

interface HandTrackerProps {
  onHandUpdate: (results: Results) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    let isMounted = true;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (!isMounted) return;
      
      // Basic smoothing could be done here, but we'll pass raw results 
      // and handle smoothing in the render loop for better performance.
      onHandUpdate(results);
      setIsLoaded(true);
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && isMounted) {
          try {
            await hands.send({ image: videoRef.current });
          } catch (e) {
            console.error("MediaPipe send error:", e);
          }
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().catch((err) => {
      if (!isMounted) return;
      console.error('Camera start error:', err);
      setError('Failed to access camera. Please ensure permissions are granted.');
    });

    return () => {
      isMounted = false;
      camera.stop();
      hands.close();
    };
  }, [onHandUpdate]);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-48 h-36 rounded-xl overflow-hidden border border-white/20 bg-black/40 backdrop-blur-md shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full object-cover opacity-60 scale-x-[-1]"
        playsInline
      />
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/50 animate-pulse">
          Initializing Hand Tracking...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-red-400 text-center p-2">
          {error}
        </div>
      )}
      <div className="absolute top-2 left-2 flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${isLoaded ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <span className="text-[8px] uppercase tracking-tighter text-white/70 font-mono">
          {isLoaded ? 'Tracking Active' : 'Calibrating'}
        </span>
      </div>
    </div>
  );
};
