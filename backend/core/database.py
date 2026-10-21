import sqlite3
import os
import json
import time
import uuid
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "nexus_enterprise.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # Tenants table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT NOT NULL,
        region TEXT NOT NULL,
        tier TEXT NOT NULL,
        sla_level TEXT NOT NULL,
        created_at REAL NOT NULL
    )
    """)

    # Users table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        title TEXT NOT NULL,
        phone_number TEXT,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    """)

    # Contact Roster / Escalation Directory
    cur.execute("""
    CREATE TABLE IF NOT EXISTS contact_roster (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        email TEXT NOT NULL,
        channel_preference TEXT NOT NULL, -- sms, whatsapp, rcs, voice
        escalation_tier TEXT NOT NULL, -- P1_CRITICAL, P2_HIGH, P3_STANDARD
        is_on_call INTEGER NOT NULL DEFAULT 1,
        last_notified_at REAL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    """)

    # Dispatched Alerts Log
    cur.execute("""
    CREATE TABLE IF NOT EXISTS dispatched_alerts (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        incident_id TEXT,
        recipient_name TEXT NOT NULL,
        recipient_phone TEXT NOT NULL,
        channel TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL, -- QUEUED, SENT, DELIVERED, ACKNOWLEDGED
        timestamp REAL NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    """)

    # Incidents table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        title TEXT NOT NULL,
        severity TEXT NOT NULL, -- P0_EMERGENCY, P1_CRITICAL, P2_WARNING, P3_INFO
        status TEXT NOT NULL, -- ACTIVE, INVESTIGATING, MITIGATED, RESOLVED
        assigned_to TEXT,
        summary TEXT,
        created_at REAL NOT NULL,
        updated_at REAL NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
    """)

    conn.commit()

    # Seed initial enterprise data if empty
    cur.execute("SELECT COUNT(*) as count FROM tenants")
    if cur.fetchone()["count"] == 0:
        seed_enterprise_data(conn)

    conn.close()

def seed_enterprise_data(conn):
    cur = conn.cursor()
    now = time.time()

    # 1. Tenants
    cur.execute("""
    INSERT INTO tenants VALUES 
    ('tenant-cloudscale', 'CloudScale Datacenters Inc.', 'Hyperscale Infrastructure', 'eu-central-1 (Frankfurt)', 'ENTERPRISE_MISSION_CRITICAL', '99.999%', ?)
    """, (now,))

    cur.execute("""
    INSERT INTO tenants VALUES 
    ('tenant-apexhealth', 'Apex Health Care Systems', 'Hospital & Clinical Telemetry', 'us-east-1 (N. Virginia)', 'HIPAA_REGULATED_ENTERPRISE', '99.99%', ?)
    """, (now,))

    # 2. Users (Password: password123 for all demo accounts)
    cur.execute("""
    INSERT INTO users VALUES
    ('usr-ic-890', 'tenant-cloudscale', 'sarah.chen@cloudscale.com', 'password123', 'Sarah Chen', 'INCIDENT_COMMANDER', 'VP of Critical Infrastructure', '+36301234567'),
    ('usr-fe-112', 'tenant-cloudscale', 'marcus.vance@cloudscale.com', 'password123', 'Marcus Vance', 'FIELD_ENGINEER', 'Lead SRE & HVAC Specialist', '+36309876543'),
    ('usr-cfo-404', 'tenant-cloudscale', 'david.ross@cloudscale.com', 'password123', 'David Ross', 'CFO_FINOPS_LEAD', 'Chief Financial Officer', '+15557890123'),
    ('usr-aud-007', 'tenant-apexhealth', 'aris.thorne@apexhealth.com', 'password123', 'Dr. Aris Thorne', 'COMPLIANCE_AUDITOR', 'Chief Security & Compliance Officer', '+15554567890')
    """)

    # 3. Contact Roster / Pre-defined emergency phone numbers
    cur.execute("""
    INSERT INTO contact_roster VALUES
    ('ros-001', 'tenant-cloudscale', 'Marcus Vance', 'Primary On-Call SRE', '+36309876543', 'marcus.vance@cloudscale.com', 'sms', 'P1_CRITICAL', 1, ?),
    ('ros-002', 'tenant-cloudscale', 'Sarah Chen', 'Incident Commander (VP)', '+36301234567', 'sarah.chen@cloudscale.com', 'whatsapp', 'P1_CRITICAL', 1, ?),
    ('ros-003', 'tenant-cloudscale', 'David Ross', 'CFO & Budget Authorizer', '+15557890123', 'david.ross@cloudscale.com', 'whatsapp', 'P2_HIGH', 1, NULL),
    ('ros-004', 'tenant-cloudscale', 'SecOps Tier-2 Duty Desk', 'Cybersecurity SOC', '+15553334444', 'soc-escalation@cloudscale.com', 'sms', 'P1_CRITICAL', 1, ?),
    ('ros-005', 'tenant-apexhealth', 'Dr. Aris Thorne', 'Chief Compliance Lead', '+15554567890', 'aris.thorne@apexhealth.com', 'whatsapp', 'P1_CRITICAL', 1, NULL),
    ('ros-006', 'tenant-apexhealth', 'Nurse Duty Desk ER-4', 'Hospital Operations', '+15559998888', 'er-ops@apexhealth.com', 'sms', 'P1_CRITICAL', 1, NULL)
    """, (now - 3600, now - 1800, now - 7200))

    # 4. Default Incidents
    cur.execute("""
    INSERT INTO incidents VALUES
    ('INC-2026-904', 'tenant-cloudscale', 'DataCenter Frankfurt Loop 4B Thermal Runaway (>88°C)', 'P1_CRITICAL', 'ACTIVE', 'Marcus Vance', 'Delta-T exceeded threshold by 14°C. Autonomous refrigerant bypass triggered.', ?, ?),
    ('INC-2026-880', 'tenant-cloudscale', 'DDoS Pattern on Edge BGP Router FRA-01', 'P2_WARNING', 'RESOLVED', 'SecOps Tier-2', 'Autonomous rate-limiting and Scrubbing Center engagement mitigated in 42s.', ?, ?)
    """, (now - 1440, now - 240, now - 86400, now - 82000))

    conn.commit()

# Initialize DB on module import
init_db()
