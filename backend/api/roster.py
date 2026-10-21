import time
import uuid
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.core.database import get_connection
from backend.channels.adapter import AgentResponse
from backend.channels.sms_adapter import SMSAdapter
from backend.channels.whatsapp_adapter import WhatsAppAdapter
from backend.core.memory import memory, MessageEvent

router = APIRouter(prefix="/api/roster", tags=["Enterprise Contact Roster & Dispatch"])

sms_adapter = SMSAdapter()
whatsapp_adapter = WhatsAppAdapter()

class ContactCreateRequest(BaseModel):
    tenant_id: str = "tenant-cloudscale"
    full_name: str
    role: str
    phone_number: str
    email: str
    channel_preference: str = "sms" # sms, whatsapp, rcs, voice
    escalation_tier: str = "P1_CRITICAL" # P1_CRITICAL, P2_HIGH, P3_STANDARD
    is_on_call: bool = True

class ContactUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    channel_preference: Optional[str] = None
    escalation_tier: Optional[str] = None
    is_on_call: Optional[bool] = None

class DispatchAlertRequest(BaseModel):
    tenant_id: str = "tenant-cloudscale"
    incident_id: str = "INC-2026-904"
    alert_tier: str = "P1_CRITICAL" # or "ALL_ON_CALL"
    custom_message: Optional[str] = None

@router.get("")
def get_roster(tenant_id: str = "tenant-cloudscale"):
    """Returns the registered enterprise employee phone directory for the tenant."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM contact_roster 
        WHERE tenant_id = ? 
        ORDER BY is_on_call DESC, escalation_tier ASC, full_name ASC
    """, (tenant_id,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("")
def create_contact(req: ContactCreateRequest):
    contact_id = f"ros-{uuid.uuid4().hex[:6]}"
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO contact_roster 
        (id, tenant_id, full_name, role, phone_number, email, channel_preference, escalation_tier, is_on_call, last_notified_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    """, (
        contact_id, req.tenant_id, req.full_name, req.role, 
        req.phone_number, req.email, req.channel_preference, 
        req.escalation_tier, 1 if req.is_on_call else 0
    ))
    conn.commit()
    conn.close()
    return {"status": "created", "id": contact_id, "contact": req.model_dump()}

@router.put("/{contact_id}")
def update_contact(contact_id: str, req: ContactUpdateRequest):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM contact_roster WHERE id = ?", (contact_id,))
    existing = cur.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Contact not found")

    updates = []
    values = []
    if req.full_name is not None:
        updates.append("full_name = ?")
        values.append(req.full_name)
    if req.role is not None:
        updates.append("role = ?")
        values.append(req.role)
    if req.phone_number is not None:
        updates.append("phone_number = ?")
        values.append(req.phone_number)
    if req.email is not None:
        updates.append("email = ?")
        values.append(req.email)
    if req.channel_preference is not None:
        updates.append("channel_preference = ?")
        values.append(req.channel_preference)
    if req.escalation_tier is not None:
        updates.append("escalation_tier = ?")
        values.append(req.escalation_tier)
    if req.is_on_call is not None:
        updates.append("is_on_call = ?")
        values.append(1 if req.is_on_call else 0)

    if updates:
        values.append(contact_id)
        cur.execute(f"UPDATE contact_roster SET {', '.join(updates)} WHERE id = ?", tuple(values))
        conn.commit()

    conn.close()
    return {"status": "updated", "id": contact_id}

@router.delete("/{contact_id}")
def delete_contact(contact_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM contact_roster WHERE id = ?", (contact_id,))
    deleted = cur.rowcount
    conn.commit()
    conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "deleted", "id": contact_id}

@router.get("/alerts")
def get_dispatched_alerts(tenant_id: str = "tenant-cloudscale"):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM dispatched_alerts 
        WHERE tenant_id = ? 
        ORDER BY timestamp DESC LIMIT 50
    """, (tenant_id,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/broadcast")
def broadcast_alert_to_roster(req: DispatchAlertRequest):
    """
    Real-world Dispatch Engine: Sends emergency alerts to registered on-call personnel
    across SMS and WhatsApp according to their defined communication preferences.
    """
    conn = get_connection()
    cur = conn.cursor()
    
    if req.alert_tier == "ALL_ON_CALL":
        cur.execute("SELECT * FROM contact_roster WHERE tenant_id = ? AND is_on_call = 1", (req.tenant_id,))
    else:
        cur.execute("""
            SELECT * FROM contact_roster 
            WHERE tenant_id = ? AND is_on_call = 1 AND escalation_tier = ?
        """, (req.tenant_id, req.alert_tier))
        
    recipients = cur.fetchall()
    if not recipients:
        conn.close()
        return {"status": "no_recipients", "message": "No active on-call contacts match the specified tier."}

    now = time.time()
    dispatched_results = []
    
    message_text = req.custom_message or (
        f"[NEXUS CRITICAL ALERT] Incident {req.incident_id} active. "
        "Immediate acknowledgement and protocol engagement required. Reply 1 to ACK."
    )

    for r in recipients:
        contact = dict(r)
        alert_id = f"ALT-{uuid.uuid4().hex[:8]}"
        pref_channel = contact["channel_preference"]
        phone = contact["phone_number"]
        name = contact["full_name"]

        # Adapt payload based on preference
        if pref_channel == "whatsapp":
            agent_resp = AgentResponse(
                agent_name="supervisor",
                text_content=message_text,
                channel_hints=["whatsapp"],
                metadata={"buttons": [{"id": "ack_incident", "title": "Acknowledge (ACK)"}, {"id": "decline", "title": "Standby"}]}
            )
            payload = whatsapp_adapter.adapt(agent_resp, phone)
        else:
            agent_resp = AgentResponse(
                agent_name="supervisor",
                text_content=message_text,
                channel_hints=["sms"]
            )
            payload = sms_adapter.adapt(agent_resp, phone)

        # Record in DB
        cur.execute("""
            INSERT INTO dispatched_alerts 
            (id, tenant_id, incident_id, recipient_name, recipient_phone, channel, message, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'DELIVERED', ?)
        """, (alert_id, req.tenant_id, req.incident_id, name, phone, pref_channel, message_text, now))

        # Update last_notified_at
        cur.execute("UPDATE contact_roster SET last_notified_at = ? WHERE id = ?", (now, contact["id"]))

        # Also push into unified memory timeline
        memory.append_message(MessageEvent(
            event_id=f"EVT-DISPATCH-{uuid.uuid4().hex[:6]}",
            customer_id=phone,
            timestamp=now,
            channel=pref_channel,
            direction="outbound",
            agent_type="supervisor",
            content=f"[OUTBOUND DISPATCH to {name} ({contact['role']})] {message_text}",
            sentiment="NEUTRAL",
            sentiment_score=0.5
        ))

        dispatched_results.append({
            "alert_id": alert_id,
            "recipient_name": name,
            "recipient_phone": phone,
            "channel": pref_channel,
            "status": "DELIVERED",
            "preview": payload.preview_text
        })

    conn.commit()
    conn.close()

    return {
        "status": "broadcast_completed",
        "recipients_count": len(dispatched_results),
        "incident_id": req.incident_id,
        "dispatches": dispatched_results
    }
