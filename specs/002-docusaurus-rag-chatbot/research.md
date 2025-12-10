# Research: Docusaurus RAG Chatbot Integration

## Overview
Research document for implementing a RAG-based chatbot that integrates with an existing Docusaurus book deployment.

## Decision: FastAPI Backend Architecture
**Rationale**: FastAPI was selected as the backend framework due to its high performance, built-in async support, automatic API documentation generation, and strong typing with Pydantic. It's ideal for serving AI applications with low latency requirements.

**Alternatives considered**:
- Flask: Simpler but slower and lacks async support
- Django: More complex, overkill for API-only application
- Node.js/Express: Good performance but Python ecosystem better for AI/RAG

## Decision: Qdrant Vector Database
**Rationale**: Qdrant Cloud was selected as the vector database due to its efficient similarity search, support for high-dimensional vectors, cloud hosting option, and good Python client library. It's specifically designed for vector search applications.

**Alternatives considered**:
- Pinecone: Commercial alternative but higher cost
- Weaviate: Good option but Qdrant has simpler setup for this use case
- ChromaDB: Open source but less scalable than cloud options
- FAISS: Library rather than DB, requires more infrastructure work

## Decision: Neon Postgres for Chat History
**Rationale**: Neon Serverless Postgres was chosen for storing chat history and metadata due to its serverless architecture (cost-effective), PostgreSQL compatibility (mature and reliable), and easy integration with Python applications.

**Alternatives considered**:
- SQLite: Simpler but not suitable for concurrent users
- MongoDB: Good for document storage but PostgreSQL is more appropriate for structured chat data
- Redis: Fast but not ideal for persistent chat history storage

## Decision: Gemini 2.5 Flash as LLM
**Rationale**: Gemini 2.5 Flash was selected as the LLM due to its low cost (free tier), good performance for RAG applications, and compatibility with ChatKit SDK as specified in requirements.

**Alternatives considered**:
- GPT-4: More expensive than required for this application
- Claude: Good alternative but Gemini specified in requirements
- Open-source models: Require more infrastructure but no API costs

## Decision: Frontend Integration Approach
**Rationale**: A lightweight JavaScript widget injected into Docusaurus pages was chosen to provide the chat functionality without modifying the existing Docusaurus build process. This approach maintains compatibility with existing deployment on Vercel.

**Alternatives considered**:
- Docusaurus plugin: Would require more complex integration
- Separate iframe: Would create integration challenges
- Native Docusaurus component: Would require rebuild of site

## Technical Unknowns Resolved
- **NEEDS CLARIFICATION**: How to extract Docusaurus book content for embedding → Resolved: Use Docusaurus plugins or static build output to extract content
- **NEEDS CLARIFICATION**: How to inject frontend widget → Resolved: Use Docusaurus' ability to inject custom components/scripts via swizzling or plugins
- **NEEDS CLARIFICATION**: Security model for chat endpoints → Resolved: Rate limiting and optional authentication via session tokens