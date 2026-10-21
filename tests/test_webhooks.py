from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)

def test_whatsapp_webhook_verification():
    # Valid verify token
    res = client.get("/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=nexus_webhook_token_2026&hub.challenge=987654321")
    assert res.status_code == 200
    assert res.text == "987654321"

    # Invalid verify token
    res_bad = client.get("/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=987654321")
    assert res_bad.status_code == 403

def test_whatsapp_incoming_message():
    meta_payload = {
        "object": "whatsapp_business_account",
        "entry": [{
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "messages": [{
                        "from": "+36301234567",
                        "type": "text",
                        "text": {"body": "Hol jár a megrendelésem?"}
                    }]
                }
            }]
        }]
    }
    res = client.post("/api/webhooks/whatsapp", json=meta_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "processed"
    assert data["sender"] == "+36301234567"
    assert data["channel"] == "whatsapp"

def test_sms_incoming_message():
    payload = {
        "from": "+15559876543",
        "body": "Need urgent status on server rack power"
    }
    res = client.post("/api/webhooks/sms", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "processed"
    assert data["sender"] == "+15559876543"
    assert data["channel"] == "sms"
