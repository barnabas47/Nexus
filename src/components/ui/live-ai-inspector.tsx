'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Terminal, Cpu, CheckCircle2, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface TraceStep {
  name: string;
  durationMs: number;
  status: 'done' | 'running' | 'idle';
  detail?: string;
}

interface LiveAIInspectorProps {
  modelName?: string;
  latencyMs?: number;
  tokensPerSec?: number;
  steps?: TraceStep[];
}

export const LiveAIInspector: React.FC<LiveAIInspectorProps> = ({
  modelName = 'Gemini 3.8 Flash • AgentCore',
  latencyMs = 48,
  tokensPerSec = 112,
  steps = [
    { name: 'Intent Classifier', durationMs: 12, status: 'done', detail: 'Identified: Real-time Camera Stream Analysis' },
    { name: 'MCP Tool Invocation', durationMs: 24, status: 'done', detail: 'Called: firetv_os_stream_sync()' },
    { name: 'Context RAG Retrieval', durationMs: 8, status: 'done', detail: 'Fetched 3 temporal context chunks' },
    { name: 'Streaming Response', durationMs: 4, status: 'running', detail: 'Generating SSE payload to client' },
  ],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-3 right-68 z-40 font-sans pointer-events-auto">
      {/* Floating Collapsed Pill */}
      <motion.div
        layout
        className="overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.7)]"
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-neutral-200 flex items-center gap-1">
              <Cpu className="h-3 w-3 text-purple-400" />
              {modelName}
            </span>
          </div>

          <div className="h-3 w-[1px] bg-white/10" />

          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1 text-cyan-400">
              <Zap className="h-3 w-3" />
              {latencyMs}ms
            </span>
            <span>•</span>
            <span>{tokensPerSec} t/s</span>
          </div>

          <button className="text-neutral-400 hover:text-white">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Expanded Telemetry Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-t border-white/[0.08] px-4 py-3 text-xs"
            >
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2 font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Terminal className="h-3 w-3 text-purple-400" /> Execution Pipeline Trace
                </span>
                <span className="text-emerald-400">Live 60fps</span>
              </div>

              <div className="space-y-2 mt-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5 rounded-lg bg-white/[0.02] p-2 border border-white/[0.04]">
                    <div className="flex items-center justify-between text-neutral-300 font-medium">
                      <span className="flex items-center gap-1.5">
                        {step.status === 'done' ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Activity className="h-3 w-3 text-cyan-400 animate-spin" />
                        )}
                        {step.name}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500">{step.durationMs}ms</span>
                    </div>
                    {step.detail && (
                      <p className="text-[11px] text-neutral-500 font-mono pl-4.5 truncate">{step.detail}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>Memory Context: 4 nodes</span>
                <span className="text-purple-400/80">Deterministic Pipeline</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
