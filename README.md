# NexusAI — Multi-Agent Omnichannel Enterprise Platform

> **"Autonomous Multi-Agent Mission-Control & Omnichannel Incident Response with Unified Memory, Blind Consensus, FinOps Attribution & Cryptographic Audit Ledger."**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-barnabas47%2FNexus-181717?logo=github)](https://github.com/barnabas47/Nexus)
[![AWS Bedrock](https://img.shields.io/badge/Amazon%20Bedrock-AgentCore-orange.svg)](https://aws.amazon.com/bedrock/)
[![AWS CDS](https://img.shields.io/badge/AWS%20CDS-RCS%20%7C%20WhatsApp%20%7C%20SMS%20%7C%20SES-green.svg)](https://aws.amazon.com/)

---

## ⚡ Problem Statement (Research Grounding)
Enterprises juggle an average of **6.3 disconnected communication systems** (Salesforce State of Service).
- **72% of customers** abandon workflows having to repeat themselves across SMS, WhatsApp, and Email.
- **Critical incidents** escalate uncontrolled without cryptographic audit trails or deterministic budget caps.
- **Multi-agent hallucinations** compromise high-stakes enterprise decisions without blind consensus verification.

---

## 🚀 Key Architectural Innovations

1. **Multi-Agent Blind Consensus Engine**:
   - Independent deliberation across Site Reliability, Cybersecurity, and FinOps agents.
   - Prevents sycophancy with mathematical safety score gating.

2. **A2A (Agent-to-Agent) JSON-RPC Protocol Broker**:
   - Autonomous multi-turn agent procurement negotiation with strict 3-turn circuit breaker.

3. **Deterministic Code Gates ("Silence is the Product")**:
   - `PromptInjectionDefenseGate`: Traps adversarial attacks into isolated shadow honeypots.
   - `InteractionBudgetGate`: Strict hard caps preventing customer alert fatigue.
   - `SentimentEscalationGate`: Automatic tier-3 escalation when negative sentiment is detected.

4. **FinOps Token Attribution & Cryptographic Audit Ledger**:
   - SHA-256 chained tamper-evident audit ledger with One-Tap Executive Sign-off.
   - Direct ROI and token burn analytics.

5. **Live Omnichannel Webhooks (Render Ready)**:
   - **WhatsApp Cloud API / AWS EUM**: Webhook verification challenge (`GET /api/webhooks/whatsapp`) and live message ingestion (`POST /api/webhooks/whatsapp`).
   - **SMS Gateway / Twilio**: Webhook receiver (`POST /api/webhooks/sms`).

---

## 🌐 1-Click Render Deployment (`onrender.com`)

NexusAI is configured for instant deployment on **[Render](https://render.com)** using Docker or standard Web Service:

### Render Setup Steps:
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service** (or **Blueprint**).
3. Connect your GitHub repository: `https://github.com/barnabas47/Nexus`.
4. Configure service settings:
   - **Name:** `nexus-platform`
   - **Runtime:** `Docker` (or `Python 3`)
   - **Dockerfile Path:** `./Dockerfile`
   - **Plan:** Free
5. **Environment Variables**:
   - `PORT`: `10000`
   - `WHATSAPP_VERIFY_TOKEN`: `nexus_webhook_token_2026`
6. Click **Deploy Web Service**.
7. Once deployed, your platform is live at:
   `https://nexus-platform-xxxx.onrender.com`

---

## 📲 Live Webhook Configuration Guide

Once deployed to Render, configure your omnichannel integrations:

### 1. WhatsApp Cloud API / AWS End User Messaging
- **Callback URL:** `https://<YOUR-RENDER-SUBDOMAIN>.onrender.com/api/webhooks/whatsapp`
- **Verify Token:** `nexus_webhook_token_2026`
- **Verification Test (GET):**
  ```bash
  curl "https://<YOUR-RENDER-SUBDOMAIN>.onrender.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=nexus_webhook_token_2026&hub.challenge=11223344"
  ```
  Expected output: `11223344`

- **Send Live Message (POST):**
  ```bash
  curl -X POST "https://<YOUR-RENDER-SUBDOMAIN>.onrender.com/api/webhooks/whatsapp" \
       -H "Content-Type: application/json" \
       -d '{"from": "+36301234567", "text": "Can you check the datacenter cooling alert?"}'
  ```

### 2. SMS Gateway / Twilio
- **SMS Webhook URL:** `https://<YOUR-RENDER-SUBDOMAIN>.onrender.com/api/webhooks/sms`
- **Send SMS Payload (POST):**
  ```bash
  curl -X POST "https://<YOUR-RENDER-SUBDOMAIN>.onrender.com/api/webhooks/sms" \
       -H "Content-Type: application/json" \
       -d '{"from": "+15551234567", "body": "Critical rack temperature warning status"}'
  ```

---

## 🧪 Local Quickstart & Testing

### 1. Run Complete Test Suite
```powershell
py -m pytest tests/ -v
```

### 2. Windows 1-Click Launch
Double-click `start.bat` in the root folder to start both FastAPI (port 8000) and the React Frontend (port 3000) concurrently.

### 3. Production Build
```powershell
npm run build
py -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000
```
Open [http://localhost:8000](http://localhost:8000) to view the integrated full-stack application.
