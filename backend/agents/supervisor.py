import time
import uuid
from typing import Dict, Any, Tuple
from backend.channels.adapter import AgentResponse
from backend.channels.rcs_adapter import RCSAdapter
from backend.channels.sms_adapter import SMSAdapter
from backend.channels.whatsapp_adapter import WhatsAppAdapter
from backend.channels.ses_adapter import SESAdapter
from backend.core.memory import memory, MessageEvent
from backend.core.gates import InteractionBudgetGate, SentimentEscalationGate, PromptInjectionDefenseGate
from backend.core.sentiment import SentimentAnalyzer

rcs_adapter = RCSAdapter()
sms_adapter = SMSAdapter()
whatsapp_adapter = WhatsAppAdapter()
ses_adapter = SESAdapter()

class SupervisorAgent:
    """Central orchestrator routing requests across specialized agents."""

    @staticmethod
    def process_incoming_message(customer_id: str, channel: str, text: str) -> Dict[str, Any]:
        # Step 1: Adversarial defense code gate
        is_safe, defense_reason = PromptInjectionDefenseGate.check(customer_id, text, agent_type="supervisor")
        if not is_safe:
            return {
                "status": "rejected",
                "reason": defense_reason,
                "agent_selected": "supervisor"
            }

        # Step 2: Sentiment analysis
        sentiment_label, sentiment_score = SentimentAnalyzer.analyze(text)

        # Step 3: Record inbound message into unified memory
        inbound_event = MessageEvent(
            event_id=f"EVT-IN-{uuid.uuid4().hex[:8]}",
            customer_id=customer_id,
            timestamp=time.time(),
            channel=channel,
            direction="inbound",
            agent_type="supervisor",
            content=text,
            sentiment=sentiment_label,
            sentiment_score=sentiment_score
        )
        memory.append_message(inbound_event)

        # Step 4: Check Sentiment Escalation Code Gate
        is_escalated, escalation_msg = SentimentEscalationGate.check(customer_id, sentiment_score)
        if is_escalated:
            outbound_event = MessageEvent(
                event_id=f"EVT-OUT-{uuid.uuid4().hex[:8]}",
                customer_id=customer_id,
                timestamp=time.time(),
                channel=channel,
                direction="outbound",
                agent_type="human",
                content=f"Priority support alert: A human engineering lead has been summoned to take over this conversation. {escalation_msg}",
                sentiment="neutral",
                sentiment_score=0.5
            )
            memory.append_message(outbound_event)
            return {
                "status": "escalated_to_human",
                "message": outbound_event.content,
                "sentiment_score": sentiment_score
            }

        # Step 5: Intent Classification & Agent Delegation
        agent_type = SupervisorAgent.classify_intent(text)
        
        # Dispatch to specialist
        return SupervisorAgent.dispatch(customer_id, channel, agent_type, text)

    @staticmethod
    def classify_intent(text: str) -> str:
        lowered = text.lower()
        if any(w in lowered for w in ["help", "error", "issue", "bug", "integrate", "integration", "salesforce", "broken", "troubleshoot", "faq", "hiba", "gond", "probléma"]):
            return "support"
        elif any(w in lowered for w in ["pricing", "cost", "quote", "catalog", "buy", "plan", "package", "árak", "csomag", "mennyibe"]):
            return "sales"
        elif any(w in lowered for w in ["start", "welcome", "onboard", "setup", "kyc", "register", "regisztráció"]):
            return "onboarding"
        return "supervisor"

    @staticmethod
    def dispatch(customer_id: str, channel: str, agent_type: str, text: str) -> Dict[str, Any]:
        profile = memory.get_profile(customer_id)
        profile.agent_assignments[agent_type] = "active"
        memory.save_profile(profile)

        if agent_type == "sales":
            from backend.agents.sales_agent import SalesAgent
            return SalesAgent.handle(customer_id, channel, text)
        elif agent_type == "support":
            from backend.agents.support_agent import SupportAgent
            return SupportAgent.handle(customer_id, channel, text)
        elif agent_type == "onboarding":
            from backend.agents.onboarding_agent import OnboardingAgent
            return OnboardingAgent.handle(customer_id, channel, text)
        else:
            # Default / General Supervisor with contextual AI
            from backend.core.llm_client import LLMClient
            llm_res = LLMClient.query(
                prompt=text,
                system_prompt="You are NexusAI Enterprise Operations Supervisor. Provide concise, direct answers. Respond in the user's language.",
                tier="fast"
            )
            reply_text = llm_res.get("text", "NexusAI Omnichannel Platform active. How can I assist you?")

            response = AgentResponse(
                agent_name="SupervisorAgent",
                text_content=reply_text,
                metadata={}
            )

            target_channel = channel if channel in ["rcs", "whatsapp", "sms", "ses"] else "rcs"
            if target_channel == "whatsapp":
                channel_payload = whatsapp_adapter.adapt(response, customer_id)
            elif target_channel == "sms":
                channel_payload = sms_adapter.adapt(response, customer_id)
            elif target_channel == "ses":
                channel_payload = ses_adapter.adapt(response, customer_id)
            else:
                channel_payload = rcs_adapter.adapt(response, customer_id)

            outbound_event = MessageEvent(
                event_id=f"EVT-OUT-{uuid.uuid4().hex[:8]}",
                customer_id=customer_id,
                timestamp=time.time(),
                channel=target_channel,
                direction="outbound",
                agent_type="supervisor",
                content=response.text_content,
                rich_payload=channel_payload.payload,
                sentiment="positive",
                sentiment_score=0.95
            )
            memory.append_message(outbound_event)

            return {
                "status": "success",
                "agent": "supervisor",
                "channel": target_channel,
                "preview": channel_payload.preview_text,
                "payload": channel_payload.payload
            }
