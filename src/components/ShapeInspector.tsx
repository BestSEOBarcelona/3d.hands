import React from 'react';
import { motion } from 'motion/react';
import { Settings2, Palette, Box, Circle, Triangle, Activity, Wind } from 'lucide-react';

interface ShapeInspectorProps {
  shapeIndex: number;
  color: string;
  size: number;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onReset: () => void;
}

const SHAPE_INFO = [
  { name: 'Esfera', icon: Circle, desc: 'Simetría perfecta. Flujo omnidireccional.' },
  { name: 'Cubo', icon: Box, desc: 'Estructura ortogonal. Rigidez geométrica.' },
  { name: 'Toroide', icon: Activity, desc: 'Bucle infinito. Dinámica toroidal.' },
  { name: 'Pirámide', icon: Triangle, desc: 'Ascensión focal. Energía piramidal.' },
  { name: 'Espiral', icon: Wind, desc: 'Crecimiento áureo. Expansión logarítmica.' },
];

const COLORS = [
  { name: 'Emerald', value: '#00ffcc' },
  { name: 'Violet', value: '#a855f7' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Rose', value: '#f43f5e' },
];

export const ShapeInspector: React.FC<ShapeInspectorProps> = ({
  shapeIndex,
  color,
  size,
  onColorChange,
  onSizeChange,
  onReset,
}) => {
  const current = SHAPE_INFO[shapeIndex];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col gap-6 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 w-64"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-bottom border-white/5 pb-4">
        <div className="p-2 rounded-xl bg-white/5 text-emerald-400">
          <current.icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">{current.name}</h3>
          <p className="text-[10px] text-white/40 font-mono">ID: 0x0{shapeIndex + 1}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] leading-relaxed text-white/60 italic font-serif">
        "{current.desc}"
      </p>

      {/* Controls */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold flex items-center gap-1">
              <Palette size={10} /> Espectro
            </label>
            <span className="text-[9px] font-mono text-emerald-400">{color}</span>
          </div>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => onColorChange(c.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  color === c.value ? 'border-white scale-110' : 'border-transparent scale-100'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold flex items-center gap-1">
              <Settings2 size={10} /> Densidad
            </label>
            <span className="text-[9px] font-mono text-white/60">{(size * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.3"
            step="0.01"
            value={size}
            onChange={(e) => onSizeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] uppercase tracking-tighter text-white/20">Real-time Sync</span>
        </div>
        <button 
          onClick={onReset}
          className="text-[8px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          Reset Defaults
        </button>
      </div>
    </motion.div>
  );
};
