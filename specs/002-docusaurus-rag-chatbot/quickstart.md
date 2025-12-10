# Quickstart: Docusaurus RAG Chatbot Integration

## Prerequisites
- Python 3.11+
- Node.js 16+ (for Docusaurus)
- Qdrant Cloud account with API key
- Neon Postgres account with database URL
- Google Gemini API key for Gemini 2.5 Flash
- ChatKit SDK

## Setup Backend

### 1. Clone and Install Dependencies
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create `.env` file in the backend root:
```env
QDRANT_URL=https://your-cluster.qdrant.tech
QDRANT_API_KEY=your-qdrant-api-key
NEON_DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/dbname
GEMINI_API_KEY=your-gemini-api-key
CHATKIT_API_KEY=your-chatkit-api-key
SECRET_KEY=your-secret-key-for-sessions
```

### 3. Initialize Vector Database
```bash
# Index the Docusaurus book content
python -m src.scripts.index_book_content
```

### 4. Run Backend Server
```bash
# Start the FastAPI server
uvicorn src.api.main:app --reload --port 8000
```

## Setup Frontend Integration

### 1. Integrate Chat Widget
Add the following to your Docusaurus `docusaurus.config.js`:

```js
module.exports = {
  // ... existing config
  scripts: [
    '/js/chat-integration.js'
  ],
  // ... rest of config
};
```

### 2. Build and Deploy
```bash
# Build Docusaurus site
npm run build

# The chat widget will be automatically included
```

## API Endpoints

### Chat Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "message": "Your question here",
  "session_id": "optional session ID",
  "selected_text": "optional text that was selected by user"
}
```

### Health Check
```
GET /api/health
```

### Embedding Endpoint
```
POST /api/embedding
Content-Type: application/json

{
  "text": "Text to embed"
}
```

## Environment Setup for Development

### Backend
```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Run tests
pytest tests/

# Run with auto-reload
uvicorn src.api.main:app --reload
```

### Frontend Integration
```bash
# The frontend widget is a lightweight JavaScript file
# that gets injected into Docusaurus pages
# No separate build process needed
```

## Deployment

### Backend to Production
```bash
# Build Docker image
docker build -t docusaurus-rag-chatbot .

# Run container
docker run -p 8000:8000 --env-file .env docusaurus-rag-chatbot
```

### Docusaurus Integration
The chat widget will automatically be available on all pages after the build process.

## Troubleshooting

### Common Issues
1. **API Keys not working**: Verify all environment variables are set correctly
2. **Vector search failing**: Ensure the book content has been indexed properly
3. **Frontend not loading**: Check that the JavaScript widget is properly injected

### Logging
- Backend logs are available in the console when running uvicorn
- Check the `/api/health` endpoint to verify all services are connected