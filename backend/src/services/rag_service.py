import requests
from typing import List, Dict, Any
from src.services.qdrant_service import qdrant_service
from src.services.embedding_service import embedding_service
from src.config.settings import settings

class RAGService:
    def __init__(self):
        self.gemini_api_key = settings.gemini_api_key

    def generate_answer(self, query: str, selected_text: str = None) -> Dict[str, Any]:
        """Generate an answer based on the query and retrieved context"""
        try:
            # Embed the query
            query_embedding = embedding_service.embed_text(query)

            # Search for relevant document chunks
            relevant_chunks = qdrant_service.search_similar(query_embedding, limit=5)

            # Prepare context from retrieved chunks
            context = "\n".join([chunk["content"] for chunk in relevant_chunks])
        except Exception as e:
            # If Qdrant is not available, use empty context
            print(f"Qdrant error (expected in development): {e}")
            relevant_chunks = []
            context = "No book context available (Qdrant not connected)"

        # Prepare the prompt for Gemini
        if selected_text:
            prompt = f"""
            Context from the book: {context}

            User has selected this text: {selected_text}

            Question: {query}

            Please provide an answer based on the book content. If the information is not available in the context,
            acknowledge the limitation and suggest checking other book sections.
            """
        else:
            prompt = f"""
            Context from the book: {context}

            Question: {query}

            Please provide an answer based on the book content. If the information is not available in the context,
            acknowledge the limitation and suggest checking other book sections.
            """

        # Call Gemini API to generate response
        response = self.call_gemini_api(prompt)

        return {
            "response": response,
            "context_used": [chunk["content"] for chunk in relevant_chunks] if relevant_chunks else [],
            "sources": [chunk["source_url"] for chunk in relevant_chunks] if relevant_chunks else []
        }

    def call_gemini_api(self, prompt: str) -> str:
        """Call the Gemini API to generate a response"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={self.gemini_api_key}"

        headers = {
            "Content-Type": "application/json"
        }

        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024
            }
        }

        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            return result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Sorry, I couldn't generate a response.")
        else:
            return "Sorry, I'm having trouble generating a response right now."

rag_service = RAGService()