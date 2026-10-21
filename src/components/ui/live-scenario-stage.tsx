import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, ShieldCheck, Cpu, Play, Pause, RotateCcw,
  X, Check, Lock, DollarSign, AlertTriangle, ArrowRight,
  Server, Phone, CheckCircle2, ChevronRight, Activity, Terminal
} from 'lucide-react';

interface LiveScenarioStageProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function LiveScenarioStage({ isOpen, onClose, onComplete }: LiveScenarioStageProps) {
  // Scenario Timeline Phases:
  // 0: Initial state / Waiting to start
  // 1: User types message on WhatsApp
  // 2: Message sent, delivered with double checkmarks
  // 3: Deterministic Code Gate inspection
  // 4: Multi-Agent Blind Consensus & Safety Veto
  // 5: A2A Autonomous Negotiation (JSON-RPC)
  // 6: Executive Sign-off & Cryptographic Audit Commit
  // 7: Scenario Completed
  const [phase, setPhase] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x or 2x
  const [typedText, setTypedText] = useState<string>('');
  const [activeStepTimer, setActiveStepTimer] = useState<number>(0);

  const FULL_MESSAGE = "Critical Delta-T breach (+14°C) on Frankfurt Loop 4B. Chiller pressure climbing to 174 PSI.";

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setPhase(1);
      setIsPlaying(true);
      setTypedText('');
      setActiveStepTimer(0);
    }
  }, [isOpen]);

  // Main Simulation State Machine
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const baseDelay = 1000 / playbackSpeed;
    let timer: any;

    if (phase === 1) {
      // Typing phase: append character by character
      if (typedText.length < FULL_MESSAGE.length) {
        timer = setTimeout(() => {
          setTypedText(FULL_MESSAGE.slice(0, typedText.length + 1));
        }, 32 / playbackSpeed);
      } else {
        // Typing finished, wait 600ms before sending
        timer = setTimeout(() => {
          setPhase(2);
        }, 600 / playbackSpeed);
      }
    } else if (phase === 2) {
      // Sent & Received on WhatsApp -> Transition to Gate Check
      timer = setTimeout(() => {
        setPhase(3);
      }, 1400 / playbackSpeed);
    } else if (phase === 3) {
      // Deterministic Gate Check -> Transition to Multi-Agent Consensus
      timer = setTimeout(() => {
        setPhase(4);
      }, 2000 / playbackSpeed);
    } else if (phase === 4) {
      // Blind Consensus & Veto -> Transition to A2A Broker
      timer = setTimeout(() => {
        setPhase(5);
      }, 2600 / playbackSpeed);
    } else if (phase === 5) {
      // A2A Negotiation -> Transition to Sign-off & Audit
      timer = setTimeout(() => {
        setPhase(6);
      }, 2600 / playbackSpeed);
    } else if (phase === 6) {
      // Complete
      timer = setTimeout(() => {
        setPhase(7);
        if (onComplete) onComplete();
      }, 2000 / playbackSpeed);
    }

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, phase, typedText, playbackSpeed]);

  if (!isOpen) return null;

  const restartSimulation = () => {
    setPhase(1);
    setTypedText('');
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050608]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-6xl h-[88vh] rounded-2xl border border-white/[0.08] bg-[#090b10] shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
      >
        {/* Top Control Bar */}
        <header className="h-12 border-b border-white/[0.08] bg-[#0c0e14] px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="font-mono text-xs font-semibold text-white tracking-tight">
                AUTONOMOUS INCIDENT RESOLUTION SIMULATION
              </span>
            </div>

            <div className="h-4 w-[1px] bg-white/[0.1] mx-1" />

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#94a3b8]">
              <span>Scenario:</span>
              <span className="text-[#e2e8f0]">Frankfurt DC Thermal Runaway (P1)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed toggle */}
            <button
              onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-white/[0.1] bg-white/[0.04] text-[#cbd5e1] hover:bg-white/[0.08] transition-colors"
            >
              Speed: {playbackSpeed}x
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 rounded text-xs font-mono border border-white/[0.1] bg-white/[0.04] text-white hover:bg-white/[0.08] flex items-center gap-1 transition-colors"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Restart */}
            <button
              onClick={restartSimulation}
              className="px-2.5 py-1 rounded text-xs font-mono border border-white/[0.1] bg-white/[0.04] text-white hover:bg-white/[0.08] flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Restart</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-white/[0.08] transition-colors ml-2"
              title="Close Simulator"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Main Body: Left Phone View + Right Reaction Pipeline */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: Realistic WhatsApp Enterprise Phone Simulator */}
          <div className="w-[380px] lg:w-[420px] flex-shrink-0 border-r border-white/[0.08] bg-[#07080b] p-4 flex flex-col justify-center items-center">
            
            {/* Mobile Device Frame */}
            <div className="w-[340px] h-[640px] rounded-[36px] border border-white/[0.15] bg-[#0b141a] shadow-[0_15px_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative">
              
              {/* Speaker notch */}
              <div className="h-5 w-full bg-[#0b141a] flex justify-center items-center flex-shrink-0 z-20">
                <div className="h-3.5 w-24 bg-black rounded-b-xl flex items-center justify-center">
                  <div className="h-1 w-8 bg-[#1f2c34] rounded-full" />
                </div>
              </div>

              {/* WhatsApp App Header */}
              <div className="h-14 bg-[#202c33] px-3 flex items-center justify-between border-b border-[#2a3942] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884]">
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-white truncate max-w-[150px]">CloudScale Desk</span>
                      <CheckCircle2 className="h-3 w-3 text-[#00a884] fill-current" />
                    </div>
                    <span className="text-[10px] text-[#8696a0] block leading-none">
                      {phase >= 3 && phase <= 5 ? 'NexusAI is typing...' : 'Verified Business'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#aebac1]">
                  <Phone className="h-3.5 w-3.5" />
                  <Activity className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 bg-[#0b141a] p-3 overflow-y-auto space-y-2.5 text-xs font-sans">
                {/* Security Encryption Notice */}
                <div className="p-1.5 rounded-lg bg-[#182229] border border-[#222e35] text-[10px] text-[#8696a0] text-center">
                  <Lock className="h-2.5 w-2.5 inline mr-1 text-[#ffd279]" />
                  End-to-end encrypted · AWS CDS Social Gateway
                </div>

                {/* Inbound Message from Field / Sensor */}
                {phase >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] rounded-lg rounded-tr-none bg-[#005c4b] text-white p-2.5 shadow-sm space-y-1">
                      <p className="text-xs leading-relaxed text-[#e9edef]">{FULL_MESSAGE}</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0]">
                        <span>14:28</span>
                        <div className="flex items-center -space-x-1 text-[#53bdeb]">
                          <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                          <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Supervisor Agent Interactive Response */}
                {phase >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[90%] rounded-lg rounded-tl-none bg-[#202c33] text-[#e9edef] p-2.5 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-[#00a884] font-mono border-b border-[#2a3942] pb-1">
                        <span>NexusAI Incident Supervisor</span>
                        <span>AZ-2 ROUTED</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        Emergency Loop-4 protocol triggered. Multi-Agent Blind Consensus active.
                        Technician dispatch vetoed until depressurization completes.
                      </p>
                      {/* WhatsApp Interactive Reply Buttons */}
                      <div className="space-y-1 pt-1">
                        <div className="w-full py-1.5 px-2 rounded bg-[#0b141a] border border-[#2a3942] text-[11px] text-[#00a884] text-center font-medium cursor-pointer hover:bg-[#111b21]">
                          [1. ACKNOWLEDGE INCIDENT (ACK)]
                        </div>
                        <div className="w-full py-1.5 px-2 rounded bg-[#0b141a] border border-[#2a3942] text-[11px] text-[#e9edef] text-center font-medium cursor-pointer hover:bg-[#111b21]">
                          [2. REQUEST SRE DISPATCH]
                        </div>
                      </div>
                      <div className="flex justify-end text-[10px] text-[#8696a0]">
                        <span>14:28</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Outbound SMS Alert Preview (Cross-Channel Relay) */}
                {phase >= 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2 rounded-lg bg-[#111b21] border border-[#00a884]/30 text-[10px] text-[#8696a0] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[#00a884] font-mono font-medium">
                      <span>SMS RELAY DISPATCH</span>
                      <span>DELIVERED</span>
                    </div>
                    <p className="text-[#d1d7db] text-[11px]">
                      SMS sent to Marcus Vance (+36309876543): P1 Alert ACK required. Chiller Loop 4B.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Chat Input Bar with Animated Character-by-Character Typing */}
              <div className="h-14 bg-[#202c33] px-2.5 flex items-center gap-2 flex-shrink-0">
                <div className="flex-1 h-9 rounded-lg bg-[#2a3942] px-3 flex items-center text-xs text-white overflow-hidden font-sans">
                  {phase === 1 ? (
                    <span className="truncate">
                      {typedText}
                      <span className="inline-block w-1.5 h-3.5 bg-[#00a884] ml-0.5 animate-pulse" />
                    </span>
                  ) : (
                    <span className="text-[#8696a0]">Type an emergency message...</span>
                  )}
                </div>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                  phase === 1 && typedText.length > 5
                    ? 'bg-[#00a884] text-white'
                    : 'bg-[#2a3942] text-[#8696a0]'
                }`}>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Autonomous Reaction & Deliberation Engine */}
          <div className="flex-1 bg-[#090b10] p-4 lg:p-5 flex flex-col justify-between overflow-y-auto space-y-4">
            
            {/* Stage Timeline Navigation Bar */}
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {[
                { step: 1, label: '1. Ingestion & Gates', active: phase >= 2 },
                { step: 2, label: '2. Blind Consensus', active: phase >= 4 },
                { step: 3, label: '3. A2A Negotiation', active: phase >= 5 },
                { step: 4, label: '4. Executive Sign-Off', active: phase >= 6 },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    s.active
                      ? 'border-[#3b82f6]/40 bg-[#1e293b]/50 text-white shadow-sm'
                      : 'border-white/[0.05] bg-white/[0.02] text-[#64748b]'
                  }`}
                >
                  <span className="font-semibold block">{s.label}</span>
                </div>
              ))}
            </div>

            {/* STAGE 1: Deterministic Security & Sentiment Code Gates */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              phase >= 3 ? 'border-white/[0.1] bg-[#0e1118]' : 'border-white/[0.04] bg-white/[0.01] opacity-50'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                  <span>DETERMINISTIC CODE GATES ("Silence is the Product")</span>
                </span>
                <span className="text-[10px] text-[#94a3b8]">Evaluated in 14ms (Zero LLM Tokens)</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-2 rounded bg-black/40 border border-white/[0.05] space-y-1">
                  <span className="text-[10px] text-[#94a3b8] block">Prompt Injection Gate</span>
                  <span className="text-[#10b981] font-semibold block">PASSED (0.00 Risk)</span>
                  <span className="text-[10px] text-[#64748b] block">No adversarial override pattern</span>
                </div>

                <div className="p-2 rounded bg-black/40 border border-white/[0.05] space-y-1">
                  <span className="text-[10px] text-[#94a3b8] block">Interaction Budget Gate</span>
                  <span className="text-[#10b981] font-semibold block">1 / 2 ALLOWED</span>
                  <span className="text-[10px] text-[#64748b] block">Alert budget enforced</span>
                </div>

                <div className="p-2 rounded bg-black/40 border border-white/[0.05] space-y-1">
                  <span className="text-[10px] text-[#94a3b8] block">Sentiment Escalation</span>
                  <span className="text-[#f59e0b] font-semibold block">NEGATIVE (0.18)</span>
                  <span className="text-[10px] text-[#64748b] block">Auto-escalated to SRE Tier-3</span>
                </div>
              </div>
            </div>

            {/* STAGE 2: Multi-Agent Blind Consensus & Safety Veto */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              phase >= 4 ? 'border-white/[0.1] bg-[#0e1118]' : 'border-white/[0.04] bg-white/[0.01] opacity-50'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-[#818cf8]" />
                  <span>MULTI-AGENT BLIND CONSENSUS (Anti-Sycophancy Engine)</span>
                </span>
                <span className="text-[10px] text-[#818cf8] font-bold">3/3 AGENTS DELIBERATING</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {/* SRE Agent */}
                <div className="p-2.5 rounded bg-black/40 border border-white/[0.05] space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-white font-semibold">Systems & SRE</span>
                    <span className="text-[#ef4444] font-bold">CRITICAL</span>
                  </div>
                  <p className="text-[11px] text-[#cbd5e1] leading-tight">
                    Delta-T +14°C breach. Shift 60% workload to AZ-2, throttle compute racks to 40%.
                  </p>
                </div>

                {/* FinOps Agent */}
                <div className="p-2.5 rounded bg-black/40 border border-white/[0.05] space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-white font-semibold">FinOps & SLA</span>
                    <span className="text-[#f59e0b] font-bold">MEDIUM</span>
                  </div>
                  <p className="text-[11px] text-[#cbd5e1] leading-tight">
                    Full outage incurs $12,500/hr SLA penalties. Authorize up to $1,850 for expedited carrier sourcing.
                  </p>
                </div>

                {/* Safety Sentinel with VETO */}
                <div className="p-2.5 rounded bg-[#1c1012] border border-[#ef4444]/40 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#f87171] font-semibold">Safety Sentinel</span>
                    <span className="px-1 rounded bg-[#ef4444]/20 text-[#f87171] font-bold">VETO ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-[#fca5a5] leading-tight font-medium">
                    NFPA-75 standard: Technician entry forbidden while pressure &gt; 160 PSI. Depressurization mandatory.
                  </p>
                </div>
              </div>
            </div>

            {/* STAGE 3: Autonomous A2A Machine Procurement (JSON-RPC 2.0) */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              phase >= 5 ? 'border-white/[0.1] bg-[#0e1118]' : 'border-white/[0.04] bg-white/[0.01] opacity-50'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-[#06b6d4]" />
                  <span>A2A (AGENT-TO-AGENT) JSON-RPC PROTOCOL BROKER</span>
                </span>
                <span className="text-[10px] text-[#10b981] font-semibold">SETTLED: $1,780.00 USD (45m ETA)</span>
              </div>

              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="p-2 rounded bg-black/50 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-[#06b6d4]">Turn #1 [RFQ SUBMIT]</span>
                  <span className="text-[#94a3b8]">NexusCore → Carrier Industrial Bot: SKU COMP-DANFOSS-VFD (Cap: $1,850)</span>
                  <span className="text-[#10b981]">PROPOSED</span>
                </div>
                <div className="p-2 rounded bg-black/50 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-[#f59e0b]">Turn #2 [COUNTER PROPOSE]</span>
                  <span className="text-[#94a3b8]">Carrier Industrial Bot → NexusCore: $2,150 + $150 freight = $2,300.00</span>
                  <span className="text-[#ef4444]">REJECTED BY CODE GATE</span>
                </div>
                <div className="p-2 rounded bg-black/50 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-[#10b981]">Turn #3 [CONTRACT SETTLE]</span>
                  <span className="text-[#94a3b8]">NexusCore final offer: $1,780.00 with 10% SLA penalty clause & AWS invoice</span>
                  <span className="text-[#10b981] font-bold">ACCEPTED & LOCKED</span>
                </div>
              </div>
            </div>

            {/* STAGE 4: Executive Sign-off & SHA-256 Cryptographic Audit Ledger */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              phase >= 6 ? 'border-white/[0.1] bg-[#0e1118]' : 'border-white/[0.04] bg-white/[0.01] opacity-50'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-[#10b981]" />
                  <span>EXECUTIVE SIGN-OFF & CRYPTOGRAPHIC SHA-256 AUDIT BLOCK</span>
                </span>
                <span className="text-[10px] text-[#10b981] font-mono">MERKLE LEAF COMMITTED</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-black/40 border border-white/[0.05] space-y-1">
                  <span className="text-[10px] text-[#94a3b8] block">Executive Sign-Off Authority</span>
                  <div className="flex items-center gap-1.5 text-white">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
                    <span className="font-semibold">Sarah Chen, VP Incident Commander</span>
                  </div>
                  <span className="text-[10px] text-[#64748b] block">PO-AWS-2026-991 ($1,780.00 USD) Approved</span>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/[0.05] space-y-1">
                  <span className="text-[10px] text-[#94a3b8] block">SHA-256 Cryptographic Block Hash</span>
                  <span className="text-[10px] text-[#10b981] truncate block">
                    5aa27de0b278c5f3c53762ed49ba2d9ee0254fb08a7b3171bfb906d033050baa
                  </span>
                  <span className="text-[10px] text-[#64748b] block">Tamper-Evident Immutable Ledger Entry #1</span>
                </div>
              </div>
            </div>

            {/* Bottom Status Footnote */}
            <footer className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#94a3b8]">
                <span>Inference Cost: <strong className="text-white">$0.02 USD</strong></span>
                <span>·</span>
                <span>Downtime Loss Averted: <strong className="text-[#10b981]">$42,500 USD</strong></span>
                <span>·</span>
                <span>Model Tiering Efficiency: <strong className="text-[#38bdf8]">92.4%</strong></span>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] font-semibold text-white transition-all shadow-sm active:scale-95 text-xs font-sans"
              >
                Enter Mission-Control Workbench
              </button>
            </footer>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
