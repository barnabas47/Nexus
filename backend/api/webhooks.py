import logging
import os
from fastapi import APIRouter, Request, Response, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.agents.supervisor import SupervisorAgent
from backend.core.memory import memory

logger = logging.getLogger("NexusWebhooks")
router = APIRouter(prefix="/api/webhooks", tags=["Omnichannel Webhooks (WhatsApp & SMS)"])

WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "nexus_webhook_token_2026")

class GenericSMSPayload(BaseModel):
    from_number: Optional[str] = None
    From: Optional[str] = None
    body: Optional[str] = None
    Body: Optional[str] = None
    to: Optional[str] = None

@router.get("/whatsapp")
def verify_whatsapp_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """
    Meta WhatsApp Cloud API / AWS EUM Webhook Handshake Verification.
    When registering the webhook in Meta App Dashboard or AWS End User Messaging,
    Meta makes a GET request with hub.mode=subscribe and hub.verify_token.
    """
    if hub_mode == "subscribe" and hub_verify_token == WHATSAPP_VERIFY_TOKEN:
        logger.info("[WhatsApp Webhook] Verification successful!")
        return Response(content=hub_challenge or "", media_type="text/plain")
    
    # Return 200 anyway for testing if no params provided
    if not hub_mode:
        return {
            "status": "active",
            "webhook": "WhatsApp Cloud API & AWS EUM Social Adapter",
            "hint": "Configure Meta Webhook with verify_token: " + WHATSAPP_VERIFY_TOKEN
        }

    raise HTTPException(status_code=403, detail="Verification token mismatch")

@router.post("/whatsapp")
async def receive_whatsapp_message(request: Request):
    """
    Receives incoming WhatsApp messages from Meta / AWS End User Messaging.
    Routes to NexusCore Supervisor Agent and records in Unified Memory.
    """
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    customer_id = "+1-555-WHATSAPP"
    text = ""

    # Parse standard Meta Cloud API webhook structure
    try:
        entries = data.get("entry", [])
        if entries:
            changes = entries[0].get("changes", [])
            if changes:
                value = changes[0].get("value", {})
                messages = value.get("messages", [])
                if messages:
                    msg = messages[0]
                    customer_id = msg.get("from", customer_id)
                    if msg.get("type") == "text":
                        text = msg.get("text", {}).get("body", "")
                    elif msg.get("type") == "interactive":
                        # Button click
                        interactive = msg.get("interactive", {})
                        if "button_reply" in interactive:
                            text = interactive["button_reply"].get("title", "")
    except Exception as e:
        logger.warning(f"Error parsing Meta structure: {e}, falling back to top-level fields")

    # Fallback to direct simulated JSON (e.g., {"from": "+1...", "text": "..."})
    if not text:
        text = data.get("text") or data.get("body") or data.get("message") or "Hello Nexus"
        customer_id = data.get("from") or data.get("customer_id") or customer_id

    # Route through supervisor agent
    agent_output = SupervisorAgent.process_incoming_message(
        customer_id=customer_id,
        channel="whatsapp",
        text=text
    )

    return {
        "status": "processed",
        "channel": "whatsapp",
        "sender": customer_id,
        "input": text,
        "response": agent_output
    }

@router.post("/sms")
async def receive_sms_message(request: Request):
    """
    Receives incoming SMS messages (Twilio webhook / AWS SNS HTTP / Custom gateway).
    Supports both JSON and application/x-www-form-urlencoded formats.
    """
    content_type = request.headers.get("content-type", "")
    customer_id = "+1-555-SMS"
    text = ""

    if "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        customer_id = form.get("From") or form.get("from") or customer_id
        text = form.get("Body") or form.get("body") or form.get("text") or ""
    else:
        try:
            data = await request.json()
            customer_id = data.get("from") or data.get("From") or data.get("customer_id") or customer_id
            text = data.get("body") or data.get("Body") or data.get("text") or ""
        except Exception:
            text = "Status inquiry"

    if not text:
        text = "Hello Nexus SMS"

    agent_output = SupervisorAgent.process_incoming_message(
        customer_id=customer_id,
        channel="sms",
        text=text
    )

    return {
        "status": "processed",
        "channel": "sms",
        "sender": customer_id,
        "input": text,
        "response": agent_output
    }

@router.get("/sms")
def sms_webhook_status():
    return {
        "status": "active",
        "webhook": "AWS EUM SMS & Twilio Webhook Receiver",
        "supported_methods": ["POST (form-urlencoded or JSON)"],
        "endpoint": "/api/webhooks/sms"
    }

@router.post("/simulate")
def simulate_incoming_event(channel: str = "whatsapp", customer_id: str = "+1-555-TEST", text: str = "Order status query"):
    """Developer testing endpoint to trigger an incoming webhook event."""
    result = SupervisorAgent.process_incoming_message(customer_id, channel, text)
    return {
        "status": "simulated",
        "channel": channel,
        "customer_id": customer_id,
        "message": text,
        "result": result
    }
