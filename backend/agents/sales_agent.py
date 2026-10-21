import time
import uuid
from typing import Dict, Any
from backend.channels.adapter import AgentResponse
from backend.channels.rcs_adapter import RCSAdapter
from backend.channels.sms_adapter import SMSAdapter
from backend.core.memory import memory, MessageEvent
from backend.core.llm_client import LLMClient

rcs_adapter = RCSAdapter()
sms_adapter = SMSAdapter()

class SalesAgent:
    """Specialist agent for product discovery, quotes, and pricing via AWS EUM RCS."""

    @staticmethod
    def handle(customer_id: str, channel: str, text: str) -> Dict[str, Any]:
        llm_res = LLMClient.query(
            prompt=text,
            system_prompt="You are NexusAI Enterprise Sales Specialist. Provide helpful, concise information on packages, pricing, and infrastructure. Respond in the customer's language.",
            tier="fast"
        )
        reply_text = llm_res.get("text", "Here are the tailored enterprise communication packages for your infrastructure:")

        lowered = text.lower()
        needs_cards = any(w in lowered for w in ["pricing", "cost", "quote", "catalog", "buy", "plan", "package", "ár", "árak", "csomag", "mennyibe", "tier"])

        cards = [
            {
                "title": "Nexus Enterprise Cloud",
                "description": "Unlimited RCS/WhatsApp sessions, dedicated Bedrock AgentCore microVM, 99.99% SLA.",
                "media_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
                "price": "$499/mo",
                "buttons": [
                    {"type": "action", "label": "Select Enterprise Plan", "postback": "select_enterprise"},
                    {"type": "action", "label": "Book Solutions Architect", "postback": "schedule_demo"}
                ]
            },
            {
                "title": "Nexus Growth Suite",
                "description": "Up to 50k monthly sessions, auto fallback to SMS, standard Bedrock agent runtime.",
                "media_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
                "price": "$199/mo",
                "buttons": [
                    {"type": "action", "label": "Select Growth Plan", "postback": "select_growth"}
                ]
            }
        ] if needs_cards else []

        metadata = {"cards": cards} if cards else {}

        response = AgentResponse(
            agent_name="SalesAgent",
            text_content=reply_text,
            metadata=metadata
        )

        # Adapt payload to requested channel
        target_channel = channel if channel in ["rcs", "sms"] else "rcs"
        if target_channel == "rcs":
            channel_payload = rcs_adapter.adapt(response, customer_id)
        else:
            channel_payload = sms_adapter.adapt(response, customer_id)

        # Record outbound message event
        outbound_event = MessageEvent(
            event_id=f"EVT-OUT-{uuid.uuid4().hex[:8]}",
            customer_id=customer_id,
            timestamp=time.time(),
            channel=target_channel,
            direction="outbound",
            agent_type="sales",
            content=response.text_content,
            rich_payload=channel_payload.payload,
            sentiment="positive",
            sentiment_score=0.92
        )
        memory.append_message(outbound_event)

        return {
            "status": "success",
            "agent": "sales",
            "channel": target_channel,
            "preview": channel_payload.preview_text,
            "payload": channel_payload.payload
        }
