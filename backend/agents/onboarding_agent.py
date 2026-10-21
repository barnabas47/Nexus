import time
import uuid
from typing import Dict, Any
from backend.channels.adapter import AgentResponse
from backend.channels.ses_adapter import SESAdapter
from backend.core.memory import memory, MessageEvent

ses_adapter = SESAdapter()

class OnboardingAgent:
    """Specialist agent for account setup, verification, and welcome guides via SES."""

    @staticmethod
    def handle(customer_id: str, channel: str, text: str) -> Dict[str, Any]:
        reply_text = (
            "Welcome to NexusAI Enterprise! Your high-availability omnichannel communications cluster is active. "
            "We have provisioned your dedicated AWS EUM phone pool and linked your Bedrock AgentCore workspace. "
            "Review your setup documentation and security credentials in your secure portal."
        )

        response = AgentResponse(
            agent_name="OnboardingAgent",
            text_content=reply_text,
            metadata={
                "subject": "Welcome to NexusAI — Your Omnichannel Agent Cluster is Live"
            }
        )

        channel_payload = ses_adapter.adapt(response, customer_id)

        outbound_event = MessageEvent(
            event_id=f"EVT-OUT-{uuid.uuid4().hex[:8]}",
            customer_id=customer_id,
            timestamp=time.time(),
            channel="ses",
            direction="outbound",
            agent_type="onboarding",
            content=response.text_content,
            rich_payload=channel_payload.payload,
            sentiment="positive",
            sentiment_score=0.96
        )
        memory.append_message(outbound_event)

        return {
            "status": "success",
            "agent": "onboarding",
            "channel": "ses",
            "preview": channel_payload.preview_text,
            "payload": channel_payload.payload
        }
