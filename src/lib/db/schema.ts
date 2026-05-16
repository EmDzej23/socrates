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
  uniqueIndex,
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

// Better Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const characters = pgTable(
  "characters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    avatarUrl: text("avatar_url"),
    basePrompt: text("base_prompt"),
    greetingMessage: text("greeting_message"),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("characters_slug_idx").on(table.slug),
  ]
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    characterId: uuid("character_id").references(() => characters.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    index("documents_character_id_idx").on(table.characterId),
  ]
);

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

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    characterId: uuid("character_id").references(() => characters.id, { onDelete: "set null" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    summary: text("summary"),
    messageCount: integer("message_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("chat_sessions_character_id_idx").on(table.characterId),
    index("chat_sessions_user_id_idx").on(table.userId),
  ]
);

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

export const rules = pgTable(
  "rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    characterId: uuid("character_id").references(() => characters.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    active: boolean("active").notNull().default(true),
    alwaysInclude: boolean("always_include").notNull().default(true),
    priority: integer("priority").notNull().default(100),
    embedding: vector("embedding"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("rules_character_id_idx").on(table.characterId),
  ]
);

export const retrievalLogs = pgTable("retrieval_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id"),
  userMessage: text("user_message").notNull(),
  queryEmbeddingModel: text("query_embedding_model"),
  retrievedChunks: jsonb("retrieved_chunks").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Keep socraticRules as alias for backward compatibility during migration
export const socraticRules = rules;

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;
// Backward compatibility
export type SocraticRule = Rule;
export type NewSocraticRule = NewRule;
