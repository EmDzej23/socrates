# Socrates RAG Chat App — Technical Implementation Plan

## 1. Project Goal

Build a focused web application around a single historical/philosophical figure: **Socrates**.

The application has two main surfaces:

1. **Public Agora** — a public chat interface where users can have a Socratic dialogue.
2. **Private Archive** — an admin-only interface where the owner continuously adds, edits, processes, and improves the Socrates knowledge base.

The core idea is not to build a generic AI roleplay chatbot. The goal is to build a **curated Socratic dialogue engine** based on verified sources, structured context, embeddings, retrieval, and strict response rules.

The system should continuously improve as the archive grows. New documents, translations, notes, interpretations, and rules added through the admin panel should become available to the public chat automatically after processing.

---

## 2. Core Product Principles

### 2.1 One Figure Only

The app is only about Socrates.

Do not design this as a multi-character system in the MVP. The strength of the product is depth, not breadth.

### 2.2 Curated Archive, Not Generic AI Memory

The app should not rely on the model's built-in knowledge.

The real memory of the system is:

- documents stored in the database
- chunked text passages
- embeddings
- metadata
- admin notes
- behavior rules
- source reliability levels

The LLM is only the language and reasoning layer. The knowledge comes from the archive.

### 2.3 RAG-Based Responses

Use Retrieval-Augmented Generation.

For every user question:

1. Create an embedding of the user message.
2. Search the archive for the most relevant chunks.
3. Build a prompt using only those chunks plus global Socratic behavior rules.
4. Ask the LLM to answer based on the retrieved material.
5. Return the answer and optionally show sources.

Never send the entire archive to the LLM.

### 2.4 Socrates Should Not Be a Guru

The assistant should not behave like a motivational speaker or generic life coach.

It should:

- ask questions
- challenge assumptions
- request definitions
- expose contradictions
- guide the user toward clearer thinking
- avoid pretending to know things that are not supported by the archive

### 2.5 Historical Honesty

The app must clearly avoid false claims like:

> I am the real Socrates.

Instead, the system should present itself as:

> A Socratic dialogue system based on curated sources about Socrates.

The public UI can still feel poetic and immersive, but the system prompt and legal/ethical framing should remain honest.

---

## 3. Recommended Tech Stack

Use the same general architecture as the user's existing Next.js projects.

### 3.1 App Framework

- Next.js App Router
- TypeScript
- Tailwind CSS
- Server Components where useful
- Route Handlers for API endpoints

### 3.2 Database

- PostgreSQL
- Neon is recommended because the user already uses Neon/Postgres
- pgvector extension for embedding storage and vector similarity search

### 3.3 ORM / Database Layer

Recommended:

- Drizzle ORM

Alternative:

- Prisma, but Drizzle may be simpler and more direct for SQL/vector work.

### 3.4 Authentication

For MVP:

- simple admin authentication
- preferably NextAuth/Auth.js, Clerk, or a custom password-protected admin route

If speed is the priority, implement a simple admin password stored in environment variables and protect `/archive/*` routes with middleware.

Later, replace with proper auth.

### 3.5 AI Providers

Use a provider abstraction so the model can be swapped.

Recommended initial setup:

- OpenAI embeddings for document and query embeddings
- OpenAI, Anthropic, or Vercel AI Gateway for chat generation
- Vercel AI SDK for streaming chat responses

### 3.6 Deployment

- Vercel for app hosting
- Neon for Postgres
- Environment variables in Vercel dashboard

---

## 4. High-Level Architecture

```txt
User Chat UI
    ↓
POST /api/chat
    ↓
Create embedding from user message
    ↓
Vector search in document_chunks
    ↓
Retrieve top relevant chunks
    ↓
Build Socratic system prompt + retrieved context
    ↓
Call LLM with streaming
    ↓
Return answer to user
```

Admin ingestion flow:

```txt
Admin uploads/adds document
    ↓
Save document record
    ↓
Normalize text
    ↓
Split into chunks
    ↓
Create embedding for each chunk
    ↓
Save chunks + embeddings + metadata
    ↓
Document becomes searchable by public chat
```

---

## 5. Main App Sections

### 5.1 Public Landing Page

Route:

```txt
/
```

Purpose:

- introduce the project
- frame it as a curated Socratic dialogue archive
- link to chat

Tone:

- calm
- minimal
- philosophical
- serious

Possible text direction:

> A digital agora for questioning, reflection, and dialogue — built from a curated archive of Socratic sources.

### 5.2 Public Chat — The Agora

Route:

```txt
/agora
```

Features:

- chat interface
- streaming responses
- short intro message
- optional source drawer below each answer
- optional “Socratic mode” toggle later

Initial UI rules:

- no avatars needed
- no fake realistic Socrates image
- no gimmicky “talking to the dead” framing
- minimal text-first interface

### 5.3 Admin Archive

Routes:

```txt
/archive
/archive/documents
/archive/documents/new
/archive/documents/[id]
/archive/chunks
/archive/rules
/archive/settings
```

Purpose:

- manage source documents
- add new documents
- process/reprocess documents
- edit metadata
- review generated chunks
- define Socratic behavior rules
- inspect retrieval quality

---

## 6. Database Schema

Use PostgreSQL with pgvector.

Enable extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 6.1 documents

Stores full archive documents.

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  translator TEXT,
  source_type TEXT NOT NULL,
  reliability TEXT NOT NULL DEFAULT 'medium',
  language TEXT NOT NULL DEFAULT 'en',
  original_language TEXT,
  period TEXT,
  source_url TEXT,
  publication_year TEXT,
  copyright_status TEXT,
  notes TEXT,
  raw_content TEXT NOT NULL,
  normalized_content TEXT,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Recommended `source_type` values:

```txt
primary_source
secondary_source
biography
academic_commentary
admin_interpretation
behavior_rule
system_note
translation_note
```

Recommended `reliability` values:

```txt
high
medium
low
experimental
```

### 6.2 document_chunks

Stores chunked passages and embeddings.

If using OpenAI `text-embedding-3-small`, default dimension is 1536.

```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_estimate INTEGER,
  embedding vector(1536),
  title TEXT,
  author TEXT,
  source_type TEXT,
  reliability TEXT,
  language TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Vector index:

```sql
CREATE INDEX document_chunks_embedding_idx
ON document_chunks
USING hnsw (embedding vector_cosine_ops);
```

Fallback if HNSW is unavailable:

```sql
CREATE INDEX document_chunks_embedding_ivfflat_idx
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 6.3 chat_sessions

```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

For anonymous MVP, `user_id` can be null or a browser-generated anonymous id.

### 6.4 chat_messages

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  retrieved_chunk_ids UUID[] DEFAULT '{}',
  model TEXT,
  token_usage JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Allowed roles:

```txt
user
assistant
system
```

### 6.5 socratic_rules

Admin-configurable rules for behavior.

```sql
CREATE TABLE socratic_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Examples:

- “Do not pretend to be the historical Socrates.”
- “Prefer questions over direct advice.”
- “If evidence is insufficient, say so.”
- “When discussing modern topics, answer hypothetically and label it as interpretation.”

### 6.6 retrieval_logs

Useful for debugging and improving retrieval quality.

```sql
CREATE TABLE retrieval_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  user_message TEXT NOT NULL,
  query_embedding_model TEXT,
  retrieved_chunks JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 7. Environment Variables

Create `.env.local`:

```env
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="..."
ANTHROPIC_API_KEY="..."
ADMIN_PASSWORD="change-this"
AI_CHAT_PROVIDER="openai"
AI_CHAT_MODEL="gpt-4.1-mini"
AI_EMBEDDING_MODEL="text-embedding-3-small"
MAX_RETRIEVED_CHUNKS="10"
MAX_CHAT_HISTORY_MESSAGES="8"
```

Use provider abstraction so the chat provider can be changed later.

---

## 8. Folder Structure

Recommended Next.js App Router structure:

```txt
src/
  app/
    page.tsx
    agora/
      page.tsx
    archive/
      layout.tsx
      page.tsx
      documents/
        page.tsx
        new/
          page.tsx
        [id]/
          page.tsx
      chunks/
        page.tsx
      rules/
        page.tsx
      settings/
        page.tsx
    api/
      chat/
        route.ts
      archive/
        documents/
          route.ts
        documents/[id]/
          route.ts
        ingest/
          route.ts
        rules/
          route.ts
      retrieval-test/
        route.ts
  components/
    chat/
      ChatWindow.tsx
      ChatMessage.tsx
      SourcePanel.tsx
      ChatInput.tsx
    archive/
      DocumentForm.tsx
      DocumentList.tsx
      ChunkPreview.tsx
      RuleEditor.tsx
  lib/
    ai/
      embeddings.ts
      chat.ts
      prompts.ts
      providers.ts
    archive/
      chunking.ts
      ingest.ts
      normalize.ts
      retrieval.ts
    db/
      index.ts
      schema.ts
      queries.ts
    auth/
      admin.ts
    utils/
      tokens.ts
      errors.ts
```

---

## 9. Archive Ingestion Pipeline

### 9.1 Input Types for MVP

Support text input first.

Admin should be able to paste:

- full text
- excerpts
- personal notes
- source metadata

Do not start with PDF parsing unless necessary. Add PDF upload later.

### 9.2 Document Creation Flow

Admin form fields:

```txt
Title
Author
Translator
Source Type
Reliability
Language
Original Language
Period
Source URL
Publication Year
Copyright Status
Notes
Raw Content
```

When submitted:

1. Save document in `documents` with status `pending`.
2. Call ingestion function.
3. Normalize content.
4. Chunk content.
5. Generate embeddings.
6. Save chunks.
7. Update document status to `processed`.

### 9.3 Text Normalization

Implement `normalizeText(raw: string)`.

It should:

- trim excessive whitespace
- normalize line endings
- remove repeated empty lines
- preserve paragraph boundaries
- optionally remove page headers/footers later

Do not over-clean philosophical texts. Preserve meaning and paragraph structure.

### 9.4 Chunking Strategy

Implement `chunkText(text: string)`.

MVP recommendation:

- chunk size: approximately 700–1000 tokens
- overlap: approximately 100–150 tokens
- split preferably on paragraph boundaries

Pseudo-logic:

```txt
1. Split text into paragraphs.
2. Add paragraphs to current chunk until token estimate reaches target.
3. Save chunk.
4. Start next chunk with small overlap from previous chunk.
5. Continue until complete.
```

Why overlap matters:

- prevents losing meaning at chunk boundaries
- helps retrieval find connected ideas

### 9.5 Embedding Generation

Implement `createEmbedding(text: string)`.

Use a single embedding model consistently.

Recommended for MVP:

```txt
text-embedding-3-small
```

Store:

- embedding vector
- chunk content
- document metadata copied into chunk row

### 9.6 Reprocessing Documents

Admin should have a button:

```txt
Reprocess Document
```

When clicked:

1. Delete existing chunks for document.
2. Normalize current document content.
3. Re-chunk.
4. Re-embed.
5. Save new chunks.
6. Update chunk count.

This is important because chunking strategy will change during development.

---

## 10. Retrieval System

### 10.1 Retrieval Function

Implement:

```ts
retrieveRelevantChunks({
  query,
  limit,
  minReliability,
  sourceTypes,
  language,
})
```

Flow:

1. Create embedding for query.
2. Search `document_chunks` by vector similarity.
3. Filter low-quality sources if needed.
4. Return top chunks with metadata and similarity score.

### 10.2 SQL Example

Using cosine distance:

```sql
SELECT
  id,
  document_id,
  content,
  title,
  author,
  source_type,
  reliability,
  language,
  metadata,
  1 - (embedding <=> $1::vector) AS similarity
FROM document_chunks
WHERE embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT $2;
```

Note:

- `<=>` is cosine distance in pgvector.
- Higher similarity means closer semantic match if calculated as `1 - distance`.

### 10.3 Retrieval Defaults

Recommended MVP defaults:

```txt
MAX_RETRIEVED_CHUNKS = 8 to 12
Minimum reliability = medium
Include admin_interpretation and behavior_rule only when appropriate
```

### 10.4 Hybrid Retrieval Later

Later, improve retrieval by combining:

- vector search
- full-text search
- metadata filters
- source reliability boosts
- primary-source preference

For MVP, vector search is enough.

---

## 11. Chat API

Route:

```txt
POST /api/chat
```

Request body:

```ts
type ChatRequest = {
  sessionId?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
};
```

Flow:

1. Validate input.
2. Get latest user message.
3. Create or load chat session.
4. Retrieve relevant chunks for latest user message.
5. Load active Socratic rules.
6. Build prompt.
7. Stream response from LLM.
8. Save user message.
9. Save assistant message.
10. Save retrieval log.
11. Return streamed response to frontend.

### 11.1 Chat History Management

Do not send the entire chat history forever.

For MVP:

- send latest 6–8 messages
- plus retrieved archive chunks
- plus system prompt

Later:

- summarize long conversations
- save conversation memory separately

### 11.2 Source Display

Each assistant response should be able to show sources.

Store retrieved chunk ids with assistant message.

Frontend can show:

```txt
Sources used:
- Plato, Apology, chunk 12
- Plato, Crito, chunk 4
- Admin note, Socratic behavior, chunk 2
```

Do not overcomplicate citations in MVP.

---

## 12. Socratic Prompt Design

### 12.1 Main System Prompt

Create `buildSocraticSystemPrompt()`.

Initial system prompt:

```txt
You are not the historical Socrates, and you must never claim to be him.
You are a Socratic dialogue system based on a curated archive of sources about Socrates.

Your purpose is to help the user think more clearly through Socratic dialogue.

Core behavior:
- Prefer questions over direct answers when appropriate.
- Ask for definitions.
- Examine assumptions.
- Reveal contradictions gently but firmly.
- Do not behave like a motivational speaker, therapist, guru, or generic advice bot.
- Do not invent historical facts.
- Use only the retrieved archive context for factual claims about Socrates.
- If the archive does not provide enough support, say that there is not enough reliable basis in the available sources.
- When discussing modern topics, make it clear that any answer is an interpretation through Socratic method, not a historical statement by Socrates.
- Keep answers concise unless the user asks for depth.
- Maintain a calm, precise, reflective tone.

Response style:
- Speak in a philosophical but clear way.
- Avoid modern slang.
- Avoid excessive drama.
- Avoid pretending to be resurrected or alive.
- Do not say “as an AI language model”.
```

### 12.2 Context Injection Format

When building the final LLM prompt, format retrieved chunks clearly:

```txt
Retrieved archive context:

[Source 1]
Title: Apology
Author: Plato
Type: primary_source
Reliability: high
Content:
...

[Source 2]
Title: Crito
Author: Plato
Type: primary_source
Reliability: high
Content:
...
```

### 12.3 User Message Format

```txt
User question:
{latestUserMessage}
```

### 12.4 Important Rule

The retrieved context should be treated as the factual basis.

The model can reason Socratically from the context, but it must not fabricate unsupported historical details.

---

## 13. Admin Rules System

The admin should be able to add rules from the UI.

Example rules:

```txt
Title: No direct identity claim
Content: Never say “I am Socrates.” Say “Let us examine this in a Socratic manner.”
Priority: 1
Active: true
```

```txt
Title: Modern questions
Content: For modern concepts such as social media, capitalism, AI, or smartphones, do not pretend Socrates knew them. Discuss them as hypothetical objects to be examined.
Priority: 2
Active: true
```

When building prompts:

1. Load active rules ordered by priority.
2. Add them after the base system prompt.

---

## 14. Admin Retrieval Test Tool

Build this early.

Route:

```txt
/archive/retrieval-test
```

Admin enters a test question:

```txt
What is courage?
```

The system shows:

- top retrieved chunks
- title
- author
- reliability
- similarity score
- content preview

This is extremely important because retrieval quality is the soul of the app.

If the wrong chunks are retrieved, the chat will feel wrong.

---

## 15. MVP Implementation Order

### Phase 1 — Foundation

1. Create Next.js app.
2. Add Tailwind.
3. Add database connection.
4. Add schema and migrations.
5. Enable pgvector.
6. Add basic landing page.
7. Add `/agora` placeholder.
8. Add `/archive` protected page.

### Phase 2 — Archive Admin

1. Create document form.
2. Save documents to database.
3. List documents.
4. View document detail.
5. Add processing status.

### Phase 3 — Ingestion

1. Implement normalization.
2. Implement chunking.
3. Implement embeddings.
4. Save chunks.
5. Reprocess documents.
6. Show chunk preview.

### Phase 4 — Retrieval

1. Implement query embedding.
2. Implement vector search.
3. Build retrieval test UI.
4. Tune chunk size and retrieval limit.

### Phase 5 — Chat

1. Build chat UI.
2. Implement `/api/chat`.
3. Retrieve chunks per user message.
4. Build Socratic prompt.
5. Stream response.
6. Save messages.
7. Show sources.

### Phase 6 — Quality Controls

1. Add Socratic rules admin.
2. Add source reliability filtering.
3. Add retrieval logs.
4. Add basic rate limiting.
5. Add error handling.

### Phase 7 — Cost Controls

1. Limit anonymous messages per day.
2. Limit answer length.
3. Cache common retrieval results.
4. Optionally cache common answers.
5. Add usage logging.

---

## 16. Cost Control Strategy

### 16.1 Never Send Full Archive

Only send retrieved chunks.

### 16.2 Keep Answers Short by Default

Socrates does not need long essays.

Default response length:

```txt
150–350 words
```

Unless user asks for depth.

### 16.3 Limit Retrieved Chunks

Default:

```txt
8–12 chunks
```

### 16.4 Limit Chat History

Default:

```txt
last 6–8 messages
```

### 16.5 Cache Similar Questions Later

Potential table:

```sql
CREATE TABLE answer_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_question TEXT NOT NULL,
  question_embedding vector(1536),
  answer TEXT NOT NULL,
  retrieved_chunk_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

For MVP, do not implement this unless needed.

---

## 17. Rate Limiting

For public chat, add rate limits early.

MVP options:

- IP-based limit
- anonymous session cookie limit
- simple database counter

Suggested free usage:

```txt
10 messages per anonymous user per day
```

Later:

- free tier
- supporter tier
- private deep dialogue tier

---

## 18. Error Handling

The app should handle:

- missing API keys
- failed embeddings
- failed chat completion
- empty archive
- no relevant chunks found
- database connection failure
- admin unauthorized

If no chunks are found, the assistant should say:

```txt
The archive does not yet contain enough relevant material for me to examine this properly.
```

---

## 19. Initial Archive Content Recommendation

Start with a small but strong archive.

MVP sources:

1. Plato — Apology
2. Plato — Crito
3. Plato — Phaedo
4. Plato — Symposium
5. Plato — Laches
6. Xenophon — Memorabilia
7. Aristophanes — Clouds, with caution and clear source type
8. Admin note — Socratic method behavior
9. Admin note — How to handle modern questions
10. Admin note — Historical uncertainty around Socrates

Important:

Add source metadata carefully.

For example, Aristophanes is not the same type of source as Plato. It is comedic/dramatic and should not be treated as direct reliable biography.

---

## 20. Source Reliability Rules

Use source reliability in retrieval and prompt construction.

Recommended interpretation:

```txt
high:
  primary ancient source or carefully selected canonical text

medium:
  respected secondary source or admin interpretation

low:
  uncertain, fragmentary, satirical, speculative, or unverified source

experimental:
  notes or ideas being tested
```

In the prompt, include reliability metadata so the model can avoid treating all sources equally.

---

## 21. Public UX Direction

### 21.1 Visual Style

- minimal
- calm
- text-first
- dark or warm neutral background
- no excessive decoration
- no fake 3D avatars
- no gimmicky death/ghost framing

### 21.2 Copy Direction

Use words like:

```txt
Agora
Archive
Dialogue
Question
Examination
Sources
Reflection
```

Avoid:

```txt
Meet the dead
Talk to dead people
AI resurrects Socrates
Socrates is alive
```

### 21.3 First Assistant Message

Example:

```txt
Let us begin carefully. What question do you wish to examine?
```

---

## 22. Security Notes

### 22.1 Admin Protection

Protect all `/archive/*` routes.

For MVP:

- middleware checks admin cookie/session
- login form asks for password
- password compared against `ADMIN_PASSWORD`

Later:

- use proper auth provider
- user roles

### 22.2 Input Sanitization

Sanitize admin document content before rendering.

Do not render raw HTML from documents unless sanitized.

### 22.3 Abuse Prevention

Add:

- rate limiting
- max message length
- max document size
- error logging

---

## 23. API Routes

### 23.1 POST /api/archive/documents

Creates a document.

Request:

```ts
{
  title: string;
  author?: string;
  translator?: string;
  sourceType: string;
  reliability: string;
  language: string;
  originalLanguage?: string;
  period?: string;
  sourceUrl?: string;
  publicationYear?: string;
  copyrightStatus?: string;
  notes?: string;
  rawContent: string;
  processImmediately?: boolean;
}
```

Response:

```ts
{
  documentId: string;
  status: 'pending' | 'processed';
}
```

### 23.2 POST /api/archive/ingest

Processes or reprocesses a document.

Request:

```ts
{
  documentId: string;
  reprocess?: boolean;
}
```

Response:

```ts
{
  documentId: string;
  chunkCount: number;
  status: 'processed';
}
```

### 23.3 POST /api/retrieval-test

Returns chunks for a query.

Request:

```ts
{
  query: string;
  limit?: number;
}
```

Response:

```ts
{
  chunks: Array<{
    id: string;
    documentId: string;
    title: string;
    author: string;
    sourceType: string;
    reliability: string;
    similarity: number;
    content: string;
  }>;
}
```

### 23.4 POST /api/chat

Streams a Socratic response.

Request:

```ts
{
  sessionId?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

Response:

- streamed assistant message
- include source metadata if using Vercel AI SDK data parts or a separate message metadata endpoint

---

## 24. Implementation Details for Cursor

### 24.1 Build Reusable AI Functions

Create:

```ts
// src/lib/ai/embeddings.ts
export async function createEmbedding(input: string): Promise<number[]> {}
```

```ts
// src/lib/archive/retrieval.ts
export async function retrieveRelevantChunks(query: string, limit = 10) {}
```

```ts
// src/lib/ai/prompts.ts
export function buildSocraticPrompt(args: {
  rules: SocraticRule[];
  chunks: RetrievedChunk[];
  recentMessages: ChatMessage[];
  latestUserMessage: string;
}): string {}
```

```ts
// src/lib/archive/ingest.ts
export async function ingestDocument(documentId: string) {}
```

### 24.2 Keep Provider Code Isolated

Do not scatter OpenAI/Anthropic calls everywhere.

Use:

```txt
src/lib/ai/providers.ts
```

This makes it easy to switch models later.

---

## 25. Testing Checklist

### Archive Tests

- Can create document
- Can list documents
- Can process document
- Can reprocess document
- Chunks are created
- Embeddings are stored
- Chunk count is correct

### Retrieval Tests

- Query “What is courage?” retrieves Laches-related chunks
- Query “Why should one obey the law?” retrieves Crito-related chunks
- Query “What happens after death?” retrieves Phaedo-related chunks
- Query “What is love?” retrieves Symposium-related chunks

### Chat Tests

- Chat answers using retrieved material
- Chat does not claim to be the real Socrates
- Chat asks questions instead of only answering directly
- Chat says when archive is insufficient
- Chat does not invent modern historical claims

### Admin Rule Tests

- Active rules are included in prompt
- Inactive rules are excluded
- Higher-priority rules appear earlier

---

## 26. Future Features After MVP

Do not build these first, but design so they are possible.

### 26.1 User Accounts

- save private dialogue history
- allow users to continue conversations
- paid supporter tier

### 26.2 Deep Dialogue Mode

A slower, more structured mode:

- one question at a time
- user must answer before continuing
- system tracks definitions and contradictions

### 26.3 Dialogue Maps

Visualize the philosophical path:

```txt
Initial question
  → definition attempt
  → contradiction found
  → revised definition
  → deeper question
```

### 26.4 Source Explorer

Public archive browser:

- see documents
- search sources
- read excerpts
- understand why Socrates answered a certain way

### 26.5 Multilingual Mode

Possible languages:

- English
- Serbian
- Greek excerpts later

Important:

If multilingual retrieval becomes important, either:

- embed all translations
- or use multilingual embedding model

### 26.6 Voice

Not for MVP.

If added later, avoid pretending it is Socrates' real voice.

---

## 27. Cursor Build Instruction

Build this as a production-ready MVP, not a throwaway demo.

Prioritize:

1. clean architecture
2. working archive ingestion
3. reliable retrieval
4. good Socratic prompt
5. simple admin UI
6. simple public chat

Do not over-engineer:

- no avatars
- no multi-character system
- no complex payments
- no PDF parsing in first version
- no user accounts unless needed

The first goal is:

```txt
Admin can add Socratic source text → system chunks and embeds it → public user asks question → chat retrieves relevant chunks → Socratic answer streams back with sources.
```

That is the MVP.

---

## 28. Final MVP Acceptance Criteria

The MVP is complete when:

1. Admin can log in.
2. Admin can add a document.
3. Admin can process the document into chunks and embeddings.
4. Admin can test retrieval for a custom question.
5. Public user can chat in `/agora`.
6. Every chat answer uses retrieved archive chunks.
7. Assistant follows Socratic behavior rules.
8. Assistant does not pretend to be the real Socrates.
9. Sources used for each answer can be inspected.
10. New admin-added content affects future chat answers without retraining.

---

## 29. Mental Model Summary

The LLM is not the memory.

The archive is the memory.

The retrieval system is the librarian.

The LLM is the voice of the dialogue.

The admin is the curator.

The user enters the Agora.



---

# Conversation Context Architecture (Critical)

The system must distinguish between:

1. Permanent archive context
   - Socrates source material
   - Plato dialogues
   - Xenophon writings
   - curator notes
   - behavioral rules

2. Conversation context
   - the current dialogue between the user and Socrates
   - previous user answers
   - unresolved philosophical questions
   - emotional / conceptual direction of the session

The AI response should always depend on BOTH.

---

# Chat Memory Strategy

The application should persist all conversations in the database.

Suggested tables:

```sql
chat_sessions
- id
- user_id
- title
- summary
- created_at
- updated_at

chat_messages
- id
- session_id
- role
- content
- created_at
```

Every message should be stored immediately after creation.

---

# Prompt Composition

Each AI request should be constructed from:

1. System prompt
2. Socrates behavioral rules
3. Relevant archive chunks (RAG retrieval)
4. Conversation summary
5. Recent chat messages
6. Latest user message

Example structure:

```txt
SYSTEM PROMPT:
You are a Socratic dialogue guide...

ARCHIVE CONTEXT:
[top relevant retrieved chunks]

CONVERSATION SUMMARY:
[summary of long-term discussion]

RECENT MESSAGES:
[last 8-12 messages]

USER:
[latest question]
```

---

# Important Principle

The archive provides:
- knowledge
- philosophy
- source material
- historical grounding

The chat history provides:
- dialogue continuity
- emotional continuity
- logical continuity
- unresolved ideas
- conversational memory

Both are required for a high-quality Socratic experience.

---

# Long Conversation Handling

The system should NEVER continuously send the entire chat history.

That becomes:
- expensive
- slow
- noisy
- lower quality

Instead:

- always send recent messages
- summarize older parts of the conversation
- keep the summary updated

---

# Recommended MVP Strategy

For the first implementation:

- store all messages
- send last 8-12 messages
- when total messages > 20:
  - summarize older messages
  - save summary into chat_sessions.summary
  - continue sending:
    - summary
    - recent messages
    - latest question

This is sufficient for a high-quality MVP.

---

# Conversation Summary Example

Example summary:

```txt
The user is exploring whether courage requires fear.
Socrates has questioned whether courage is knowledge or habit.
The user admitted that fear may be necessary for courage to exist.
The unresolved question is whether virtue can be taught.
```

This summary allows the AI to maintain continuity without sending the full conversation history.

---

# Optional Advanced Future Features

Later versions may introduce:

- conversation embeddings
- important insight extraction
- user philosophical profile
- recurring themes
- long-term memory
- semantic retrieval from past conversations

However, these should NOT be part of the initial MVP.

The first version should remain:
- simple
- deterministic
- understandable
- controllable
- low-cost
