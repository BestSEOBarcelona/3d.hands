import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Layers } from 'lucide-react';

interface VoiceControllerProps {
  onCommand: (index: number) => void;
  currentShapeIndex: number;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({ onCommand, currentShapeIndex }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  const isListeningRef = useRef(isListening);
  const errorRef = useRef(error);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  const shapes = ['Esfera', 'Cubo', 'Toroide', 'Pirámide', 'Espiral'];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Non-continuous is often more stable across networks
    recognition.interimResults = false;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      setError(null);
      errorRef.current = null;
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase().trim();
      setLastCommand(command);
      
      if (command.includes('uno')) onCommand(0);
      else if (command.includes('dos')) onCommand(1);
      else if (command.includes('tres')) onCommand(2);
      else if (command.includes('cuatro')) onCommand(3);
      else if (command.includes('cinco')) onCommand(4);
    };

    recognition.onend = () => {
      // Auto-restart if we are still supposed to be listening and no fatal error occurred
      // Use refs to get the most current state
      if (isListeningRef.current && !errorRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        const msg = 'Permiso de micrófono denegado.';
        setError(msg);
        errorRef.current = msg;
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'network') {
        const msg = 'Error de conexión con el servicio de voz.';
        setError(msg);
        errorRef.current = msg;
        setIsListening(false);
        isListeningRef.current = false;
        console.error('Fatal network error in speech recognition. Stopping auto-restart.');
      } else if (event.error === 'no-speech') {
        // This is common, just ignore and let onend restart it
      } else if (event.error === 'aborted') {
        // Ignore aborted errors
      } else {
        const msg = `Error: ${event.error}`;
        setError(msg);
        errorRef.current = msg;
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    if (isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore stop errors
      }
    };
  }, [isListening, onCommand]);

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex gap-2">
        {/* Manual Selector Toggle */}
        <button
          onClick={() => setShowManual(!showManual)}
          className={`p-3 rounded-full border transition-all duration-300 ${
            showManual 
              ? 'bg-white/20 border-white text-white' 
              : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
          }`}
          title="Selector Manual"
        >
          <Layers size={20} />
        </button>

        {/* Voice Toggle */}
        <button
          onClick={() => {
            if (!isListening) setError(null);
            setIsListening(!isListening);
          }}
          className={`p-3 rounded-full border transition-all duration-300 ${
            isListening 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
              : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
          }`}
          title="Comandos de Voz"
        >
          {isListening ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
      </div>
      
      {/* Manual Selection Menu */}
      {showManual && (
        <div className="flex flex-col gap-1 bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-right-4 duration-300">
          {shapes.map((name, idx) => (
            <button
              key={name}
              onClick={() => onCommand(idx)}
              className={`px-4 py-2 rounded-xl text-[11px] font-medium transition-all ${
                currentShapeIndex === idx 
                  ? 'bg-white text-black' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {idx + 1}. {name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 backdrop-blur-md px-3 py-2 rounded-lg border border-red-500/50 max-w-[220px]">
          <p className="text-[9px] font-mono text-red-400 uppercase tracking-tight leading-tight">
            {error}
          </p>
          <p className="text-[8px] text-red-400/60 mt-1 italic">
            Prueba el selector manual (icono de capas) si el error persiste.
          </p>
        </div>
      )}

      {isListening && lastCommand && !error && (
        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
          <p className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-widest">
            Comando: <span className="text-emerald-400">{lastCommand}</span>
          </p>
        </div>
      )}
    </div>
  );
};
