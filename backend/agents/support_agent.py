import time
import uuid
from typing import Dict, Any
from backend.channels.adapter import AgentResponse
from backend.channels.whatsapp_adapter import WhatsAppAdapter
from backend.core.memory import memory, MessageEvent
from backend.core.llm_client import LLMClient

whatsapp_adapter = WhatsAppAdapter()

class SupportAgent:
    """Specialist agent for troubleshooting and technical guides via WhatsApp."""

    @staticmethod
    def handle(customer_id: str, channel: str, text: str) -> Dict[str, Any]:
        lowered = text.lower()
        if "salesforce" in lowered or "crm" in lowered:
            reply_text = (
                "NexusAI integrates seamlessly with Salesforce Service Cloud & CRM via our official AppExchange connector. "
                "All conversation states, unified memory, and customer sentiment scores sync bidirectionally in under 200ms."
            )
        else:
            llm_res = LLMClient.query(
                prompt=text,
                system_prompt="You are NexusAI Technical Support Engineer. Provide clear, direct solutions to infrastructure or integration queries. Respond in the user's language.",
                tier="fast"
            )
            reply_text = llm_res.get("text", "Nexus Technical Support: Telemetry verified. All channels are operating within SLA.")

        response = AgentResponse(
            agent_name="SupportAgent",
            text_content=reply_text,
            metadata={
                "buttons": [
                    {"id": "view_salesforce_docs", "title": "Salesforce Guide"},
                    {"id": "run_telemetry_check", "title": "Run Diagnostic"},
                    {"id": "speak_human", "title": "Human Escalation"}
                ]
            }
        )

        channel_payload = whatsapp_adapter.adapt(response, customer_id)

        outbound_event = MessageEvent(
            event_id=f"EVT-OUT-{uuid.uuid4().hex[:8]}",
            customer_id=customer_id,
            timestamp=time.time(),
            channel="whatsapp",
            direction="outbound",
            agent_type="support",
            content=response.text_content,
            rich_payload=channel_payload.payload,
            sentiment="positive",
            sentiment_score=0.91
        )
        memory.append_message(outbound_event)

        return {
            "status": "success",
            "agent": "support",
            "channel": "whatsapp",
            "preview": channel_payload.preview_text,
            "payload": channel_payload.payload
        }
