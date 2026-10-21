import time
import uuid
from typing import Dict, Any, List
from backend.core.memory import memory, MessageEvent, CustomerProfile
from backend.agents.onboarding_agent import OnboardingAgent
from backend.agents.sales_agent import SalesAgent
from backend.agents.support_agent import SupportAgent

class JudgeDemoOrchestrator:
    """Champion Rule #1: 1-Click Judge Scenario that executes the full 10-step multi-channel storyline."""

    @staticmethod
    def run_full_scenario() -> Dict[str, Any]:
        customer_id = "+1-555-DEMO"
        now = time.time()
        memory.clear()

        # Step 1: Initialize Profile
        profile = CustomerProfile(
            customer_id=customer_id,
            name="Alex Johnson (VP of Digital Ops)",
            channels_preferred=["ses", "sms", "rcs", "whatsapp"],
            sentiment_score=0.94,
            lifecycle_stage="evaluating_enterprise",
            agent_assignments={"onboarding": "done", "sales": "active", "support": "active"},
            interaction_budget_remaining=1,
            created_at=now - 25,
            updated_at=now
        )
        memory.save_profile(profile)

        # 10 Timeline Events (Omnichannel story)
        timeline_events: List[MessageEvent] = [
            # T0: Customer Account Provisioned
            MessageEvent(
                event_id="EVT-01",
                customer_id=customer_id,
                timestamp=now - 24,
                channel="ses",
                direction="outbound",
                agent_type="onboarding",
                content="Welcome to NexusAI Enterprise! Your AWS CDS cluster has been provisioned.",
                rich_payload={"subject": "Welcome to NexusAI — Setup Guide & Credentials"},
                sentiment="positive",
                sentiment_score=0.95
            ),
            # T1: Alex asks for CRM solution via SMS
            MessageEvent(
                event_id="EVT-02",
                customer_id=customer_id,
                timestamp=now - 20,
                channel="sms",
                direction="inbound",
                agent_type="supervisor",
                content="Hi! I need an enterprise CRM & customer messaging solution for 500k customers.",
                sentiment="positive",
                sentiment_score=0.88
            ),
            # T2: Supervisor routes to Sales Agent
            MessageEvent(
                event_id="EVT-03",
                customer_id=customer_id,
                timestamp=now - 18,
                channel="sms",
                direction="outbound",
                agent_type="supervisor",
                content="Intent: Enterprise Sales. Delegating context & conversation memory to SalesAgent.",
                sentiment="neutral",
                sentiment_score=0.80
            ),
            # T3: Sales Agent delivers RCS Rich Card Carousel
            MessageEvent(
                event_id="EVT-04",
                customer_id=customer_id,
                timestamp=now - 15,
                channel="rcs",
                direction="outbound",
                agent_type="sales",
                content="Here are the recommended packages for high-scale enterprise omnichannel communication:",
                rich_payload={
                    "type": "rcs_carousel",
                    "cards": [
                        {
                            "title": "Nexus Enterprise Cloud ($499/mo)",
                            "description": "Unlimited RCS/WhatsApp, Bedrock AgentCore MicroVM, 99.99% SLA.",
                            "badge": "RECOMMENDED"
                        },
                        {
                            "title": "Nexus Growth Suite ($199/mo)",
                            "description": "Up to 50k monthly sessions, auto fallback to SMS.",
                            "badge": "STANDARD"
                        }
                    ]
                },
                sentiment="positive",
                sentiment_score=0.96
            ),
            # T4: Alex clicks Enterprise Tier action chip
            MessageEvent(
                event_id="EVT-05",
                customer_id=customer_id,
                timestamp=now - 12,
                channel="rcs",
                direction="inbound",
                agent_type="sales",
                content="Action Tap: 'Select Enterprise Plan ($499/mo)'",
                sentiment="positive",
                sentiment_score=0.98
            ),
            # T5: Sales Agent confirms selection & triggers demo booking
            MessageEvent(
                event_id="EVT-06",
                customer_id=customer_id,
                timestamp=now - 10,
                channel="rcs",
                direction="outbound",
                agent_type="sales",
                content="Confirmed! Enterprise Cloud package reserved. Solutions Architect demo booked for tomorrow 10:00 AM EST.",
                sentiment="positive",
                sentiment_score=0.97
            ),
            # T6: Alex switches to WhatsApp with technical question
            MessageEvent(
                event_id="EVT-07",
                customer_id=customer_id,
                timestamp=now - 8,
                channel="whatsapp",
                direction="inbound",
                agent_type="supervisor",
                content="One quick technical question: Does this integrate seamlessly with Salesforce Service Cloud?",
                sentiment="neutral",
                sentiment_score=0.79
            ),
            # T7: Support Agent answers on WhatsApp without asking Alex to repeat context
            MessageEvent(
                event_id="EVT-08",
                customer_id=customer_id,
                timestamp=now - 5,
                channel="whatsapp",
                direction="outbound",
                agent_type="support",
                content="Yes Alex! NexusAI provides native bidirectional Salesforce Service Cloud synchronization in <200ms. All memory & transcripts sync automatically.",
                rich_payload={
                    "type": "whatsapp_interactive",
                    "action_buttons": ["View Salesforce Connector", "Run Diagnostic Check"]
                },
                sentiment="positive",
                sentiment_score=0.94
            ),
            # T8: Automated SES Case & Onboarding Summary
            MessageEvent(
                event_id="EVT-09",
                customer_id=customer_id,
                timestamp=now - 2,
                channel="ses",
                direction="outbound",
                agent_type="onboarding",
                content="Executive Summary & Onboarding Plan: Enterprise Cluster + Salesforce Connector active.",
                rich_payload={"subject": "Executive Summary: Enterprise Setup & Calendar Invite"},
                sentiment="positive",
                sentiment_score=0.96
            ),
            # T9: Live sync complete
            MessageEvent(
                event_id="EVT-10",
                customer_id=customer_id,
                timestamp=now,
                channel="rcs",
                direction="outbound",
                agent_type="supervisor",
                content="Nexus Omnichannel Sync: All 4 channels (RCS, WhatsApp, SMS, SES) synchronised under unified customer profile.",
                sentiment="positive",
                sentiment_score=0.99
            )
        ]

        for evt in timeline_events:
            memory.append_message(evt)

        return {
            "status": "scenario_loaded",
            "events_count": len(timeline_events),
            "customer_id": customer_id,
            "profile": profile.model_dump()
        }
