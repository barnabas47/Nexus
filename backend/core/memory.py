import time
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class CustomerProfile(BaseModel):
    customer_id: str
    name: str = "Anonymous"
    channels_preferred: List[str] = Field(default_factory=lambda: ["whatsapp", "rcs", "sms", "ses"])
    sentiment_score: float = 0.85
    lifecycle_stage: str = "active"
    agent_assignments: Dict[str, str] = Field(
        default_factory=lambda: {"onboarding": "idle", "sales": "idle", "support": "idle"}
    )
    interaction_budget_remaining: int = 2
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

class MessageEvent(BaseModel):
    event_id: str
    customer_id: str
    timestamp: float = Field(default_factory=time.time)
    channel: str # "rcs" | "sms" | "whatsapp" | "ses"
    direction: str # "inbound" | "outbound"
    agent_type: str # "supervisor" | "onboarding" | "sales" | "support" | "human"
    content: str
    rich_payload: Optional[Dict[str, Any]] = None
    sentiment: str = "neutral"
    sentiment_score: float = 0.85
    status: str = "delivered"

class RejectionRecord(BaseModel):
    id: str
    timestamp: float = Field(default_factory=time.time)
    customer_id: str
    agent_type: str
    reason: str
    original_intent: str
    action_blocked: str
    overturned: bool = False

class MemoryStore:
    """Unified in-memory conversation memory with DynamoDB parity interface."""
    def __init__(self):
        self.profiles: Dict[str, CustomerProfile] = {}
        self.threads: Dict[str, List[MessageEvent]] = {}
        self.rejections: List[RejectionRecord] = []
        self._init_defaults()

    def _init_defaults(self):
        default_id = "+1-555-DEMO"
        self.profiles[default_id] = CustomerProfile(
            customer_id=default_id,
            name="Alex Johnson",
            channels_preferred=["whatsapp", "rcs", "sms", "ses"],
            sentiment_score=0.88,
            lifecycle_stage="active",
            agent_assignments={"onboarding": "done", "sales": "active", "support": "idle"},
            interaction_budget_remaining=2
        )
        self.threads[default_id] = []

    def get_profile(self, customer_id: str) -> CustomerProfile:
        if customer_id not in self.profiles:
            self.profiles[customer_id] = CustomerProfile(customer_id=customer_id)
            self.threads[customer_id] = []
        return self.profiles[customer_id]

    def save_profile(self, profile: CustomerProfile):
        profile.updated_at = time.time()
        self.profiles[profile.customer_id] = profile

    def append_message(self, event: MessageEvent):
        if event.customer_id not in self.threads:
            self.threads[event.customer_id] = []
        self.threads[event.customer_id].append(event)
        # Update customer profile updated_at
        if event.customer_id in self.profiles:
            self.profiles[event.customer_id].updated_at = time.time()

    def get_timeline(self, customer_id: Optional[str] = None) -> List[MessageEvent]:
        if customer_id:
            return self.threads.get(customer_id, [])
        all_events: List[MessageEvent] = []
        for events in self.threads.values():
            all_events.extend(events)
        all_events.sort(key=lambda x: x.timestamp)
        return all_events

    def add_rejection(self, rejection: RejectionRecord):
        self.rejections.insert(0, rejection)

    def get_rejections(self) -> List[RejectionRecord]:
        return self.rejections

    def overturn_rejection(self, rejection_id: str) -> bool:
        for r in self.rejections:
            if r.id == rejection_id:
                r.overturned = True
                return True
        return False

    def clear(self):
        self.profiles.clear()
        self.threads.clear()
        self.rejections.clear()
        self._init_defaults()

memory = MemoryStore()
