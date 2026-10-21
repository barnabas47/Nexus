import os
from pydantic import BaseModel

class Settings(BaseModel):
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    DYNAMODB_TABLE_NAME: str = os.getenv("DYNAMODB_TABLE_NAME", "NexusAI_Omnichannel_Memory")
    COMPREHEND_ENABLED: bool = os.getenv("COMPREHEND_ENABLED", "false").lower() == "true"
    DEMO_MODE_ACTIVE: bool = True
    SENTIMENT_ESCALATION_THRESHOLD: float = 0.35
    MAX_DAILY_INTERACTIONS: int = 2

settings = Settings()
