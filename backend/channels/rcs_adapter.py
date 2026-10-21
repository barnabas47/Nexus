from typing import List, Dict, Any
from backend.channels.adapter import BaseChannelAdapter, AgentResponse, ChannelPayload

class RCSAdapter(BaseChannelAdapter):
    """Adapter for AWS EUM RCS rich cards, carousels, and action chips."""
    def adapt(self, response: AgentResponse, recipient: str) -> ChannelPayload:
        cards = response.metadata.get("cards", [])
        if not cards:
            cards = [
                {
                    "title": "Nexus Enterprise Solution",
                    "description": response.text_content,
                    "media_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
                    "buttons": [
                        {"type": "action", "label": "Explore Enterprise Plan", "postback": "select_tier_enterprise"},
                        {"type": "action", "label": "Schedule Architecture Review", "postback": "schedule_demo"}
                    ]
                }
            ]

        chips = response.metadata.get("chips", [
            {"label": "Enterprise Tier ($499/mo)", "data": "tier_ent"},
            {"label": "Growth Tier ($199/mo)", "data": "tier_growth"},
            {"label": "Talk to Specialist", "data": "talk_human"}
        ])

        payload = {
            "type": "rcs_carousel",
            "sender": "NexusAI Official Bot",
            "cards": cards,
            "suggested_replies": chips
        }

        return ChannelPayload(
            channel="rcs",
            recipient=recipient,
            payload=payload,
            preview_text=f"[RCS Rich Carousel] {len(cards)} interactive card(s): {response.text_content[:60]}..."
        )
