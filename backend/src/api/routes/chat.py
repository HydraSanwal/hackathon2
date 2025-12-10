from fastapi import APIRouter, HTTPException
from typing import Optional
import uuid
from src.services.rag_service import rag_service
from src.models.message import Message
from src.models.chat_session import ChatSession

router = APIRouter()

# In-memory storage for sessions (in production, use database)
sessions = {}

from fastapi import APIRouter, HTTPException, Request
from typing import Optional
import uuid
from pydantic import BaseModel
from src.services.rag_service import rag_service
from src.models.message import Message
from src.models.chat_session import ChatSession


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    selected_text: Optional[str] = None


@router.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint to process user messages and return AI-generated responses"""
    try:
        message = request.message
        session_id = request.session_id
        selected_text = request.selected_text

        # Create or retrieve session
        if not session_id:
            session_id = str(uuid.uuid4())
            sessions[session_id] = ChatSession(session_token=session_id)
        elif session_id not in sessions:
            sessions[session_id] = ChatSession(session_token=session_id)

        # Create user message
        user_message = Message(
            session_id=session_id,
            role="user",
            content=message,
            metadata={"selected_text": selected_text} if selected_text else {}
        )

        # Generate response using RAG service
        result = rag_service.generate_answer(message, selected_text)

        # Create assistant message
        assistant_message = Message(
            session_id=session_id,
            role="assistant",
            content=result["response"]
        )

        # In a real implementation, you would save these messages to the database
        # For now, we'll just return the response

        return {
            "response": result["response"],
            "session_id": session_id,
            "context_used": result["context_used"],
            "sources": result["sources"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")