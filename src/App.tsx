import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, ShieldAlert, Cpu, Send, Play, AlertTriangle,
  CheckCircle, Database, Globe, ShieldCheck, Zap,
  DollarSign, FileText, Network, Server, Lock, Layers,
  ChevronRight, ArrowRight, CornerDownRight, Check, X, Shield, RefreshCw
} from 'lucide-react';
import { LiveAIInspector } from './components/ui/live-ai-inspector';

interface TimelineEvent {
  event_id: string;
  customer_id: string;
  timestamp: number;
  channel: 'rcs' | 'sms' | 'whatsapp' | 'ses';
  direction: 'inbound' | 'outbound';
  agent_type: 'supervisor' | 'onboarding' | 'sales' | 'support' | 'human';
  content: string;
  rich_payload?: any;
  sentiment: string;
  sentiment_score: number;
}

interface Perspective {
  agent_id: string;
  role_name: string;
  focus: string;
  blind_assessment: string;
  proposed_action: string;
  risk_level: string;
  budget_estimate_usd: number;
  veto_raised: boolean;
  veto_reason?: string;
}

interface ConsensusData {
  consensus_id: string;
  incident_id: string;
  timestamp: number;
  perspectives: Perspective[];
  debate_log: string[];
  sycophancy_check_passed: boolean;
  final_decision: string;
  authorized_budget_usd: number;
  selected_action: string;
  requires_human_signoff: boolean;
}

interface A2ATurn {
  turn_index: number;
  sender: string;
  receiver: string;
  rpc_method: string;
  payload: any;
  timestamp: number;
  state: string;
}

interface A2ASessionData {
  session_id: string;
  item_required: string;
  max_budget_usd: number;
  turns: A2ATurn[];
  final_status: string;
  agreed_price_usd?: number;
  supplier_confirmed?: string;
  sla_delivery_minutes?: number;
}

interface AuditBlock {
  block_index: number;
  timestamp: number;
  tenant_id: string;
  user_id: string;
  user_role: string;
  event_type: string;
  action_summary: string;
  payload_snapshot: any;
  prev_hash: string;
  block_hash: string;
}

interface FinOpsReport {
  incident_id: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
  estimated_enterprise_savings_usd: number;
  roi_multiple: string;
  breakdown: Array<{
    module: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    latency_ms: number;
  }>;
}

interface Rejection {
  id: string;
  timestamp: number;
  customer_id: string;
  agent_type: string;
  reason: string;
  original_intent: string;
  action_blocked: string;
  overturned: boolean;
}

interface CustomerProfile {
  customer_id: string;
  name: string;
  channels_preferred: string[];
  sentiment_score: number;
  lifecycle_stage: string;
  agent_assignments: Record<string, string>;
  interaction_budget_remaining: number;
}

export default function App() {
  const [activeView, setActiveView] = useState<'timeline' | 'consensus' | 'a2a' | 'finops' | 'audit' | 'rejections' | 'topology' | 'channels'>('timeline');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [consensus, setConsensus] = useState<ConsensusData | null>(null);
  const [a2aSession, setA2aSession] = useState<A2ASessionData | null>(null);
  const [auditBlocks, setAuditBlocks] = useState<AuditBlock[]>([]);
  const [finops, setFinops] = useState<FinOpsReport | null>(null);
  const [selectedTenant, setSelectedTenant] = useState('tenant-cloudscale');
  const [selectedRole, setSelectedRole] = useState('INCIDENT_COMMANDER');
  const [signoffCompleted, setSignoffCompleted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'rcs' | 'sms' | 'whatsapp' | 'ses'>('rcs');
  const [isLoading, setIsLoading] = useState(false);
  const [liveLatency, setLiveLatency] = useState(38);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const fetchState = async () => {
    try {
      const [tRes, pRes, rRes, cRes, aRes, lRes, fRes] = await Promise.all([
        fetch('/api/timeline?customer_id=%2B1-555-DEMO'),
        fetch('/api/profile/%2B1-555-DEMO'),
        fetch('/api/rejections'),
        fetch('/api/consensus/latest'),
        fetch('/api/a2a/negotiate'),
        fetch('/api/audit/ledger'),
        fetch('/api/finops/INC-SERVER-COOLING-771')
      ]);
      if (tRes.ok) setTimeline(await tRes.json());
      if (pRes.ok) setProfile(await pRes.json());
      if (rRes.ok) setRejections(await rRes.json());
      if (cRes.ok) setConsensus(await cRes.json());
      if (aRes.ok) setA2aSession(await aRes.json());
      if (lRes.ok) setAuditBlocks(await lRes.json());
      if (fRes.ok) setFinops(await fRes.json());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3500);
    return () => clearInterval(interval);
  }, []);

  const triggerJudgeDemo = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/demo/run', { method: 'POST' });
      await fetchState();
      notify("Judge Demo: 10-step omnichannel journey synthesized.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRedTeam = async (attackType: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/demo/red-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attack_type: attackType, customer_id: '+1-555-DEMO' })
      });
      const data = await res.json();
      await fetchState();
      if (data.result === 'trapped_in_honeypot') {
        notify("Exploit neutralised: Injected payload isolated in Shadow Honeypot.");
        setActiveView('rejections');
      } else if (data.result === 'blocked') {
        notify("Budget gate triggered: Outbound ping suppressed.");
        setActiveView('rejections');
      } else {
        notify("Sentiment escalation triggered: Human takeover dispatched.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const executeSignoff = async () => {
    if (selectedRole !== 'INCIDENT_COMMANDER') {
      notify("Access Denied: Only Incident Commander has sign-off authority.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/incident/signoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: 'INC-SERVER-COOLING-771',
          tenant_id: selectedTenant,
          user_id: 'usr-ic-890',
          user_role: selectedRole,
          authorized_amount_usd: 1780.0,
          action_approved: 'A2A Compressor Expedited Dispatch'
        })
      });
      if (res.ok) {
        setSignoffCompleted(true);
        await fetchState();
        notify("PO-AWS-2026-991 dispatched. Cryptographic block committed to ledger.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    setLiveLatency(Math.floor(Math.random() * 20) + 28);
    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: '+1-555-DEMO',
          channel: selectedChannel,
          text: textToSend
        })
      });
      const data = await res.json();
      if (data.status === 'rejected') {
        notify(`Security Gate: ${data.reason}`);
      }
      await fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOverturn = async (id: string) => {
    try {
      await fetch(`/api/rejections/${id}/overturn`, { method: 'POST' });
      await fetchState();
      notify(`Rejection ${id} manually overturned by operator.`);
    } catch (err) {
      console.error(err);
    }
  };

  const channelBadge = (ch: string) => {
    switch (ch) {
      case 'rcs':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#5e6ad2]/20 text-[#a5afff] border border-[#5e6ad2]/30">RCS</span>;
      case 'whatsapp':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#27a644]/20 text-[#6ee7b7] border border-[#27a644]/30">WHATSAPP</span>;
      case 'sms':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#06b6d4]/20 text-[#67e8f9] border border-[#06b6d4]/30">SMS</span>;
      case 'ses':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30">SES</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">{ch}</span>;
    }
  };

  const navItems = [
    { id: 'timeline', label: 'Omnichannel Feed', icon: MessageSquare, badge: timeline.length },
    { id: 'consensus', label: 'Blind Consensus', icon: ShieldCheck, badge: consensus ? consensus.perspectives.length : 3 },
    { id: 'a2a', label: 'A2A Protocol Broker', icon: Network, badge: a2aSession ? a2aSession.turns.length : 3 },
    { id: 'finops', label: 'FinOps & Tokens', icon: DollarSign, badge: `$${finops ? finops.total_cost_usd : '0.02'}` },
    { id: 'audit', label: 'Audit Ledger (SOC 2)', icon: Lock, badge: auditBlocks.length },
    { id: 'rejections', label: 'Silence / Rejection Log', icon: ShieldAlert, badge: rejections.length },
    { id: 'topology', label: 'Agent Topology', icon: Cpu, badge: '4' },
    { id: 'channels', label: 'Protocol Adapters', icon: Globe, badge: '4' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#010102] text-[#f7f8f8] flex flex-col font-sans select-none">
      {/* 1. Ultra-clean Header Toolbar */}
      <header className="h-12 flex-shrink-0 border-b border-[#23252a] bg-[#070709] px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0f1011] border border-[#2e3038] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <svg className="h-3.5 w-3.5 text-[#f7f8f8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-[#f7f8f8]">Nexus</span>
            <span className="text-xs text-[#62666d] font-mono">/</span>
            <span className="text-xs font-mono text-[#8a8f98]">orchestrator</span>
          </div>

          <div className="h-4 w-[1px] bg-[#23252a] mx-1" />

          {/* Tenant Selector */}
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="bg-[#0f1011] hover:bg-[#151619] border border-[#23252a] text-[11px] font-mono text-[#d0d6e0] rounded px-2 py-1 focus:outline-none focus:border-[#5e6ad2] transition-colors cursor-pointer"
          >
            <option value="tenant-cloudscale">CloudScale Datacenters (Tier-4)</option>
            <option value="tenant-apex-health">Apex Health Systems (HIPAA)</option>
          </select>

          {/* RBAC Role Selector */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#0f1011] hover:bg-[#151619] border border-[#23252a] text-[11px] font-mono text-[#a5afff] rounded px-2 py-1 focus:outline-none focus:border-[#5e6ad2] transition-colors cursor-pointer"
          >
            <option value="INCIDENT_COMMANDER">Commander (Sign-off Auth)</option>
            <option value="FIELD_ENGINEER">Field Tech (Read / Submit)</option>
            <option value="COMPLIANCE_AUDITOR">Auditor (SOC 2 Read)</option>
          </select>
        </div>

        {/* Global Action Strip */}
        <div className="flex items-center gap-2">
          {actionNotice && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] font-mono text-[#27a644] bg-[#27a644]/10 border border-[#27a644]/20 px-2 py-0.5 rounded"
            >
              {actionNotice}
            </motion.span>
          )}

          <button
            onClick={triggerJudgeDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded bg-[#5e6ad2] hover:bg-[#6875e5] px-2.5 py-1 text-xs font-medium text-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:scale-[0.98]"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Judge Demo</span>
          </button>

          <button
            onClick={() => triggerRedTeam('prompt_injection')}
            title="Red-Team: Test prompt injection honeypot trapping"
            className="inline-flex items-center gap-1 rounded border border-[#3e2428] bg-[#1a0e10] hover:bg-[#261316] px-2 py-1 text-xs font-medium text-[#f87171] transition-colors"
          >
            <ShieldAlert className="h-3 w-3" />
            <span>Inject Test</span>
          </button>

          <button
            onClick={() => triggerRedTeam('budget_exceeded')}
            title="Red-Team: Test silence gate when budget exhausted"
            className="inline-flex items-center gap-1 rounded border border-[#382b19] bg-[#1a140b] hover:bg-[#261e10] px-2 py-1 text-xs font-medium text-[#fbbf24] transition-colors"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Budget Test</span>
          </button>
        </div>
      </header>

      {/* 2. Main Body Grid: Sidebar + Viewport + Right Telemetry */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Navigation Menu */}
        <aside className="w-56 flex-shrink-0 border-r border-[#23252a] bg-[#070709] flex flex-col justify-between p-2">
          <div className="space-y-0.5">
            <span className="px-2.5 py-1 text-[10px] font-mono font-medium text-[#62666d] uppercase tracking-wider block">
              Core Modules
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#18191c] text-[#f7f8f8] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-[#2e3038]'
                      : 'text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#0f1011]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#5e6ad2]' : 'text-[#62666d]'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-[#5e6ad2]/20 text-[#a5afff]' : 'bg-[#141516] text-[#62666d]'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Telemetry Footnote */}
          <div className="p-2.5 rounded border border-[#23252a] bg-[#0c0d0f] space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8a8f98]">
              <span>Inference SLA:</span>
              <span className="text-[#27a644] font-semibold">{liveLatency} ms</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8a8f98]">
              <span>Active Agents:</span>
              <span className="text-white">4 Specialized</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8a8f98]">
              <span>Gate Status:</span>
              <span className="text-[#27a644]">Enforced</span>
            </div>
          </div>
        </aside>

        {/* Center Main Viewport (Zero Page-Level Scroll, Internal Scrollable panes only) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#010102]">
          {/* Executive P1 Sign-off Banner (Compact Top Bar) */}
          <div className="h-10 flex-shrink-0 border-b border-[#23252a] bg-[#0a0a0d] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/30">
                P1 INCIDENT
              </span>
              <span className="font-medium text-white truncate max-w-md">
                Chiller Delta-T High · Sourced Danfoss Compressor ($1,780 USD)
              </span>
            </div>

            <button
              onClick={executeSignoff}
              disabled={signoffCompleted || selectedRole !== 'INCIDENT_COMMANDER'}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                signoffCompleted
                  ? 'bg-[#18191c] text-[#8a8f98] cursor-not-allowed border border-[#23252a]'
                  : selectedRole !== 'INCIDENT_COMMANDER'
                  ? 'bg-[#18191c] text-[#62666d] cursor-not-allowed border border-[#23252a]'
                  : 'bg-[#27a644] hover:bg-[#2db84d] text-white shadow-sm'
              }`}
            >
              <Check className="h-3 w-3 stroke-[3]" />
              <span>{signoffCompleted ? 'PO-AWS-2026-991 Dispatched' : 'Sign-Off & Approve ($1,780)'}</span>
            </button>
          </div>

          {/* Dynamic Module Content View */}
          <div className="flex-1 overflow-hidden p-4">
            {/* VIEW 1: Omnichannel Timeline */}
            {activeView === 'timeline' && (
              <div className="h-full flex flex-col justify-between">
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {timeline.map((evt, idx) => (
                    <div
                      key={evt.event_id || idx}
                      className={`p-3 rounded border text-xs transition-colors ${
                        evt.direction === 'inbound'
                          ? 'bg-[#0a0a0d] border-[#23252a]'
                          : 'bg-[#0f1014] border-[#2e303f]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {channelBadge(evt.channel)}
                          <span className="font-semibold text-white">
                            {evt.direction === 'inbound' ? 'Customer' : `${evt.agent_type.toUpperCase()} AGENT`}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#62666d]">
                          {new Date(evt.timestamp * 1000).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-[#d0d6e0] leading-relaxed">{evt.content}</p>

                      {evt.rich_payload?.cards && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {evt.rich_payload.cards.map((c: any, cIdx: number) => (
                            <div key={cIdx} className="p-2 rounded bg-black/50 border border-[#5e6ad2]/30">
                              <span className="text-[9px] font-bold text-[#a5afff] uppercase">{c.badge || 'TIER'}</span>
                              <div className="font-semibold text-xs text-white">{c.title}</div>
                              <div className="text-[10px] text-[#8a8f98]">{c.description}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {evt.rich_payload?.action_buttons && (
                        <div className="mt-2 flex gap-1.5">
                          {evt.rich_payload.action_buttons.map((btn: string, bIdx: number) => (
                            <span key={bIdx} className="px-2 py-0.5 rounded text-[10px] bg-[#27a644]/10 text-[#6ee7b7] border border-[#27a644]/30">
                              {btn}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Message Input Strip */}
                <form onSubmit={handleSendMessage} className="pt-3">
                  <div className="p-1.5 rounded-lg border border-[#23252a] bg-[#0c0d10] flex items-center gap-2">
                    <select
                      value={selectedChannel}
                      onChange={(e: any) => setSelectedChannel(e.target.value)}
                      className="bg-black/50 border border-[#23252a] text-xs rounded px-2 py-1 text-neutral-300 focus:outline-none"
                    >
                      <option value="rcs">RCS Channel</option>
                      <option value="whatsapp">WhatsApp Channel</option>
                      <option value="sms">SMS Fallback</option>
                      <option value="ses">SES Email</option>
                    </select>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type cross-channel message (e.g. 'Can you provide the enterprise quote?')..."
                      className="flex-1 bg-transparent px-2 text-xs text-white placeholder-[#62666d] focus:outline-none"
                    />

                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-[#5e6ad2] hover:bg-[#6875e5] text-white text-xs font-medium transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 2: Blind Consensus */}
            {activeView === 'consensus' && consensus && (
              <div className="h-full flex flex-col justify-between overflow-hidden space-y-3">
                <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                  {consensus.perspectives.map((p) => (
                    <div
                      key={p.agent_id}
                      className={`p-3 rounded-xl border text-xs space-y-2 ${
                        p.veto_raised
                          ? 'bg-[#180d0e] border-[#ef4444]/40'
                          : 'bg-[#0f1013] border-[#23252a]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{p.role_name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          p.risk_level === 'CRITICAL' ? 'bg-[#ef4444]/20 text-[#f87171]' : 'bg-[#f59e0b]/20 text-[#fcd34d]'
                        }`}>{p.risk_level}</span>
                      </div>

                      <div className="p-2 rounded bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[9px] font-mono text-[#8a8f98] block uppercase">Blind Round-1:</span>
                        <p className="text-[11px] text-[#d0d6e0] leading-snug">{p.blind_assessment}</p>
                      </div>

                      <p className="text-[11px] text-[#8a8f98]">{p.proposed_action}</p>

                      {p.veto_raised && (
                        <div className="p-1.5 rounded bg-[#ef4444]/10 border border-[#ef4444]/30 text-[10px] text-[#f87171] font-medium">
                          {p.veto_reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-3 rounded-xl border border-[#23252a] bg-[#0c0d10] space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#a5afff] block">Deliberation & Cross-Examination</span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {consensus.debate_log.map((log, lIdx) => (
                      <div key={lIdx} className="text-[#8a8f98] bg-black/40 p-2 rounded border border-white/5">
                        {log}
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 rounded bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 text-xs text-[#d0d6e0]">
                    <span className="font-semibold text-[#a5afff] block">Synthesized Output:</span>
                    {consensus.final_decision}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: A2A Protocol */}
            {activeView === 'a2a' && a2aSession && (
              <div className="h-full flex flex-col justify-between overflow-hidden space-y-3">
                <div className="flex justify-between items-center text-xs pb-1 border-b border-[#23252a]">
                  <span className="font-mono text-[#8a8f98]">Session: {a2aSession.session_id}</span>
                  <span className="font-mono text-[#27a644] font-semibold">Agreed Target: ${a2aSession.agreed_price_usd} USD ({a2aSession.sla_delivery_minutes}m ETA)</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {a2aSession.turns.map((t) => (
                    <div key={t.turn_index} className="p-3 rounded border border-[#23252a] bg-[#0d0e12] space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#06b6d4] font-semibold">Turn #{t.turn_index}: {t.rpc_method}</span>
                        <span className="text-[#62666d]">{t.sender} → {t.receiver}</span>
                      </div>
                      <pre className="p-2 rounded bg-black/50 text-[10px] font-mono text-[#67e8f9] overflow-x-auto">
                        {JSON.stringify(t.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>

                <div className="p-2 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[11px] text-[#fcd34d]">
                  Circuit Breaker: Max 3 turns enforced. Stalled negotiation terminates into manual escalation.
                </div>
              </div>
            )}

            {/* VIEW 4: FinOps */}
            {activeView === 'finops' && finops && (
              <div className="h-full flex flex-col justify-between overflow-hidden space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-[#23252a] bg-[#0d0e12]">
                    <span className="text-[10px] font-mono text-[#8a8f98] block">Inference Cost</span>
                    <span className="text-xl font-mono font-bold text-white">${finops.total_cost_usd} USD</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[#27a644]/30 bg-[#27a644]/10">
                    <span className="text-[10px] font-mono text-[#27a644] block">Downtime Loss Averted</span>
                    <span className="text-xl font-mono font-bold text-white">${finops.estimated_enterprise_savings_usd.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[#5e6ad2]/30 bg-[#5e6ad2]/10">
                    <span className="text-[10px] font-mono text-[#a5afff] block">ROI Multiple</span>
                    <span className="text-xl font-mono font-bold text-[#a5afff]">{finops.roi_multiple}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-xl border border-[#23252a] bg-[#0c0d10]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-black/50 text-[#8a8f98] text-[10px] uppercase border-b border-white/5">
                      <tr>
                        <th className="p-2.5">Module</th>
                        <th className="p-2.5">Model</th>
                        <th className="p-2.5 text-right">Tokens</th>
                        <th className="p-2.5 text-right">Latency</th>
                        <th className="p-2.5 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px]">
                      {finops.breakdown.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-2.5 text-white font-sans">{row.module}</td>
                          <td className="p-2.5 text-[#8a8f98]">{row.model}</td>
                          <td className="p-2.5 text-right text-[#d0d6e0]">{row.input_tokens} / {row.output_tokens}</td>
                          <td className="p-2.5 text-right text-[#06b6d4]">{row.latency_ms} ms</td>
                          <td className="p-2.5 text-right text-[#27a644]">${row.cost_usd.toFixed(5)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 5: Audit Ledger */}
            {activeView === 'audit' && (
              <div className="h-full flex flex-col justify-between overflow-hidden space-y-2">
                <div className="flex justify-between items-center text-xs pb-1 border-b border-[#23252a]">
                  <span className="font-mono text-[#8a8f98]">Cryptographic SHA-256 Merkle Chain</span>
                  <span className="font-mono text-[#27a644] font-semibold">Integrity: VERIFIED INTACT</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                  {auditBlocks.map((b) => (
                    <div key={b.block_index} className="p-3 rounded border border-[#23252a] bg-[#0c0d10] space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#a5afff] font-bold">Block #{b.block_index} [{b.event_type}]</span>
                        <span className="text-[#62666d]">{new Date(b.timestamp * 1000).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-white font-sans text-xs">{b.action_summary}</p>
                      <div className="p-1.5 rounded bg-black/60 border border-white/5 text-[10px] text-[#8a8f98] truncate">
                        Hash: <span className="text-[#27a644]">{b.block_hash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 6: Silence / Rejections */}
            {activeView === 'rejections' && (
              <div className="h-full overflow-y-auto space-y-2 pr-1">
                {rejections.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#62666d]">
                    No rejected events. Click 'Inject Test' or 'Budget Test' above to verify gates.
                  </div>
                ) : (
                  rejections.map((rej) => (
                    <div key={rej.id} className="p-3 rounded border border-[#ef4444]/30 bg-[#190d0e] flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#ef4444]/20 text-[#f87171] uppercase">
                            {rej.reason}
                          </span>
                          <span className="text-[10px] font-mono text-[#8a8f98]">{rej.id}</span>
                          {rej.overturned && (
                            <span className="text-[9px] font-bold text-[#27a644]">OVERTURNED</span>
                          )}
                        </div>
                        <p className="font-semibold text-white">{rej.action_blocked}</p>
                        <p className="text-[11px] text-[#8a8f98]">Intent: {rej.original_intent}</p>
                      </div>

                      {!rej.overturned && (
                        <button
                          onClick={() => handleOverturn(rej.id)}
                          className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                        >
                          Overturn
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VIEW 7: Topology */}
            {activeView === 'topology' && (
              <div className="grid grid-cols-2 gap-3 h-full">
                {[
                  { title: 'Supervisor / Router', ch: 'Core Runtime', desc: 'Classifies cross-channel intent, enforces silence gates and delegates context.' },
                  { title: 'Onboarding Agent', ch: 'SES + SMS', desc: 'Account provisioning, setup documentation, and tenant credentials.' },
                  { title: 'Sales Agent', ch: 'AWS EUM RCS', desc: 'Dynamic product carousels, quotation generation, and catalog queries.' },
                  { title: 'Support Agent', ch: 'WhatsApp EUM', desc: 'Technical troubleshooting, diagnostics, and bidirectional Salesforce sync.' }
                ].map((a, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-[#23252a] bg-[#0c0d10] space-y-1.5 text-xs">
                    <span className="text-[10px] font-mono text-[#a5afff]">{a.ch}</span>
                    <h4 className="font-semibold text-white">{a.title}</h4>
                    <p className="text-[#8a8f98] text-[11px] leading-relaxed">{a.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 8: Channels */}
            {activeView === 'channels' && (
              <div className="grid grid-cols-2 gap-3 h-full text-xs">
                <div className="p-3 rounded-xl border border-[#23252a] bg-[#0c0d10] space-y-2">
                  <span className="font-semibold text-white">AWS EUM RCS Payload Adapter</span>
                  <pre className="p-2 rounded bg-black/60 text-[10px] font-mono text-[#a5afff] overflow-x-auto">
{`{
  "type": "rcs_carousel",
  "cards": [{ "title": "Enterprise Cloud ($499/mo)" }],
  "suggested_replies": ["Select Tier", "Schedule Review"]
}`}
                  </pre>
                </div>

                <div className="p-3 rounded-xl border border-[#23252a] bg-[#0c0d10] space-y-2">
                  <span className="font-semibold text-white">WhatsApp Interactive Adapter</span>
                  <pre className="p-2 rounded bg-black/60 text-[10px] font-mono text-[#6ee7b7] overflow-x-auto">
{`{
  "messaging_product": "whatsapp",
  "interactive": {
    "type": "button",
    "action": { "buttons": [{ "title": "Salesforce Guide" }] }
  }
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Telemetry Drawer (Compact, high density) */}
        <aside className="w-64 flex-shrink-0 border-l border-[#23252a] bg-[#070709] p-3 space-y-3 overflow-y-auto">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#62666d] uppercase block">Unified Customer Context</span>
            <div className="p-2.5 rounded border border-[#23252a] bg-[#0f1013] space-y-1.5 text-xs">
              <div>
                <span className="font-semibold text-white block">{profile?.name || 'Alex Johnson'}</span>
                <span className="text-[10px] font-mono text-[#8a8f98]">{profile?.customer_id || '+1-555-DEMO'}</span>
              </div>
              <div className="text-[11px] text-[#8a8f98] pt-1 border-t border-white/5 space-y-0.5">
                <div className="flex justify-between">
                  <span>Sentiment:</span>
                  <span className="text-[#06b6d4] font-medium">{profile ? (profile.sentiment_score * 100).toFixed(0) : 94}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget Remaining:</span>
                  <span className="text-[#f59e0b] font-medium">{profile?.interaction_budget_remaining || 1} / 2 daily</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#62666d] uppercase block">Hardware & Infrastructure</span>
            <div className="p-2.5 rounded border border-[#23252a] bg-[#0f1013] space-y-1 text-[11px] font-mono text-[#8a8f98]">
              <div className="flex justify-between">
                <span>Chiller Delta-T:</span>
                <span className="text-[#ef4444] font-bold">+14°C CRITICAL</span>
              </div>
              <div className="flex justify-between">
                <span>Venting PSI:</span>
                <span className="text-[#f59e0b]">174 PSI (Venting)</span>
              </div>
              <div className="flex justify-between">
                <span>Target AZ:</span>
                <span className="text-white">AZ-2 (40% load)</span>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#62666d] uppercase block">Bedrock MicroVM Routing</span>
            <div className="p-2 rounded border border-[#23252a] bg-[#0c0d0f] text-[10px] font-mono space-y-1">
              <div className="text-[#a5afff]">Claude 3.5 Sonnet (Consensus)</div>
              <div className="text-[#06b6d4]">Claude 3.5 Haiku (Router)</div>
              <div className="text-[#27a644]">Deterministic Gate (Zero LLM)</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
