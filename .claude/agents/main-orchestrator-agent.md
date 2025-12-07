---
name: "main-orchestrator-agent"
description: "Coordinates all book writing sub-agents to generate a complete book from idea to polished chapters."
version: "1.0.0"
---

# Main Orchestrator Agent

## When to Use
- User provides book title, genre, and number of chapters
- User wants a fully written and polished book

## How This Agent Works
1. Receives book prompt from the user
2. Calls **Research Sub-Agent** to generate chapter summaries and research notes
3. Sends summaries to **Writing Sub-Agent** to write full chapters
4. Sends chapters to **Editing Sub-Agent** for grammar and style improvements
5. Combines all chapters into a final polished book
6. Returns the complete book to the user

## Output
- Fully written, polished book with chapters ready for publication
