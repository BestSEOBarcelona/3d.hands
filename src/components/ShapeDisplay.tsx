import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ShapeDisplayProps {
  shapeIndex: number;
}

const SHAPE_DATA = [
  { 
    name: 'Esfera Primordial', 
    tag: 'GEOMETRÍA_01', 
    lore: 'El estado de equilibrio absoluto. Las partículas convergen en un centro gravitatorio perfecto, emulando el nacimiento de una estrella.' 
  },
  { 
    name: 'Cubo Hiperbóreo', 
    tag: 'GEOMETRÍA_02', 
    lore: 'Orden y estructura. Los átomos digitales se alinean en ejes ortogonales, creando una arquitectura de datos inquebrantable.' 
  },
  { 
    name: 'Anillo Toroidal', 
    tag: 'GEOMETRÍA_03', 
    lore: 'Energía en bucle infinito. Un flujo continuo que desafía el principio y el fin, canalizando la corriente a través de un vacío central.' 
  },
  { 
    name: 'Vórtice Piramidal', 
    tag: 'GEOMETRÍA_04', 
    lore: 'Concentración de flujo ascendente. La base sostiene la expansión mientras el ápice proyecta la intención hacia el infinito.' 
  },
  { 
    name: 'Espiral Áurea', 
    tag: 'GEOMETRÍA_05', 
    lore: 'Crecimiento orgánico fractal. La secuencia matemática de la vida manifestada en luz, expandiéndose eternamente hacia el exterior.' 
  },
];

export const ShapeDisplay: React.FC<ShapeDisplayProps> = ({ shapeIndex }) => {
  const current = SHAPE_DATA[shapeIndex];

  return (
    <div className="pointer-events-none select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={shapeIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center text-center gap-2"
        >
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-emerald-500/30" />
            <span className="text-[10px] font-mono tracking-[0.5em] text-emerald-400 uppercase">
              {current.tag}
            </span>
            <div className="h-[1px] w-12 bg-emerald-500/30" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase italic">
            {current.name}
          </h2>
          
          <div className="max-w-md mt-2">
            <p className="text-[11px] md:text-xs text-white/40 font-serif italic leading-relaxed tracking-wide">
              {current.lore}
            </p>
          </div>

          {/* Decorative bits */}
          <div className="flex gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i === shapeIndex ? 'bg-emerald-400 scale-125 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-white/10'
                }`} 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
