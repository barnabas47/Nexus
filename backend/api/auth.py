from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.core.database import get_connection

router = APIRouter(prefix="/api/auth", tags=["Enterprise Multi-Tenant Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class SwitchUserRequest(BaseModel):
    user_id: str

@router.post("/login")
def login(req: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.*, t.name as tenant_name, t.industry, t.sla_level, t.tier as tenant_tier
        FROM users u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.email = ? AND u.password = ?
    """, (req.email, req.password))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid enterprise email or password")

    user_data = dict(row)
    del user_data["password"]
    return {
        "status": "authenticated",
        "token": f"bearer-nexus-{user_data['id']}",
        "user": user_data
    }

@router.get("/users")
def list_demo_users():
    """Returns available enterprise profiles for instant switching."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.email, u.full_name, u.role, u.title, u.tenant_id, t.name as tenant_name
        FROM users u
        JOIN tenants t ON u.tenant_id = t.id
    """)
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/switch/{user_id}")
def switch_user(user_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.*, t.name as tenant_name, t.industry, t.sla_level, t.tier as tenant_tier
        FROM users u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.id = ?
    """, (user_id,))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="User ID not found")

    user_data = dict(row)
    del user_data["password"]
    return {
        "status": "switched",
        "token": f"bearer-nexus-{user_data['id']}",
        "user": user_data
    }
