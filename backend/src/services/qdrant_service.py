from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Dict, Any
from ..config.settings import settings
import uuid

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
        )
        self.collection_name = "book_chunks"
        self._initialize_collection()

    def _initialize_collection(self):
        """Initialize the Qdrant collection if it doesn't exist"""
        try:
            # Check if collection exists
            self.client.get_collection(self.collection_name)
        except Exception as e:
            print(f"Qdrant collection not found, creating: {e}")
            # Create collection if it doesn't exist
            try:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
                )
                print(f"Created collection: {self.collection_name}")
            except Exception as create_error:
                print(f"Failed to create collection: {create_error}")
                # Still continue without the collection for now
                pass

    def add_document_chunks(self, chunks: List[Dict[str, Any]]):
        """Add document chunks to the Qdrant collection"""
        points = []
        for chunk in chunks:
            point = models.PointStruct(
                id=str(uuid.uuid4()),
                vector=chunk.get('embedding', [0.0] * 768),  # Default to zero vector if no embedding
                payload={
                    "content": chunk.get('content', ''),
                    "source_url": chunk.get('source_url', ''),
                    "chunk_index": chunk.get('chunk_index', 0)
                }
            )
            points.append(point)

        self.client.upsert(collection_name=self.collection_name, points=points)

    def search_similar(self, query_vector: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar document chunks based on query vector"""
        from qdrant_client.http import models
        # Handle Qdrant search with proper error handling for the correct method
        try:
            # Try the new query_points method (current Qdrant client version)
            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                limit=limit
            )
        except Exception as e:
            print(f"Qdrant search error: {e}")
            # Return empty results if search fails
            return []

        results = []
        # The query_points method might return results in a different format
        # depending on the Qdrant client version
        for result in search_results:
            # Check if result has 'payload' attribute (newer versions)
            if hasattr(result, 'payload'):
                results.append({
                    "content": result.payload.get("content", ""),
                    "source_url": result.payload.get("source_url", ""),
                    "chunk_index": result.payload.get("chunk_index", 0),
                    "score": result.score
                })
            # Alternative: if result is a dictionary (older style or different format)
            elif isinstance(result, dict):
                results.append({
                    "content": result.get("payload", {}).get("content", ""),
                    "source_url": result.get("payload", {}).get("source_url", ""),
                    "chunk_index": result.get("payload", {}).get("chunk_index", 0),
                    "score": result.get("score", 0)
                })
            else:
                # Handle other possible formats
                try:
                    results.append({
                        "content": getattr(result, 'payload', {}).get("content", ""),
                        "source_url": getattr(result, 'payload', {}).get("source_url", ""),
                        "chunk_index": getattr(result, 'payload', {}).get("chunk_index", 0),
                        "score": getattr(result, 'score', 0)
                    })
                except:
                    continue  # Skip this result if we can't parse it

        return results

qdrant_service = QdrantService()