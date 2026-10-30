import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, RotateCcw, X, Check,
  Activity, Terminal, ShieldAlert, ShieldCheck, Zap,
  Lock, DollarSign, Phone, MessageSquare, ChevronRight,
  Sparkles, Maximize2, Compass
} from 'lucide-react';

export interface DirectorWalkthroughProps {
  isActive: boolean;
  onClose: () => void;
  activeView: string;
  setActiveView: (view: 'timeline' | 'roster' | 'playbooks' | 'consensus' | 'a2a' | 'finops' | 'audit' | 'rejections' | 'topology' | 'channels') => void;
  onBroadcastAlert: () => Promise<void>;
  onExecuteSignoff: () => Promise<void>;
  onSendMessage: (text: string) => Promise<void>;
  signoffCompleted: boolean;
}

interface StepConfig {
  id: number;
  view: 'timeline' | 'roster' | 'playbooks' | 'consensus' | 'a2a' | 'finops' | 'audit' | 'rejections' | 'topology' | 'channels';
  title: string;
  phaseCode: string;
  badge: string;
  subtitle: string;
  explanation: string;
  targetSelector?: string;
  cursorTarget: { xPct: number; yPct: number };
  durationMs: number;
  typeText?: string;
  autoAction?: 'type_and_send' | 'broadcast' | 'signoff' | 'highlight_veto' | 'highlight_a2a';
}

const DIRECTOR_STEPS: StepConfig[] = [
  {
    id: 1,
    view: 'timeline',
    title: 'Inbound P1 Telemetry & Code Gate Ingestion',
    phaseCode: 'INGEST_AND_GATES',
    badge: '14ms Ingestion',
    subtitle: 'Zero-Token Adversarial Defense & Immediate Incident Escalation',
    explanation: 'Hardware sensor alert arrives via WhatsApp/SMS. Deterministic Code Gates evaluate sentiment (0.18 negative) and prompt injection safety in 14ms without burning any LLM tokens. Escalated straight to SRE command.',
    cursorTarget: { xPct: 45, yPct: 94 },
    durationMs: 7000,
    typeText: 'Critical Delta-T breach (+14°C) on Frankfurt Loop 4B. Chiller pressure climbing to 174 PSI.',
    autoAction: 'type_and_send'
  },
  {
    id: 2,
    view: 'roster',
    title: 'Automated On-Call Team Dispatch & Multi-Channel Broadcast',
    phaseCode: 'ON_CALL_DISPATCH',
    badge: 'Dual SMS + WhatsApp',
    subtitle: 'Matching Certified Personnel and Enforcing Interaction Budgets',
    explanation: 'Nexus scans the active enterprise directory, matches Frankfurt Lead SRE Marcus Vance, and broadcasts high-priority emergency alerts across SMS and WhatsApp. Gate logs confirm 1/2 interaction budget used.',
    cursorTarget: { xPct: 68, yPct: 12 },
    durationMs: 6500,
    autoAction: 'broadcast'
  },
  {
    id: 3,
    view: 'consensus',
    title: 'Multi-Agent Blind Consensus & Anti-Sycophancy Veto',
    phaseCode: 'BLIND_CONSENSUS',
    badge: 'NFPA-75 VETO',
    subtitle: 'Champion Principle: "Prompt says Yes, Code says No"',
    explanation: 'Three isolated models (SRE, FinOps, Compliance) deliberate without peer exposure. While SRE requests physical technician entry, Safety Sentinel raises an irrevocable NFPA-75 Safety Veto: entry forbidden while pressure > 160 PSI.',
    cursorTarget: { xPct: 62, yPct: 24 },
    durationMs: 7500,
    autoAction: 'highlight_veto'
  },
  {
    id: 4,
    view: 'a2a',
    title: 'Autonomous A2A Protocol Machine-to-Machine Negotiation',
    phaseCode: 'A2A_JSON_RPC',
    badge: 'Settled $1,780 USD',
    subtitle: '3-Turn JSON-RPC 2.0 Circuit Breaker with Supplier Bot',
    explanation: 'Nexus Procurement Agent negotiates with Carrier Industrial Bot. Turn #2 counter-offer ($2,300) is rejected by code gate. Turn #3 locks expedited delivery at $1,780 with a 10% SLA penalty clause and AWS invoice.',
    cursorTarget: { xPct: 48, yPct: 40 },
    durationMs: 7000,
    autoAction: 'highlight_a2a'
  },
  {
    id: 5,
    view: 'audit',
    title: 'Cryptographic SHA-256 Merkle Ledger Audit Anchor',
    phaseCode: 'SOC2_CHAIN_COMMIT',
    badge: 'Tamper-Evident Chain',
    subtitle: 'Mathematical Immutability for Enterprise Compliance',
    explanation: 'Every message event, gate decision, consensus veto, and negotiated contract turn is cryptographically linked with SHA-256 Merkle block hashes. Integrity check confirms intact proof chain for SOC 2 auditors.',
    cursorTarget: { xPct: 52, yPct: 35 },
    durationMs: 6000
  },
  {
    id: 6,
    view: 'finops',
    title: 'Executive Sign-Off & FinOps Token Attribution ROI',
    phaseCode: 'FINOPS_AND_SIGNOFF',
    badge: '2,125x ROI Achieved',
    subtitle: 'Full Resolution in < 3 Minutes with $42,500 Downtime Loss Averted',
    explanation: 'Sarah Chen (VP Incident Commander) signs off PO-AWS-2026-991 ($1,780). Total LLM inference cost: $0.02 USD. Model tiering (Haiku router + Sonnet deliberation) saved 92% of tokens, yielding a 2,125x ROI.',
    cursorTarget: { xPct: 70, yPct: 6 },
    durationMs: 8000,
    autoAction: 'signoff'
  }
];

export function DirectorWalkthrough({
  isActive,
  onClose,
  activeView,
  setActiveView,
  onBroadcastAlert,
  onExecuteSignoff,
  onSendMessage,
  signoffCompleted
}: DirectorWalkthroughProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 1.5x, 2x
  const [stepProgress, setStepProgress] = useState(0); // 0 - 100%
  const [cursorPos, setCursorPos] = useState({ xPct: 50, yPct: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [simulatedTyping, setSimulatedTyping] = useState('');
  const [spotlightRect, setSpotlightRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const step = DIRECTOR_STEPS[currentStepIndex];
  const stepTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);

  // Initialize or reset when triggered
  useEffect(() => {
    if (isActive) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
      setStepProgress(0);
      setSimulatedTyping('');
      goToStep(0);
    } else {
      clearTimeout(stepTimerRef.current);
      clearInterval(progressTimerRef.current);
    }
  }, [isActive]);

  const goToStep = (index: number) => {
    if (index >= DIRECTOR_STEPS.length) {
      setIsPlaying(false);
      return;
    }

    const nextStep = DIRECTOR_STEPS[index];
    setCurrentStepIndex(index);
    setStepProgress(0);
    setSimulatedTyping('');
    setActiveView(nextStep.view);

    // Initial smooth cursor glide
    setCursorPos(nextStep.cursorTarget);

    // Execute step specific autonomous micro-actions
    if (nextStep.autoAction === 'type_and_send' && nextStep.typeText) {
      executeTypingSequence(nextStep.typeText);
    } else if (nextStep.autoAction === 'broadcast') {
      setTimeout(() => {
        triggerClickAnimation();
        onBroadcastAlert();
      }, 1800 / playbackSpeed);
    } else if (nextStep.autoAction === 'signoff') {
      setTimeout(() => {
        // Move to the sign-off button at the top
        setCursorPos({ xPct: 75, yPct: 5.5 });
        setTimeout(() => {
          triggerClickAnimation();
          onExecuteSignoff();
        }, 1200 / playbackSpeed);
      }, 2000 / playbackSpeed);
    }
  };

  const triggerClickAnimation = () => {
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 350);
  };

  const executeTypingSequence = (fullText: string) => {
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex += 2;
      if (charIndex >= fullText.length) {
        clearInterval(typeInterval);
        setSimulatedTyping(fullText);
        // Move cursor to Send button and click
        setTimeout(() => {
          setCursorPos({ xPct: 82, yPct: 94 });
          setTimeout(() => {
            triggerClickAnimation();
            onSendMessage(fullText);
            setSimulatedTyping('');
          }, 600 / playbackSpeed);
        }, 400 / playbackSpeed);
      } else {
        setSimulatedTyping(fullText.slice(0, charIndex));
      }
    }, 45 / playbackSpeed);
  };

  // Progress Bar and Auto-Advance Loop
  useEffect(() => {
    if (!isActive || !isPlaying) return;

    const currentDuration = step.durationMs / playbackSpeed;
    const intervalMs = 50;
    const increment = (intervalMs / currentDuration) * 100;

    progressTimerRef.current = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current);
          if (currentStepIndex + 1 < DIRECTOR_STEPS.length) {
            goToStep(currentStepIndex + 1);
          } else {
            setIsPlaying(false);
          }
          return 100;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(progressTimerRef.current);
  }, [isActive, isPlaying, currentStepIndex, playbackSpeed]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden">
      {/* 1. Subtle Cinematic Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 backdrop-blur-[0.5px]" />

      {/* 2. Autonomous Virtual Director Cursor with Spring Motion */}
      <motion.div
        className="absolute z-50 pointer-events-none"
        animate={{
          left: `${cursorPos.xPct}%`,
          top: `${cursorPos.yPct}%`
        }}
        transition={{
          type: 'spring',
          stiffness: 240,
          damping: 26,
          mass: 0.6
        }}
      >
        <div className="relative">
          {/* Luminous Glow Halo */}
          <div className="absolute -inset-3 rounded-full bg-[#06b6d4]/20 blur-md animate-pulse" />

          {/* SVG Director Arrow Pointer */}
          <motion.div
            animate={{
              scale: isClicking ? 0.78 : 1,
              rotate: isClicking ? -12 : 0
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <svg
              className="h-6 w-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] text-[#38bdf8]"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="#0f172a"
              strokeWidth="1.5"
            >
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
          </motion.div>

          {/* Expanding Click Ripple Wave */}
          <AnimatePresence>
            {isClicking && (
              <motion.div
                initial={{ scale: 0.3, opacity: 1 }}
                animate={{ scale: 2.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute top-1 left-1 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-2 border-[#38bdf8] bg-[#38bdf8]/20"
              />
            )}
          </AnimatePresence>

          {/* Autonomous Simulated Keystrokes Floating Bubble */}
          <AnimatePresence>
            {simulatedTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-7 left-3 whitespace-nowrap px-3 py-1.5 rounded-lg border border-[#38bdf8]/40 bg-[#090d16]/95 backdrop-blur-md shadow-xl text-xs font-mono text-[#e2e8f0]"
              >
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-[#38bdf8]" />
                  <span className="text-[#38bdf8] font-bold">[AUTONOMOUS INPUT]:</span>
                  <span className="text-white max-w-sm truncate">{simulatedTyping}</span>
                  <span className="w-1.5 h-3.5 bg-[#38bdf8] animate-pulse inline-block" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 3. Sleek Top-Tier Director Cinema HUD (Pointer-events enabled on controls) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[820px] max-w-[95vw] pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="rounded-2xl border border-white/[0.12] bg-[#08090e]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-4 flex flex-col gap-3 font-sans"
        >
          {/* Top Bar: Live Presentation Status & Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-[#38bdf8] animate-ping" />
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#38bdf8]" />
                  <span>ONE-TAKE AUTONOMOUS CASE WALKTHROUGH</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[#7dd3fc]">
                  {step.phaseCode}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/[0.1] bg-white/[0.04] text-[#94a3b8]">
                  {step.badge}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {/* Play / Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 py-1 rounded-md border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white flex items-center gap-1.5 text-xs font-mono transition-colors"
                title={isPlaying ? 'Pause Presentation' : 'Resume Presentation'}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Resume'}</span>
              </button>

              {/* Speed Toggle */}
              <button
                onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1)}
                className="px-2 py-1 rounded-md border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-[#cbd5e1] font-mono text-[11px] transition-colors"
                title="Toggle Walkthrough Speed"
              >
                {playbackSpeed}x
              </button>

              {/* Restart */}
              <button
                onClick={() => goToStep(0)}
                className="p-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-[#94a3b8] hover:text-white transition-colors"
                title="Restart Presentation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Exit Cinema Mode */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-[#94a3b8] hover:text-white transition-colors"
                title="Exit Cinema Mode"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stepper Timeline Scrubber */}
          <div className="space-y-1">
            <div className="grid grid-cols-6 gap-1.5">
              {DIRECTOR_STEPS.map((s, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;
                return (
                  <button
                    key={s.id}
                    onClick={() => goToStep(idx)}
                    className="group relative flex flex-col gap-1 text-left"
                  >
                    <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-100 ease-linear ${
                          isCurrent
                            ? 'bg-[#38bdf8]'
                            : isPassed
                            ? 'bg-[#10b981]'
                            : 'bg-transparent'
                        }`}
                        style={{
                          width: isCurrent ? `${stepProgress}%` : isPassed ? '100%' : '0%'
                        }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono truncate transition-colors ${
                      isCurrent ? 'text-[#38bdf8] font-bold' : isPassed ? 'text-[#94a3b8]' : 'text-[#475569]'
                    }`}>
                      0{s.id}. {s.title.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Narrative Subtitle & Technical Architecture Rationale */}
          <div className="pt-1 border-t border-white/[0.08] flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-white tracking-tight">
                  {step.title}
                </span>
                <span className="text-xs text-[#94a3b8]">· {step.subtitle}</span>
              </div>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                {step.explanation}
              </p>
            </div>

            {/* Next Step Pill */}
            <div className="flex items-center gap-2 flex-shrink-0 self-center">
              <button
                onClick={() => {
                  if (currentStepIndex + 1 < DIRECTOR_STEPS.length) {
                    goToStep(currentStepIndex + 1);
                  } else {
                    onClose();
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 font-sans"
              >
                <span>{currentStepIndex + 1 < DIRECTOR_STEPS.length ? 'Next Step' : 'Finish Demo'}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
