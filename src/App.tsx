import React, { useState, useCallback, useEffect } from 'react';
import { Results } from '@mediapipe/hands';
import { HandTracker } from './components/HandTracker';
import { Scene } from './components/Scene';
import { VoiceController } from './components/VoiceController';
import { ShapeInspector } from './components/ShapeInspector';
import { ShapeDisplay } from './components/ShapeDisplay';
import { motion, AnimatePresence } from 'motion/react';
import { Hand, Info, Maximize2, MousePointer2, Zap, Sliders } from 'lucide-react';

export default function App() {
  const [handResults, setHandResults] = useState<Results | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [color, setColor] = useState('#00ffcc');
  const [size, setSize] = useState(0.12);
  const [showInspector, setShowInspector] = useState(false);

  // Keydown listener for manual shape switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < 6) {
        setShapeIndex(idx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHandUpdate = useCallback((results: Results) => {
    // Use functional update to avoid dependency on handResults state
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandResults(results);
    } else {
      setHandResults(null);
    }
  }, []); // Empty dependency array makes this function stable

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene 
          handResults={handResults} 
          onShapeChange={setShapeIndex}
          shapeIndex={shapeIndex} 
          color={color}
          size={size}
        />
      </div>

      {/* Hand Tracker UI */}
      <HandTracker onHandUpdate={handleHandUpdate} />

      {/* Voice Controller */}
      <div className="absolute top-8 right-8 z-20">
        <VoiceController onCommand={setShapeIndex} currentShapeIndex={shapeIndex} />
      </div>

      {/* UI Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12"
          >
            {/* Header */}
            <header className="flex justify-between items-start pointer-events-auto">
              <div className="space-y-1">
                <motion.h1 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl md:text-6xl font-bold tracking-tighter uppercase italic"
                >
                  Aether <span className="text-emerald-400">Hands</span>
                </motion.h1>
                <motion.p 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs md:text-sm font-mono text-white/40 uppercase tracking-[0.3em]"
                >
                  Interactive Particle Manipulation v1.0.4
                </motion.p>
              </div>
              <div className="flex gap-4">
                <button className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                  <Info size={18} className="text-white/60" />
                </button>
              </div>
            </header>

            {/* Center Instructions */}
            <div className="flex-1 flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center space-y-6 max-w-md"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-widest">
                  <Zap size={12} /> System Active
                </div>
                <h2 className="text-2xl md:text-3xl font-light leading-tight">
                  Reach out and <span className="italic font-serif text-emerald-300">sculpt the void</span> with your movements.
                </h2>
                <div className="flex justify-center gap-8 pt-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                      <Hand size={20} className="text-white/40" />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-white/30">Hand Control</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                      <MousePointer2 size={20} className="text-white/40" />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-white/30">Orbit Camera</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOverlay(false)}
                  className="pointer-events-auto mt-8 px-8 py-3 rounded-full bg-white text-black text-xs uppercase font-bold tracking-widest hover:bg-emerald-400 transition-colors"
                >
                  Enter Experience
                </button>
              </motion.div>
            </div>

            {/* Footer */}
            <footer className="flex justify-between items-end pointer-events-auto">
              <div className="flex gap-12 text-[10px] uppercase tracking-widest text-white/40 font-mono">
                <div className="space-y-1">
                  <p className="text-white/20">Coordinates</p>
                  <p className="text-white/60">
                    {handResults?.multiHandLandmarks?.[0] 
                      ? `${handResults.multiHandLandmarks[0][8].x.toFixed(3)}, ${handResults.multiHandLandmarks[0][8].y.toFixed(3)}`
                      : '0.000, 0.000'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/20">Status</p>
                  <p className={handResults ? "text-emerald-400" : "text-amber-400"}>
                    {handResults ? 'Tracking' : 'Searching...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-[1px] bg-white/10" />
                <span className="text-[10px] font-mono text-white/20">© 2026 AETHER_LABS</span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal Toggles */}
      {!showOverlay && (
        <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowOverlay(true)}
            className="p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-white/40 hover:text-white transition-colors"
            title="Información"
          >
            <Info size={18} />
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowInspector(!showInspector)}
            className={`p-3 rounded-full border transition-all duration-300 ${
              showInspector 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                : 'bg-black/40 border-white/10 text-white/40 hover:text-white'
            }`}
            title="Ajustes de Forma"
          >
            <Sliders size={18} />
          </motion.button>
        </div>
      )}

      {/* Shape Inspector Panel */}
      {!showOverlay && showInspector && (
        <div className="absolute top-32 left-8 z-20">
          <ShapeInspector 
            key={shapeIndex}
            shapeIndex={shapeIndex}
            color={color}
            size={size}
            onColorChange={setColor}
            onSizeChange={setSize}
            onReset={() => {
              setColor('#00ffcc');
              setSize(0.12);
            }}
          />
        </div>
      )}

      {/* Dynamic Shape Display (HUD) */}
      {!showOverlay && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
          <ShapeDisplay shapeIndex={shapeIndex} />
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[1px] border-white/5 m-4 rounded-3xl" />
      <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col gap-4 pointer-events-none">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
        ))}
      </div>
    </div>
  );
}
