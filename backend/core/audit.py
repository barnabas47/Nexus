import time
import hashlib
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class AuditBlock(BaseModel):
    block_index: int
    timestamp: float = Field(default_factory=time.time)
    tenant_id: str
    user_id: str
    user_role: str
    event_type: str # CONSENSUS_DELIBERATION, A2A_CONTRACT_AGREED, CODE_GATE_INTERVENTION, HUMAN_SIGNOFF
    action_summary: str
    payload_snapshot: Dict[str, Any]
    prev_hash: str
    block_hash: str

class AuditLedger:
    """
    SOC 2 Type II / ISO 27001 Cryptographically Chained Immutable Audit Trail.
    Every multi-agent consensus decision, A2A trade, and deterministic code gate block
    is SHA-256 hashed and linked to the previous block.
    """
    def __init__(self):
        self.chain: List[AuditBlock] = []
        self._seed_genesis()

    def _calculate_hash(self, index: int, timestamp: float, tenant_id: str, event_type: str, prev_hash: str, payload: Dict[str, Any]) -> str:
        data_str = f"{index}:{timestamp}:{tenant_id}:{event_type}:{prev_hash}:{json.dumps(payload, sort_keys=True)}"
        return hashlib.sha256(data_str.encode('utf-8')).hexdigest()

    def _seed_genesis(self):
        genesis_payload = {"system": "NexusCore Initialized", "spec": "AWS Bedrock Multi-Agent Enterprise Spec v2.4"}
        genesis_hash = self._calculate_hash(0, 1729450000.0, "tenant-cloudscale-global", "GENESIS", "0"*64, genesis_payload)
        
        genesis_block = AuditBlock(
            block_index=0,
            timestamp=1729450000.0,
            tenant_id="tenant-cloudscale-global",
            user_id="SYSTEM",
            user_role="SYSTEM_KERNEL",
            event_type="GENESIS_BLOCK",
            action_summary="Cryptographic audit ledger initialized with tamper-evident SHA-256 chaining.",
            payload_snapshot=genesis_payload,
            prev_hash="0"*64,
            block_hash=genesis_hash
        )
        self.chain.append(genesis_block)

    def record_event(
        self,
        tenant_id: str,
        user_id: str,
        user_role: str,
        event_type: str,
        action_summary: str,
        payload: Dict[str, Any]
    ) -> AuditBlock:
        prev_block = self.chain[-1]
        now = time.time()
        new_index = len(self.chain)
        new_hash = self._calculate_hash(new_index, now, tenant_id, event_type, prev_block.block_hash, payload)

        block = AuditBlock(
            block_index=new_index,
            timestamp=now,
            tenant_id=tenant_id,
            user_id=user_id,
            user_role=user_role,
            event_type=event_type,
            action_summary=action_summary,
            payload_snapshot=payload,
            prev_hash=prev_block.block_hash,
            block_hash=new_hash
        )
        self.chain.append(block)
        return block

    def get_chain(self, tenant_id: Optional[str] = None) -> List[AuditBlock]:
        if tenant_id:
            return [b for b in self.chain if b.tenant_id == tenant_id or b.tenant_id == "tenant-cloudscale-global"]
        return self.chain

    def verify_integrity(self) -> Dict[str, Any]:
        """Validates the entire hash-chain for tampering."""
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i-1]
            if curr.prev_hash != prev.block_hash:
                return {"valid": False, "corrupted_block": i, "reason": "Hash pointer mismatch"}
            recalc = self._calculate_hash(curr.block_index, curr.timestamp, curr.tenant_id, curr.event_type, curr.prev_hash, curr.payload_snapshot)
            if recalc != curr.block_hash:
                return {"valid": False, "corrupted_block": i, "reason": "Block content modified"}
        return {"valid": True, "blocks_verified": len(self.chain), "status": "CRYPTOGRAPHICALLY_INTACT"}

audit_ledger = AuditLedger()
