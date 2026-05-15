import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  customType,
} from "drizzle-orm/pg-core";

const vector = customType<{ data: number[]; dpiverName: "vector" }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === "string") {
      return value
        .slice(1, -1)
        .split(",")
        .map((v) => parseFloat(v));
    }
    return value as number[];
  },
});

export const sourceTypes = [
  "primary_source",
  "secondary_source",
  "biography",
  "academic_commentary",
  "admin_interpretation",
  "behavior_rule",
  "system_note",
  "translation_note",
] as const;

export const reliabilityLevels = [
  "high",
  "medium",
  "low",
  "experimental",
] as const;

export const processingStatuses = [
  "pending",
  "processing",
  "processed",
  "failed",
] as const;

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  author: text("author"),
  translator: text("translator"),
  sourceType: text("source_type").notNull().$type<(typeof sourceTypes)[number]>(),
  reliability: text("reliability").notNull().default("medium").$type<(typeof reliabilityLevels)[number]>(),
  language: text("language").notNull().default("en"),
  originalLanguage: text("original_language"),
  period: text("period"),
  sourceUrl: text("source_url"),
  publicationYear: text("publication_year"),
  copyrightStatus: text("copyright_status"),
  notes: text("notes"),
  rawContent: text("raw_content").notNull(),
  normalizedContent: text("normalized_content"),
  processingStatus: text("processing_status").notNull().default("pending").$type<(typeof processingStatuses)[number]>(),
  chunkCount: integer("chunk_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    tokenEstimate: integer("token_estimate"),
    embedding: vector("embedding"),
    title: text("title"),
    author: text("author"),
    sourceType: text("source_type").$type<(typeof sourceTypes)[number]>(),
    reliability: text("reliability").$type<(typeof reliabilityLevels)[number]>(),
    language: text("language"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("document_chunks_document_id_idx").on(table.documentId),
  ]
);

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitorId: text("visitor_id"),
  title: text("title"),
  summary: text("summary"),
  messageCount: integer("message_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull().$type<"user" | "assistant" | "system">(),
    content: text("content").notNull(),
    retrievedChunkIds: text("retrieved_chunk_ids").array().default([]),
    model: text("model"),
    tokenUsage: jsonb("token_usage").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("chat_messages_session_id_idx").on(table.sessionId),
  ]
);

export const socraticRules = pgTable("socratic_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  active: boolean("active").notNull().default(true),
  priority: integer("priority").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const retrievalLogs = pgTable("retrieval_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id"),
  userMessage: text("user_message").notNull(),
  queryEmbeddingModel: text("query_embedding_model"),
  retrievedChunks: jsonb("retrieved_chunks").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type SocraticRule = typeof socraticRules.$inferSelect;
export type NewSocraticRule = typeof socraticRules.$inferInsert;
