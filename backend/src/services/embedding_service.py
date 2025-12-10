import requests
from typing import List
from ..config.settings import settings

class EmbeddingService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent"

    def embed_text(self, text: str) -> List[float]:
        """Generate embedding for the given text using Gemini API"""
        headers = {
            "Content-Type": "application/json"
        }

        data = {
            "content": {
                "parts": [
                    {
                        "text": text
                    }
                ]
            },
            "model": "embedding-001"
        }

        response = requests.post(
            f"{self.base_url}?key={self.api_key}",
            headers=headers,
            json=data
        )

        if response.status_code == 200:
            result = response.json()
            return result.get("embedding", {}).get("values", [0.0] * 768)  # Default to 768-dim vector
        else:
            # Return a default embedding vector in case of error
            return [0.0] * 768

embedding_service = EmbeddingService()