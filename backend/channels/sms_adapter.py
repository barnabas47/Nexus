from backend.channels.adapter import BaseChannelAdapter, AgentResponse, ChannelPayload

class SMSAdapter(BaseChannelAdapter):
    """Adapter for AWS EUM SMS (Graceful degradation, concise text + shortlink)."""
    def adapt(self, response: AgentResponse, recipient: str) -> ChannelPayload:
        shortlink = "https://nxus.ai/d/9x"
        clean_text = response.text_content.replace("\n", " ").strip()
        if len(clean_text) > 130:
            clean_text = clean_text[:127] + "..."
        sms_body = f"{clean_text} View details: {shortlink} (Reply STOP to opt-out)"

        return ChannelPayload(
            channel="sms",
            recipient=recipient,
            payload={
                "type": "sms_text",
                "sender_id": "NexusAI",
                "body": sms_body,
                "character_count": len(sms_body)
            },
            preview_text=sms_body
        )
