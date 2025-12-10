# Docusaurus RAG Chatbot Backend

This is the backend service for the Docusaurus RAG chatbot that provides AI-powered responses based on your book content.

## Prerequisites

- Python 3.11+
- Qdrant Cloud account
- Neon Postgres account
- Google Gemini API key

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file with your API keys:
   ```env
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_api_key
   NEON_DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/dbname
   GEMINI_API_KEY=your_gemini_api_key
   SECRET_KEY=your_secret_key_for_sessions
   ```

3. Run the application:
   ```bash
   uvicorn src.api.main:app --reload
   ```

## Docker Setup

Alternatively, you can run the application using Docker:

1. Build and run with docker-compose:
   ```bash
   docker-compose up --build
   ```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/chat` - Chat endpoint

## Integration with Docusaurus

To integrate with your Docusaurus site, add the chat widget script to your site. The frontend integration script is located at `../frontend/static/js/chat-integration.js`.