# NexusAI — SPEC.md
## Multi-Agent Omnichannel Enterprise Communication Platform

> **"Not a single agent — an entire agent team, unified by shared memory, each mastering its own channel."**

---

## 1. Problem Statement (Research Grounding)

Enterprises today use an average of **6.3 disconnected systems** for customer communication (Salesforce State of Service, 2025). This fragmentation causes:

- **72% of customers** are frustrated when they have to repeat themselves across channels (Kayako CX Report)
- **60% of customer complaints** receive responses after 24+ hours — by then the customer has already churned
- **Bot-to-human handoff failure** is the #1 cause of AI chatbot abandonment — context gets truncated or dropped entirely during escalation
- Support agents spend **35% of their time** asking diagnostic questions that were already answered on a different channel

**NexusAI solves this** by deploying specialized AI agents — each expert in their domain (Sales, Support, Onboarding) — that communicate via the customer's preferred AWS CDS channel while sharing a unified conversation memory.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NexusAI Platform                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Amazon Bedrock AgentCore                         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │   │
│  │  │  Onboarding  │ │    Sales     │ │      Support         │ │   │
│  │  │    Agent     │ │    Agent     │ │       Agent          │ │   │
│  │  │  (Welcome,   │ │  (Products,  │ │  (Issues, FAQ,       │ │   │
│  │  │   Setup,     │ │   Pricing,   │ │   Troubleshooting,   │ │   │
│  │  │   KYC)       │ │   Upsell)    │ │   Escalation)        │ │   │
│  │  └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘ │   │
│  │         │                │                     │             │   │
│  │  ┌──────┴────────────────┴─────────────────────┴──────────┐ │   │
│  │  │           Supervisor / Router Agent                     │ │   │
│  │  │  (Intent classification, agent delegation, context mgmt)│ │   │
│  │  └────────────────────────┬───────────────────────────────┘ │   │
│  └───────────────────────────┼──────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┼──────────────────────────────────┐   │
│  │         Channel Adapter Layer (Lambda + EventBridge)         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌───────────┐ ┌────────────────┐  │   │
│  │  │   RCS   │ │   SMS   │ │ WhatsApp  │ │      SES       │  │   │
│  │  │  Rich   │ │  Text   │ │ Social    │ │    Email       │  │   │
│  │  │  Cards  │ │ Fallback│ │ Interactive│ │  HTML/Attach  │  │   │
│  │  └─────────┘ └─────────┘ └───────────┘ └────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Shared Services                            │   │
│  │  ┌──────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────┐  │   │
│  │  │ DynamoDB │ │  Comprehend  │ │    S3     │ │ CloudWatch│  │   │
│  │  │ Unified  │ │  Sentiment   │ │  Assets   │ │  Metrics  │  │   │
│  │  │ Memory   │ │  Analysis    │ │  & Logs   │ │  & Alerts │  │   │
│  │  └──────────┘ └──────────────┘ └───────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Admin Dashboard (React/Next.js)                 │   │
│  │  Real-time conversation view │ Agent topology │ Rejection log│   │
│  │  Sentiment heatmap │ Channel analytics │ Judge Demo Mode     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Agent Definitions

### 3.1 Supervisor / Router Agent
- **Role:** Central orchestrator — classifies incoming message intent and delegates to the right specialist agent
- **Capabilities:**
  - Intent classification (onboarding vs. sales vs. support)
  - Agent hand-off with full context transfer
  - Channel preference detection and routing
  - Interaction budget enforcement (max 2 proactive messages/day)
- **Tools:** `route_to_agent`, `get_customer_context`, `update_channel_preference`

### 3.2 Onboarding Agent
- **Primary Channel:** Amazon SES (welcome emails, setup guides)
- **Secondary:** SMS (verification OTPs, quick confirmations)
- **Role:** First-touch — welcome new customers, guide through setup, collect preferences
- **Tools:** `send_welcome_email`, `verify_identity`, `set_preferences`, `create_customer_profile`

### 3.3 Sales Agent
- **Primary Channel:** RCS (rich product cards, carousels, action buttons)
- **Secondary:** SMS fallback (text-only product summaries)
- **Role:** Product discovery, pricing, upsell recommendations
- **Tools:** `show_product_catalog`, `generate_quote`, `create_cart`, `schedule_demo`

### 3.4 Support Agent
- **Primary Channel:** WhatsApp (conversational, media-rich troubleshooting)
- **Secondary:** RCS (rich diagnostic cards), SES (case summaries)
- **Role:** Issue resolution, FAQ, troubleshooting, escalation
- **Tools:** `diagnose_issue`, `search_knowledge_base`, `escalate_to_human`, `send_case_summary`

---

## 4. AWS Services Integration Map

| Service | Purpose | Critical For |
|---------|---------|-------------|
| **Amazon Bedrock AgentCore** | Multi-agent runtime, session memory, tool execution | Core — Agent orchestration |
| **AWS EUM RCS** | Rich cards, carousels, suggested replies for Sales | Tech Execution — Rich UI |
| **AWS EUM SMS** | Text fallback, OTP, quick notifications | Tech Execution — Universal reach |
| **AWS EUM Social (WhatsApp)** | Conversational support, media sharing | WhatsApp Prize + Tech Execution |
| **Amazon SES** | HTML emails, attachments, onboarding sequences | Tech Execution — Email channel |
| **Amazon DynamoDB** | Unified conversation memory, customer profiles | Shared context store |
| **Amazon Comprehend** | Real-time sentiment analysis on all messages | Intelligent routing |
| **Amazon EventBridge** | Event-driven message routing between channels | Orchestration glue |
| **AWS Lambda** | Channel adapter logic, protocol translation | Channel mapping |
| **AWS Step Functions** | Multi-step workflow orchestration | Complex flows |
| **Amazon SNS** | Internal pub/sub for agent events | Event fanout |
| **Amazon S3** | Asset storage, conversation logs, attachments | Persistence |
| **Amazon CloudWatch** | Metrics, dashboards, alerting | Observability |
| **AWS CDK** | Infrastructure as Code deployment | Reproducibility |

---

## 5. Channel Adapter Layer (Protocol Translation)

The critical middleware that solves the #1 technical gap: **no native adapter exists between Bedrock AgentCore output and CDS rich payloads**.

```python
# Pseudocode — Channel Adapter Pattern
class ChannelAdapter:
    """Translates AgentCore structured output → native channel format"""

    def adapt(self, agent_response: AgentResponse, channel: Channel) -> ChannelPayload:
        match channel:
            case Channel.RCS:
                return self._to_rcs_rich_card(agent_response)
            case Channel.SMS:
                return self._to_sms_text(agent_response)
            case Channel.WHATSAPP:
                return self._to_whatsapp_interactive(agent_response)
            case Channel.SES:
                return self._to_ses_html_email(agent_response)

    def _to_rcs_rich_card(self, resp):
        # Carousel cards with images, action buttons, suggested replies
        # Handles RCS payload schema validation
        ...

    def _to_sms_text(self, resp):
        # Graceful degradation: rich content → abbreviated text
        # Preserves action URLs as shortened links
        ...

    def _to_whatsapp_interactive(self, resp):
        # WhatsApp interactive messages: buttons, lists, media
        ...

    def _to_ses_html_email(self, resp):
        # Responsive HTML email with embedded images, .ics attachments
        ...
```

---

## 6. Unified Conversation Memory (DynamoDB Schema)

```
CustomerProfile:
  PK: CUSTOMER#{phone_or_email}
  SK: PROFILE
  channels_preferred: ["whatsapp", "rcs", "sms", "email"]
  sentiment_score: 0.82
  lifecycle_stage: "active"
  agent_assignments: {onboarding: "done", sales: "active", support: "idle"}
  interaction_budget_remaining: 2
  created_at, updated_at

ConversationThread:
  PK: CUSTOMER#{phone_or_email}
  SK: THREAD#{timestamp}#{channel}
  agent_type: "sales" | "support" | "onboarding" | "supervisor"
  channel: "rcs" | "sms" | "whatsapp" | "ses"
  direction: "inbound" | "outbound"
  content: { text, rich_payload, attachments }
  sentiment: "positive" | "neutral" | "negative"
  context_snapshot: { ... }  # Full agent context at this point

RejectionLog:
  PK: CUSTOMER#{phone_or_email}
  SK: REJECTION#{timestamp}
  reason: "interaction_budget_exceeded" | "off_topic" | "competitor_product"
  agent_type: str
  original_intent: str
```

---

## 7. Deterministic Code Gates (Champion Rule #2)

```python
# BeforeToolCallEvent → cancel_tool pattern
class InteractionBudgetGate:
    """The code decides, not the prompt."""

    def check(self, customer_id: str, action: str) -> bool:
        profile = dynamo.get_profile(customer_id)
        if profile.interaction_budget_remaining <= 0:
            rejection_log.record(
                customer_id=customer_id,
                reason="interaction_budget_exceeded",
                action=action
            )
            return False  # Block — no matter what the prompt says
        return True

class SentimentEscalationGate:
    """Auto-escalate to human if sentiment drops below threshold."""

    THRESHOLD = 0.3

    def check(self, customer_id: str, sentiment: float) -> bool:
        if sentiment < self.THRESHOLD:
            # Force escalation — prompt cannot override this
            escalate_to_human(customer_id)
            return True  # Escalated
        return False
```

---

## 8. Frontend — Admin Dashboard

### Design System (Taste Skill Configuration)
```yaml
DESIGN_VARIANCE: high
MOTION_INTENSITY: high
PALETTE:
  background: "#0A0A0F"          # Deep obsidian
  surface: "#12121A"             # Elevated card
  surface_glass: "rgba(255,255,255,0.04)"
  accent_primary: "#6366F1"     # Indigo (Bedrock brand)
  accent_secondary: "#06B6D4"   # Cyan (communication)
  accent_tertiary: "#F59E0B"    # Amber (alerts)
  success: "#10B981"
  danger: "#EF4444"
  text_primary: "#F8FAFC"
  text_secondary: "#94A3B8"
TYPOGRAPHY:
  heading: "Inter, system-ui"
  body: "Inter, system-ui"
  mono: "JetBrains Mono, monospace"
BORDER_RADIUS: "12px"
GLASSMORPHISM: true
RIM_LIGHTING: true
```

### Dashboard Sections
1. **Agent Topology View** — Real-time multi-agent graph showing active agents, their states, and message flow
2. **Unified Conversation Timeline** — Single scrollable view showing all customer interactions across all channels, color-coded by channel
3. **Sentiment Heatmap** — Grid of customers colored by real-time sentiment (green → yellow → red)
4. **Rejection Log** — What the agents decided NOT to do and why (Champion Rule #3)
5. **Channel Analytics** — Message volume, response times, channel switching patterns
6. **Live AI Inspector** — Real-time model latency, tool calls, agent reasoning (Champion Rule #4)
7. **Judge Demo Mode** — 1-click button to populate with realistic demo data and trigger a full end-to-end scenario

### Key UI Components (from Vault)
- `stitch-aurora-hero` — Animated gradient hero section
- `live-ai-inspector` — Real-time AI telemetry overlay
- `bento-metric-grid` — Dashboard metric cards in bento layout
- `glass-card` — Glassmorphic card components
- `shimmer-button` — Premium button with shimmer effect
- `voice-command-pill` — Voice interaction trigger

---

## 9. Judge Demo Mode (Champion Rule #1)

### One-Click Demo Scenario
When the judge clicks "Demo Mode", the system:

1. **T+0s** — Creates demo customer "Alex Johnson" (phone: +1-555-DEMO)
2. **T+2s** — Onboarding Agent sends SES welcome email with setup guide
3. **T+5s** — Alex "replies" via SMS: "I need a CRM solution"
4. **T+7s** — Supervisor routes to Sales Agent
5. **T+9s** — Sales Agent sends RCS rich card carousel with 3 CRM tiers
6. **T+12s** — Alex "taps" the Enterprise tier card
7. **T+14s** — Sales Agent sends RCS confirmation + schedules demo
8. **T+17s** — Alex "asks" on WhatsApp: "Does it integrate with Salesforce?"
9. **T+19s** — Support Agent responds on WhatsApp with integration guide
10. **T+22s** — SES sends comprehensive onboarding summary email

**Dashboard shows:** All 10 events in real-time across the unified timeline, agent topology lights up, sentiment stays green.

### Red-Team Trigger
- "Send prompt injection" — Agent correctly rejects and logs
- "Exceed interaction budget" — Gate blocks and logs rejection
- "Send to wrong channel" — Supervisor re-routes correctly

---

## 10. Tech Stack Summary

### Backend
- **Runtime:** Python 3.12 + FastAPI
- **Agent Framework:** Amazon Bedrock AgentCore (Firecracker microVM)
- **Database:** Amazon DynamoDB (unified memory)
- **Messaging:** AWS EUM (RCS + SMS) + AWS EUM Social (WhatsApp) + Amazon SES
- **Orchestration:** AWS Lambda + Amazon EventBridge + AWS Step Functions
- **Sentiment:** Amazon Comprehend
- **IaC:** AWS CDK (TypeScript)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + custom design tokens
- **Components:** Vault (aurora-hero, live-ai-inspector, bento-grid, glass-card)
- **Real-time:** WebSocket via API Gateway
- **Charts:** Recharts / Tremor for analytics

### Deployment
- **Frontend:** Vercel (Next.js)
- **Backend:** AWS Lambda + API Gateway (serverless)
- **Alternative:** Render.com (FastAPI container) with `render.yaml`
- **Domain:** Custom domain with CloudFront

---

## 11. File Structure

```
NexusAI/
├── backend/
│   ├── agents/
│   │   ├── supervisor.py          # Router/orchestrator agent
│   │   ├── onboarding_agent.py    # Welcome & setup specialist
│   │   ├── sales_agent.py         # Product & pricing specialist
│   │   └── support_agent.py       # Issue resolution specialist
│   ├── channels/
│   │   ├── adapter.py             # Base channel adapter
│   │   ├── rcs_adapter.py         # RCS rich card translation
│   │   ├── sms_adapter.py         # SMS text fallback
│   │   ├── whatsapp_adapter.py    # WhatsApp interactive messages
│   │   └── ses_adapter.py         # SES HTML email builder
│   ├── core/
│   │   ├── memory.py              # DynamoDB unified memory
│   │   ├── gates.py               # Deterministic code gates
│   │   ├── sentiment.py           # Comprehend integration
│   │   └── config.py              # Environment & service config
│   ├── api/
│   │   ├── main.py                # FastAPI app entry
│   │   ├── webhooks.py            # Inbound message handlers
│   │   ├── dashboard.py           # Dashboard API endpoints
│   │   └── demo.py                # Judge Demo Mode orchestrator
│   └── requirements.txt
├── src/                            # Next.js frontend
│   ├── app/
│   │   ├── page.tsx               # Landing / hero
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Main admin dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   └── ui/                    # Vault components + custom
│   ├── lib/
│   │   ├── api.ts                 # Backend API client
│   │   └── websocket.ts           # Real-time updates
│   └── agents/                    # Frontend agent visualization
├── infra/
│   ├── cdk/                       # AWS CDK stack
│   │   ├── nexus-stack.ts
│   │   └── cdk.json
│   └── render.yaml                # Render.com fallback
├── tests/
│   ├── test_gates.py              # Deterministic gate tests
│   ├── test_adapters.py           # Channel adapter tests
│   ├── test_red_team.py           # Prompt injection resistance
│   └── test_e2e.py                # End-to-end flow tests
├── task.md
├── SPEC.md
├── README.md
├── LICENSE                         # MIT (required for public repo)
├── package.json
└── .gitignore
```

---

## 12. Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| RCS agent onboarding takes days (23-field registration) | Cannot demo RCS | Use SMS fallback + mock RCS UI in dashboard demo |
| Bedrock AgentCore latency > 5s for multi-agent | Poor UX | Show typing indicators, cache common responses |
| WhatsApp Business API approval delay | Miss WhatsApp prize | Apply immediately, use sandbox mode for dev |
| 4 channels = 4x integration complexity | Scope creep | Build adapter pattern first, add channels incrementally |
| DynamoDB cold starts | Slow first request | Provisioned capacity for demo, on-demand for prod |

---

## 13. 3-Minute Demo Script

| Time | Action | Visual |
|------|--------|--------|
| 0:00-0:20 | Problem statement: "6.3 systems, zero context" | Statistics + pain point slides |
| 0:20-0:40 | Architecture overview | Animated diagram |
| 0:40-1:30 | Live Demo: Click "Judge Demo Mode" | Dashboard lights up with all 10 events |
| 1:30-2:00 | Zoom into channel views: RCS carousel, WhatsApp thread, SES email | Split-screen channel views |
| 2:00-2:20 | Red-Team: Prompt injection → rejected + logged | Rejection log highlights |
| 2:20-2:40 | Agent topology: show supervisor routing decisions in real-time | Animated agent graph |
| 2:40-3:00 | Impact metrics + "Package as AWS Marketplace offering" | Bento metric grid + closing |

