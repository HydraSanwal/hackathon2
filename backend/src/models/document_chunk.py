from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class DocumentChunk(BaseModel):
    id: str = str(uuid.uuid4())
    source_url: str
    content: str
    chunk_index: int
    embedding_vector: Optional[list] = None
    created_at: datetime = datetime.now()