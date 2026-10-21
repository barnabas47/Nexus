from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel

class AgentResponse(BaseModel):
    agent_name: str
    text_content: str
    metadata: Dict[str, Any] = {}
    suggested_actions: list = []

class ChannelPayload(BaseModel):
    channel: str # "rcs" | "sms" | "whatsapp" | "ses"
    recipient: str
    payload: Dict[str, Any]
    preview_text: str

class BaseChannelAdapter(ABC):
    @abstractmethod
    def adapt(self, response: AgentResponse, recipient: str) -> ChannelPayload:
        pass
