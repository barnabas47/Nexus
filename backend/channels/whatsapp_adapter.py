from backend.channels.adapter import BaseChannelAdapter, AgentResponse, ChannelPayload

class WhatsAppAdapter(BaseChannelAdapter):
    """Adapter for AWS EUM Social WhatsApp interactive and media messages."""
    def adapt(self, response: AgentResponse, recipient: str) -> ChannelPayload:
        quick_replies = response.metadata.get("buttons", [
            {"id": "faq_docs", "title": "Integration Docs"},
            {"id": "agent_chat", "title": "Speak with Specialist"}
        ])

        payload = {
            "type": "whatsapp_interactive",
            "messaging_product": "whatsapp",
            "interactive": {
                "type": "button",
                "body": {"text": response.text_content},
                "action": {
                    "buttons": [
                        {"type": "reply", "reply": {"id": b["id"], "title": b["title"]}}
                        for b in quick_replies
                    ]
                }
            }
        }

        return ChannelPayload(
            channel="whatsapp",
            recipient=recipient,
            payload=payload,
            preview_text=f"[WhatsApp Interactive] {response.text_content}"
        )
