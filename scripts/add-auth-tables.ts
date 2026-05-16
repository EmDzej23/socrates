import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Adding better-auth tables...\n");

  // 1. Create user table
  console.log("1. Creating user table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified BOOLEAN NOT NULL DEFAULT false,
      image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("   ✓ User table created\n");

  // 2. Create session table
  console.log("2. Creating session table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "session" (
      id TEXT PRIMARY KEY,
      expires_at TIMESTAMPTZ NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip_address TEXT,
      user_agent TEXT,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    )
  `;
  console.log("   ✓ Session table created\n");

  // 3. Create account table
  console.log("3. Creating account table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "account" (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      access_token_expires_at TIMESTAMPTZ,
      refresh_token_expires_at TIMESTAMPTZ,
      scope TEXT,
      password TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("   ✓ Account table created\n");

  // 4. Create verification table
  console.log("4. Creating verification table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "verification" (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("   ✓ Verification table created\n");

  // 5. Add user_id to chat_sessions (replacing visitor_id)
  console.log("5. Updating chat_sessions table...");
  try {
    await sql`ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE`;
    console.log("   ✓ Added user_id column\n");
  } catch (e) {
    console.log("   ✓ user_id column already exists\n");
  }

  // 6. Create index on user_id
  console.log("6. Creating indexes...");
  await sql`CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id)`;
  console.log("   ✓ Indexes created\n");

  // 7. Drop visitor_id column if exists (optional - keep for backward compatibility)
  // console.log("7. Removing visitor_id column...");
  // await sql`ALTER TABLE chat_sessions DROP COLUMN IF EXISTS visitor_id`;

  console.log("Migration completed successfully!");
}

migrate().catch(console.error);
