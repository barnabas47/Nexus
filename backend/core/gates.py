import uuid
import time
from typing import Tuple, Optional
from backend.core.memory import memory, RejectionRecord
from backend.core.config import settings

class InteractionBudgetGate:
    """Champion Rule #2: Deterministic Code Gate - limits proactive outbound reaches."""
    @staticmethod
    def check(customer_id: str, action: str, intent: str = "outbound_contact") -> Tuple[bool, Optional[str]]:
        profile = memory.get_profile(customer_id)
        if profile.interaction_budget_remaining <= 0:
            rejection_id = f"REJ-{int(time.time()*1000)}-{uuid.uuid4().hex[:4]}"
            rejection = RejectionRecord(
                id=rejection_id,
                customer_id=customer_id,
                agent_type="supervisor",
                reason="interaction_budget_exceeded",
                original_intent=intent,
                action_blocked=f"Blocked {action}: daily interaction budget (max {settings.MAX_DAILY_INTERACTIONS}) exhausted."
            )
            memory.add_rejection(rejection)
            return False, "Daily interaction budget exhausted. Silence preserved."
        
        # Deduct 1 proactive interaction budget on approval
        profile.interaction_budget_remaining -= 1
        memory.save_profile(profile)
        return True, None

class SentimentEscalationGate:
    """Champion Rule #2: Forces human escalation if sentiment drops below threshold."""
    @staticmethod
    def check(customer_id: str, sentiment_score: float) -> Tuple[bool, Optional[str]]:
        if sentiment_score < settings.SENTIMENT_ESCALATION_THRESHOLD:
            # Force auto-escalate
            profile = memory.get_profile(customer_id)
            profile.agent_assignments["support"] = "escalated_human"
            memory.save_profile(profile)
            return True, "Triggered emergency Human-in-the-loop escalation due to critical negative sentiment."
        return False, None

class PromptInjectionDefenseGate:
    """Red-team adversary detection: Blocks prompt injection and adversarial attacks."""
    BLOCKED_PATTERNS = [
        "ignore previous instructions",
        "system prompt",
        "jailbreak",
        "dan mode",
        "bypass rules",
        "drop table",
        "admin access override"
    ]

    @staticmethod
    def check(customer_id: str, text: str, agent_type: str = "supervisor") -> Tuple[bool, Optional[str]]:
        lowered = text.lower()
        for pattern in PromptInjectionDefenseGate.BLOCKED_PATTERNS:
            if pattern in lowered:
                rejection_id = f"REJ-SEC-{int(time.time()*1000)}"
                rejection = RejectionRecord(
                    id=rejection_id,
                    customer_id=customer_id,
                    agent_type=agent_type,
                    reason="prompt_injection_attempt",
                    original_intent=f"Exploit attempt: '{pattern}'",
                    action_blocked=f"Blocked unauthorized system manipulation: pattern '{pattern}' flagged."
                )
                memory.add_rejection(rejection)
                return False, f"Adversarial security violation detected ('{pattern}'). Action neutralized."
        return True, None
