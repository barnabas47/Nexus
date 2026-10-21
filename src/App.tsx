import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, ShieldAlert, Cpu, Send, Play, AlertTriangle,
  CheckCircle, Database, Globe, ShieldCheck, Zap,
  DollarSign, FileText, Network, Server, Lock, Layers,
  ChevronRight, ArrowRight, CornerDownRight, Check, X, Shield, RefreshCw,
  Phone, Users, Plus, Trash2, Radio, Bell, Key, Sliders, CheckCircle2,
  Pause, SkipForward, RotateCcw, Sparkles, Terminal, Activity, ChevronDown
} from 'lucide-react';
import { LiveAIInspector } from './components/ui/live-ai-inspector';
import { LiveScenarioStage } from './components/ui/live-scenario-stage';

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

interface Contact {
  id: string;
  tenant_id: string;
  full_name: string;
  role: string;
  phone_number: string;
  email: string;
  channel_preference: 'sms' | 'whatsapp' | 'rcs' | 'voice';
  escalation_tier: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_STANDARD';
  is_on_call: number;
  last_notified_at?: number;
}

interface DispatchedAlert {
  id: string;
  tenant_id: string;
  incident_id: string;
  recipient_name: string;
  recipient_phone: string;
  channel: string;
  message: string;
  status: string;
  timestamp: number;
}

interface Playbook {
  id: string;
  title: string;
  category: string;
  industry: string;
  description: string;
  steps_count: number;
  sla_target_minutes: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  title: string;
  tenant_id: string;
  tenant_name: string;
}

export default function App() {
  const [activeView, setActiveView] = useState<'timeline' | 'roster' | 'playbooks' | 'consensus' | 'a2a' | 'finops' | 'audit' | 'rejections' | 'topology' | 'channels'>('timeline');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [consensus, setConsensus] = useState<ConsensusData | null>(null);
  const [a2aSession, setA2aSession] = useState<A2ASessionData | null>(null);
  const [auditBlocks, setAuditBlocks] = useState<AuditBlock[]>([]);
  const [finops, setFinops] = useState<FinOpsReport | null>(null);
  
  // Enterprise States
  const [selectedTenant, setSelectedTenant] = useState('tenant-cloudscale');
  const [selectedRole, setSelectedRole] = useState('INCIDENT_COMMANDER');
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-ic-890',
    email: 'sarah.chen@cloudscale.com',
    full_name: 'Sarah Chen',
    role: 'INCIDENT_COMMANDER',
    title: 'VP of Critical Infrastructure',
    tenant_id: 'tenant-cloudscale',
    tenant_name: 'CloudScale Datacenters Inc.'
  });
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [roster, setRoster] = useState<Contact[]>([]);
  const [dispatchedAlerts, setDispatchedAlerts] = useState<DispatchedAlert[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [lastExecutedPlaybook, setLastExecutedPlaybook] = useState<any | null>(null);
  const [isExecutingPlaybook, setIsExecutingPlaybook] = useState(false);

  // New Contact Form Modal state
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactChannel, setNewContactChannel] = useState<'sms' | 'whatsapp' | 'rcs' | 'voice'>('sms');
  const [newContactTier, setNewContactTier] = useState<'P1_CRITICAL' | 'P2_HIGH' | 'P3_STANDARD'>('P1_CRITICAL');

  // BYOK & Token Optimizer Modal states
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keySettings, setKeySettings] = useState<any>(null);
  const [providerChoice, setProviderChoice] = useState<'anthropic' | 'openai' | 'emulated'>('emulated');
  const [apiKeyVal, setApiKeyVal] = useState('');
  const [testResult, setTestResult] = useState<{ testing: boolean; success?: boolean; msg?: string } | null>(null);
  const [cacheOpt, setCacheOpt] = useState(true);
  const [tieringOpt, setTieringOpt] = useState(true);
  const [maxTokensOpt, setMaxTokensOpt] = useState(350);

  // Live Scenario Simulator Stage
  const [showLiveStage, setShowLiveStage] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Guided Tour State Machine
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [isTourPaused, setIsTourPaused] = useState(false);
  const [tourTimerProgress, setTourTimerProgress] = useState(0);

  const TOUR_STEPS = [
    {
      index: 0,
      view: 'timeline' as const,
      title: '1. Cross-Channel Incident Ingestion',
      badge: 'WhatsApp & SMS Webhook',
      desc: 'Critical hardware cooling alert arrives via WhatsApp and SMS webhooks. The Supervisor Agent processes sentiment and registers the event into unified DynamoDB memory.',
      actionName: 'Ingesting Omnichannel Stream...'
    },
    {
      index: 1,
      view: 'roster' as const,
      title: '2. Automated On-Call Team Dispatch',
      badge: 'AWS EUM & Twilio Roster',
      desc: 'The platform scans the registered enterprise employee roster, finds Lead SRE Marcus Vance on-call, and broadcasts emergency dispatch alerts via SMS and WhatsApp.',
      actionName: 'Broadcasting P1 Emergency Alert to Roster...'
    },
    {
      index: 2,
      view: 'consensus' as const,
      title: '3. Multi-Agent Blind Deliberation & Safety Veto',
      badge: 'Anti-Sycophancy Engine',
      desc: 'Three independent models (SRE, FinOps, Compliance) deliberate without peer exposure. Compliance Sentinel raises NFPA-75 Safety VETO, blocking human entry until depressurization.',
      actionName: 'Evaluating Blind Consensus...'
    },
    {
      index: 3,
      view: 'a2a' as const,
      title: '4. Agent-to-Agent (A2A) Autonomous Negotiation',
      badge: 'JSON-RPC 2.0 Circuit Breaker',
      desc: 'Nexus Procurement Agent negotiates with Carrier supplier bot, slashing price from $2,300 to $1,780 with guaranteed 45-minute delivery before 3-turn circuit breaker terminates.',
      actionName: 'Running Autonomous Procurement Alku...'
    },
    {
      index: 4,
      view: 'timeline' as const,
      title: '5. Executive One-Tap Sign-Off',
      badge: 'Code Gate Authorization',
      desc: 'Sarah Chen (VP) authorizes the $1,780 PO. "Prompt says Yes, Code says No"—money never moves without cryptographic sign-off.',
      actionName: 'Executing VP Executive Sign-Off...'
    },
    {
      index: 5,
      view: 'audit' as const,
      title: '6. Cryptographic SHA-256 Audit Ledger',
      badge: 'Immutable SOC 2 Chain',
      desc: 'Every single event, negotiation turn, and sign-off is committed into a tamper-evident SHA-256 Merkle chain for ISO/SOC 2 compliance.',
      actionName: 'Verifying Audit Chain Integrity...'
    },
    {
      index: 6,
      view: 'finops' as const,
      title: '7. Real-Time FinOps Token Burn & ROI',
      badge: 'Token Attribution Engine',
      desc: 'Total LLM inference cost: $0.02 USD. Downtime loss averted: $42,500 USD (2,125x ROI). Model tiering (Haiku router + Sonnet consensus) saved 90% of tokens.',
      actionName: 'Reviewing Token Attribution & Savings...'
    }
  ];

  const startGuidedTour = async () => {
    setIsTourActive(true);
    setTourStep(0);
    setIsTourPaused(false);
    setTourTimerProgress(0);
    setActiveView('timeline');
    notify("[START] Live Autonomous Judge Walkthrough active.");
    try {
      await fetch('/api/demo/run', { method: 'POST' });
      await fetchState();
    } catch (e) {
      console.error(e);
    }
  };

  const advanceTourStep = async (nextIndex: number) => {
    if (nextIndex >= TOUR_STEPS.length) {
      setIsTourActive(false);
      notify("[COMPLETED] Live Autonomous Walkthrough finished. Manual control restored.");
      return;
    }
    const targetStep = TOUR_STEPS[nextIndex];
    setTourStep(nextIndex);
    setActiveView(targetStep.view);
    setTourTimerProgress(0);

    // Auto action per step
    if (nextIndex === 1) {
      handleBroadcastAlert();
    } else if (nextIndex === 4) {
      executeSignoff();
    }
  };

  const [signoffCompleted, setSignoffCompleted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'rcs' | 'sms' | 'whatsapp' | 'ses'>('rcs');
  const [isLoading, setIsLoading] = useState(false);
  const [liveLatency, setLiveLatency] = useState(38);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/settings/keys?tenant_id=${selectedTenant}`);
      if (res.ok) {
        const data = await res.json();
        setKeySettings(data);
        setProviderChoice(data.provider || 'emulated');
        setCacheOpt(data.cache_enabled === 1);
        setTieringOpt(data.tiering_enabled === 1);
        setMaxTokensOpt(data.max_output_tokens || 350);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestKey = async () => {
    if (!apiKeyVal.trim()) return;
    setTestResult({ testing: true });
    try {
      const res = await fetch('/api/settings/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerChoice, key: apiKeyVal.trim() })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setTestResult({ testing: false, success: true, msg: `Verified ${data.model} (${data.latency_ms}ms ping)` });
      } else {
        setTestResult({ testing: false, success: false, msg: data.detail || 'Verification failed' });
      }
    } catch (err: any) {
      setTestResult({ testing: false, success: false, msg: err.message || 'Network error' });
    }
  };

  const handleSaveKeys = async () => {
    try {
      const body: any = {
        tenant_id: selectedTenant,
        provider: providerChoice,
        cache_enabled: cacheOpt,
        tiering_enabled: tieringOpt,
        max_output_tokens: maxTokensOpt
      };
      if (providerChoice === 'anthropic' && apiKeyVal.trim()) {
        body.anthropic_key = apiKeyVal.trim();
      } else if (providerChoice === 'openai' && apiKeyVal.trim()) {
        body.openai_key = apiKeyVal.trim();
      }
      const res = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        notify(`AI Engine updated: ${providerChoice === 'emulated' ? 'Emulated Zero-Cost' : 'Live ' + providerChoice.toUpperCase()}`);
        setShowKeyModal(false);
        setApiKeyVal('');
        await fetchSettings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRosterData = async () => {
    try {
      const [rRes, aRes, pbRes, uRes] = await Promise.all([
        fetch(`/api/roster?tenant_id=${selectedTenant}`),
        fetch(`/api/roster/alerts?tenant_id=${selectedTenant}`),
        fetch('/api/playbooks'),
        fetch('/api/auth/users')
      ]);
      if (rRes.ok) setRoster(await rRes.json());
      if (aRes.ok) setDispatchedAlerts(await aRes.json());
      if (pbRes.ok) setPlaybooks(await pbRes.json());
      if (uRes.ok) setAvailableUsers(await uRes.json());
    } catch (err) {
      console.error("Enterprise fetch error:", err);
    }
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
      await fetchRosterData();
      await fetchSettings();
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 4000);
    return () => clearInterval(interval);
  }, [selectedTenant]);

  useEffect(() => {
    if (!isTourActive || isTourPaused) return;
    const interval = setInterval(() => {
      setTourTimerProgress((prev) => {
        if (prev >= 100) {
          advanceTourStep(tourStep + 1);
          return 0;
        }
        return prev + 2.5; // ~4 seconds per step
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isTourActive, isTourPaused, tourStep]);

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/auth/switch/${userId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setSelectedRole(data.user.role);
        setSelectedTenant(data.user.tenant_id);
        notify(`Switched context to ${data.user.full_name} (${data.user.tenant_name})`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    try {
      const res = await fetch('/api/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: selectedTenant,
          full_name: newContactName,
          role: newContactRole || 'On-Call Engineer',
          phone_number: newContactPhone,
          email: newContactEmail || 'ops@enterprise.internal',
          channel_preference: newContactChannel,
          escalation_tier: newContactTier,
          is_on_call: true
        })
      });
      if (res.ok) {
        notify(`Added ${newContactName} to Enterprise On-Call Directory.`);
        setShowAddContact(false);
        setNewContactName('');
        setNewContactPhone('');
        setNewContactRole('');
        setNewContactEmail('');
        await fetchRosterData();
      await fetchSettings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOnCall = async (contact: Contact) => {
    try {
      await fetch(`/api/roster/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_on_call: contact.is_on_call === 1 ? false : true })
      });
      await fetchRosterData();
      await fetchSettings();
      notify(`Updated ${contact.full_name} on-call status.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await fetch(`/api/roster/${contactId}`, { method: 'DELETE' });
      await fetchRosterData();
      await fetchSettings();
      notify("Contact removed from directory.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastAlert = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/roster/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: selectedTenant,
          incident_id: 'INC-2026-904',
          alert_tier: 'ALL_ON_CALL',
          custom_message: '[EMERGENCY BROADCAST] Chiller Loop 4B Thermal Warning. Immediate ACK required via WhatsApp/SMS.'
        })
      });
      if (res.ok) {
        const data = await res.json();
        notify(`[DISPATCHED] Alert sent to ${data.recipients_count} active on-call staff via SMS & WhatsApp.`);
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunPlaybook = async (playbookId: string) => {
    setIsExecutingPlaybook(true);
    try {
      const res = await fetch('/api/playbooks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbook_id: playbookId, tenant_id: selectedTenant })
      });
      if (res.ok) {
        const data = await res.json();
        setLastExecutedPlaybook(data);
        notify(`Executed Playbook: ${data.playbook_title}`);
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingPlaybook(false);
    }
  };

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
    if (currentUser.role !== 'INCIDENT_COMMANDER') {
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
          user_id: currentUser.id,
          user_role: currentUser.role,
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
      case 'voice':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#ec4899]/20 text-[#f472b6] border border-[#ec4899]/30">VOICE</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">{ch}</span>;
    }
  };

  const navItems = [
    { id: 'timeline', label: 'Omnichannel Feed', icon: MessageSquare, badge: timeline.length },
    { id: 'roster', label: 'On-Call Roster & Numbers', icon: Phone, badge: roster.length },
    { id: 'playbooks', label: 'Enterprise Playbooks', icon: Zap, badge: '3' },
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
      {/* 1. Header Toolbar with Streamlined Linear Aesthetic */}
      <header className="h-12 flex-shrink-0 border-b border-[#23252a] bg-[#070709] px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0f1011] border border-[#2e3038] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <svg className="h-3.5 w-3.5 text-[#f7f8f8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-[#f7f8f8]">NexusAI</span>
            <span className="text-xs text-[#62666d] font-mono">/</span>
            <span className="text-xs font-mono text-[#8a8f98]">enterprise</span>
          </div>

          <div className="h-4 w-[1px] bg-[#23252a] mx-1" />

          {/* User Session Switcher */}
          <select
            value={currentUser.id}
            onChange={(e) => handleSwitchUser(e.target.value)}
            className="bg-[#0f1011] hover:bg-[#151619] border border-[#23252a] text-[11px] font-mono text-[#d0d6e0] rounded px-2 py-1 focus:outline-none focus:border-[#5e6ad2] transition-colors cursor-pointer"
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name} ({u.role === 'INCIDENT_COMMANDER' ? 'VP Commander' : u.role === 'FIELD_ENGINEER' ? 'Lead SRE' : u.role === 'CFO_FINOPS_LEAD' ? 'CFO' : 'Auditor'})
              </option>
            ))}
          </select>
        </div>

        {/* Global Action Strip */}
        <div className="flex items-center gap-2 relative">
          {actionNotice && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] font-mono text-[#27a644] bg-[#27a644]/10 border border-[#27a644]/20 px-2 py-0.5 rounded"
            >
              {actionNotice}
            </motion.span>
          )}

          {/* Interactive Simulator — Unified Clean Monochrome Style */}
          <button
            onClick={() => setShowLiveStage(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium border border-[#2e3038] bg-[#121316] hover:bg-[#1a1b20] text-[#d0d6e0] transition-colors"
            title="Launch Interactive Omnichannel Incident Simulator"
          >
            <Terminal className="h-3.5 w-3.5 text-[#8a8f98]" />
            <span>Interactive Simulator</span>
          </button>

          {/* Choose AI Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium border border-[#2e3038] bg-[#121316] hover:bg-[#1a1b20] text-[#d0d6e0] transition-colors"
            title="Configure Live Anthropic / OpenAI Keys & Token Optimizer"
          >
            <Key className="h-3.5 w-3.5 text-[#8a8f98]" />
            <span>Choose AI</span>
          </button>

          {/* Scenarios & Tests Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium border border-[#2e3038] bg-[#121316] hover:bg-[#1a1b20] text-[#d0d6e0] transition-colors"
              title="Open Scenarios & Testing Suite"
            >
              <Activity className="h-3.5 w-3.5 text-[#8a8f98]" />
              <span>Scenarios & Tests</span>
              <ChevronDown className="h-3 w-3 text-[#8a8f98]" />
            </button>

            {showActionsMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-lg border border-[#2e3038] bg-[#0c0d12] shadow-2xl py-1.5 z-50 text-xs font-sans"
                onClick={() => setShowActionsMenu(false)}
              >
                <div className="px-3 py-1 text-[10px] font-mono text-[#62666d] uppercase tracking-wider border-b border-[#1f2025]">
                  Automated Scenarios
                </div>

                <button
                  onClick={() => { triggerJudgeDemo(); setShowActionsMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#16171d] text-white flex items-start gap-2.5 transition-colors"
                >
                  <Play className="h-4 w-4 text-[#27a644] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-[12px]">1-Click Judge Demo</div>
                    <div className="text-[10px] text-[#8a8f98]">Synthesize 10-step full omnichannel journey</div>
                  </div>
                </button>

                <button
                  onClick={() => { startGuidedTour(); setShowActionsMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#16171d] text-white flex items-start gap-2.5 transition-colors"
                >
                  <Activity className="h-4 w-4 text-[#38bdf8] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-[12px]">Guided Walkthrough Tour</div>
                    <div className="text-[10px] text-[#8a8f98]">Interactive walkthrough highlighting key modules</div>
                  </div>
                </button>

                <div className="px-3 py-1 text-[10px] font-mono text-[#62666d] uppercase tracking-wider border-y border-[#1f2025] mt-1">
                  Red Team Security Gates
                </div>

                <button
                  onClick={() => { triggerRedTeam('prompt_injection'); setShowActionsMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#16171d] text-white flex items-start gap-2.5 transition-colors"
                >
                  <ShieldAlert className="h-4 w-4 text-[#f87171] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-[12px]">Prompt Injection Defense</div>
                    <div className="text-[10px] text-[#8a8f98]">Test honeypot trapping of adversarial prompt</div>
                  </div>
                </button>

                <button
                  onClick={() => { triggerRedTeam('budget_exceeded'); setShowActionsMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#16171d] text-white flex items-start gap-2.5 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 text-[#fbbf24] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-[12px]">Interaction Budget Gate</div>
                    <div className="text-[10px] text-[#8a8f98]">Verify frequency caps ("Silence is the Product")</div>
                  </div>
                </button>

                <button
                  onClick={() => { triggerRedTeam('negative_sentiment'); setShowActionsMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#16171d] text-white flex items-start gap-2.5 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[#ec4899] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-[12px]">Sentiment Escalation & Veto</div>
                    <div className="text-[10px] text-[#8a8f98]">Trigger emergency takeover & safety gate</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Body Grid: Sidebar + Viewport + Right Telemetry */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Navigation Menu */}
        <aside className="w-56 flex-shrink-0 border-r border-[#23252a] bg-[#070709] flex flex-col justify-between p-2">
          <div className="space-y-0.5">
            <span className="px-2.5 py-1 text-[10px] font-mono font-medium text-[#62666d] uppercase tracking-wider block">
              Enterprise Control
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
              <span>On-Call Numbers:</span>
              <span className="text-white">{roster.filter(r => r.is_on_call === 1).length} active</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8a8f98]">
              <span>Gate Status:</span>
              <span className="text-[#27a644]">Enforced</span>
            </div>
          </div>
        </aside>

        {/* Center Main Viewport */}
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
              disabled={signoffCompleted || currentUser.role !== 'INCIDENT_COMMANDER'}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                signoffCompleted
                  ? 'bg-[#18191c] text-[#8a8f98] cursor-not-allowed border border-[#23252a]'
                  : currentUser.role !== 'INCIDENT_COMMANDER'
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
            
            {/* VIEW: ON-CALL ROSTER & VERIFIED NUMBERS */}
            {activeView === 'roster' && (
              <div className="h-full flex flex-col justify-between overflow-hidden space-y-3">
                {/* Header Action Strip */}
                <div className="flex justify-between items-center pb-2 border-b border-[#23252a] flex-shrink-0">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#5e6ad2]" />
                      <span>Enterprise Emergency Contact Directory</span>
                    </h3>
                    <p className="text-[11px] text-[#8a8f98]">
                      Pre-defined phone numbers for automated SMS & WhatsApp incident dispatching.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBroadcastAlert}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Bell className="h-3.5 w-3.5 fill-current" />
                      <span>Broadcast P1 Alert (SMS + WhatsApp)</span>
                    </button>

                    <button
                      onClick={() => setShowAddContact(!showAddContact)}
                      className="px-3 py-1.5 rounded bg-[#1f2025] hover:bg-[#2b2d35] text-white text-xs font-medium border border-[#2e3038] flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Number</span>
                    </button>
                  </div>
                </div>

                {/* Add Contact Inline Card */}
                {showAddContact && (
                  <form onSubmit={handleCreateContact} className="p-3 rounded-lg border border-[#2e303f] bg-[#0c0d12] flex flex-wrap gap-2 items-center flex-shrink-0 text-xs">
                    <input
                      type="text"
                      placeholder="Full Name (e.g. John Doe)"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="bg-black/50 border border-[#23252a] rounded px-2.5 py-1 text-white placeholder-[#62666d] flex-1 min-w-[140px]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Backup SRE)"
                      value={newContactRole}
                      onChange={(e) => setNewContactRole(e.target.value)}
                      className="bg-black/50 border border-[#23252a] rounded px-2.5 py-1 text-white placeholder-[#62666d] flex-1 min-w-[130px]"
                    />
                    <input
                      type="text"
                      placeholder="Phone (+3630...)"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="bg-black/50 border border-[#23252a] rounded px-2.5 py-1 text-white placeholder-[#62666d] flex-1 min-w-[130px]"
                      required
                    />
                    <select
                      value={newContactChannel}
                      onChange={(e: any) => setNewContactChannel(e.target.value)}
                      className="bg-black/50 border border-[#23252a] rounded px-2 py-1 text-neutral-300"
                    >
                      <option value="sms">SMS</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="voice">Voice Call</option>
                    </select>
                    <select
                      value={newContactTier}
                      onChange={(e: any) => setNewContactTier(e.target.value)}
                      className="bg-black/50 border border-[#23252a] rounded px-2 py-1 text-neutral-300"
                    >
                      <option value="P1_CRITICAL">P1 Critical</option>
                      <option value="P2_HIGH">P2 High</option>
                      <option value="P3_STANDARD">P3 Standard</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-[#27a644] hover:bg-[#2db84d] text-white font-medium"
                    >
                      Save Contact
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddContact(false)}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[#8a8f98]"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {/* Contacts Directory Table */}
                <div className="flex-1 overflow-y-auto rounded-xl border border-[#23252a] bg-[#0c0d10]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-black/50 text-[#8a8f98] text-[10px] uppercase border-b border-white/5 sticky top-0">
                      <tr>
                        <th className="p-2.5">Personnel / Role</th>
                        <th className="p-2.5">Emergency Phone</th>
                        <th className="p-2.5">Pref. Channel</th>
                        <th className="p-2.5">Tier</th>
                        <th className="p-2.5">On-Call Duty</th>
                        <th className="p-2.5">Last Notified</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px]">
                      {roster.map((c) => (
                        <tr key={c.id} className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-sans">
                            <span className="text-white font-semibold block">{c.full_name}</span>
                            <span className="text-[10px] text-[#8a8f98]">{c.role}</span>
                          </td>
                          <td className="p-2.5 text-[#67e8f9] font-mono">{c.phone_number}</td>
                          <td className="p-2.5">{channelBadge(c.channel_preference)}</td>
                          <td className="p-2.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              c.escalation_tier === 'P1_CRITICAL' ? 'bg-[#ef4444]/20 text-[#f87171]' : 'bg-[#f59e0b]/20 text-[#fcd34d]'
                            }`}>
                              {c.escalation_tier}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <button
                              onClick={() => handleToggleOnCall(c)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                                c.is_on_call === 1
                                  ? 'bg-[#27a644]/20 text-[#6ee7b7] border border-[#27a644]/40 hover:bg-[#27a644]/30'
                                  : 'bg-white/5 text-[#62666d] border border-white/10 hover:bg-white/10'
                              }`}
                            >
                              {c.is_on_call === 1 ? '[ON-CALL]' : '[STANDBY]'}
                            </button>
                          </td>
                          <td className="p-2.5 text-[#8a8f98] text-[10px]">
                            {c.last_notified_at ? new Date(c.last_notified_at * 1000).toLocaleTimeString() : 'Never'}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleDeleteContact(c.id)}
                              className="p-1 rounded text-[#62666d] hover:text-[#f87171] hover:bg-white/5 transition-colors"
                              title="Delete Contact"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dispatched Alerts Audit Stream */}
                <div className="h-32 flex-shrink-0 rounded-xl border border-[#23252a] bg-[#090a0d] p-2.5 flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-[#8a8f98] mb-1 block">
                    Live Dispatch Audit Trail ({dispatchedAlerts.length} sent)
                  </span>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
                    {dispatchedAlerts.length === 0 ? (
                      <span className="text-[#62666d] italic">No outbound alerts dispatched yet. Click 'Broadcast P1 Alert' to test.</span>
                    ) : (
                      dispatchedAlerts.map((a) => (
                        <div key={a.id} className="p-1.5 rounded bg-black/40 border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#27a644] font-bold">[{a.status}]</span>
                            <span className="text-white">{a.recipient_name} ({a.recipient_phone})</span>
                            <span className="text-[#62666d]">via {a.channel.toUpperCase()}</span>
                          </div>
                          <span className="text-[#8a8f98]">{new Date(a.timestamp * 1000).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: ENTERPRISE PLAYBOOKS */}
            {activeView === 'playbooks' && (
              <div className="h-full flex flex-col justify-between overflow-hidden space-y-3">
                <div className="pb-2 border-b border-[#23252a] flex-shrink-0">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#fbbf24]" />
                    <span>Autonomous Enterprise Emergency Playbooks</span>
                  </h3>
                  <p className="text-[11px] text-[#8a8f98]">
                    Pre-authorized automated orchestration sequences executing end-to-end multi-agent resolution.
                  </p>
                </div>

                {/* Playbooks Grid */}
                <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                  {playbooks.map((pb) => (
                    <div key={pb.id} className="p-3.5 rounded-xl border border-[#23252a] bg-[#0c0d12] flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#5e6ad2]/20 text-[#a5afff] border border-[#5e6ad2]/30">
                            {pb.category}
                          </span>
                          <span className="text-[10px] font-mono text-[#27a644]">
                            SLA: &lt;{pb.sla_target_minutes}m
                          </span>
                        </div>
                        <h4 className="font-semibold text-white text-xs">{pb.title}</h4>
                        <p className="text-[11px] text-[#8a8f98] leading-relaxed">{pb.description}</p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#62666d]">{pb.steps_count} Auto-Steps</span>
                        <button
                          onClick={() => handleRunPlaybook(pb.id)}
                          disabled={isExecutingPlaybook}
                          className="px-2.5 py-1 rounded bg-[#5e6ad2] hover:bg-[#6875e5] text-white text-xs font-medium flex items-center gap-1 transition-all active:scale-95"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Run Playbook</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Playbook Live Execution Console */}
                <div className="flex-1 overflow-y-auto rounded-xl border border-[#23252a] bg-[#08090b] p-3 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#67e8f9] block">
                    Playbook Execution Output & Multi-Agent Cascade
                  </span>
                  
                  {lastExecutedPlaybook ? (
                    <div className="space-y-2 font-mono text-xs">
                      <div className="p-2 rounded bg-[#27a644]/10 border border-[#27a644]/30 text-[#6ee7b7]">
                        [RESOLVED] {lastExecutedPlaybook.playbook_title} completed successfully.
                      </div>
                      <div className="space-y-1.5 pl-2 border-l-2 border-[#5e6ad2]">
                        {lastExecutedPlaybook.steps_executed.map((st: string, idx: number) => (
                          <div key={idx} className="text-[#d0d6e0] bg-black/40 p-2 rounded border border-white/5">
                            {st}
                          </div>
                        ))}
                      </div>
                      <div className="p-2 rounded bg-black/50 text-[10px] text-[#8a8f98] truncate">
                        Cryptographic Merkle Proof: <span className="text-[#27a644]">{lastExecutedPlaybook.audit_hash}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-[#62666d]">
                      Click 'Run Playbook' above to simulate a full real-world enterprise emergency resolution.
                    </div>
                  )}
                </div>
              </div>
            )}

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
                            {evt.direction === 'inbound' ? 'Customer / Employee' : `${evt.agent_type.toUpperCase()} AGENT`}
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
                        <span className="text-[#62666d]">{t.sender} -&gt; {t.receiver}</span>
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
            <span className="text-[10px] font-mono text-[#62666d] uppercase block">Logged-In Officer</span>
            <div className="p-2.5 rounded border border-[#23252a] bg-[#0f1013] space-y-1 text-xs">
              <span className="font-semibold text-white block">{currentUser.full_name}</span>
              <span className="text-[10px] font-mono text-[#a5afff] block">{currentUser.title}</span>
              <span className="text-[10px] text-[#62666d] block truncate">{currentUser.email}</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#62666d] uppercase block">Active Infrastructure</span>
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
                <span>SLA Level:</span>
                <span className="text-[#27a644]">99.999% Tier-4</span>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#62666d] uppercase block">Emergency Roster Status</span>
            <div className="p-2.5 rounded border border-[#23252a] bg-[#0f1013] space-y-1 text-[11px] font-mono">
              <div className="flex justify-between text-[#8a8f98]">
                <span>Total Registered:</span>
                <span className="text-white">{roster.length} Personnel</span>
              </div>
              <div className="flex justify-between text-[#8a8f98]">
                <span>On-Call Duty:</span>
                <span className="text-[#27a644] font-semibold">{roster.filter(r => r.is_on_call === 1).length} Ready</span>
              </div>
              <div className="flex justify-between text-[#8a8f98]">
                <span>Primary Channel:</span>
                <span className="text-[#67e8f9]">SMS + WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#62666d] uppercase block">Bedrock Agent Core</span>
            <div className="p-2 rounded border border-[#23252a] bg-[#0c0d0f] text-[10px] font-mono space-y-1">
              <div className="text-[#a5afff]">Claude 3.5 Sonnet (Debate)</div>
              <div className="text-[#06b6d4]">Claude 3.5 Haiku (Router)</div>
              <div className="text-[#27a644]">Deterministic Gate (Zero LLM)</div>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. BYOK & Token Optimizer Settings Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl border border-[#2e303f] bg-[#0c0d12] shadow-2xl p-5 space-y-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#5e6ad2]/20 border border-[#5e6ad2]/40 flex items-center justify-center text-[#a5afff]">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI Engine & API Key Setup (BYOK)</h3>
                    <p className="text-[11px] text-[#8a8f98]">Connect live Claude 3.5 / GPT-4o or use zero-cost emulated mode.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="p-1 rounded text-[#8a8f98] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">Inference Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'anthropic', label: 'Anthropic Claude', sub: 'Sonnet & Haiku' },
                    { id: 'openai', label: 'OpenAI', sub: 'GPT-4o & 4o-mini' },
                    { id: 'emulated', label: 'Emulated Engine', sub: 'Zero-Cost Demo' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProviderChoice(p.id as any);
                        setTestResult(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        providerChoice === p.id
                          ? 'border-[#5e6ad2] bg-[#5e6ad2]/10 text-white shadow-sm'
                          : 'border-[#23252a] bg-[#121316] text-[#8a8f98] hover:border-[#2e3038]'
                      }`}
                    >
                      <span className="font-semibold text-xs block text-white">{p.label}</span>
                      <span className="text-[10px] text-[#8a8f98] font-mono">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              {providerChoice !== 'emulated' ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-white">
                      {providerChoice === 'anthropic' ? 'Anthropic API Key' : 'OpenAI API Key'}
                    </label>
                    {keySettings && (providerChoice === 'anthropic' ? keySettings.anthropic_key_masked : keySettings.openai_key_masked) && (
                      <span className="text-[10px] font-mono text-[#27a644]">
                        Saved: {providerChoice === 'anthropic' ? keySettings.anthropic_key_masked : keySettings.openai_key_masked}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder={providerChoice === 'anthropic' ? 'sk-ant-api03-...' : 'sk-proj-...'}
                      value={apiKeyVal}
                      onChange={(e) => setApiKeyVal(e.target.value)}
                      className="flex-1 bg-black/60 border border-[#23252a] rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2]"
                    />
                    <button
                      type="button"
                      onClick={handleTestKey}
                      disabled={!apiKeyVal.trim() || testResult?.testing}
                      className="px-3 py-1.5 rounded-lg border border-[#2e3038] bg-[#18191d] hover:bg-[#22242a] text-xs font-medium text-white transition-colors disabled:opacity-50"
                    >
                      {testResult?.testing ? 'Testing...' : 'Test Key'}
                    </button>
                  </div>

                  {testResult && (
                    <div className={`p-2 rounded text-xs font-mono flex items-center gap-1.5 ${
                      testResult.success ? 'bg-[#27a644]/15 border border-[#27a644]/30 text-[#6ee7b7]' : 'bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#f87171]'
                    }`}>
                      {testResult.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      <span>{testResult.msg}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-[#27a644]/30 bg-[#27a644]/10 text-xs text-[#d0d6e0] space-y-1">
                  <div className="font-semibold text-[#6ee7b7] flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Zero-Cost Deterministic Engine Active</span>
                  </div>
                  <p className="text-[11px] text-[#8a8f98]">
                    No external API keys required. Responses, consensus deliberations, and A2A negotiations run at 38ms latency at $0.00 cost.
                  </p>
                </div>
              )}

              {/* FinOps Token Reduction Settings */}
              <div className="p-3 rounded-xl border border-[#23252a] bg-[#090a0d] space-y-2.5">
                <span className="text-[10px] font-mono text-[#a5afff] uppercase tracking-wider block font-semibold">
                  FinOps Token Optimization Engine
                </span>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white font-medium block">Dynamic Model Tiering (Routing Cascade)</span>
                    <span className="text-[10px] text-[#8a8f98]">Routes intent classification to Haiku (saves ~90% tokens). Flagship Sonnet reserved for consensus.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tieringOpt}
                    onChange={(e) => setTieringOpt(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#5e6ad2]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <div>
                    <span className="text-white font-medium block">Zero-Token Telemetry Cache</span>
                    <span className="text-[10px] text-[#8a8f98]">Caches recurring sensor telemetry deliberations for 10 minutes (0 tokens burned).</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cacheOpt}
                    onChange={(e) => setCacheOpt(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#5e6ad2]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <div>
                    <span className="text-white font-medium block">Max Output Tokens Cap ({maxTokensOpt} tokens)</span>
                    <span className="text-[10px] text-[#8a8f98]">Strictly prevents rambling to minimize monthly inference spend.</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="800"
                    step="50"
                    value={maxTokensOpt}
                    onChange={(e) => setMaxTokensOpt(parseInt(e.target.value))}
                    className="w-24 accent-[#5e6ad2]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#23252a]">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#2e3038] bg-[#121316] hover:bg-[#1c1d22] text-xs font-medium text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveKeys}
                  className="px-4 py-1.5 rounded-lg bg-[#5e6ad2] hover:bg-[#6875e5] text-xs font-semibold text-white transition-all shadow-sm active:scale-95"
                >
                  Save & Activate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Live Autonomous Judge Walkthrough Spotlight Bubble */}
      <AnimatePresence>
        {isTourActive && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[580px] max-w-[95vw] rounded-2xl border border-[#5e6ad2]/60 bg-[#07080d]/95 backdrop-blur-2xl shadow-[0_16px_50px_rgba(94,106,210,0.4)] p-4 flex flex-col gap-2.5"
          >
            {/* Top Bar: Progress and Step Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-[#a5afff]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#a5afff]">
                  Walkthrough Step {tourStep + 1} of {TOUR_STEPS.length}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#5e6ad2]/20 text-[#c7d2fe] border border-[#5e6ad2]/30">
                  {TOUR_STEPS[tourStep].badge}
                </span>
              </div>
              <button
                onClick={() => setIsTourActive(false)}
                className="text-[#8a8f98] hover:text-white p-1 rounded transition-colors"
                title="Exit Tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Timer Progress Bar */}
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5e6ad2] via-[#8b5cf6] to-[#27a644] transition-all duration-100 ease-linear"
                style={{ width: `${tourTimerProgress}%` }}
              />
            </div>

            {/* Title & Description Bubble */}
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-[#5e6ad2]" />
                <span>{TOUR_STEPS[tourStep].title}</span>
              </h4>
              <p className="text-xs text-[#d0d6e0] leading-relaxed mt-1">
                {TOUR_STEPS[tourStep].desc}
              </p>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-[10px] font-mono text-[#67e8f9] animate-pulse truncate max-w-[260px] flex items-center gap-1">
                <Activity className="h-3 w-3 inline text-[#38bdf8]" />
                <span>{TOUR_STEPS[tourStep].actionName}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTourPaused(!isTourPaused)}
                  className="px-2.5 py-1 rounded-md border border-[#2e3038] bg-[#14151b] hover:bg-[#1e2029] font-medium text-white flex items-center gap-1 transition-colors"
                >
                  {isTourPaused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
                  <span>{isTourPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={() => advanceTourStep(tourStep + 1)}
                  className="px-3 py-1 rounded-md bg-[#5e6ad2] hover:bg-[#6875e5] font-semibold text-white flex items-center gap-1 transition-all shadow-sm active:scale-95"
                >
                  <span>{tourStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next Step'}</span>
                  <SkipForward className="h-3 w-3 fill-current" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Live Omnichannel WhatsApp & Incident Reactor Simulator */}
      <LiveScenarioStage
        isOpen={showLiveStage}
        onClose={() => setShowLiveStage(false)}
        onComplete={() => fetchState()}
        onNavigateTab={(view) => setActiveView(view)}
      />
    </div>
  );
}
