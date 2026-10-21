from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class Tenant(BaseModel):
    id: str
    name: str
    region: str
    tier: str
    sla_level: str
    active_incidents: int

class UserContext(BaseModel):
    user_id: str
    name: str
    role: str # INCIDENT_COMMANDER, FIELD_ENGINEER, COMPLIANCE_AUDITOR
    permissions: List[str]

TENANTS = {
    "tenant-cloudscale": Tenant(
        id="tenant-cloudscale",
        name="CloudScale Datacenters Inc. (Tier-4 Infrastructure)",
        region="eu-central-1 (Frankfurt)",
        tier="ENTERPRISE_MISSION_CRITICAL",
        sla_level="99.999%",
        active_incidents=1
    ),
    "tenant-apex-health": Tenant(
        id="tenant-apex-health",
        name="Apex Health Systems (Clinical Network)",
        region="us-east-1 (N. Virginia)",
        tier="HIPAA_REGULATED_ENTERPRISE",
        sla_level="99.99%",
        active_incidents=0
    )
}

ROLES = {
    "INCIDENT_COMMANDER": UserContext(
        user_id="usr-ic-890",
        name="Sarah Chen (VP of Critical Infrastructure)",
        role="INCIDENT_COMMANDER",
        permissions=["ALL", "EXECUTE_FINANCIAL_SIGNOFF", "OVERRIDE_VETO", "A2A_EXECUTE"]
    ),
    "FIELD_ENGINEER": UserContext(
        user_id="usr-fe-112",
        name="Marcus Vance (Lead HVAC Field Tech)",
        role="FIELD_ENGINEER",
        permissions=["REPORT_INCIDENT", "VIEW_TELEMETRY", "SUBMIT_DIAGNOSTICS"]
    ),
    "COMPLIANCE_AUDITOR": UserContext(
        user_id="usr-aud-007",
        name="Dr. Aris Thorne (ISO / SOC 2 Lead Auditor)",
        role="COMPLIANCE_AUDITOR",
        permissions=["VIEW_AUDIT_LOGS", "VERIFY_CRYPTO_HASHES", "EXPORT_REPORT"]
    )
}
