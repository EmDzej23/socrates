# Socrates — A Curated Dialogue Archive

A RAG-powered Socratic dialogue system built with Next.js, PostgreSQL/pgvector, and OpenAI.

## Overview

This application provides:

- **Public Agora** (`/agora`) — A chat interface for Socratic dialogue
- **Private Archive** (`/archive`) — Admin panel for managing the knowledge base

The system uses Retrieval-Augmented Generation (RAG) to answer questions based on curated historical sources, not generic AI knowledge.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with pgvector (Neon recommended)
- **ORM**: Drizzle
- **AI**: OpenAI (embeddings + chat)
- **Styling**: Tailwind CSS v4

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

- `DATABASE_URL` — PostgreSQL connection string (must support pgvector)
- `OPENAI_API_KEY` — Your OpenAI API key
- `ADMIN_PASSWORD` — Password for accessing the admin archive
- `SESSION_SECRET` — Generate with `openssl rand -base64 32`

### 3. Set up the database

Enable the pgvector extension in your PostgreSQL database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Push the schema to your database:

```bash
npm run db:push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### Admin Archive

1. Navigate to `/archive/login`
2. Enter the admin password (from `ADMIN_PASSWORD`)
3. Add documents with source metadata
4. Click "Save & Process" to chunk and embed the text
5. Configure Socratic rules for dialogue behavior

### Public Chat

1. Visit `/agora`
2. Ask questions
3. The system retrieves relevant chunks and responds in Socratic style

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── agora/                # Public chat
│   ├── archive/              # Admin panel
│   └── api/                  # API routes
├── components/
│   ├── chat/                 # Chat UI components
│   └── archive/              # Admin UI components
└── lib/
    ├── ai/                   # AI functions (embeddings, prompts)
    ├── archive/              # Ingestion and retrieval
    ├── auth/                 # Admin authentication
    └── db/                   # Database schema and connection
```

## Database Scripts

```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly
npm run db:studio    # Open Drizzle Studio
```

## Initial Archive Content

Start with these recommended sources:

1. Plato — Apology
2. Plato — Crito
3. Plato — Phaedo
4. Plato — Symposium
5. Xenophon — Memorabilia

Add each with appropriate metadata (author, source type, reliability level).

## Key Principles

- The **archive** is the memory, not the LLM
- Use **retrieval** for all factual claims
- Socrates should **ask questions**, not lecture
- Never claim to be the historical Socrates
- Maintain **historical honesty** about limitations
