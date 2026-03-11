import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ShapeDisplayProps {
  shapeIndex: number;
}

const SHAPE_DATA = [
  { 
    name: 'Aprobación Estelar', 
    tag: 'GEOMETRÍA_01', 
    lore: 'El pulgar hacia arriba, un símbolo universal de positividad manifestado en el vacío. La energía se concentra en un eje vertical ascendente.' 
  },
  { 
    name: 'Proyector de Fotones', 
    tag: 'GEOMETRÍA_02', 
    lore: 'Estructura balística de luz. Las partículas se alinean en un cañón de precisión, listas para disparar ráfagas de información pura.' 
  },
  { 
    name: 'Trébol de la Suerte', 
    tag: 'GEOMETRÍA_03', 
    lore: 'Simetría trilobulada. Un bucle de tres pétalos que canaliza la fortuna a través de la armonía matemática y el equilibrio natural.' 
  },
  { 
    name: 'Corona de Soberanía', 
    tag: 'GEOMETRÍA_04', 
    lore: 'El ápice del poder geométrico. Cinco puntas de luz que se elevan desde una base circular, simbolizando el dominio sobre el caos.' 
  },
  { 
    name: 'Pirotecnia Digital', 
    tag: 'GEOMETRÍA_05', 
    lore: 'Expansión explosiva. Un estallido de partículas que nacen en un punto y se dispersan en una esfera perfecta de luz efímera.' 
  },
  { 
    name: 'Galaxia Espiral', 
    tag: 'GEOMETRÍA_06', 
    lore: 'El cosmos en la palma de tu mano. Brazos de estrellas que giran en un baile eterno alrededor de un núcleo de gravedad infinita.' 
  },
];

export const ShapeDisplay: React.FC<ShapeDisplayProps> = ({ shapeIndex }) => {
  const current = SHAPE_DATA[shapeIndex] || SHAPE_DATA[0];

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
            {[...Array(6)].map((_, i) => (
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
