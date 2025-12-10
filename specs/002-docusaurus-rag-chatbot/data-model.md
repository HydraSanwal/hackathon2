# Data Model: Docusaurus RAG Chatbot Integration

## Entities

### ChatSession
- **id**: UUID (Primary Key)
- **user_id**: UUID (Optional, for logged-in users)
- **session_token**: String (For anonymous users)
- **created_at**: DateTime
- **updated_at**: DateTime
- **metadata**: JSON (Additional session data)

### Message
- **id**: UUID (Primary Key)
- **session_id**: UUID (Foreign Key to ChatSession)
- **role**: String (system, user, assistant)
- **content**: Text
- **timestamp**: DateTime
- **metadata**: JSON (Additional message data like selected text context)

### DocumentChunk
- **id**: UUID (Primary Key)
- **source_url**: String (URL of the Docusaurus page)
- **content**: Text (Chunked content from the book)
- **chunk_index**: Integer
- **embedding_vector**: Vector (Embedding of the content)
- **created_at**: DateTime

### ChatHistory
- **id**: UUID (Primary Key)
- **session_id**: UUID (Foreign Key to ChatSession)
- **query**: Text (User's original query)
- **response**: Text (AI's response)
- **context_used**: Text (Context provided to the LLM)
- **timestamp**: DateTime
- **is_feedback_positive**: Boolean (User feedback on response quality)

## Relationships
- ChatSession has many Messages
- ChatSession has many ChatHistory entries
- DocumentChunk represents chunks of the Docusaurus book content

## Validation Rules
- ChatSession must have either user_id or session_token
- Message role must be one of: system, user, assistant
- DocumentChunk content must not exceed 2000 characters
- Message content must not exceed 10000 characters

## State Transitions
- ChatSession: Active → Archived (after period of inactivity)
- Message: Created → Updated (if edited) → Deleted (if removed)