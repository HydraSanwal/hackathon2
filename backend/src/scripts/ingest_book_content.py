import os
import sys
import glob
from pathlib import Path
import re
from typing import List, Dict, Any

# Add the backend root directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.qdrant_service import qdrant_service
from services.embedding_service import embedding_service
import markdown
from bs4 import BeautifulSoup


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
    sentences = re.split(r'[.!?]+', text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        if len(current_chunk) + len(sentence) < chunk_size:
            current_chunk += " " + sentence
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())

            # Add overlap by taking part of the current chunk
            words = current_chunk.split()
            overlap_start = max(0, len(words) - overlap)
            current_chunk = " ".join(words[overlap_start:]) + " " + sentence

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # If any chunk is too short, try to merge with the next one
    final_chunks = []
    i = 0
    while i < len(chunks):
        current = chunks[i]
        if len(current) < 100 and i < len(chunks) - 1:
            # Merge with next chunk if current is too short
            next_chunk = chunks[i + 1]
            merged = current + " " + next_chunk
            if len(merged) <= chunk_size:
                final_chunks.append(merged.strip())
                i += 2  # Skip next chunk since we merged it
            else:
                final_chunks.append(current.strip())
                i += 1
        else:
            final_chunks.append(current.strip())
            i += 1

    return final_chunks


def load_book_content_to_qdrant():
    """Load all book content from docs directory to Qdrant"""
    docs_path = Path("../../docs")  # Relative to backend/src directory

    # Find all markdown files in the docs directory and subdirectories
    md_files = list(docs_path.rglob("*.md"))

    print(f"Found {len(md_files)} markdown files to process...")

    all_chunks = []

    for file_path in md_files:
        if "_templates" in str(file_path):  # Skip template files
            continue

        print(f"Processing: {file_path}")

        try:
            # Extract text from markdown
            text_content = extract_text_from_markdown(file_path)

            # Skip if content is too short
            if len(text_content.strip()) < 50:
                print(f"  Skipping {file_path} - content too short")
                continue

            # Create chunks from the text
            chunks = chunk_text(text_content)

            # Create document chunks with metadata
            for i, chunk_text in enumerate(chunks):
                if len(chunk_text.strip()) < 20:  # Skip very short chunks
                    continue

                # Create embedding for the chunk
                embedding = embedding_service.embed_text(chunk_text)

                # Extract module info from path
                relative_path = str(file_path.relative_to(docs_path))

                chunk_data = {
                    'content': chunk_text,
                    'source_url': f'/docs/{relative_path}',  # Docusaurus URL format
                    'chunk_index': i,
                    'embedding': embedding,
                    'module': str(file_path.parent.name),  # module1, module2, etc.
                    'file_name': file_path.name
                }

                all_chunks.append(chunk_data)

                print(f"  Created chunk {i+1} ({len(chunk_text)} chars)")

        except Exception as e:
            print(f"  Error processing {file_path}: {e}")
            continue

    print(f"\nTotal chunks created: {len(all_chunks)}")

    if all_chunks:
        print("Uploading chunks to Qdrant...")
        qdrant_service.add_document_chunks(all_chunks)
        print("Successfully uploaded content to Qdrant!")
    else:
        print("No content was processed. Please check if markdown files exist in the docs directory.")


if __name__ == "__main__":
    load_book_content_to_qdrant()