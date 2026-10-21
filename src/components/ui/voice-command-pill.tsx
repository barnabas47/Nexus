'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';

interface VoiceCommandPillProps {
  onTranscript?: (text: string) => void;
  placeholder?: string;
}

export const VoiceCommandPill: React.FC<VoiceCommandPillProps> = ({
  onTranscript,
  placeholder = 'Beszélj hozzá... (Live Voice AI)',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Fallback demo simulation or browser Web Speech API
  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript('Hallgatom...');

      // Check if browser SpeechRecognition is available
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const current = event.results[0][0].transcript;
          setTranscript(current);
          if (event.results[0].isFinal && onTranscript) {
            onTranscript(current);
            setIsListening(false);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        // Fallback simulated interactive speech for demo mode
        setTimeout(() => {
          const sample = 'Analyze Fire TV sports stream with real-time MCP agent';
          setTranscript(sample);
          setIsListening(false);
          if (onTranscript) onTranscript(sample);
        }, 2200);
      }
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        onClick={toggleListening}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-2xl transition-all duration-300 shadow-lg ${
          isListening
            ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-200 shadow-cyan-500/20'
            : 'border-white/10 bg-white/[0.04] text-neutral-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white'
        }`}
      >
        {/* Animated Waveform Bars when listening */}
        <AnimatePresence>
          {isListening ? (
            <div className="flex items-center gap-0.5 h-3.5">
              {[0.4, 0.8, 1, 0.6, 0.9, 0.5].map((scale, i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: [0.3, scale, 0.3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                  className="w-0.5 h-full rounded-full bg-cyan-400 origin-center"
                />
              ))}
            </div>
          ) : (
            <Mic className="h-3.5 w-3.5 text-neutral-400" />
          )}
        </AnimatePresence>

        <span className="truncate max-w-[220px]">
          {transcript || placeholder}
        </span>

        {isListening && (
          <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
        )}
      </motion.button>
    </div>
  );
};
