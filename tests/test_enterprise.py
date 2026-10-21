from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)

def test_auth_login_and_switching():
    # Valid login
    res = client.post("/api/auth/login", json={
        "email": "sarah.chen@cloudscale.com",
        "password": "password123"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "authenticated"
    assert data["user"]["role"] == "INCIDENT_COMMANDER"
    assert "CloudScale" in data["user"]["tenant_name"]

    # Invalid login
    res_bad = client.post("/api/auth/login", json={
        "email": "sarah.chen@cloudscale.com",
        "password": "wrongpassword"
    })
    assert res_bad.status_code == 401

    # List demo users
    res_users = client.get("/api/auth/users")
    assert res_users.status_code == 200
    assert len(res_users.json()) >= 3

def test_roster_crud_and_broadcast():
    # 1. Get roster
    res = client.get("/api/roster?tenant_id=tenant-cloudscale")
    assert res.status_code == 200
    roster = res.json()
    assert len(roster) >= 2

    # 2. Add new on-call contact
    new_contact = {
        "tenant_id": "tenant-cloudscale",
        "full_name": "Alex Kovacs",
        "role": "Backup Datacenter SRE",
        "phone_number": "+36307778899",
        "email": "alex.kovacs@cloudscale.com",
        "channel_preference": "sms",
        "escalation_tier": "P1_CRITICAL",
        "is_on_call": True
    }
    res_create = client.post("/api/roster", json=new_contact)
    assert res_create.status_code == 200
    created_id = res_create.json()["id"]

    # 3. Broadcast alert to on-call roster
    res_broadcast = client.post("/api/roster/broadcast", json={
        "tenant_id": "tenant-cloudscale",
        "incident_id": "INC-TEST-001",
        "alert_tier": "P1_CRITICAL",
        "custom_message": "Immediate Datacenter alert test"
    })
    assert res_broadcast.status_code == 200
    broadcast_data = res_broadcast.json()
    assert broadcast_data["status"] == "broadcast_completed"
    assert broadcast_data["recipients_count"] >= 1

    # 4. Clean up contact
    res_del = client.delete(f"/api/roster/{created_id}")
    assert res_del.status_code == 200

def test_playbook_execution():
    res_list = client.get("/api/playbooks")
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 3

    # Execute DC cooling playbook
    res_exec = client.post("/api/playbooks/execute", json={
        "playbook_id": "dc_cooling_p1",
        "tenant_id": "tenant-cloudscale"
    })
    assert res_exec.status_code == 200
    data = res_exec.json()
    assert data["status"] == "success"
    assert len(data["steps_executed"]) == 4
    assert "consensus" in data
