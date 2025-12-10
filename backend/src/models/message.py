from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class Message(BaseModel):
    id: str = str(uuid.uuid4())
    session_id: str
    role: str  # system, user, assistant
    content: str
    timestamp: datetime = datetime.now()
    metadata: Optional[dict] = {}