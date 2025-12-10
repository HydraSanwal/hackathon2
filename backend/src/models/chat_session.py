from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class ChatSession(BaseModel):
    id: str = str(uuid.uuid4())
    user_id: Optional[str] = None
    session_token: Optional[str] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    metadata: Optional[dict] = {}