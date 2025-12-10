import os
import sys
from pathlib import Path
import re
from typing import List
import markdown
from bs4 import BeautifulSoup
import requests
from qdrant_client import QdrantClient
from qdrant_client.http import models
import uuid

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Get settings from environment variables
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def embed_text(text: str) -> List[float]:
    """Generate embedding for the given text using Gemini API"""
    base_url = "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent"
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
        f"{base_url}?key={GEMINI_API_KEY}",
        headers=headers,
        json=data
    )

    if response.status_code == 200:
        result = response.json()
        return result.get("embedding", {}).get("values", [0.0] * 768)  # Default to 768-dim vector
    else:
        # Return a default embedding vector in case of error
        print(f"Embedding API error: {response.status_code} - {response.text}")
        return [0.0] * 768


def extract_text_from_markdown(file_path: str) -> str:
    """Extract text content from a markdown file"""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Convert markdown to HTML then extract text
    html = markdown.markdown(content)
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text()

    # Clean up the text
    text = re.sub(r'\n\s*\n', '\n\n', text)  # Remove excessive newlines
    text = text.strip()

    return text


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks"""
    if not text.strip():
        return []

    sentences = re.split(r'[.!?]+', text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        # Add a period back to the sentence for proper sentence structure
        sentence = sentence + "."

        if len(current_chunk) + len(sentence) <= chunk_size:
            current_chunk += " " + sentence
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())

            # Add overlap by taking part of the current chunk
            words = current_chunk.split()
            overlap_start = max(0, len(words) - overlap)
            current_chunk = " ".join(words[overlap_start:]) + " " + sentence

    # Add the last chunk if it exists
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # Remove any empty chunks
    final_chunks = [chunk for chunk in chunks if len(chunk.strip()) > 0]

    return final_chunks


def process_single_file(file_path: Path, client, collection_name: str):
    """Process a single markdown file and add to Qdrant"""
    print(f"Processing: {file_path}")

    try:
        # Extract text from markdown
        text_content = extract_text_from_markdown(file_path)

        # Skip if content is too short
        if len(text_content.strip()) < 50:
            print(f"  Skipping {file_path} - content too short")
            return 0

        # Create chunks from the text
        chunks = chunk_text(text_content)
        print(f"  Created {len(chunks)} chunks")

        processed_count = 0

        # Create document chunks with metadata
        for i, chunk_content in enumerate(chunks):
            if len(chunk_content.strip()) < 20:  # Skip very short chunks
                continue

            # Create embedding for the chunk
            try:
                embedding = embed_text(chunk_content)
            except Exception as embed_error:
                print(f"  Error creating embedding for chunk in {file_path}: {embed_error}")
                # Use a default embedding vector if embedding fails
                embedding = [0.0] * 768

            # Extract module info from path - need to get path relative to docs folder for Docusaurus URLs
            hackathon2_path = Path(__file__).parent.parent  # Go up two levels to hackathon2
            relative_docs_path = file_path.relative_to(hackathon2_path)

            chunk_data = {
                'content': chunk_content,
                'source_url': f'/{relative_docs_path}',  # Docusaurus URL format
                'chunk_index': i,
                'embedding': embedding,
                'module': str(file_path.parent.name),  # module1, module2, etc.
                'file_name': file_path.name
            }

            # Create point for Qdrant
            point = models.PointStruct(
                id=str(uuid.uuid4()),
                vector=chunk_data.get('embedding', [0.0] * 768),  # Default to zero vector if no embedding
                payload={
                    "content": chunk_data.get('content', ''),
                    "source_url": chunk_data.get('source_url', ''),
                    "module": chunk_data.get('module', ''),
                    "file_name": chunk_data.get('file_name', ''),
                    "chunk_index": chunk_data.get('chunk_index', 0)
                }
            )

            # Upload single point to Qdrant
            client.upsert(collection_name=collection_name, points=[point])

            processed_count += 1
            print(f"    Uploaded chunk {i+1} ({len(chunk_content)} chars)")

        return processed_count

    except Exception as e:
        print(f"  Error processing {file_path}: {e}")
        import traceback
        traceback.print_exc()
        return 0


def load_book_content_to_qdrant():
    """Load all book content from docs directory to Qdrant"""
    # Initialize Qdrant client
    client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
    )
    collection_name = "book_chunks"

    # Create collection if it doesn't exist
    try:
        client.get_collection(collection_name)
        print(f"Collection '{collection_name}' already exists.")
    except Exception as e:
        print(f"Collection not found, creating: {e}")
        try:
            client.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
            )
            print(f"Created collection: {collection_name}")
        except Exception as create_error:
            print(f"Failed to create collection: {create_error}")
            return

    # Use absolute path to ensure we find the docs directory
    script_dir = Path(__file__).parent
    docs_path = script_dir.parent / "docs"  # Go up one level from backend, then into docs

    # Find all markdown files in the docs directory and subdirectories
    md_files = list(docs_path.rglob("*.md"))

    print(f"Found {len(md_files)} markdown files to process...")

    total_processed = 0

    for file_path in md_files:
        if "_templates" in str(file_path):  # Skip template files
            continue

        processed = process_single_file(file_path, client, collection_name)
        total_processed += processed

    print(f"\nTotal chunks uploaded: {total_processed}")
    print("Book content successfully loaded to Qdrant!")


if __name__ == "__main__":
    load_book_content_to_qdrant()