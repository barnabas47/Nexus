from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.core.llm_client import LLMClient

router = APIRouter(prefix="/api/settings", tags=["BYOK & Token Optimizer Settings"])

class SaveSettingsRequest(BaseModel):
    tenant_id: str = "tenant-cloudscale"
    provider: str = "emulated" # 'anthropic', 'openai', 'aws_bedrock', 'emulated'
    anthropic_key: Optional[str] = None
    openai_key: Optional[str] = None
    aws_access_key: Optional[str] = None
    aws_secret_key: Optional[str] = None
    aws_region: str = "us-east-1"
    cache_enabled: bool = True
    tiering_enabled: bool = True
    max_output_tokens: int = 400

class TestKeyRequest(BaseModel):
    provider: str
    key: str

@router.get("/keys")
def get_api_key_settings(tenant_id: str = "tenant-cloudscale"):
    return LLMClient.get_settings(tenant_id)

@router.post("/keys")
def save_api_key_settings(req: SaveSettingsRequest):
    updated = LLMClient.save_settings(
        tenant_id=req.tenant_id,
        provider=req.provider,
        anthropic_key=req.anthropic_key,
        openai_key=req.openai_key,
        aws_access_key=req.aws_access_key,
        aws_secret_key=req.aws_secret_key,
        aws_region=req.aws_region,
        cache_enabled=req.cache_enabled,
        tiering_enabled=req.tiering_enabled,
        max_output_tokens=req.max_output_tokens
    )
    return {"status": "saved", "settings": updated}

@router.post("/test-key")
def test_api_key(req: TestKeyRequest):
    result = LLMClient.test_key(req.provider, req.key)
    if not result.get("valid"):
        raise HTTPException(status_code=400, detail=result.get("error", "Key verification failed"))
    return result
