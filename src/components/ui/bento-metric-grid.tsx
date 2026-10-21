'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, ShieldCheck, Zap, Activity } from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change?: string;
  description: string;
  icon: LucideIcon;
  glowColor: 'cyan' | 'purple' | 'emerald';
}

interface BentoMetricGridProps {
  metrics?: MetricCard[];
}

export const BentoMetricGrid: React.FC<BentoMetricGridProps> = ({
  metrics = [
    {
      title: 'AI Processing Latency',
      value: '38 ms',
      change: '-18% vs baseline',
      description: 'Ultra-low latency inference powered by streaming SSE and edge agent cache.',
      icon: Zap,
      glowColor: 'cyan',
    },
    {
      title: 'Context Verification Score',
      value: '99.4%',
      change: 'Zero hallucination',
      description: 'Deterministic RAG validation with strict grounding contracts.',
      icon: ShieldCheck,
      glowColor: 'purple',
    },
    {
      title: 'Telemetry Event Throughput',
      value: '14.2k /s',
      change: '+340% capacity',
      description: 'High-concurrency streaming connection pipeline directly to client.',
      icon: Activity,
      glowColor: 'emerald',
    },
  ],
}) => {
  const glowMap = {
    cyan: 'hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] from-cyan-500/10',
    purple: 'hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] from-purple-500/10',
    emerald: 'hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] from-emerald-500/10',
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 py-8">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className={`relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-2xl transition-all duration-300 ${glowMap[m.glowColor]}`}
          >
            {/* Ambient Corner Glow */}
            <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${glowMap[m.glowColor]} blur-2xl opacity-50`} />

            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 text-white">
                <Icon className="h-5 w-5" />
              </div>
              {m.change && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  {m.change}
                </span>
              )}
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">{m.title}</p>
              <h3 className="mt-1 text-4xl font-semibold tracking-tight text-white">{m.value}</h3>
              <p className="mt-3 text-xs leading-relaxed text-neutral-400">{m.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
